import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, Gender, BloodType } from '@/types';
import { Practitioner, Speciality } from '@/services/practitioners-service';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

const genderLabels: Record<Gender, string> = {
  [Gender.M]: 'Masculin',
  [Gender.F]: 'Féminin',
  [Gender.OTHER]: 'Autre',
};

const bloodTypeLabels: Record<BloodType, string> = {
  [BloodType.A_POSITIVE]: 'A+',
  [BloodType.A_NEGATIVE]: 'A-',
  [BloodType.B_POSITIVE]: 'B+',
  [BloodType.B_NEGATIVE]: 'B-',
  [BloodType.AB_POSITIVE]: 'AB+',
  [BloodType.AB_NEGATIVE]: 'AB-',
  [BloodType.O_POSITIVE]: 'O+',
  [BloodType.O_NEGATIVE]: 'O-',
};

const specialityLabels: Record<Speciality, string> = {
  [Speciality.GENERAL_MEDICINE]: 'Médecine générale',
  [Speciality.PEDIATRICS]: 'Pédiatrie',
  [Speciality.CARDIOLOGY]: 'Cardiologie',
  [Speciality.DERMATOLOGY]: 'Dermatologie',
  [Speciality.NEUROLOGY]: 'Neurologie',
  [Speciality.ORTHOPEDICS]: 'Orthopédie',
  [Speciality.GYNECOLOGY]: 'Gynécologie',
  [Speciality.OPHTHALMOLOGY]: 'Ophtalmologie',
  [Speciality.DENTISTRY]: 'Dentisterie',
  [Speciality.PSYCHIATRY]: 'Psychiatrie',
};

export function exportPatientsToPDF(patients: Patient[], clinicName?: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 139, 34); // Forest green color
  doc.text('Liste des Patients', pageWidth / 2, 20, { align: 'center' });

  // Clinic name if provided
  if (clinicName) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(clinicName, pageWidth / 2, 28, { align: 'center' });
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Généré le: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });

  // Summary
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nombre total de patients: ${patients.length}`, 14, 45);

  // Prepare table data
  const tableData = patients.map((patient, index) => [
    (index + 1).toString(),
    patient.mrn || '-',
    `${patient.lastName} ${patient.firstName}`,
    genderLabels[patient.gender] || patient.gender,
    patient.age?.toString() || '-',
    patient.phone || '-',
    patient.bloodType ? bloodTypeLabels[patient.bloodType] : '-',
    patient.address?.city || '-',
  ]);

  // Create table
  autoTable(doc, {
    startY: 52,
    head: [[
      '#',
      'N° Dossier',
      'Nom Complet',
      'Genre',
      'Âge',
      'Téléphone',
      'Groupe Sanguin',
      'Ville',
    ]],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [34, 139, 34], // Forest green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 40 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 28 },
      6: { cellWidth: 25, halign: 'center' },
      7: { cellWidth: 25 },
    },
    didDrawPage: (data) => {
      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber} sur ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Download
  const filename = `patients_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function exportPractitionersToPDF(practitioners: Practitioner[], clinicName?: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 139, 34); // Forest green color
  doc.text('Liste des Praticiens', pageWidth / 2, 20, { align: 'center' });

  // Clinic name if provided
  if (clinicName) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(clinicName, pageWidth / 2, 28, { align: 'center' });
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Généré le: ${currentDate}`, pageWidth / 2, 35, { align: 'center' });

  // Summary
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nombre total de praticiens: ${practitioners.length}`, 14, 45);

  // Prepare table data
  const tableData = practitioners.map((practitioner, index) => {
    // Get specialty label, handle both string and enum
    let specialtyLabel = practitioner.specialty;
    if (practitioner.specialty in Speciality) {
      specialtyLabel = specialityLabels[practitioner.specialty as Speciality] || practitioner.specialty;
    }

    return [
      (index + 1).toString(),
      `${practitioner.lastName} ${practitioner.firstName}`,
      specialtyLabel,
      practitioner.email || '-',
      practitioner.phoneNumber || '-',
      practitioner.slotDuration ? `${practitioner.slotDuration} min` : '-',
    ];
  });

  // Create table
  autoTable(doc, {
    startY: 52,
    head: [[
      '#',
      'Nom Complet',
      'Spécialité',
      'Email',
      'Téléphone',
      'Durée consultation',
    ]],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [34, 139, 34], // Forest green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 40 },
      3: { cellWidth: 50 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30, halign: 'center' },
    },
    didDrawPage: (data) => {
      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber} sur ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Download
  const filename = `praticiens_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
