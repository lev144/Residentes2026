import { Patient, ClinicalAlert, CensusReportStats, BedSector, Census17Stats } from '../types';

/**
 * Determina el sector al que pertenece una cama (1 a 20):
 * - Camas 01 a 04: Unidad de Intermedios (4 camas)
 * - Camas 05 a 17: Camas Generales (13 camas)
 * - Camas 18 a 20: Camas Ectópicos (3 camas)
 */
export function getBedSector(bedNumber: number): BedSector {
  if (bedNumber >= 1 && bedNumber <= 4) return 'intermedios';
  if (bedNumber >= 5 && bedNumber <= 17) return 'generales';
  return 'ectopicos';
}

export function getBedSectorTitle(sectorOrBed: BedSector | number): string {
  const sector = typeof sectorOrBed === 'number' ? getBedSector(sectorOrBed) : sectorOrBed;
  switch (sector) {
    case 'intermedios':
      return 'Unidad de Intermedios (4 Camas)';
    case 'generales':
      return 'Camas Generales (13 Camas)';
    case 'ectopicos':
      return 'Camas Ectópicos (3 Camas)';
  }
}

export function getBedSectorBadgeInfo(bedNumber: number) {
  const sector = getBedSector(bedNumber);
  switch (sector) {
    case 'intermedios':
      return {
        label: 'Unidad de Intermedios',
        shortLabel: 'Intermedios',
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-300',
        dotBg: 'bg-purple-600',
        icon: '🏥',
      };
    case 'generales':
      return {
        label: 'Camas Generales',
        shortLabel: 'Generales',
        bg: 'bg-sky-100',
        text: 'text-sky-800',
        border: 'border-sky-300',
        dotBg: 'bg-sky-600',
        icon: '🛏️',
      };
    case 'ectopicos':
      return {
        label: 'Camas Ectópicos',
        shortLabel: 'Ectópicos',
        bg: 'bg-amber-100',
        text: 'text-amber-900',
        border: 'border-amber-300',
        dotBg: 'bg-amber-600',
        icon: '🏷️',
      };
  }
}

/**
 * Contabiliza los días que lleva hospitalizado un paciente pediátrico desde su fecha de ingreso.
 * Si ingresó hoy, se contabiliza como día 1.
 */
export function calculateHospitalDays(admissionDateStr: string): number {
  if (!admissionDateStr) return 1;
  
  const today = new Date();
  // Normalizar a medianoche local para comparar días calendarios
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = admissionDateStr.split('-').map(Number);
  const admission = new Date(year, month - 1, day);
  admission.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - admission.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Día 1 es el día de ingreso
  return Math.max(1, diffDays + 1);
}

/**
 * Formatea la edad del paciente pediátrico de forma médica y cariñosa
 */
export function formatPediatricAge(years: number, months: number): string {
  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  return `${years} a ${months} m`;
}

/**
 * Genera alertas clínicas automatizadas en base a los datos de cada paciente
 */
