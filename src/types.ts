export type PatientStatus = 'estable' | 'observacion' | 'critico';
export type BedSector = 'intermedios' | 'generales' | 'ectopicos';

export interface SectorCensusInfo {
  total: number;
  occupied: number; // llenas
  empty: number;    // vacías
  occupancyRate: number;
}

export interface Census17Stats {
  total: number; // 17 camas
  occupied: number; // Llenas (Intermedios + Generales)
  empty: number;    // Vacías (Intermedios + Generales)
  occupancyRate: number;
  intermedios: SectorCensusInfo; // 4 camas
  generales: SectorCensusInfo;    // 13 camas
  ectopicos: SectorCensusInfo;    // 3 camas
}

export interface Vitals {
  heartRate?: number; // lpm
  bloodPressure?: string; // mmHg
  respiratoryRate?: number; // rpm
  oxygenSaturation?: number; // %
  temperature?: number; // °C
}

export interface Patient {
  id: string;
  bedNumber: number; // 1 to 20
  firstName: string;
  lastName: string;
  ageYears: number;
  ageMonths: number;
  gender: 'M' | 'F';
  admissionDate: string; // YYYY-MM-DD
  diagnoses: string[];
  primaryDiagnosis: string;
  surgicalProcedure?: string;
  postOpDay?: number;
  currentPlans: string; // ¿Qué exámenes o plan tiene?
  pendingPlans: string; // ¿Qué plan pendiente está?
  status: PatientStatus; // 'estable' | 'observacion' | 'critico'
  vitals?: Vitals;
  dietStatus?: string; // ej. Ayuno prequirúrgico, Líquidos orales, Dieta blanda
  avatarSticker?: string; // 'bear' | 'lion' | 'rabbit' | 'dino' | 'star' | 'rocket'
  allergies?: string;
  bloodType?: string;
  lastUpdated?: string;
  notes?: string;
}

export interface Bed {
  id: number; // 1 to 20
  occupied: boolean;
  patient?: Patient;
}

export interface ClinicalAlert {
  id: string;
  bedNumber: number;
  patientName: string;
  patientId: string;
  type: 'critical_patient' | 'prolonged_stay' | 'pending_fasting' | 'pending_exam' | 'observation_needed';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  actionRequired: string;
  daysHospitalized?: number;
}

export interface UserSession {
  email: string;
  displayName: string;
  role: string;
  medicalLicense?: string;
  photoURL?: string;
  provider: 'google' | 'email';
}

export interface CensusReportStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  stableCount: number;
  observationCount: number;
  criticalCount: number;
  averageDaysStay: number;
  maxDaysStay: number;
  ageGroups: {
    infants: number; // < 2 años
    preschool: number; // 2 - 5 años
    schoolAge: number; // 6 - 11 años
    adolescents: number; // 12+ años
  };
  commonPathologies: { name: string; count: number }[];
  census17: Census17Stats;
}

export interface DischargeRecord {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: number;
  dischargeDate: string;
  admissionDate: string;
  daysHospitalized: number;
  primaryDiagnosis: string;
  dischargeType: 'domicilio' | 'traslado_uci' | 'otra_institucion' | 'otro';
  dischargeNotes?: string;
  dischargePrescription?: string;
}
