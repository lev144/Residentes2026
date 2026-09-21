import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DailyOccupancyPoint } from '../utils/historyHelper';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  Activity,
  Bed,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface HistoricalOccupancyChartProps {
  historyData: DailyOccupancyPoint[];
}

export const HistoricalOccupancyChart: React.FC<HistoricalOccupancyChartProps> = ({
  historyData,
}) => {
  const [chartType, setChartType] = useState<'occupancy' | 'sectors' | 'clinical'>('occupancy');

  if (!historyData || historyData.length === 0) {
    return null;
  }

  // Cálculos estadísticos de los 7 días
  const avgOccupancyRate = Math.round(
    historyData.reduce((acc, curr) => acc + curr.occupancyRate, 0) / historyData.length
  );
  const avgBeds = (
    historyData.reduce((acc, curr) => acc + curr.occupiedBeds, 0) / historyData.length
  ).toFixed(1);

  const maxOccupied = Math.max(...historyData.map((d) => d.occupiedBeds));
  const minOccupied = Math.min(...historyData.map((d) => d.occupiedBeds));

  const firstDay = historyData[0];
  const lastDay = historyData[historyData.length - 1];
  const trendDiff = lastDay.occupiedBeds - firstDay.occupiedBeds;

  // Custom Tooltip estilizado con Tailwind
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyOccupancyPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md text-xs min-w-[200px] z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
            <span className="font-black text-sm text-sky-300">{data.dayLabel}</span>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                Hoy (En Vivo)
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Ocupación Total:</span>
              <span className="font-extrabold text-white text-sm">
                {data.occupiedBeds}/20 camas ({data.occupancyRate}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Bloque 17 Camas:</span>
              <span className="font-bold text-indigo-300">{data.census17Occupied}/17 camas</span>
            </div>

            <div className="pt-1.5 mt-1.5 border-t border-slate-800 grid grid-cols-3 gap-1 text-[10px] text-center">
              <div className="bg-purple-900/40 p-1 rounded-lg border border-purple-500/30">
                <span className="block text-purple-300 font-bold">Interm.</span>
                <span className="text-white font-black">{data.intermediosOccupied}/4</span>
              </div>
              <div className="bg-sky-900/40 p-1 rounded-lg border border-sky-500/30">
                <span className="block text-sky-300 font-bold">Gral.</span>
                <span className="text-white font-black">{data.generalesOccupied}/13</span>
              </div>
              <div className="bg-amber-900/40 p-1 rounded-lg border border-amber-500/30">
                <span className="block text-amber-300 font-bold">Ectóp.</span>
                <span className="text-white font-black">{data.ectopicosOccupied}/3</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] flex items-center justify-between text-slate-300">
              <span>Triaje:</span>
              <span className="font-medium">
                <strong className="text-emerald-400">{data.stableCount}</strong> Est ·{' '}
                <strong className="text-amber-400">{data.observationCount}</strong> Obs ·{' '}
                <strong className="text-rose-400">{data.criticalCount}</strong> Crít
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
      {/* Encabezado y Selector de Vistas de Gráficos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>TENDENCIA HISTÓRICA RECIENTE</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-['Fredoka',sans-serif]">
            Ocupación Histórica de Camas (Últimos 7 Días)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Seguimiento longitudinal de hospitalización en la sala de 20 camas de cirugía infantil.
          </p>
        </div>

        {/* Botones de conmutación de vista */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl self-start text-xs font-bold">
          <button
            type="button"
            onClick={() => setChartType('occupancy')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              chartType === 'occupancy'
                ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bed className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ocupación Global</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('sectors')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              chartType === 'sectors'
                ? 'bg-white dark:bg-slate-900 text-sky-900 dark:text-sky-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Por Sectores</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('clinical')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              chartType === 'clinical'
                ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Triaje Clínico</span>
          </button>
        </div>
      </div>

      {/* Tarjetas resumen de métricas de los 7 días */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Promedio 7 Días
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-['Fredoka',sans-serif]">
              {avgOccupancyRate}%
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              ({avgBeds} camas)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
            Pico Máximo
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-950 dark:text-amber-200 font-['Fredoka',sans-serif]">
              {maxOccupied}
            </span>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
              de 20 camas ({Math.round((maxOccupied / 20) * 100)}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60">
          <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider block">
            Mínimo Semanal
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-teal-950 dark:text-teal-200 font-['Fredoka',sans-serif]">
              {minOccupied}
            </span>
            <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400">
              de 20 camas ({Math.round((minOccupied / 20) * 100)}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60">
          <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
            Tendencia 7D
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {trendDiff > 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">+{trendDiff} camas</span>
              </>
            ) : trendDiff < 0 ? (
              <>
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">{trendDiff} camas</span>
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">Estable</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ÁREA DEL GRÁFICO RECHARTS */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'occupancy' ? (
            <AreaChart data={historyData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="census17Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="shortDay"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 20]}
                ticks={[0, 5, 10, 15, 17, 20]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={17}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: 'Capacidad 17 Camas',
                  fill: '#6366f1',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <ReferenceLine
                y={20}
                stroke="#94a3b8"
                strokeDasharray="2 2"
                label={{
                  value: 'Total 20 Camas',
                  fill: '#94a3b8',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              <Area
                type="monotone"
                dataKey="occupiedBeds"
                name="Total Camas Ocupadas"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#occupancyGradient)"
                activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Area
                type="monotone"
                dataKey="census17Occupied"
                name="Bloque 17 Camas (Interm. + Gral.)"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#census17Gradient)"
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
            </AreaChart>
          ) : chartType === 'sectors' ? (
            <BarChart data={historyData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="shortDay"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 20]}
                ticks={[0, 4, 8, 12, 16, 20]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="3 3" />
              <Bar
                dataKey="intermediosOccupied"
                name="Unidad de Intermedios (Máx. 4)"
                stackId="sectors"
                fill="#8b5cf6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="generalesOccupied"
                name="Camas Generales (Máx. 13)"
                stackId="sectors"
                fill="#0ea5e9"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="ectopicosOccupied"
                name="Camas Ectópicos (Máx. 3)"
                stackId="sectors"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
            </BarChart>
          ) : (
            <LineChart data={historyData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="shortDay"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 16]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="stableCount"
                name="Estables"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="observationCount"
                name="En Observación"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="criticalCount"
                name="Críticos"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          Pasa el cursor sobre los días para ver el desglose clínico y de camas por sector.
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Datos actualizados en tiempo real según los pacientes hospitalizados.
        </span>
      </div>
    </div>
  );
};