export function generateAutomatedAlerts(patients: Patient[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  patients.forEach((p) => {
    const days = calculateHospitalDays(p.admissionDate);
    const fullName = `${p.firstName} ${p.lastName}`;

    // 1. Alerta crítica urgente
    if (p.status === 'critico') {
      alerts.push({
        id: `alert-crit-${p.id}`,
        bedNumber: p.bedNumber,
        patientName: fullName,
        patientId: p.id,
        type: 'critical_patient',
        severity: 'high',
        title: `Cama ${String(p.bedNumber).padStart(2, '0')} - Paciente Crítico`,
        message: `${fullName} (${formatPediatricAge(p.ageYears, p.ageMonths)}) en condición crítica por ${p.primaryDiagnosis}. Requiere monitorización hemodinámica continua.`,
        actionRequired: 'Reevaluación de signos vitales cada 1 hora y reporte inmediato al cirujano de guardia.',
        daysHospitalized: days,
      });
    }

    // 2. Alerta de estancia hospitalaria prolongada (>= 5 días)
    if (days >= 5) {
      alerts.push({
        id: `alert-stay-${p.id}`,
        bedNumber: p.bedNumber,
        patientName: fullName,
        patientId: p.id,
        type: 'prolonged_stay',
        severity: days >= 7 ? 'high' : 'medium',
        title: `Cama ${String(p.bedNumber).padStart(2, '0')} - Estancia Prolongada (${days} días)`,
        message: `${fullName} lleva ${days} días hospitalizado(a). Diagnóstico: ${p.primaryDiagnosis}.`,
        actionRequired: 'Evaluar criterios de alta, rotación de antibióticos endovenosos o estudios complementarios.',
        daysHospitalized: days,
      });
    }

    // 3. Alertas sobre planes pendientes críticos (ayuno, cirugía, cultivo, TAC)
    const pendingLower = (p.pendingPlans || '').toLowerCase();
    const currentLower = (p.currentPlans || '').toLowerCase();

    if (
      pendingLower.includes('ayuno') ||
      currentLower.includes('ayuno') ||
      pendingLower.includes('quirófano') ||
      pendingLower.includes('quirofano') ||
      pendingLower.includes('cirugía') ||
      pendingLower.includes('cirugia')
    ) {
      alerts.push({
        id: `alert-fast-${p.id}`,
        bedNumber: p.bedNumber,
        patientName: fullName,
        patientId: p.id,
        type: 'pending_fasting',
        severity: 'medium',
        title: `Cama ${String(p.bedNumber).padStart(2, '0')} - Plan Quirúrgico / Ayuno Activo`,
        message: `Verificar horario estricto de ayuno y disponibilidad de banco de sangre/pabellón.`,
        actionRequired: p.pendingPlans || 'Verificar plan quirúrgico programado con anestesiología pediátrica.',
        daysHospitalized: days,
      });
    }

    if (
      pendingLower.includes('tac') ||
      pendingLower.includes('tomografía') ||
      pendingLower.includes('ecografía') ||
      pendingLower.includes('cultivo') ||
      pendingLower.includes('resonancia') ||
      pendingLower.includes('laboratorio') ||
      pendingLower.includes('hemograma')
    ) {
      alerts.push({
        id: `alert-exam-${p.id}`,
        bedNumber: p.bedNumber,
        patientName: fullName,
        patientId: p.id,
        type: 'pending_exam',
        severity: 'info',
        title: `Cama ${String(p.bedNumber).padStart(2, '0')} - Examen Auxiliar Pendiente`,
        message: `Tiene exámenes pendientes en plan: ${p.pendingPlans}`,
        actionRequired: 'Gestionar solicitud con laboratorio o imagenología para pase de guardia.',
        daysHospitalized: days,
      });
    }

    // 4. Paciente en observación
    if (p.status === 'observacion') {
      alerts.push({
        id: `alert-obs-${p.id}`,
        bedNumber: p.bedNumber,
        patientName: fullName,
        patientId: p.id,
        type: 'observation_needed',
        severity: 'info',
        title: `Cama ${String(p.bedNumber).padStart(2, '0')} - En Observación Estrecha`,
        message: `${fullName}: amerita vigilancia estrecha de abdomen, gasto por drenajes o curva térmica.`,
        actionRequired: 'Registrar balance hídrico y vigilar dolor postoperatorio.',
        daysHospitalized: days,
      });
    }
  });

  // Ordenar: alta severidad primero
  return alerts.sort((a, b) => {
    const order = { high: 0, medium: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

/**
 * Calcula estadísticas diarias para el censo médico de cirugía pediátrica
 */
export function calculateCensusStats(patients: Patient[]): CensusReportStats {
  const totalBeds = 20;
  const occupiedBeds = patients.length;
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  let stableCount = 0;
  let observationCount = 0;
  let criticalCount = 0;

  let totalStayDays = 0;
  let maxDaysStay = 0;

  const ageGroups = {
    infants: 0,
    preschool: 0,
    schoolAge: 0,
    adolescents: 0,
  };

  const pathologyMap: Record<string, number> = {};

  patients.forEach((p) => {
    // Estados
    if (p.status === 'estable') stableCount++;
    else if (p.status === 'observacion') observationCount++;
    else if (p.status === 'critico') criticalCount++;

    // Días
    const days = calculateHospitalDays(p.admissionDate);
    totalStayDays += days;
    if (days > maxDaysStay) maxDaysStay = days;

    // Grupo etario
    if (p.ageYears < 2) {
      ageGroups.infants++;
    } else if (p.ageYears <= 5) {
      ageGroups.preschool++;
    } else if (p.ageYears <= 11) {
      ageGroups.schoolAge++;
    } else {
      ageGroups.adolescents++;
    }

    // Patologías
    const diag = p.primaryDiagnosis.split('(')[0].trim();
    pathologyMap[diag] = (pathologyMap[diag] || 0) + 1;
  });

  // Cálculo del Censo de Sectores y Censo 17 (Intermedios 4 + Generales 13)
  const intermediosBeds = [1, 2, 3, 4];
  const generalesBeds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const ectopicosBeds = [18, 19, 20];

  const intermediosFilled = patients.filter((p) => intermediosBeds.includes(p.bedNumber)).length;
  const intermediosEmpty = 4 - intermediosFilled;

  const generalesFilled = patients.filter((p) => generalesBeds.includes(p.bedNumber)).length;
  const generalesEmpty = 13 - generalesFilled;

  const ectopicosFilled = patients.filter((p) => ectopicosBeds.includes(p.bedNumber)).length;
  const ectopicosEmpty = 3 - ectopicosFilled;

  // Censo específico solicitado: Solo Generales y Unidad de Intermedios (17 camas)
  const census17Occupied = intermediosFilled + generalesFilled;
  const census17Empty = 17 - census17Occupied;
  const census17Rate = Math.round((census17Occupied / 17) * 100);

  const census17: Census17Stats = {
    total: 17,
    occupied: census17Occupied, // Llenas de 17
    empty: census17Empty,       // Vacías de 17
    occupancyRate: census17Rate,
    intermedios: {
      total: 4,
      occupied: intermediosFilled,
      empty: intermediosEmpty,
      occupancyRate: Math.round((intermediosFilled / 4) * 100),
    },
    generales: {
      total: 13,
      occupied: generalesFilled,
      empty: generalesEmpty,
      occupancyRate: Math.round((generalesFilled / 13) * 100),
    },
    ectopicos: {
      total: 3,
      occupied: ectopicosFilled,
      empty: ectopicosEmpty,
      occupancyRate: Math.round((ectopicosFilled / 3) * 100),
    },
  };

  const averageDaysStay = occupiedBeds > 0 ? Number((totalStayDays / occupiedBeds).toFixed(1)) : 0;

  const commonPathologies = Object.entries(pathologyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalBeds,
    occupiedBeds,
    availableBeds,
    occupancyRate,
    stableCount,
    observationCount,
    criticalCount,
    averageDaysStay,
    maxDaysStay,
    ageGroups,
    commonPathologies,
    census17,
  };
}
