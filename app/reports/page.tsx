"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Euro, 
  Clock,
  FileText,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface DynamicReportData {
  period: string;
  tenantId: string;
  metrics: {
    totalPatients: number;
    totalAppointments: number;
    totalRevenue: number;
    averageWaitTime: number;
    previousPeriodRevenue?: number;
    cancelledAppointments?: number;
    completedAppointments?: number;
  };
  charts: {
    dailyRevenue: Array<{ date: string; revenue: number }>;
    appointmentsByType: Array<{ type: string; count: number }>;
  };
  lastUpdated?: string;
}

export default function DynamicReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<DynamicReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('MONTHLY');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDynamicData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        throw new Error('Aucune donnée disponible');
      }

      // Transformation des données API
      const transformedData: DynamicReportData = {
        period: data.period || period,
        tenantId: data.tenantId || 'N/A',
        metrics: {
          totalPatients: data.metrics?.totalPatients || data.totalPatients || 0,
          totalAppointments: data.metrics?.totalAppointments || data.totalAppointments || 0,
          totalRevenue: data.metrics?.totalRevenue || data.totalRevenue || 0,
          averageWaitTime: data.metrics?.averageWaitTime || data.averageWaitTime || 0,
          previousPeriodRevenue: data.metrics?.previousPeriodRevenue,
          cancelledAppointments: data.metrics?.cancelledAppointments,
          completedAppointments: data.metrics?.completedAppointments
        },
        charts: {
          dailyRevenue: data.dailyRevenue || data.charts?.dailyRevenue || [],
          appointmentsByType: data.appointmentsByStatus 
            ? Object.entries(data.appointmentsByStatus).map(([type, count]) => ({
                type,
                count: count as number
              }))
            : data.appointmentsByType || data.charts?.appointmentsByType || []
        },
        lastUpdated: new Date().toLocaleString('fr-FR')
      };

      setReportData(transformedData);
      toast.success('Données actualisées avec succès');
      
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [period, router]);

  useEffect(() => {
    fetchDynamicData();
  }, [fetchDynamicData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchDynamicData, 30000);
      toast.info('Actualisation automatique activée (toutes les 30 secondes)');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchDynamicData]);

  const exportToCSV = useCallback(() => {
    if (!reportData) return;
    
    const csvData = [
      ['Type', 'Valeur'],
      ['Période', reportData.period],
      ['Total Patients', reportData.metrics.totalPatients.toString()],
      ['Total Rendez-vous', reportData.metrics.totalAppointments.toString()],
      ['Revenu Total', reportData.metrics.totalRevenue.toFixed(2)],
      ['Temps d\'attente moyen', reportData.metrics.averageWaitTime.toString()],
      ...reportData.charts.dailyRevenue.map(item => [item.date, item.revenue.toString()])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_${period}_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré avec succès');
  }, [reportData, period]);

  const revenueGrowth = useMemo(() => {
    if (!reportData?.metrics.previousPeriodRevenue) return null;
    
    const current = reportData.metrics.totalRevenue;
    const previous = reportData.metrics.previousPeriodRevenue;
    const growth = ((current - previous) / previous) * 100;
    
    return {
      percentage: growth,
      isPositive: growth > 0
    };
  }, [reportData]);

  const completionRate = useMemo(() => {
    if (!reportData?.metrics.completedAppointments || !reportData?.metrics.totalAppointments) return 0;
    return (reportData.metrics.completedAppointments / reportData.metrics.totalAppointments) * 100;
  }, [reportData]);

  const cancellationRate = useMemo(() => {
    if (!reportData?.metrics.cancelledAppointments || !reportData?.metrics.totalAppointments) return 0;
    return (reportData.metrics.cancelledAppointments / reportData.metrics.totalAppointments) * 100;
  }, [reportData]);

  const renderMetric = (value: number, isCurrency = false) => {
    if (isCurrency) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    }
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-lg" />
              <Skeleton className="h-80 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
             Rapport
            </CardTitle>
            {reportData?.lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Dernière mise à jour : {reportData.lastUpdated}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            >
              <option value="DAILY">Journalier</option>
              <option value="WEEKLY">Hebdomadaire</option>
              <option value="MONTHLY">Mensuel</option>
              <option value="YEARLY">Annuel</option>
            </select>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 border-green-200" : ""}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </Button>
              
              <Button 
                onClick={fetchDynamicData} 
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Actualiser
              </Button>
              
              <Button 
                onClick={exportToCSV} 
                variant="outline" 
                size="sm" 
                disabled={!reportData || loading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : reportData ? (
            <>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Période: <Badge variant="outline">{reportData.period}</Badge>
                  </h3>
                  <Badge variant="secondary" className="mt-2">
                    Tenant: {reportData.tenantId}
                  </Badge>
                </div>
                
                {revenueGrowth && (
                  <div className="flex items-center gap-2">
                    {revenueGrowth.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      revenueGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {revenueGrowth.percentage > 0 ? '+' : ''}{revenueGrowth.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs période précédente</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <EnhancedMetricCard 
                  title="Patients Total" 
                  value={renderMetric(reportData.metrics.totalPatients)} 
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                  bgColor="bg-blue-50"
                  borderColor="border-l-blue-500"
                />
                <EnhancedMetricCard 
                  title="Rendez-vous" 
                  value={renderMetric(reportData.metrics.totalAppointments)} 
                  icon={<Calendar className="h-5 w-5 text-green-600" />}
                  bgColor="bg-green-50"
                  borderColor="border-l-green-500"
                  subtitle={
                    <div className="flex justify-between text-xs">
                      <span>Réalisés: {completionRate.toFixed(1)}%</span>
                      <span>Annulés: {cancellationRate.toFixed(1)}%</span>
                    </div>
                  }
                />
                <EnhancedMetricCard 
                  title="Revenu Total" 
                  value={renderMetric(reportData.metrics.totalRevenue, true)} 
                  icon={<Euro className="h-5 w-5 text-yellow-600" />}
                  bgColor="bg-yellow-50"
                  borderColor="border-l-yellow-500"
                  trend={revenueGrowth}
                />
                <EnhancedMetricCard 
                  title="Temps d'Attente" 
                  value={`${reportData.metrics.averageWaitTime} min`} 
                  icon={<Clock className="h-5 w-5 text-purple-600" />}
                  bgColor="bg-purple-50"
                  borderColor="border-l-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedChartCard 
                  title="Évolution du Revenu Journalier" 
                  icon={<TrendingUp className="h-5 w-5 text-primary" />}
                >
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Date</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="text-right">Évolution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.charts.dailyRevenue.map((item, index) => {
                          const previousRevenue = index > 0 
                            ? reportData.charts.dailyRevenue[index - 1].revenue 
                            : null;
                          const change = previousRevenue 
                            ? ((item.revenue - previousRevenue) / previousRevenue) * 100 
                            : 0;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {new Date(item.date).toLocaleDateString('fr-FR', { 
                                  day: '2-digit', 
                                  month: '2-digit' 
                                })}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {renderMetric(item.revenue, true)}
                              </TableCell>
                              <TableCell className="text-right">
                                {previousRevenue && (
                                  <span className={`text-sm ${
                                    change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </EnhancedChartCard>
                
                <EnhancedChartCard 
                  title="Répartition des Rendez-vous" 
                  icon={<Calendar className="h-5 w-5 text-primary" />}
                >
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Quantité</TableHead>
                          <TableHead className="text-right">Pourcentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.charts.appointmentsByType.map((item, index) => {
                          const total = reportData.charts.appointmentsByType.reduce(
                            (sum, i) => sum + i.count, 0
                          );
                          const percentage = total > 0 ? (item.count / total) * 100 : 0;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.type}</TableCell>
                              <TableCell className="text-right font-mono">
                                {item.count}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground w-12">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </EnhancedChartCard>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucune donnée disponible
              </h3>
              <p className="text-muted-foreground">
                Aucune donnée n'a pu être récupérée pour cette période.
              </p>
              <Button 
                onClick={fetchDynamicData} 
                className="mt-4"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface EnhancedMetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  subtitle?: React.ReactNode;
  trend?: { percentage: number; isPositive: boolean } | null;
}

function EnhancedMetricCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  borderColor,
  subtitle, 
  trend 
}: EnhancedMetricCardProps) {
  return (
    <Card className={`${bgColor} border-l-4 ${borderColor} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="p-1 rounded-full bg-white/50">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <div className="text-xs text-muted-foreground">
              {subtitle}
            </div>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EnhancedChartCardProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function EnhancedChartCard({ 
  title, 
  children, 
  icon 
}: EnhancedChartCardProps) {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}