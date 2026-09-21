import React, { useState } from 'react';
import { ClinicalAlert, Patient } from '../types';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Filter,
  Sparkles,
  Bed,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: ClinicalAlert[];
  patients: Patient[];
  onSelectPatientByBed: (bedNumber: number) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  patients,
  onSelectPatientByBed,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'info'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const highSeverityCount = alerts.filter((a) => a.severity === 'high').length;
  const mediumSeverityCount = alerts.filter((a) => a.severity === 'medium').length;
  const infoSeverityCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              Sistema de Alertas Clínicas Automatizadas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-black animate-pulse">
              {alerts.length} Activas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detección inteligente de pacientes críticos, estancias quirúrgicas prolongadas y planes pendientes.
          </p>
        </div>

        {/* Filtros de severidad */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              severityFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('high')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              severityFilter === 'high'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-transparent dark:border-rose-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            Críticas ({highSeverityCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('medium')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              severityFilter === 'medium'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-transparent dark:border-amber-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Moderadas ({mediumSeverityCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('info')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              severityFilter === 'info'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-transparent dark:border-sky-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Informativas ({infoSeverityCount})
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const config = {
            high: {
              cardBorder: 'border-rose-300 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/30 hover:bg-rose-50/70 dark:hover:bg-rose-950/50',
              badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
              iconBg: 'bg-rose-600 text-white',
              titleColor: 'text-rose-950 dark:text-rose-200',
              badgeText: 'Prioridad Alta / Crítica',
            },
            medium: {
              cardBorder: 'border-amber-200 dark:border-amber-900/80 bg-amber-50/40 dark:bg-amber-950/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/50',
              badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
              iconBg: 'bg-amber-500 text-white',
              titleColor: 'text-amber-950 dark:text-amber-200',
              badgeText: 'Prioridad Moderada',
            },
            info: {
              cardBorder: 'border-sky-200 dark:border-sky-900/80 bg-sky-50/40 dark:bg-sky-950/30 hover:bg-sky-50/70 dark:hover:bg-sky-950/50',
              badgeBg: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
              iconBg: 'bg-sky-600 text-white',
              titleColor: 'text-sky-950 dark:text-sky-200',
              badgeText: 'Informativa / Guardia',
            },
          }[alert.severity];

          return (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-3xl border-2 ${config.cardBorder} transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 shadow-2xs">
                      CAMA {String(alert.bedNumber).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}
                    >
                      {config.badgeText}
                    </span>
                    <h3 className={`text-sm font-black ${config.titleColor}`}>
                      {alert.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 pt-0.5">
                    <span className="text-slate-400 dark:text-slate-500">Acción Requerida:</span>
                    <span className="text-slate-800 dark:text-slate-200">{alert.actionRequired}</span>
                  </div>
                </div>
              </div>

              {/* Botón para ir a la cama del paciente */}
              <div className="shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => onSelectPatientByBed(alert.bedNumber)}
                  className="px-3.5 py-2 rounded-xl text-xs font-black bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <Bed className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Ver Cama {alert.bedNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay alertas en este nivel</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Todos los pacientes están controlados según este criterio.</p>
          </div>
        )}
      </div>
    </div>
  );
};
