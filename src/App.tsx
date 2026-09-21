import React, { useState, useEffect, useMemo } from 'react';
import { Patient, UserSession, PatientStatus, DischargeRecord } from './types';
import { INITIAL_PATIENTS } from './data/initialData';
import {
  calculateCensusStats,
  generateAutomatedAlerts,
  calculateHospitalDays,
} from './utils/helpers';
import { Header } from './components/Header';
import { BedGrid } from './components/BedGrid';
import { PatientListView } from './components/PatientListView';
import { StatsReportsView } from './components/StatsReportsView';
import { AlertsView } from './components/AlertsView';
import { PatientDetailModal } from './components/PatientDetailModal';
import { DischargeModal } from './components/DischargeModal';
import { AuthModal } from './components/AuthModal';
import { AccessLockScreen } from './components/AccessLockScreen';
import {
  Bed,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Heart,
  Calendar,
  AlertTriangle,
  Moon,
  Sun,
  Lock,
} from 'lucide-react';

export default function App() {
  // 0. Modo Noche (Guardia Médica)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pediacirugia_night_mode');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pediacirugia_night_mode', String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // ignore
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // 0.1 Control de Acceso General con Contraseña (Residentes2026)
  const [isAccessGranted, setIsAccessGranted] = useState<boolean>(() => {
    try {
      const sessionAuth = sessionStorage.getItem('pediacirugia_access_unlocked');
      if (sessionAuth === 'true') return true;
      const localAuth = localStorage.getItem('pediacirugia_access_unlocked');
      if (localAuth === 'true') return true;
    } catch (e) {
      // ignore
    }
    return false;
  });

  const handleUnlockAccess = () => {
    setIsAccessGranted(true);
  };

  const handleLockAccess = () => {
    try {
      sessionStorage.removeItem('pediacirugia_access_unlocked');
      localStorage.removeItem('pediacirugia_access_unlocked');
    } catch (e) {
      // ignore
    }
    setIsAccessGranted(false);
  };

  // 1. Estado de Sesión / Autenticación
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('pediacirugia_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    // Por defecto sugerir la cuenta de Google solicitada por el usuario
    return {
      email: 'levi.mezonesp144@gmail.com',
      displayName: 'Dr. Levi Mezones',
      role: 'Cirujano Pediátrico Titular',
      medicalLicense: 'CMP-84219 / RNE-42105',
      provider: 'google',
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 2. Estado de Pacientes en las 20 Camas
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('pediacirugia_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_PATIENTS;
  });

  // Historial de pacientes que se han ido de alta
  const [dischargedPatients, setDischargedPatients] = useState<DischargeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pediacirugia_discharges');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('pediacirugia_patients', JSON.stringify(patients));
    } catch (e) {
      console.error('Error saving patients to localStorage', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('pediacirugia_discharges', JSON.stringify(dischargedPatients));
    } catch (e) {
      console.error('Error saving discharges to localStorage', e);
    }
  }, [dischargedPatients]);

  // 3. Pestaña Activa
  const [activeTab, setActiveTab] = useState<'beds' | 'list' | 'stats' | 'alerts'>('beds');

  // 4. Modal de Paciente
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [assignedEmptyBed, setAssignedEmptyBed] = useState<number | undefined>(undefined);

  // 5. Modal de Alta Médica y Edición/Liberación de Cama
  const [patientToDischarge, setPatientToDischarge] = useState<Patient | null>(null);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);

  // 6. Cálculos automáticos de estadísticas y alertas
  const stats = useMemo(() => calculateCensusStats(patients), [patients]);
  const alerts = useMemo(() => generateAutomatedAlerts(patients), [patients]);

  const occupiedBedsList = useMemo(() => patients.map((p) => p.bedNumber), [patients]);

  // Handlers
  const handleOpenPatientDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setAssignedEmptyBed(undefined);
    setIsPatientModalOpen(true);
  };

  const handleOpenNewPatientOnBed = (bedNumber: number) => {
    setSelectedPatient(null);
    setAssignedEmptyBed(bedNumber);
    setIsPatientModalOpen(true);
  };

  const handleOpenNewPatientGeneral = () => {
    setSelectedPatient(null);
    setAssignedEmptyBed(undefined);
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = (patientData: Patient) => {
    setPatients((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === patientData.id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = patientData;
        return copy;
      }
      return [...prev, patientData];
    });
    setIsPatientModalOpen(false);
  };

  const handleOpenDischargeModal = (patient: Patient) => {
    setPatientToDischarge(patient);
    setIsDischargeModalOpen(true);
  };

  const handleConfirmDischarge = (
    dischargeData: DischargeRecord,
    actionAfter: 'free_bed' | 'reassign_now'
  ) => {
    // 1. Guardar en registro histórico de altas
    setDischargedPatients((prev) => [dischargeData, ...prev]);

    // 2. Liberar la cama (remover de la lista de camas ocupadas)
    setPatients((prev) => prev.filter((p) => p.id !== dischargeData.patientId));
    setIsDischargeModalOpen(false);
    setPatientToDischarge(null);

    // 3. Si solicitó reasignar inmediatamente a nuevo paciente, abrir modal con esa cama
    if (actionAfter === 'reassign_now') {
      setTimeout(() => {
        handleOpenNewPatientOnBed(dischargeData.bedNumber);
      }, 200);
    }
  };

  const handleChangeBed = (patientId: string, newBedNumber: number) => {
    setPatients((prev) => {
      // Verificar si la cama destino está ocupada para intercambiar
      const targetPatient = prev.find((p) => p.bedNumber === newBedNumber);
      const currentPatient = prev.find((p) => p.id === patientId);
      if (!currentPatient) return prev;

      const oldBedNumber = currentPatient.bedNumber;

      return prev.map((p) => {
        if (p.id === patientId) {
          return { ...p, bedNumber: newBedNumber };
        }
        if (targetPatient && p.id === targetPatient.id) {
          return { ...p, bedNumber: oldBedNumber };
        }
        return p;
      });
    });
  };

  const handleDischargePatient = (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
  };

  const handleUpdatePatientStatus = (patientId: string, newStatus: PatientStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: newStatus } : p))
    );
  };

  const handleSelectPatientByBed = (bedNumber: number) => {
    const p = patients.find((pat) => pat.bedNumber === bedNumber);
    if (p) {
      handleOpenPatientDetail(p);
    } else {
      setActiveTab('beds');
    }
  };

  const handleResetToDemo = () => {
    if (
      confirm(
        '¿Deseas restaurar los datos iniciales de demostración con los 20 pacientes y camas pediátricas?'
      )
    ) {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('pediacirugia_patients', JSON.stringify(INITIAL_PATIENTS));
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('pediacirugia_user');
      sessionStorage.removeItem('pediacirugia_access_unlocked');
      localStorage.removeItem('pediacirugia_access_unlocked');
    } catch (e) {
      // ignore
    }
    setUser(null);
    setIsAccessGranted(false);
  };

  // Si no se ha desbloqueado con la contraseña autorizada ("Residentes2026"), mostrar pantalla de bloqueo
  if (!isAccessGranted) {
    return (
      <AccessLockScreen
        onUnlock={handleUnlockAccess}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-['Nunito',sans-serif] transition-colors duration-200 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Cabecera Principal */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onLockAccess={handleLockAccess}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        alerts={alerts}
        onOpenNewPatient={handleOpenNewPatientGeneral}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Alerta Destacada si existen pacientes críticos */}
      {stats.criticalCount > 0 && activeTab !== 'alerts' && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-900 py-2 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <span>
                Atención Médica Inmediata: Hay <strong>{stats.criticalCount} {stats.criticalCount === 1 ? 'paciente pediátrico en estado crítico' : 'pacientes pediátricos en estado crítico'}</strong> en la sala.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="text-xs underline hover:text-rose-950 dark:hover:text-rose-100 font-black cursor-pointer"
            >
              Ver Alertas Críticas →
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal según la pestaña activa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'beds' && (
          <BedGrid
            patients={patients}
            alerts={alerts}
            onSelectPatient={handleOpenPatientDetail}
            onSelectEmptyBed={handleOpenNewPatientOnBed}
            onOpenDischargeModal={handleOpenDischargeModal}
          />
        )}

        {activeTab === 'list' && (
          <PatientListView
            patients={patients}
            onSelectPatient={handleOpenPatientDetail}
            onUpdatePatientStatus={handleUpdatePatientStatus}
            onOpenDischargeModal={handleOpenDischargeModal}
          />
        )}

        {activeTab === 'stats' && (
          <StatsReportsView
            stats={stats}
            patients={patients}
            doctorName={user?.displayName || 'Dr. Levi Mezones'}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            patients={patients}
            onSelectPatientByBed={handleSelectPatientByBed}
          />
        )}
      </main>

      {/* Botón flotante para cambio rápido a Modo Noche durante pase de visita o guardia */}
      <button
        type="button"
        onClick={handleToggleDarkMode}
        title={
          isDarkMode
            ? 'Desactivar Modo Noche · Cambiar a Modo Día'
            : 'Activar Modo Noche (Guardia) · Reduce el brillo en salas con poca luz'
        }
        className={`fixed bottom-5 right-5 z-30 p-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all flex items-center gap-2 text-xs font-black cursor-pointer active:scale-95 ${
          isDarkMode
            ? 'bg-slate-900/90 text-amber-300 border-amber-500/40 shadow-slate-950/80 hover:bg-slate-800'
            : 'bg-white/95 text-slate-700 border-slate-200 shadow-slate-300/60 hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-200'
        }`}
      >
        {isDarkMode ? (
          <>
            <Moon className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">Modo Noche</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-extrabold">
              ON
            </span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Turno Noche</span>
          </>
        )}
      </button>

      {/* Pie de página con información del servicio y crédito discreto de autoría */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-4 px-4 mt-auto text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-5 h-5 rounded-md object-cover border border-slate-300 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Residentes2026 · Cirugía Pediátrica (20 Camas)
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Iniciativa y autoría clínica: <span className="font-semibold text-slate-600 dark:text-slate-300">MR Leví Mezones Peña</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              title="Restaurar pacientes de ejemplo iniciales"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer Censo Demo
            </button>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sesión Médica Segura
            </span>
          </div>
        </div>
      </footer>

      {/* Modal de Ficha Clínica / Asignación de Paciente */}
      {isPatientModalOpen && (
        <PatientDetailModal
          patient={selectedPatient}
          assignedBedNumber={assignedEmptyBed}
          onClose={() => setIsPatientModalOpen(false)}
          onSavePatient={handleSavePatient}
          onDischargePatient={handleDischargePatient}
          onTriggerDischargeModal={handleOpenDischargeModal}
          occupiedBeds={occupiedBedsList}
        />
      )}

      {/* Modal de Procesar Alta Médica y Liberar / Transferir Cama */}
      {isDischargeModalOpen && patientToDischarge && (
        <DischargeModal
          patient={patientToDischarge}
          onClose={() => {
            setIsDischargeModalOpen(false);
            setPatientToDischarge(null);
          }}
          onConfirmDischarge={handleConfirmDischarge}
          occupiedBeds={occupiedBedsList}
          onChangeBed={handleChangeBed}
        />
      )}

      {/* Modal de Autenticación con Google y Correo */}
      {isAuthModalOpen && (
        <AuthModal
          currentUser={user}
          onLoginSuccess={(newSession) => {
            setUser(newSession);
            setIsAuthModalOpen(false);
          }}
          onClose={() => setIsAuthModalOpen(false)}
          forceOpen={isAuthModalOpen}
        />
      )}
    </div>
  );
}

