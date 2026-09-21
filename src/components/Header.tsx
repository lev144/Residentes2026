import React from 'react';
import { UserSession, CensusReportStats, ClinicalAlert } from '../types';
import {
  Bed,
  Bell,
  BarChart3,
  ListFilter,
  LogOut,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  User,
  Activity,
  Layers,
  Moon,
  Sun,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  user: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLockAccess?: () => void;
  activeTab: 'beds' | 'list' | 'stats' | 'alerts';
  setActiveTab: (tab: 'beds' | 'list' | 'stats' | 'alerts') => void;
  stats: CensusReportStats;
  alerts: ClinicalAlert[];
  onOpenNewPatient: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onLockAccess,
  activeTab,
  setActiveTab,
  stats,
  alerts,
  onOpenNewPatient,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const criticalCount = alerts.filter((a) => a.severity === 'high').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 shadow-sm transition-colors">
      {/* Barra superior con identidad y estado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logotipo temático pediátrico */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 p-0.5 shadow-md shadow-sky-200 dark:shadow-none border-2 border-sky-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="Residentes2026 Logo Cirugía Pediátrica"
                className="w-full h-full object-cover rounded-[13px]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback si por alguna razón la imagen tardara en cargar
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-emoji')) {
                    const span = document.createElement('span');
                    span.className = 'fallback-emoji text-2xl';
                    span.textContent = '🧸';
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-tight bg-gradient-to-r from-sky-700 via-indigo-700 to-teal-700 dark:from-sky-300 dark:via-indigo-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Residentes2026
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  Cirugía Pediátrica
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hospitalización Quirúrgica Infantil · Sala de 20 Camas
              </p>
            </div>
          </div>

          {/* Resumen interactivo de los 3 estados clínicos y ocupación */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Censo Solicitado: 17 Camas (Intermedios + Generales) */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-800"
              title="Censo exclusivo: 4 Camas de Unidad de Intermedios + 13 Camas Generales"
            >
              <span className="text-xs">🏥</span>
              <span>
                Censo 17 Camas: <span className="text-indigo-700 dark:text-indigo-300 font-black">{stats.census17.occupied} Llenas</span> · <span className="text-emerald-700 dark:text-emerald-400 font-black">{stats.census17.empty} Vacías</span>
              </span>
            </div>

            {/* Ocupación Global */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
              <Bed className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>
                Total: {stats.occupiedBeds}/20 ({stats.occupancyRate}%)
              </span>
            </div>

            {/* 1. Estable (Verde) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              <span>{stats.stableCount} Estables</span>
            </div>

            {/* 2. Observación (Amarillo) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
              <span>{stats.observationCount} En Observación</span>
            </div>

            {/* 3. Crítico (Rojo) */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border transition-all ${
                stats.criticalCount > 0
                  ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${stats.criticalCount > 0 ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
              <span>{stats.criticalCount} Críticos</span>
            </div>

            {/* INTERRUPTOR DE MODO NOCHE (GUARDIA HOSPITALARIA) */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={
                  isDarkMode
                    ? 'Desactivar Modo Noche · Cambiar a Modo Día'
                    : 'Activar Modo Noche · Tonos oscuros para guardia hospitalaria con baja iluminación'
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-200'
                }`}
              >
                {isDarkMode ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Modo Noche</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-extrabold ml-0.5">
                      ON
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Modo Noche</span>
                  </>
                )}
              </button>
            )}

            {/* Perfil del médico */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                {onLockAccess && (
                  <button
                    type="button"
                    onClick={onLockAccess}
                    title="Bloquear acceso a la sala hospitalaria"
                    className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  title="Cerrar sesión o cambiar de cuenta"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {onLockAccess && (
                  <button
                    type="button"
                    onClick={onLockAccess}
                    title="Bloquear acceso a la sala hospitalaria"
                    className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de navegación de pestañas y botón de nuevo paciente */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('beds')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'beds'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              Mapa de Camas (20)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'list'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Lista de Pacientes ({stats.occupiedBeds})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reportes Estadísticos Diarios
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 shrink-0 relative ${
                activeTab === 'alerts'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Alertas Automatizadas
              {alerts.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    criticalCount > 0
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-amber-400 text-amber-900'
                  }`}
                >
                  {alerts.length}
                </span>
              )}
            </button>
          </nav>

          <button
            type="button"
            onClick={onOpenNewPatient}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-200 dark:shadow-none flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Ingresar Paciente a Cama
          </button>
        </div>
      </div>
    </header>
  );
};
