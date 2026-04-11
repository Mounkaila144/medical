'use client';

import { Building2, Phone, MapPin } from 'lucide-react';

interface PrintHeaderProps {
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

export function PrintHeader({
  clinicName = 'Clinique Médicale',
  clinicAddress = 'Niamey, Niger',
  clinicPhone = '+227 00 00 00 00',
}: PrintHeaderProps) {
  return (
    <div className="hidden print:block mb-8 border-b-2 border-gray-800 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-lg p-3">
            <Building2 className="h-8 w-8 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clinicName}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {clinicAddress}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {clinicPhone}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Date: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}
