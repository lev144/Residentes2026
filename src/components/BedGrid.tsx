import React, { useState } from 'react';
import { Patient, PatientStatus, ClinicalAlert, BedSector } from '../types';
import { calculateHospitalDays, formatPediatricAge, getBedSector, getBedSectorBadgeInfo } from '../utils/helpers';
import { PediatricAvatar } from './PediatricAvatar';
import {
  Bed,
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Activity,
  Plus,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface BedGridProps {
  patients: Patient[];
  alerts: ClinicalAlert[];
  onSelectPatient: (patient: Patient) => void;
  onSelectEmptyBed: (bedNumber: number) => void;
  onOpenDischargeModal?: (patient: Patient) => void;
}

export const BedGrid: React.FC<BedGridProps> = ({
  patients,
  alerts,
  onSelectPatient,
  onSelectEmptyBed,
  onOpenDischargeModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'occupied' | 'empty' | PatientStatus | 'with-alerts'
  >('all');
  const [sectorFilter, setSectorFilter] = useState<
    'all' | 'intermedios_y_generales_17' | 'intermedios' | 'generales' | 'ectopicos'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Cálculos específicos de Sectores y Censo de las 17 Camas
  const intermediosPatients = patients.filter((p) => p.bedNumber >= 1 && p.bedNumber <= 4);
  const generalesPatients = patients.filter((p) => p.bedNumber >= 5 && p.bedNumber <= 17);
  const ectopicosPatients = patients.filter((p) => p.bedNumber >= 18 && p.bedNumber <= 20);

  // Censo exclusivo solicitado: Intermedios (4) + Generales (13) = 17 camas
  const census17Occupied = intermediosPatients.length + generalesPatients.length; // LLENAS
  const census17Empty = 17 - census17Occupied; // VACÍAS
  const census17Rate = Math.round((census17Occupied / 17) * 100);

  // Desglose por sectores
  const intermediosFilled = intermediosPatients.length;
  const intermediosEmpty = 4 - intermediosFilled;

  const generalesFilled = generalesPatients.length;
  const generalesEmpty = 13 - generalesFilled;

  const ectopicosFilled = ectopicosPatients.length;
  const ectopicosEmpty = 3 - ectopicosFilled;

  // Generar las 20 camas fijas (1 a 20)
  const allBeds = Array.from({ length: 20 }, (_, index) => {
    const bedNumber = index + 1;
    const patient = patients.find((p) => p.bedNumber === bedNumber);
    const bedAlerts = alerts.filter((a) => a.bedNumber === bedNumber);
    const sector = getBedSector(bedNumber);
    return {
      bedNumber,
      isOccupied: !!patient,
      patient,
      alerts: bedAlerts,
      sector,
    };
  });

  // Filtrar camas
  const filteredBeds = allBeds.filter((bed) => {
    // Filtro por Sector
    if (sectorFilter === 'intermedios_y_generales_17') {
      if (bed.bedNumber > 17) return false;
    } else if (sectorFilter === 'intermedios') {
      if (bed.sector !== 'intermedios') return false;
    } else if (sectorFilter === 'generales') {
      if (bed.sector !== 'generales') return false;
    } else if (sectorFilter === 'ectopicos') {
      if (bed.sector !== 'ectopicos') return false;
    }

    // Filtro por estado
    if (filterStatus === 'occupied' && !bed.isOccupied) return false;
    if (filterStatus === 'empty' && bed.isOccupied) return false;
    if (filterStatus === 'estable' && bed.patient?.status !== 'estable') return false;
    if (filterStatus === 'observacion' && bed.patient?.status !== 'observacion') return false;
    if (filterStatus === 'critico' && bed.patient?.status !== 'critico') return false;
    if (filterStatus === 'with-alerts' && bed.alerts.length === 0) return false;

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const bedMatch = `cama ${bed.bedNumber}`.includes(q) || String(bed.bedNumber) === q;
      if (bedMatch) return true;
      if (!bed.patient) return false;

      const nameMatch = `${bed.patient.firstName} ${bed.patient.lastName}`.toLowerCase().includes(q);
      const diagMatch =
        bed.patient.primaryDiagnosis.toLowerCase().includes(q) ||
        bed.patient.diagnoses.some((d) => d.toLowerCase().includes(q));
      const planMatch =
        (bed.patient.currentPlans || '').toLowerCase().includes(q) ||
        (bed.patient.pendingPlans || '').toLowerCase().includes(q);

      return nameMatch || diagMatch || planMatch;
    }

    return true;
  });

  // Agrupación en los 3 sectores especificados
  const sectorsConfig: {
    id: BedSector;
    title: string;
    subtitle: string;
    bedRange: string;
    startBed: number;
    endBed: number;
    total: number;
    filled: number;
    empty: number;
    accentColor: string;
    badgeBg: string;
    border: string;
    icon: string;
  }[] = [
    {
      id: 'intermedios',
      title: '4 Camas de Unidad de Intermedios',
      subtitle: 'Cuidados Intermedios Quirúrgicos Pediátricos',
      bedRange: 'Camas 01 a 04',
      startBed: 1,
      endBed: 4,
      total: 4,
      filled: intermediosFilled,
      empty: intermediosEmpty,
      accentColor: 'text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
      border: 'border-purple-200',
      icon: '🏥',
    },
    {
      id: 'generales',
      title: '13 Camas Generales',
      subtitle: 'Hospitalización de Cirugía Pediátrica General',
      bedRange: 'Camas 05 a 17',
      startBed: 5,
      endBed: 17,
      total: 13,
      filled: generalesFilled,
      empty: generalesEmpty,
      accentColor: 'text-sky-700',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-200',
      border: 'border-sky-200',
      icon: '🛏️',
    },
    {
      id: 'ectopicos',
      title: '3 Camas Ectópicos',
      subtitle: 'Camas de Aislamiento / Ectópicos Quirúrgicos',
      bedRange: 'Camas 18 a 20',
      startBed: 18,
      endBed: 20,
      total: 3,
      filled: ectopicosFilled,
      empty: ectopicosEmpty,
      accentColor: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      border: 'border-amber-200',
      icon: '🏷️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 🎯 CENSO DESTACADO DE GENERALES Y UNIDAD DE INTERMEDIOS (17 CAMAS) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-sky-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Título y descripción clínica */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-bold mb-2">
              <span>🏥</span>
              <span>CENSO QUIRÚRGICO PRINCIPAL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Censo: Unidad de Intermedios y Camas Generales
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium leading-relaxed">
              Monitoreo del bloque central de <strong className="text-white">17 camas</strong> (4 camas de intermedios + 13 camas generales).
            </p>
          </div>

          {/* Tarjetas de Métricas de 17 Camas: LLENAS vs VACÍAS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Llenas */}
            <div className="bg-white/10 backdrop-blur-md border border-indigo-300/20 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
                Camas Llenas
              </span>
              <div className="flex items-baseline justify-center gap-1.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-300">
                  {census17Occupied}
                </span>
                <span className="text-xs text-slate-300 font-bold">/ 17</span>
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-extrabold">
                {census17Rate}% Ocupadas
              </span>
            </div>

            {/* Vacías */}
            <div className="bg-white/10 backdrop-blur-md border border-emerald-300/20 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                Camas Vacías
              </span>
              <div className="flex items-baseline justify-center gap-1.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-300">
                  {census17Empty}
                </span>
                <span className="text-xs text-slate-300 font-bold">/ 17</span>
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-extrabold">
                Disponibles
              </span>
            </div>

            {/* Total 17 Camas con botón de aislamiento */}
            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md border border-sky-300/20 rounded-2xl p-3.5 flex flex-col justify-between text-center">
              <div>
                <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">
                  Total Bloque
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                  17 Camas
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSectorFilter(
                    sectorFilter === 'intermedios_y_generales_17'
                      ? 'all'
                      : 'intermedios_y_generales_17'
                  )
                }
                className={`mt-2 py-1 px-2.5 rounded-xl text-[11px] font-extrabold transition-all border ${
                  sectorFilter === 'intermedios_y_generales_17'
                    ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sm'
                    : 'bg-white/10 text-sky-200 border-sky-300/30 hover:bg-white/20'
                }`}
              >
                {sectorFilter === 'intermedios_y_generales_17'
                  ? '✓ Viendo solo las 17'
                  : 'Filtrar estas 17 camas'}
              </button>
            </div>
          </div>
        </div>

        {/* Desglose rápido entre las dos unidades del bloque de 17 */}
        <div className="mt-4 pt-4 border-t border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Unidad de Intermedios */}
            <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-xl">
              <span>🏥</span>
              <span className="font-bold text-purple-200">Unidad de Intermedios (4 Camas):</span>
              <span className="font-extrabold text-white">
                <span className="text-amber-300">{intermediosFilled} llenas</span> ·{' '}
                <span className="text-emerald-300">{intermediosEmpty} vacías</span>
              </span>
            </div>

            {/* Camas Generales */}
            <div className="flex items-center gap-2 bg-sky-950/60 border border-sky-500/40 px-3 py-1.5 rounded-xl">
              <span>🛏️</span>
              <span className="font-bold text-sky-200">Camas Generales (13 Camas):</span>
              <span className="font-extrabold text-white">
                <span className="text-amber-300">{generalesFilled} llenas</span> ·{' '}
                <span className="text-emerald-300">{generalesEmpty} vacías</span>
              </span>
            </div>

            {/* Ectópicos (adicional de referencia) */}
            <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl text-slate-300">
              <span>🏷️</span>
              <span className="font-bold text-amber-200">Camas Ectópicos (3 Camas):</span>
              <span className="font-extrabold text-white">
                <span className="text-amber-300">{ectopicosFilled} llenas</span> ·{' '}
                <span className="text-emerald-300">{ectopicosEmpty} vacías</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] text-indigo-200/80 font-semibold">
            Dotación total del servicio: 20 Camas
          </span>
        </div>
      </div>

      {/* 🔍 CONTROLES DE BÚSQUEDA Y FILTRADO POR SECTORES Y ESTADO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-sky-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar paciente, diagnóstico, plan o Cama (1-20)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 outline-none bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros rápidos por estado clínico */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos los Estados
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('occupied')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === 'occupied'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60'
              }`}
            >
              Llenas ({patients.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('empty')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === 'empty'
                  ? 'bg-slate-600 dark:bg-slate-300 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Vacías ({20 - patients.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('critico')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                filterStatus === 'critico'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              Críticos ({patients.filter((p) => p.status === 'critico').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('with-alerts')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                filterStatus === 'with-alerts'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Alertas ({alerts.length})
            </button>
          </div>
        </div>

        {/* Pestañas de Filtro por Sectores del Servicio */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Sector:
            </span>

            <button
              type="button"
              onClick={() => setSectorFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'all'
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas las Camas (20)
            </button>

            <button
              type="button"
              onClick={() => setSectorFilter('intermedios_y_generales_17')}
              className={`px-3 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                sectorFilter === 'intermedios_y_generales_17'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
              title="Censo exclusivo solicitado de 17 camas"
            >
              <span>⭐</span>
              <span>Intermedios + Generales (17)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {census17Occupied} llenas / {census17Empty} vacías
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSectorFilter('intermedios')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'intermedios'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60'
              }`}
            >
              🏥 4 Camas Intermedios ({intermediosFilled} llenas)
            </button>

            <button
              type="button"
              onClick={() => setSectorFilter('generales')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'generales'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60'
              }`}
            >
              🛏️ 13 Camas Generales ({generalesFilled} llenas)
            </button>

            <button
              type="button"
              onClick={() => setSectorFilter('ectopicos')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'ectopicos'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              🏷️ 3 Camas Ectópicos ({ectopicosFilled} llenas)
            </button>
          </div>

          {(sectorFilter !== 'all' || filterStatus !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSectorFilter('all');
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-bold underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* 🛏️ SECCIONES DE CAMAS AGRUPADAS POR LOS 3 TÍTULOS SOLICITADOS */}
      <div className="space-y-8">
        {sectorsConfig.map((sector) => {
          // Camas pertenecientes a este sector específico
          const sectorBeds = filteredBeds.filter(
            (b) => b.bedNumber >= sector.startBed && b.bedNumber <= sector.endBed
          );

          // Si el filtro de sector no incluye este sector, lo ocultamos
          if (
            sectorFilter !== 'all' &&
            sectorFilter !== 'intermedios_y_generales_17' &&
            sectorFilter !== sector.id
          ) {
            return null;
          }

          if (sectorFilter === 'intermedios_y_generales_17' && sector.id === 'ectopicos') {
            return null;
          }

          if (sectorBeds.length === 0 && (searchQuery || filterStatus !== 'all')) {
            return null;
          }

          return (
            <section
              key={sector.id}
              className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
            >
              {/* Encabezado con el Título Oficial Solicitado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                    {sector.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-['Fredoka',sans-serif]">
                        {sector.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold border border-slate-200 dark:border-slate-700">
                        {sector.bedRange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{sector.subtitle}</p>
                  </div>
                </div>

                {/* Contador de Llenas vs Vacías del Sector */}
                <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>
                      <strong className="text-slate-900 dark:text-slate-100">{sector.filled}</strong> Llenas
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>
                      <strong className="text-emerald-950 dark:text-emerald-200">{sector.empty}</strong> Vacías
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    ({Math.round((sector.filled / sector.total) * 100)}% ocupación)
                  </span>
                </div>
              </div>

              {/* Grid de Camas de este Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sectorBeds.map(({ bedNumber, isOccupied, patient, alerts: bedAlerts }) => {
                  if (!isOccupied || !patient) {
                    // Cama libre / disponible
                    return (
                      <div
                        key={`bed-${bedNumber}`}
                        onClick={() => onSelectEmptyBed(bedNumber)}
                        className="group cursor-pointer rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 bg-white dark:bg-slate-900/80 hover:bg-sky-50/40 dark:hover:bg-slate-800/80 p-5 flex flex-col items-center justify-center text-center transition-all min-h-[260px] relative overflow-hidden shadow-2xs"
                      >
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black">
                          CAMA {String(bedNumber).padStart(2, '0')}
                        </div>
                        <div className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Vacía
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-950 text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center justify-center transition-colors mb-3">
                          <Bed className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-300">
                          Cama Disponible
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
                          Limpia y desinfectada para nuevo ingreso quirúrgico
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                          <Plus className="w-3.5 h-3.5" /> Asignar Paciente
                        </span>
                      </div>
                    );
                  }

                  const daysHospitalized = calculateHospitalDays(patient.admissionDate);

                  // Estilo según los 3 estados clínicos
                  const statusConfig = {
                    estable: {
                      cardBorder: 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600',
                      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                      headerBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
                      statusLabel: 'Estable',
                      dotColor: 'bg-emerald-500',
                    },
                    observacion: {
                      cardBorder: 'border-amber-200 dark:border-amber-800/80 hover:border-amber-400 dark:hover:border-amber-600',
                      badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                      headerBg: 'bg-amber-50/70 dark:bg-amber-950/40',
                      statusLabel: 'En Observación',
                      dotColor: 'bg-amber-500',
                    },
                    critico: {
                      cardBorder: 'border-rose-300 dark:border-rose-800/90 hover:border-rose-500 dark:hover:border-rose-600 ring-2 ring-rose-200 dark:ring-rose-950',
                      badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse',
                      headerBg: 'bg-rose-50/80 dark:bg-rose-950/40',
                      statusLabel: 'Paciente Crítico',
                      dotColor: 'bg-rose-600',
                    },
                  }[patient.status];

                  const sectorBadge = getBedSectorBadgeInfo(bedNumber);

                  return (
                    <div
                      key={`bed-${bedNumber}`}
                      onClick={() => onSelectPatient(patient)}
                      className={`group cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border-2 ${statusConfig.cardBorder} shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative min-h-[300px]`}
                    >
                      {/* Encabezado de Cama */}
                      <div className={`p-4 ${statusConfig.headerBg} border-b border-slate-100 dark:border-slate-800`}>
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black shadow-2xs border border-slate-200 dark:border-slate-700">
                              CAMA {String(bedNumber).padStart(2, '0')}
                            </span>
                            {/* Insignia de Sector */}
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${sectorBadge.bg} ${sectorBadge.text} ${sectorBadge.border}`}
                            >
                              {sectorBadge.shortLabel}
                            </span>
                          </div>

                          {/* Estado en 3 niveles */}
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.badgeBg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></span>
                            {statusConfig.statusLabel}
                          </span>
                        </div>

                        {/* Paciente Nombres, Apellidos y Edad */}
                        <div className="flex items-start gap-3 mt-2">
                          <PediatricAvatar
                            sticker={patient.avatarSticker}
                            gender={patient.gender}
                            status={patient.status}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors truncate">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                              <span>{formatPediatricAge(patient.ageYears, patient.ageMonths)}</span>
                              <span>·</span>
                              <span>{patient.gender === 'F' ? 'Niña 👧' : 'Niño 👦'}</span>
                              <span>·</span>
                              <span
                                className={`font-bold ${
                                  daysHospitalized >= 5 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                D{daysHospitalized}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cuerpo con Diagnósticos y Planes */}
                      <div className="p-4 space-y-3 flex-1 text-xs">
                        {/* Diagnóstico principal */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                            Diagnóstico
                          </span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                            {patient.primaryDiagnosis}
                          </p>
                        </div>

                        {/* Exámenes o Plan que tiene */}
                        <div className="p-2.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60">
                          <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            Exámenes / Plan Actual:
                          </span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
                            {patient.currentPlans || 'Sin plan registrado'}
                          </p>
                        </div>

                        {/* Plan Pendiente */}
                        <div
                          className={`p-2.5 rounded-2xl border ${
                            patient.pendingPlans?.toLowerCase().includes('ayuno') ||
                            patient.pendingPlans?.toLowerCase().includes('quirófano')
                              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <ClipboardList className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                            Plan Pendiente:
                          </span>
                          <p className="text-[11px] font-medium line-clamp-2">
                            {patient.pendingPlans || 'Ningún pendiente crítico'}
                          </p>
                        </div>
                      </div>

                      {/* Pie de tarjeta con Alertas y botón interactivo */}
                      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                        {bedAlerts.length > 0 ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 truncate">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {bedAlerts.length} {bedAlerts.length === 1 ? 'Alerta' : 'Alertas'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 shrink-0" /> Sin alertas
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onOpenDischargeModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDischargeModal(patient);
                              }}
                              className="px-2 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                              title="Dar alta médica y liberar o transferir cama"
                            >
                              🏠 Alta / Cama
                            </button>
                          )}
                          <span className="font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px]">
                            Ficha <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 my-6">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron camas con los filtros aplicados
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Prueba cambiando la búsqueda, el sector o el estado clínico.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterStatus('all');
              setSectorFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100"
          >
            Restablecer Filtros
          </button>
        </div>
      )}
    </div>
  );
};
