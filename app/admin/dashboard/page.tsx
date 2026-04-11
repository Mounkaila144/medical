'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Users, UserX, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TenantService } from '@/services/tenant.service';
import { Tenant, UserManagement } from '@/types';

export default function AdminDashboardPage() {
  const { user, getDisplayName } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantsData, usersData] = await Promise.all([
          TenantService.getTenants({ limit: 100 }),
          TenantService.getUsers({ limit: 100 }),
        ]);
        setTenants(tenantsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeTenants = tenants.filter(t => t.isActive).length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const recentTenants = tenants.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Bonjour, {getDisplayName()}</h1>
        <p className="text-blue-100 mt-1">Administration de la plateforme</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants actifs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTenants}</div>
            <p className="text-xs text-muted-foreground">sur {tenants.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliniques actives</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTenants}</div>
            <p className="text-xs text-muted-foreground">en service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs inactifs</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">comptes desactives</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers tenants</CardTitle>
          <CardDescription>Les tenants recemment crees</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTenants.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun tenant</p>
          ) : (
            <div className="space-y-3">
              {recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                  </div>
                  <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                    {tenant.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-3">
        <Button asChild variant="outline" className="h-auto p-4 justify-start">
          <Link href="/admin/tenants">
            <Plus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Creer un tenant</p>
              <p className="text-xs text-muted-foreground">Ajouter une nouvelle clinique</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 justify-start">
          <Link href="/admin/users">
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Gerer les utilisateurs</p>
              <p className="text-xs text-muted-foreground">Voir et modifier les comptes</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 justify-start">
          <Link href="/admin/permissions">
            <ArrowRight className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Permissions</p>
              <p className="text-xs text-muted-foreground">Gerer les droits d'acces</p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
