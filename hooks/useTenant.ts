import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useTenant() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Utiliser directement le tenantId de l'utilisateur comme slug
  // jusqu'à ce que le backend supporte la récupération du tenant avec slug
  const tenant = user?.tenantId ? {
    id: user.tenantId,
    slug: user.tenantId, // Utiliser l'ID comme slug temporairement
    name: 'Ma Clinique', // Nom par défaut
    isActive: true,
  } : null;

  const getPublicQueueUrls = () => {
    if (!tenant?.slug) return null;

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
      display: `${baseUrl}/${tenant.slug}/queue/display`,
      takeNumber: `${baseUrl}/${tenant.slug}/queue/take-number`,
    };
  };

  return {
    tenant,
    loading,
    error: null,
    getPublicQueueUrls,
  };
}
