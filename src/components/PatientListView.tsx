import React, { useState } from 'react';
import { Patient, PatientStatus, BedSector } from '../types';
import {
  calculateHospitalDays,
  formatPediatricAge,
  getBedSector,
  getBedSectorBadgeInfo,
  calculateCensusStats,
} from '../utils/helpers';
import { exportCensusToPdf } from '../utils/pdfGenerator';
import { PediatricAvatar } from './PediatricAvatar';
import {
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ClipboardList,
  Activity,
  Edit,
  Sparkles,
  Bed,
  Layers,
  X,
  FileDown,
  Check,
} from 'lucide-react';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onUpdatePatientStatus: (patientId: string, newStatus: PatientStatus) => void;
  onOpenDischargeModal?: (patient: Patient) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onSelectPatient,
  onUpdatePatientStatus,
  onOpenDischargeModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [sectorFilter, setSectorFilter] = useState<'all' | '17_intermedios_generales' | BedSector>('all');
  const [sortBy, setSortBy] = useState<'bed' | 'days' | 'status' | 'name'>('bed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Exportar a PDF desde la lista
  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      const currentStats = calculateCensusStats(patients);
      exportCensusToPdf(currentStats, patients);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Función para normalizar texto (sin tildes, minúsculas) para búsqueda médica fluida
  const normalizeText = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const filteredPatients = patients
    .filter((p) => {
      // Filtro por Sector
      if (sectorFilter === '17_intermedios_generales') {
        if (p.bedNumber > 17) return false;
      } else if (sectorFilter !== 'all') {
        if (getBedSector(p.bedNumber) !== sectorFilter) return false;
      }

      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;

      const rawQ = searchTerm.trim();
      const q = normalizeText(rawQ);

      // Búsqueda por número de cama (ej: "3", "03", "cama 3", "cama 03", "cama3", "#3")
      const bedNumStr = String(p.bedNumber);
      const bedPadded = bedNumStr.padStart(2, '0');
      const bedMatches =
        q === bedNumStr ||
        q === bedPadded ||
        q === `#${bedNumStr}` ||
        q === `cama ${bedNumStr}` ||
        q === `cama ${bedPadded}` ||
        q === `cama${bedNumStr}` ||
        q === `cama${bedPadded}` ||
        `cama ${bedPadded}`.includes(q) ||
        `cama ${bedNumStr}`.includes(q);

      // Búsqueda por nombre o apellido
      const fullNameNorm = normalizeText(`${p.firstName} ${p.lastName}`);
      const firstNameNorm = normalizeText(p.firstName);
      const lastNameNorm = normalizeText(p.lastName);
      const nameMatches =
        fullNameNorm.includes(q) ||
        firstNameNorm.includes(q) ||
        lastNameNorm.includes(q);

      // Búsqueda por diagnóstico primario, otros diagnósticos o procedimiento quirúrgico
      const primaryDiagNorm = normalizeText(p.primaryDiagnosis);
      const otherDiagsNorm = (p.diagnoses || []).some((d) => normalizeText(d).includes(q));
      const procedureNorm = normalizeText(p.surgicalProcedure || '');
      const diagMatches =
        primaryDiagNorm.includes(q) ||
        otherDiagsNorm ||
        procedureNorm.includes(q);

      // Búsqueda por planes o notas clínicas
      const plansNorm = normalizeText(p.currentPlans || '');
      const pendingNorm = normalizeText(p.pendingPlans || '');
      const planMatches = plansNorm.includes(q) || pendingNorm.includes(q);

      return bedMatches || nameMatches || diagMatches || planMatches;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'bed') {
        comparison = a.bedNumber - b.bedNumber;
      } else if (sortBy === 'days') {
        const daysA = calculateHospitalDays(a.admissionDate);
        const daysB = calculateHospitalDays(b.admissionDate);
        comparison = daysB - daysA; // Mayor estancia primero por defecto
      } else if (sortBy === 'status') {
        const priority = { critico: 0, observacion: 1, estable: 2 };
        comparison = priority[a.status] - priority[b.status];
      } else if (sortBy === 'name') {
        comparison = a.firstName.localeCompare(b.firstName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: 'bed' | 'days' | 'status' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔍 BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-sky-100 dark:border-slate-800 shadow-sm space-y-3.5 transition-colors">
        {/* Barra de búsqueda principal */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente por nombre, diagnóstico (ej. Apendicitis) o número de cama (ej. 05 o Cama 5)..."
              className="w-full pl-11 pr-24 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 outline-none bg-slate-50/70 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Borrar texto de búsqueda"
              >
                <X className="w-3.5 h-3.5" />
                <span>Borrar</span>
              </button>
            )}
          </div>

          {/* Contador de resultados y Exportar PDF */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 shrink-0 text-xs">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-xl font-bold bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-1.5 transition-all shadow-2xs border border-sky-600 cursor-pointer"
              title="Descargar censo oficial y reporte estadístico en PDF estructurado"
            >
              {isExportingPdf ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span>Generando PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-100">¡Descargado!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-sky-200" />
                  <span>Censo en PDF</span>
                </>
              )}
            </button>

            <span className="font-bold px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>
                {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}
              </span>
              <span className="text-sky-400 font-normal">/ {patients.length} total</span>
            </span>

            {searchTerm && (
              <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-800">
                Filtro activo
              </span>
            )}
          </div>
        </div>

        {/* Sugerencias de búsqueda rápida */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-[11px] text-slate-400 dark:text-slate-500">Búsqueda rápida:</span>
          {['Cama 01', 'Cama 05', 'Cama 18', 'Apendicitis', 'Hernia', 'Invaginación'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setSearchTerm(suggestion)}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                searchTerm.toLowerCase() === suggestion.toLowerCase()
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-700 dark:hover:text-sky-300'
              }`}
            >
              {suggestion}
            </button>
          ))}
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 underline ml-1 cursor-pointer"
            >
              Restablecer búsqueda
            </button>
          )}
        </div>

        {/* Filtro por Estado Clínico */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">Estado:</span>
            {(['all', 'estable', 'observacion', 'critico'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'all'
                  ? 'Todos'
                  : st === 'estable'
                  ? 'Estables'
                  : st === 'observacion'
                  ? 'Observación'
                  : 'Críticos'}
              </button>
            ))}
          </div>

          {/* Filtro por Sectores */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Sector:
            </span>
            <button
              type="button"
              onClick={() => setSectorFilter('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'all'
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setSectorFilter('17_intermedios_generales')}
              className={`px-2.5 py-1 rounded-xl font-black transition-all cursor-pointer ${
                sectorFilter === '17_intermedios_generales'
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
            >
              ⭐ 17 Camas
            </button>
            <button
              type="button"
              onClick={() => setSectorFilter('intermedios')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'intermedios'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60'
              }`}
            >
              🏥 Intermedios (4)
            </button>
            <button
              type="button"
              onClick={() => setSectorFilter('generales')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'generales'
                  ? 'bg-sky-700 text-white shadow-2xs'
                  : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60'
              }`}
            >
              🛏️ Generales (13)
            </button>
            <button
              type="button"
              onClick={() => setSectorFilter('ectopicos')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sectorFilter === 'ectopicos'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              🏷️ Ectópicos (3)
            </button>
          </div>
        </div>
      </div>

      {/* Tabla detallada de pacientes de cirugía pediátrica */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                <th
                  onClick={() => toggleSort('bed')}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Cama
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Paciente / Edad
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('days')}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Estancia
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Estado Clínico
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Diagnóstico Quirúrgico</th>
                <th className="py-3 px-4">Exámenes / Plan Actual</th>
                <th className="py-3 px-4">Plan Pendiente</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.map((patient) => {
                const days = calculateHospitalDays(patient.admissionDate);

                const statusStyles = {
                  estable: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                  observacion: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                  critico: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse font-black',
                }[patient.status];

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-sky-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Cama */}
                    <td className="py-3.5 px-4 font-black text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 font-black">
                          Cama {String(patient.bedNumber).padStart(2, '0')}
                        </span>
                        {(() => {
                          const badge = getBedSectorBadgeInfo(patient.bedNumber);
                          return (
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.shortLabel}
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Paciente y edad */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <PediatricAvatar
                          sticker={patient.avatarSticker}
                          gender={patient.gender}
                          status={patient.status}
                          size="sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-sky-700 dark:group-hover:text-sky-300">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {formatPediatricAge(patient.ageYears, patient.ageMonths)} ·{' '}
                            {patient.gender === 'F' ? 'Niña' : 'Niño'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Días hospitalizados */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-xs ${
                          days >= 7
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black'
                            : days >= 5
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                        }`}
                        title={`Fecha de ingreso: ${patient.admissionDate}`}
                      >
                        <Calendar className="w-3 h-3" />
                        {days} {days === 1 ? 'día' : 'días'}
                      </span>
                    </td>

                    {/* Estado con selector rápido */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={patient.status}
                        onChange={(e) =>
                          onUpdatePatientStatus(patient.id, e.target.value as PatientStatus)
                        }
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl border outline-none cursor-pointer ${statusStyles}`}
                      >
                        <option value="estable">🟢 Estable</option>
                        <option value="observacion">🟡 Observación</option>
                        <option value="critico">🔴 Crítico</option>
                      </select>
                    </td>

                    {/* Diagnóstico */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {patient.primaryDiagnosis}
                      </p>
                      {patient.surgicalProcedure && (
                        <p className="text-[11px] text-sky-700 dark:text-sky-400 font-medium mt-0.5 truncate">
                          PO: {patient.surgicalProcedure}
                        </p>
                      )}
                    </td>

                    {/* Exámenes o plan que tiene */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <div className="p-2 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
                        {patient.currentPlans || 'Sin plan registrado'}
                      </div>
                    </td>

                    {/* Plan pendiente */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <div
                        className={`p-2 rounded-xl border text-[11px] font-medium line-clamp-2 ${
                          patient.pendingPlans?.toLowerCase().includes('ayuno') ||
                          patient.pendingPlans?.toLowerCase().includes('quirófano')
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {patient.pendingPlans || 'Sin pendientes'}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectPatient(patient)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800/60 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Ficha
                        </button>
                        {onOpenDischargeModal && (
                          <button
                            type="button"
                            onClick={() => onOpenDischargeModal(patient)}
                            className="px-2.5 py-1 text-xs font-black rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800/60 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Dar de alta y liberar cama"
                          >
                            🏠 Alta
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center text-2xl shadow-2xs border border-sky-100 dark:border-sky-900/60">
              🔍
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {searchTerm
                  ? `No se encontraron pacientes para "${searchTerm}"`
                  : 'No hay pacientes con los filtros seleccionados'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? 'Verifica si el nombre, diagnóstico quirúrgico o número de cama (ej. 01, 05 o Cama 5) coincide con los registros.'
                  : 'Prueba cambiando el estado clínico o el sector para ver más pacientes de la sala.'}
              </p>
            </div>
            {(searchTerm || statusFilter !== 'all' || sectorFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSectorFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-xl border border-sky-200 dark:border-sky-800/80 transition-colors shadow-2xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Restablecer búsqueda y filtros</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
