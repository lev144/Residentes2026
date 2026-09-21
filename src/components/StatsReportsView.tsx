import React, { useState, useMemo } from 'react';
import { Patient, CensusReportStats } from '../types';
import {
  calculateHospitalDays,
  formatPediatricAge,
  getBedSector,
  getBedSectorBadgeInfo,
} from '../utils/helpers';
import { exportCensusToPdf } from '../utils/pdfGenerator';
import { getSevenDaysOccupancyHistory } from '../utils/historyHelper';
import { HistoricalOccupancyChart } from './HistoricalOccupancyChart';
import { StayDaysDistributionChart } from './StayDaysDistributionChart';
import {
  BarChart3,
  PieChart,
  Bed,
  Calendar,
  Clock,
  Printer,
  Copy,
  Check,
  Sparkles,
  Bot,
  Activity,
  ShieldAlert,
  Users,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';

interface StatsReportsViewProps {
  stats: CensusReportStats;
  patients: Patient[];
  doctorName?: string;
}

export const StatsReportsView: React.FC<StatsReportsViewProps> = ({
  stats,
  patients,
  doctorName = 'Cirujano Pediátrico',
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Ocupación histórica de los últimos 7 días con sincronización en tiempo real
  const historyData = useMemo(
    () => getSevenDaysOccupancyHistory(stats, patients),
    [stats, patients]
  );

  // Exportar reporte estadístico estructurado a PDF
  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      exportCensusToPdf(stats, patients, doctorName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Copiar Censo Médico Diario al portapapeles
  const handleCopyCensus = () => {
    const todayStr = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let reportText = `📋 CENSO DIARIO DE CIRUGÍA PEDIÁTRICA - SALA DE 20 CAMAS\n`;
    reportText += `Fecha: ${todayStr}\n`;
    reportText += `Médico a cargo: ${doctorName}\n\n`;
    reportText += `======================================================\n`;
    reportText += `⭐ CENSO: UNIDAD DE INTERMEDIOS Y CAMAS GENERALES (17 CAMAS)\n`;
    reportText += `======================================================\n`;
    reportText += `• Camas Llenas (Ocupadas): ${stats.census17.occupied} de 17\n`;
    reportText += `• Camas Vacías (Libres): ${stats.census17.empty} de 17\n`;
    reportText += `• Tasa de Ocupación (17 Camas): ${stats.census17.occupancyRate}%\n`;
    reportText += `  - 4 Camas de Unidad de Intermedios (Camas 01-04): ${stats.census17.intermedios.occupied} llenas | ${stats.census17.intermedios.empty} vacías\n`;
    reportText += `  - 13 Camas Generales (Camas 05-17): ${stats.census17.generales.occupied} llenas | ${stats.census17.generales.empty} vacías\n`;
    reportText += `• 3 Camas Ectópicos (Camas 18-20): ${stats.census17.ectopicos.occupied} llenas | ${stats.census17.ectopicos.empty} vacías\n`;
    reportText += `======================================================\n\n`;
    reportText += `Ocupación Global del Servicio: ${stats.occupiedBeds}/20 camas (${stats.occupancyRate}%)\n`;
    reportText += `Triaje: Estables: ${stats.stableCount} | Observación: ${stats.observationCount} | Críticos: ${stats.criticalCount}\n`;
    reportText += `Promedio de días de estancia: ${stats.averageDaysStay} días\n\n`;
    reportText += `------------------------------------------------------\n`;
    reportText += `DETALLE DE PACIENTES POR CAMA:\n`;
    reportText += `------------------------------------------------------\n\n`;

    const sortedPatients = [...patients].sort((a, b) => a.bedNumber - b.bedNumber);

    sortedPatients.forEach((p) => {
      const days = calculateHospitalDays(p.admissionDate);
      const statusIcon = p.status === 'critico' ? '🔴 CRÍTICO' : p.status === 'observacion' ? '🟡 OBSERVACIÓN' : '🟢 ESTABLE';

      reportText += `CAMA ${String(p.bedNumber).padStart(2, '0')}: ${p.firstName} ${p.lastName} (${formatPediatricAge(p.ageYears, p.ageMonths)})\n`;
      reportText += `  • Estado: ${statusIcon} | Estancia: ${days} días (Ingreso: ${p.admissionDate})\n`;
      reportText += `  • Diagnóstico: ${p.primaryDiagnosis}\n`;
      if (p.surgicalProcedure) {
        reportText += `  • Cirugía: ${p.surgicalProcedure} ${p.postOpDay !== undefined ? `(PO Día ${p.postOpDay})` : ''}\n`;
      }
      reportText += `  • Plan / Exámenes: ${p.currentPlans || 'Sin especificar'}\n`;
      reportText += `  • Plan Pendiente: ${p.pendingPlans || 'Ninguno'}\n\n`;
    });

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const censusPayload = {
        date: new Date().toISOString(),
        doctor: doctorName,
        totalBeds: 20,
        occupiedBeds: stats.occupiedBeds,
        occupancyRate: `${stats.occupancyRate}%`,
        statusBreakdown: {
          estables: stats.stableCount,
          observacion: stats.observationCount,
          criticos: stats.criticalCount,
        },
        averageDaysStay: stats.averageDaysStay,
        patients: patients.map((p) => ({
          bed: p.bedNumber,
          name: `${p.firstName} ${p.lastName}`,
          age: formatPediatricAge(p.ageYears, p.ageMonths),
          admissionDate: p.admissionDate,
          daysHospitalized: calculateHospitalDays(p.admissionDate),
          status: p.status,
          primaryDiagnosis: p.primaryDiagnosis,
          surgicalProcedure: p.surgicalProcedure,
          currentPlans: p.currentPlans,
          pendingPlans: p.pendingPlans,
        })),
      };

      const res = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ censusData: censusPayload }),
      });

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      setAiReport(data.report || 'Reporte generado con éxito.');
    } catch (err: any) {
      console.warn('Fallback to local analytics engine:', err);
      // Fallback local clínico en español
      const criticalPatients = patients.filter((p) => p.status === 'critico');
      const prolongedPatients = patients.filter(
        (p) => calculateHospitalDays(p.admissionDate) >= 5
      );

      setAiReport(
        `# 📑 Informe Ejecutivo Diario de Cirugía Pediátrica\n\n` +
          `**Fecha:** ${new Date().toLocaleDateString('es-ES')} | **Sala:** 20 Camas de Cirugía Infantil\n\n` +
          `### 1. Resumen de Ocupación y Triaje Clínico\n` +
          `- **Capacidad total:** 20 camas hospitalarias.\n` +
          `- **Ocupación actual:** ${stats.occupiedBeds} pacientes internados (${stats.occupancyRate}% de ocupación).\n` +
          `- **Camas libres para ingresos urgentes de pabellón:** ${stats.availableBeds} camas disponibles.\n` +
          `- **Distribución:** 🟢 **${stats.stableCount} Estables**, 🟡 **${stats.observationCount} en Observación**, 🔴 **${stats.criticalCount} Críticos**.\n\n` +
          `### 2. Prioridades de Pacientes Críticos (Respuesta Inmediata)\n` +
          (criticalPatients.length > 0
            ? criticalPatients
                .map(
                  (cp) =>
                    `- **Cama ${cp.bedNumber} - ${cp.firstName} ${cp.lastName}:** ${cp.primaryDiagnosis}. *Plan pendiente:* ${cp.pendingPlans}`
                )
                .join('\n')
            : `- No hay pacientes en condición crítica en este momento.`) +
          `\n\n### 3. Vigilancia de Estancias Prolongadas (≥ 5 días)\n` +
          (prolongedPatients.length > 0
            ? prolongedPatients
                .map((pp) => {
                  const d = calculateHospitalDays(pp.admissionDate);
                  return `- **Cama ${pp.bedNumber} - ${pp.firstName} ${pp.lastName}:** ${d} días de hospitalización (${pp.primaryDiagnosis}). Revisar retiro de vías/drenes o pase a domicilio.`;
                })
                .join('\n')
            : `- Todas las estancias están dentro del rango quirúrgico agudo promedio (< 5 días).`) +
          `\n\n### 4. Recomendaciones para el Pase de Guardia\n` +
          `- Garantizar el cumplimiento estricto del ayuno en pacientes con cirugías o procedimientos programados.\n` +
          `- Cotejar resultados de hemogramas, cultivos y ecografías pendientes en el pase de turno.\n` +
          `- Brindar apoyo empático e información clara a los padres de familia de los pacientes internados.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de Reportes con acciones */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              Reportes Estadísticos Diarios
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
              Actualizado Hoy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Métricas de ocupación, días de estancia hospitalaria y censo para entrega de guardia quirúrgica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón de Exportación a PDF */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-1.5 transition-all shadow-xs border border-sky-600 cursor-pointer"
            title="Exportar reporte estadístico y censo de pacientes a documento PDF estructurado"
          >
            {isExportingPdf ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Generando PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-100">¡PDF Descargado!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-sky-200" />
                <span>Exportar Reporte a PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyCensus}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>¡Censo Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Censo Médico</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Censo</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateAiReport}
            disabled={isGeneratingAi}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white shadow-md shadow-indigo-200 dark:shadow-none flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isGeneratingAi ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Analizando Censo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generar Análisis Clínico con IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ⭐ CENSO DESTACADO: UNIDAD DE INTERMEDIOS Y CAMAS GENERALES (17 CAMAS) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-sky-950 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-500/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-bold mb-1.5">
              <span>🏥</span>
              <span>CENSO PRIORITARIO QUIRÚRGICO</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white font-['Fredoka',sans-serif]">
              Censo: Unidad de Intermedios y Camas Generales (17 Camas)
            </h3>
            <p className="text-xs text-indigo-200 font-medium">
              Conteo central: 4 Camas de Unidad de Intermedios + 13 Camas Generales
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Llenas */}
            <div className="bg-white/10 border border-indigo-300/20 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold block">
                Camas Llenas
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300">
                {stats.census17.occupied}
              </span>
              <span className="text-[10px] text-slate-300 block font-bold">
                de 17 Camas
              </span>
            </div>

            {/* Vacías */}
            <div className="bg-white/10 border border-emerald-300/20 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                Camas Vacías
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                {stats.census17.empty}
              </span>
              <span className="text-[10px] text-emerald-200/80 block font-bold">
                Disponibles
              </span>
            </div>

            {/* Tasa */}
            <div className="hidden sm:block bg-white/10 border border-sky-300/20 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
              <span className="text-[10px] uppercase tracking-wider text-sky-200 font-bold block">
                Ocupación
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats.census17.occupancyRate}%
              </span>
              <span className="text-[10px] text-sky-200/80 block font-bold">
                Tasa bloque
              </span>
            </div>
          </div>
        </div>

        {/* Desglose de los sectores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          {/* Intermedios */}
          <div className="bg-purple-950/60 border border-purple-500/40 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-purple-200 mb-1">
              <span className="font-bold flex items-center gap-1">
                <span>🏥</span> 4 Camas de Unidad de Intermedios
              </span>
              <span className="text-[10px] text-purple-300">Camas 01-04</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-white font-extrabold text-sm">
                <span className="text-amber-300 font-black">{stats.census17.intermedios.occupied}</span> llenas ·{' '}
                <span className="text-emerald-300 font-black">{stats.census17.intermedios.empty}</span> vacías
              </span>
              <span className="text-purple-300 text-[11px] font-bold">
                {stats.census17.intermedios.occupancyRate}%
              </span>
            </div>
          </div>

          {/* Generales */}
          <div className="bg-sky-950/60 border border-sky-500/40 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-sky-200 mb-1">
              <span className="font-bold flex items-center gap-1">
                <span>🛏️</span> 13 Camas Generales
              </span>
              <span className="text-[10px] text-sky-300">Camas 05-17</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-white font-extrabold text-sm">
                <span className="text-amber-300 font-black">{stats.census17.generales.occupied}</span> llenas ·{' '}
                <span className="text-emerald-300 font-black">{stats.census17.generales.empty}</span> vacías
              </span>
              <span className="text-sky-300 text-[11px] font-bold">
                {stats.census17.generales.occupancyRate}%
              </span>
            </div>
          </div>

          {/* Ectópicos */}
          <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-amber-200 mb-1">
              <span className="font-bold flex items-center gap-1">
                <span>🏷️</span> 3 Camas Ectópicos
              </span>
              <span className="text-[10px] text-amber-300">Camas 18-20</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-white font-extrabold text-sm">
                <span className="text-amber-300 font-black">{stats.census17.ectopicos.occupied}</span> llenas ·{' '}
                <span className="text-emerald-300 font-black">{stats.census17.ectopicos.empty}</span> vacías
              </span>
              <span className="text-amber-300 text-[11px] font-bold">
                {stats.census17.ectopicos.occupancyRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas Principales de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ocupación de las 20 Camas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-sky-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ocupación de Sala</span>
            <Bed className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Fredoka',sans-serif] text-slate-900 dark:text-slate-100">
              {stats.occupancyRate}%
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ({stats.occupiedBeds} de 20 Camas)
            </span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.occupancyRate >= 90
                  ? 'bg-rose-500'
                  : stats.occupancyRate >= 70
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
              style={{ width: `${stats.occupancyRate}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {stats.availableBeds} {stats.availableBeds === 1 ? 'cama disponible' : 'camas disponibles'} para ingresos
          </p>
        </div>

        {/* 2. Triaje de los 3 Estados Clínicos */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-sky-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Triaje Clínico</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.stableCount}</span>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">Estables</p>
            </div>
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
              <span className="text-xl font-black text-amber-800 dark:text-amber-300">{stats.observationCount}</span>
              <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400">Observación</p>
            </div>
            <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
              <span className="text-xl font-black text-rose-700 dark:text-rose-300">{stats.criticalCount}</span>
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-400">Críticos</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium text-center">
            {stats.criticalCount > 0 ? '⚠️ Atención inmediata en críticos' : '✓ Sin pacientes críticos hoy'}
          </p>
        </div>

        {/* 3. Días de Estancia Promedio */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-sky-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estancia Hospitalaria</span>
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Fredoka',sans-serif] text-slate-900 dark:text-slate-100">
              {stats.averageDaysStay}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">días promedio</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl">
            <span>Estancia Máxima:</span>
            <span className="font-black text-rose-600 dark:text-rose-400">{stats.maxDaysStay} días</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Meta quirúrgica pediátrica: &lt; 4.5 días
          </p>
        </div>

        {/* 4. Pacientes por Grupo Etario */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-sky-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Demografía Pediátrica</span>
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-1.5 text-xs mt-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Lactantes (&lt; 2 a):</span>
              <span className="font-black text-sky-700 dark:text-sky-400">{stats.ageGroups.infants}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Preescolares (2-5 a):</span>
              <span className="font-black text-sky-700 dark:text-sky-400">{stats.ageGroups.preschool}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Escolares (6-11 a):</span>
              <span className="font-black text-sky-700 dark:text-sky-400">{stats.ageGroups.schoolAge}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Adolescentes (12+ a):</span>
              <span className="font-black text-sky-700 dark:text-sky-400">{stats.ageGroups.adolescents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reporte Ejecutivo Generado con IA (si está activo) */}
      {aiReport && (
        <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-md animate-fade-in relative transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-200/60 dark:border-indigo-800/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-indigo-950 dark:text-indigo-200 font-['Fredoka',sans-serif]">
                  Análisis Clínico y Briefing Diario con IA (Gemini)
                </h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-400">
                  Generado automáticamente para el equipo de Cirugía Pediátrica
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAiReport(null)}
              className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 cursor-pointer"
            >
              Cerrar Reporte
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-white/70 dark:bg-slate-900/80 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900">
            {aiReport}
          </div>
        </div>
      )}

      {/* Visualización de Ocupación Histórica de los Últimos 7 Días (Recharts) */}
      <HistoricalOccupancyChart historyData={historyData} />

      {/* Visualización de Distribución de Días de Estancia (Recharts BarChart) */}
      <StayDaysDistributionChart patients={patients} />

      {/* Desglose Gráfico de Estados y Patologías Frecuentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribución de Estados Clínicos */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-sky-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Distribución de Pacientes por Estado Clínico
          </h3>
          <div className="space-y-3 pt-2">
            {/* Estable */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Estables ({stats.stableCount} pacientes)
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.occupiedBeds > 0
                    ? Math.round((stats.stableCount / stats.occupiedBeds) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${stats.occupiedBeds > 0 ? (stats.stableCount / stats.occupiedBeds) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Observación */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  En Observación ({stats.observationCount} pacientes)
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.occupiedBeds > 0
                    ? Math.round((stats.observationCount / stats.occupiedBeds) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${stats.occupiedBeds > 0 ? (stats.observationCount / stats.occupiedBeds) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Crítico */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  Críticos ({stats.criticalCount} pacientes)
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.occupiedBeds > 0
                    ? Math.round((stats.criticalCount / stats.occupiedBeds) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full"
                  style={{
                    width: `${stats.occupiedBeds > 0 ? (stats.criticalCount / stats.occupiedBeds) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Patologías Quirúrgicas Frecuentes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-sky-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Patologías Quirúrgicas más Frecuentes en Sala
          </h3>
          <div className="space-y-2.5 pt-2">
            {stats.commonPathologies.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-slate-700/50 transition-colors text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                  {idx + 1}. {item.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-extrabold text-[11px] border border-sky-200 dark:border-sky-800">
                  {item.count} {item.count === 1 ? 'paciente' : 'pacientes'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📄 SECCIÓN DE EXPORTACIÓN Y CENSO ESTRUCTURADO EN PDF */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[11px] font-extrabold mb-1 border border-sky-200 dark:border-sky-800">
              <FileDown className="w-3.5 h-3.5" />
              <span>Documento Oficial de Entrega de Guardia</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Fredoka',sans-serif]">
              Censo Clínico Estructurado y Reporte Diario de Pacientes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Previsualización de los datos actuales de hospitalización que se integran en el archivo PDF estructurado.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-700 via-indigo-700 to-sky-800 hover:from-sky-800 hover:to-indigo-800 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-200 dark:shadow-none cursor-pointer shrink-0"
          >
            {isExportingPdf ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Generando Documento PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Reporte PDF Generado y Descargado!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Descargar Reporte PDF Estructurado</span>
              </>
            )}
          </button>
        </div>

        {/* Tabla estructurada de pacientes */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Cama / Sector</th>
                <th className="py-2.5 px-3">Paciente / Edad</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Estancia</th>
                <th className="py-2.5 px-3">Diagnóstico y Cirugía</th>
                <th className="py-2.5 px-3">Plan Actual</th>
                <th className="py-2.5 px-3">Plan Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {[...patients]
                .sort((a, b) => a.bedNumber - b.bedNumber)
                .map((p) => {
                  const days = calculateHospitalDays(p.admissionDate);
                  const badge = getBedSectorBadgeInfo(p.bedNumber);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 dark:text-slate-100 text-xs">
                            Cama {String(p.bedNumber).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.shortLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatPediatricAge(p.ageYears, p.ageMonths)} · {p.gender === 'F' ? 'Femenino' : 'Masculino'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            p.status === 'critico'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : p.status === 'observacion'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{days} días</span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Ing: {p.admissionDate}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{p.primaryDiagnosis}</div>
                        {p.surgicalProcedure && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                            Cirugía: {p.surgicalProcedure}{' '}
                            {p.postOpDay !== undefined ? `(PO D${p.postOpDay})` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] text-[11px] truncate">
                        {p.currentPlans || 'Sin especificar'}
                      </td>
                      <td className="py-2.5 px-3 text-amber-900 dark:text-amber-300 max-w-[180px] text-[11px] font-medium truncate">
                        {p.pendingPlans || 'Ninguno'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span>
            Total: <strong className="text-slate-800 dark:text-slate-200">{patients.length} pacientes</strong> en censo activo
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            El archivo PDF incluye encabezado institucional, cuadro de 4 métricas, tabla y sección de firmas médicas.
          </span>
        </div>
      </div>
    </div>
  );
};
