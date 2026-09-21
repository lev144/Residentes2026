import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { Patient } from '../types';
import { calculateHospitalDays, formatPediatricAge } from '../utils/helpers';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Bed,
  BarChart3,
  ListFilter,
  ShieldAlert,
} from 'lucide-react';

interface StayDaysDistributionChartProps {
  patients: Patient[];
}

interface StayRangeGroup {
  id: string;
  rangeLabel: string;
  shortLabel: string;
  description: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  patients: Array<{
    bedNumber: number;
    name: string;
    age: string;
    days: number;
    diagnosis: string;
    status: 'estable' | 'observacion' | 'critico';
  }>;
  color: string;
  darkColor: string;
  bgBadge: string;
}

export const StayDaysDistributionChart: React.FC<StayDaysDistributionChartProps> = ({
  patients,
}) => {
  const [viewMode, setViewMode] = useState<'ranges' | 'beds'>('ranges');

  // Procesamiento de datos de pacientes y días de estancia
  const patientStayData = useMemo(() => {
    return patients
      .map((p) => {
        const days = calculateHospitalDays(p.admissionDate);
        return {
          id: p.id,
          bedNumber: p.bedNumber,
          bedLabel: `Cama ${String(p.bedNumber).padStart(2, '0')}`,
          shortBedLabel: `C${String(p.bedNumber).padStart(2, '0')}`,
          fullName: `${p.firstName} ${p.lastName}`,
          firstName: p.firstName,
          age: formatPediatricAge(p.ageYears, p.ageMonths),
          admissionDate: p.admissionDate,
          days,
          primaryDiagnosis: p.primaryDiagnosis,
          surgicalProcedure: p.surgicalProcedure,
          postOpDay: p.postOpDay,
          status: p.status,
          isProlonged: days >= 5,
        };
      })
      .sort((a, b) => a.bedNumber - b.bedNumber);
  }, [patients]);

  // Métricas estadísticas generales
  const metrics = useMemo(() => {
    if (patientStayData.length === 0) {
      return {
        total: 0,
        average: 0,
        median: 0,
        maxDays: 0,
        maxPatient: null as (typeof patientStayData)[0] | null,
        prolongedCount: 0,
        prolongedRate: 0,
        shortStayCount: 0,
      };
    }

    const daysArray = patientStayData.map((p) => p.days).sort((a, b) => a - b);
    const sum = daysArray.reduce((acc, curr) => acc + curr, 0);
    const average = parseFloat((sum / daysArray.length).toFixed(1));

    // Mediana
    const mid = Math.floor(daysArray.length / 2);
    const median =
      daysArray.length % 2 !== 0
        ? daysArray[mid]
        : parseFloat(((daysArray[mid - 1] + daysArray[mid]) / 2).toFixed(1));

    const maxDays = daysArray[daysArray.length - 1];
    const maxPatient = patientStayData.find((p) => p.days === maxDays) || null;
    const prolongedCount = patientStayData.filter((p) => p.days >= 5).length;
    const prolongedRate = Math.round((prolongedCount / patientStayData.length) * 100);
    const shortStayCount = patientStayData.filter((p) => p.days <= 2).length;

    return {
      total: patientStayData.length,
      average,
      median,
      maxDays,
      maxPatient,
      prolongedCount,
      prolongedRate,
      shortStayCount,
    };
  }, [patientStayData]);

  // Agrupación por Rangos Clínicos de Estancia
  const rangeGroups: StayRangeGroup[] = useMemo(() => {
    const total = patientStayData.length;

    const definitions = [
      {
        id: 'r1_2',
        rangeLabel: '1 - 2 días',
        shortLabel: '1-2 d',
        description: 'Postoperatorio Inmediato / Corta Estancia',
        min: 1,
        max: 2,
        color: '#10b981', // Emerald 500
        darkColor: '#34d399',
        bgBadge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      },
      {
        id: 'r3_4',
        rangeLabel: '3 - 4 días',
        shortLabel: '3-4 d',
        description: 'Estancia Quirúrgica Habitual Favorable',
        min: 3,
        max: 4,
        color: '#0284c7', // Sky 600
        darkColor: '#38bdf8',
        bgBadge: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      },
      {
        id: 'r5_7',
        rangeLabel: '5 - 7 días',
        shortLabel: '5-7 d',
        description: 'Estancia Intermedia / Monitoreo Clínico',
        min: 5,
        max: 7,
        color: '#f59e0b', // Amber 500
        darkColor: '#fbbf24',
        bgBadge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      },
      {
        id: 'r8_14',
        rangeLabel: '8 - 14 días',
        shortLabel: '8-14 d',
        description: 'Estancia Prolongada Quirúrgica',
        min: 8,
        max: 14,
        color: '#ea580c', // Orange 600
        darkColor: '#fb923c',
        bgBadge: 'bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      },
      {
        id: 'r15_plus',
        rangeLabel: '≥ 15 días',
        shortLabel: '≥ 15 d',
        description: 'Estancia Crónica / Alta Complejidad',
        min: 15,
        max: 999,
        color: '#e11d48', // Rose 600
        darkColor: '#f43f5e',
        bgBadge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      },
    ];

    return definitions.map((def) => {
      const matchingPatients = patientStayData.filter(
        (p) => p.days >= def.min && p.days <= def.max
      );
      const count = matchingPatients.length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      return {
        ...def,
        count,
        percentage,
        patients: matchingPatients.map((p) => ({
          bedNumber: p.bedNumber,
          name: p.fullName,
          age: p.age,
          days: p.days,
          diagnosis: p.primaryDiagnosis,
          status: p.status,
        })),
      };
    });
  }, [patientStayData]);

  // Color de barra individual por cama (según estado de alerta o estado clínico)
  const getBedBarColor = (item: (typeof patientStayData)[0]) => {
    if (item.status === 'critico') return '#e11d48'; // Rose
    if (item.days >= 8) return '#ea580c'; // Orange
    if (item.days >= 5) return '#f59e0b'; // Amber
    if (item.status === 'observacion') return '#d97706'; // Amber oscuro
    return '#0284c7'; // Sky
  };

  // Tooltip personalizado para vista por Rangos
  const RangeCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: StayRangeGroup = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs min-w-[220px] max-w-[320px] z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
            <span className="font-black text-sm text-sky-300">{data.rangeLabel}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-200">
              {data.percentage}% del censo
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2 font-medium">{data.description}</p>
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/80 mb-2">
            <span className="text-slate-400">Total Pacientes:</span>
            <span className="font-extrabold text-white text-sm">
              {data.count} {data.count === 1 ? 'paciente' : 'pacientes'}
            </span>
          </div>

          {data.patients.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Pacientes en este rango:
              </span>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {data.patients.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] bg-slate-800/50 px-2 py-1 rounded-md"
                  >
                    <span className="font-bold text-slate-200 truncate max-w-[150px]">
                      Cama {String(p.bedNumber).padStart(2, '0')}: {p.name}
                    </span>
                    <span className="font-black text-sky-300 shrink-0 ml-2">{p.days}d</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para vista individual por Cama
  const BedCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statusLabel =
        data.status === 'critico'
          ? '🔴 Crítico'
          : data.status === 'observacion'
          ? '🟡 Observación'
          : '🟢 Estable';

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs min-w-[240px] max-w-[320px] z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
            <span className="font-black text-sm text-sky-300">
              {data.bedLabel} · {data.fullName}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {data.age}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Días Hospitalizado:</span>
              <span
                className={`font-black text-sm ${
                  data.days >= 5 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {data.days} {data.days === 1 ? 'día' : 'días'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fecha de Ingreso:</span>
              <span className="font-semibold text-slate-200">{data.admissionDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Triaje Clínico:</span>
              <span className="font-bold text-slate-200">{statusLabel}</span>
            </div>

            <div className="pt-1.5 mt-1.5 border-t border-slate-800">
              <p className="text-[11px] text-slate-300 font-semibold leading-snug">
                <span className="text-slate-400 font-normal">Dx: </span>
                {data.primaryDiagnosis}
              </p>
              {data.surgicalProcedure && (
                <p className="text-[10px] text-indigo-300 mt-1">
                  Cirugía: {data.surgicalProcedure}{' '}
                  {data.postOpDay !== undefined ? `(PO D${data.postOpDay})` : ''}
                </p>
              )}
            </div>

            {data.isProlonged && (
              <div className="mt-2 pt-1.5 border-t border-amber-900/60 flex items-center gap-1.5 text-[10px] text-amber-300 font-bold bg-amber-950/40 p-1.5 rounded-lg border border-amber-800/60">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Alerta: Estancia prolongada (≥ 5 días)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (patients.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-sky-100 dark:border-slate-800 shadow-sm text-center">
        <Bed className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h3 className="text-base font-black text-slate-700 dark:text-slate-300 font-['Fredoka',sans-serif]">
          Distribución de Días de Estancia
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          No hay pacientes actualmente hospitalizados en las 20 camas para calcular la distribución.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
      {/* Encabezado y Control de Conmutación */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold mb-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>INDICADOR QUIRÚRGICO DE TIEMPO</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Fredoka',sans-serif] flex items-center gap-2">
            Distribución de Días de Estancia Hospitalaria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Visualización con Recharts del tiempo de internamiento de los {patientStayData.length}{' '}
            pacientes activos en el servicio.
          </p>
        </div>

        {/* Selector de Modo de Visualización */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl self-start text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('ranges')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'ranges'
                ? 'bg-white dark:bg-slate-900 text-sky-900 dark:text-sky-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Por Rangos Clínicos</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('beds')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'beds'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Por Paciente / Cama</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Resumen de Métricas de Estancia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Promedio */}
        <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60">
          <span className="text-[11px] font-bold text-sky-800 dark:text-sky-400 uppercase tracking-wider block">
            Promedio de Estancia
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-sky-950 dark:text-sky-100 font-['Fredoka',sans-serif]">
              {metrics.average}
            </span>
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">días / paciente</span>
          </div>
          <p className="text-[10px] text-sky-600 dark:text-sky-500 mt-1 font-medium">
            Meta pediátrica: &lt; 4.5 d
          </p>
        </div>

        {/* Mediana */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60">
          <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
            Mediana de Estancia
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100 font-['Fredoka',sans-serif]">
              {metrics.median}
            </span>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">días</span>
          </div>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
            50% de pacientes ≤ {metrics.median}d
          </p>
        </div>

        {/* Estancia Máxima */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60">
          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider block">
            Estancia Máxima
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-rose-950 dark:text-rose-100 font-['Fredoka',sans-serif]">
              {metrics.maxDays}
            </span>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
              días {metrics.maxPatient ? `(Cama ${String(metrics.maxPatient.bedNumber).padStart(2, '0')})` : ''}
            </span>
          </div>
          <p className="text-[10px] text-rose-700 dark:text-rose-400 mt-1 font-medium truncate">
            {metrics.maxPatient ? `${metrics.maxPatient.firstName}` : 'Sin datos'}
          </p>
        </div>

        {/* Alerta Prolongada (≥ 5 días) */}
        <div
          className={`p-3.5 rounded-2xl border transition-colors ${
            metrics.prolongedCount > 0
              ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-200/90 dark:border-amber-900/70'
              : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60'
          }`}
        >
          <span
            className={`text-[11px] font-bold uppercase tracking-wider block ${
              metrics.prolongedCount > 0
                ? 'text-amber-900 dark:text-amber-400'
                : 'text-emerald-800 dark:text-emerald-400'
            }`}
          >
            Estancia Prolongada (≥5d)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-2xl font-black font-['Fredoka',sans-serif] ${
                metrics.prolongedCount > 0
                  ? 'text-amber-950 dark:text-amber-200'
                  : 'text-emerald-950 dark:text-emerald-200'
              }`}
            >
              {metrics.prolongedCount}
            </span>
            <span
              className={`text-[11px] font-bold ${
                metrics.prolongedCount > 0
                  ? 'text-amber-800 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              ({metrics.prolongedRate}% del censo)
            </span>
          </div>
          <p
            className={`text-[10px] mt-1 font-medium ${
              metrics.prolongedCount > 0
                ? 'text-amber-800 dark:text-amber-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {metrics.prolongedCount > 0 ? '⚠️ Requiere revisión de alta' : '✓ Todas en rango normal'}
          </p>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DEL GRÁFICO RECHARTS */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'ranges' ? (
            /* GRÁFICO 1: DISTRIBUCIÓN POR RANGOS DE ESTANCIA */
            <BarChart
              data={rangeGroups}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#94a3b8"
                strokeOpacity={0.25}
              />
              <XAxis
                dataKey="rangeLabel"
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'N° de Pacientes',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 11,
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                content={<RangeCustomTooltip />}
                cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              />
              <Bar
                dataKey="count"
                name="Pacientes"
                radius={[10, 10, 0, 0]}
                maxBarSize={64}
                animationDuration={800}
              >
                {rangeGroups.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#475569"
                  fontSize={12}
                  fontWeight="bold"
                  formatter={(val: any) => (Number(val) > 0 ? `${val} pac.` : '')}
                />
              </Bar>
            </BarChart>
          ) : (
            /* GRÁFICO 2: DETALLE INDIVIDUAL DE DÍAS POR CAMA Y PACIENTE */
            <BarChart
              data={patientStayData}
              margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#94a3b8"
                strokeOpacity={0.25}
              />
              <XAxis
                dataKey="shortBedLabel"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Días de Hospitalización',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 11,
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                content={<BedCustomTooltip />}
                cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              />
              {/* Línea de corte de Alerta: Estancia prolongada a los 5 días */}
              <ReferenceLine
                y={5}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'Umbral Estancia Prolongada (≥ 5 días)',
                  position: 'top',
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />
              {/* Línea de Promedio de la sala */}
              {metrics.average > 0 && (
                <ReferenceLine
                  y={metrics.average}
                  stroke="#0284c7"
                  strokeDasharray="2 2"
                  strokeWidth={1.5}
                  label={{
                    value: `Promedio (${metrics.average} d)`,
                    position: 'right',
                    fill: '#0284c7',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
              )}
              <Bar
                dataKey="days"
                name="Días de Estancia"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                animationDuration={800}
              >
                {patientStayData.map((entry) => (
                  <Cell key={`cell-bed-${entry.id}`} fill={getBedBarColor(entry)} />
                ))}
                <LabelList
                  dataKey="days"
                  position="top"
                  fill="#475569"
                  fontSize={11}
                  fontWeight="bold"
                  formatter={(val: any) => `${val}d`}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Leyenda y Desglose Informativo de los Rangos */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {rangeGroups.map((group) => (
          <div
            key={group.id}
            className={`p-2.5 rounded-2xl border transition-all ${
              group.count > 0
                ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                : 'bg-transparent border-dashed border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: group.color }}
              ></span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {group.rangeLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black text-slate-900 dark:text-slate-100 font-['Fredoka',sans-serif]">
                {group.count} {group.count === 1 ? 'pac.' : 'pac.'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {group.percentage}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight truncate">
              {group.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
