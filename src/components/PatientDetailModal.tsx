import React, { useState, useEffect } from 'react';
import { Patient, PatientStatus } from '../types';
import { calculateHospitalDays, formatPediatricAge } from '../utils/helpers';
import { PediatricAvatar } from './PediatricAvatar';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Save,
  Trash2,
  Sparkles,
  ClipboardCheck,
  Stethoscope,
  Activity,
  Shield,
  Utensils,
  HelpCircle,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null; // null if creating a new patient
  assignedBedNumber?: number; // pre-assigned bed if clicked on empty bed
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
  onDischargePatient?: (patientId: string, bedNumber: number) => void;
  onTriggerDischargeModal?: (patient: Patient) => void;
  occupiedBeds: number[]; // list of beds currently occupied
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  assignedBedNumber,
  onClose,
  onSavePatient,
  onDischargePatient,
  onTriggerDischargeModal,
  occupiedBeds,
}) => {
  const isNew = !patient;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageYears, setAgeYears] = useState(4);
  const [ageMonths, setAgeMonths] = useState(0);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [bedNumber, setBedNumber] = useState<number>(1);
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<PatientStatus>('estable');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [surgicalProcedure, setSurgicalProcedure] = useState('');
  const [postOpDay, setPostOpDay] = useState<string>('');
  const [currentPlans, setCurrentPlans] = useState('');
  const [pendingPlans, setPendingPlans] = useState('');
  const [dietStatus, setDietStatus] = useState('Dieta blanda pediátrica');
  const [avatarSticker, setAvatarSticker] = useState('bear');
  const [allergies, setAllergies] = useState('Ninguna conocida');
  const [bloodType, setBloodType] = useState('O+');

  // Signos vitales
  const [heartRate, setHeartRate] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [respiratoryRate, setRespiratoryRate] = useState<string>('');
  const [oxygenSaturation, setOxygenSaturation] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setAgeYears(patient.ageYears);
      setAgeMonths(patient.ageMonths);
      setGender(patient.gender);
      setBedNumber(patient.bedNumber);
      setAdmissionDate(patient.admissionDate);
      setStatus(patient.status);
      setPrimaryDiagnosis(patient.primaryDiagnosis);
      setSurgicalProcedure(patient.surgicalProcedure || '');
      setPostOpDay(patient.postOpDay !== undefined ? String(patient.postOpDay) : '');
      setCurrentPlans(patient.currentPlans || '');
      setPendingPlans(patient.pendingPlans || '');
      setDietStatus(patient.dietStatus || 'Dieta blanda pediátrica');
      setAvatarSticker(patient.avatarSticker || 'bear');
      setAllergies(patient.allergies || 'Ninguna conocida');
      setBloodType(patient.bloodType || 'O+');
      if (patient.vitals) {
        setHeartRate(patient.vitals.heartRate ? String(patient.vitals.heartRate) : '');
        setBloodPressure(patient.vitals.bloodPressure || '');
        setRespiratoryRate(patient.vitals.respiratoryRate ? String(patient.vitals.respiratoryRate) : '');
        setOxygenSaturation(patient.vitals.oxygenSaturation ? String(patient.vitals.oxygenSaturation) : '');
        setTemperature(patient.vitals.temperature ? String(patient.vitals.temperature) : '');
      }
    } else {
      // Nuevo paciente: preasignar cama si viene del grid
      if (assignedBedNumber) {
        setBedNumber(assignedBedNumber);
      } else {
        // Encontrar la primera cama libre
        const freeBed = Array.from({ length: 20 }, (_, i) => i + 1).find(
          (b) => !occupiedBeds.includes(b)
        );
        if (freeBed) setBedNumber(freeBed);
      }
      setAdmissionDate(new Date().toISOString().split('T')[0]);
    }
  }, [patient, assignedBedNumber, occupiedBeds]);

  const daysCalculated = calculateHospitalDays(admissionDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !primaryDiagnosis.trim()) {
      alert('Por favor completa los nombres, apellidos y diagnóstico principal del paciente.');
      return;
    }

    const updatedPatient: Patient = {
      id: patient?.id || `pat-${Date.now()}`,
      bedNumber: Number(bedNumber),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ageYears: Number(ageYears),
      ageMonths: Number(ageMonths),
      gender,
      admissionDate,
      primaryDiagnosis: primaryDiagnosis.trim(),
      diagnoses: [
        primaryDiagnosis.trim(),
        ...(surgicalProcedure ? [`Post-op: ${surgicalProcedure}`] : []),
      ],
      surgicalProcedure: surgicalProcedure.trim() || undefined,
      postOpDay: postOpDay ? Number(postOpDay) : undefined,
      currentPlans: currentPlans.trim(),
      pendingPlans: pendingPlans.trim(),
      status,
      dietStatus,
      avatarSticker,
      allergies,
      bloodType,
      vitals: {
        heartRate: heartRate ? Number(heartRate) : undefined,
        bloodPressure: bloodPressure.trim() || undefined,
        respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
        oxygenSaturation: oxygenSaturation ? Number(oxygenSaturation) : undefined,
        temperature: temperature ? Number(temperature) : undefined,
      },
    };

    onSavePatient(updatedPatient);
  };

  const handleDischarge = () => {
    if (!patient) return;
    if (onTriggerDischargeModal) {
      onClose();
      onTriggerDischargeModal(patient);
      return;
    }
    if (
      confirm(
        `¿Confirmar Alta Médica de ${patient.firstName} ${patient.lastName} de la Cama ${patient.bedNumber}?`
      )
    ) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
      onDischargePatient?.(patient.id, patient.bedNumber);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-sky-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors">
        {/* Encabezado del modal */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30">
              {avatarSticker === 'lion' ? '🦁' : avatarSticker === 'rabbit' ? '🐰' : avatarSticker === 'dino' ? '🦖' : avatarSticker === 'star' ? '⭐' : avatarSticker === 'rocket' ? '🚀' : '🧸'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Fredoka',sans-serif] flex items-center gap-2">
                {isNew ? 'Nuevo Ingreso a Cirugía Pediátrica' : `Ficha Clínica Pediátrica · Cama ${String(bedNumber).padStart(2, '0')}`}
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                {isNew ? 'Asignación de cama y plan de hospitalización' : `${firstName || 'Paciente'} ${lastName || ''}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-100">
          {/* Banner de días hospitalizados contabilizados en vivo */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/60 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-900/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Tiempo de Estancia Hospitalaria
                </span>
                <p className="text-xs sm:text-sm font-black text-sky-900 dark:text-sky-200">
                  Lleva <span className="text-base text-sky-600 dark:text-sky-400">{daysCalculated} {daysCalculated === 1 ? 'día' : 'días'}</span> hospitalizado(a)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Fecha de Ingreso:</label>
              <input
                type="date"
                required
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900"
              />
            </div>
          </div>

          {/* Selección de los 3 Estados Clínicos (Requisito Clave) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Estado Clínico del Paciente (Seleccione uno de los 3):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Estable */}
              <button
                type="button"
                onClick={() => setStatus('estable')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  status === 'estable'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-200 dark:ring-emerald-900'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-800'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-black">Paciente Estable</div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 leading-tight mt-0.5">
                    Buena evolución, signos estables, sin dolor descontrolado ni alarma.
                  </p>
                </div>
              </button>

              {/* 2. Observación */}
              <button
                type="button"
                onClick={() => setStatus('observacion')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  status === 'observacion'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 ring-2 ring-amber-200 dark:ring-amber-900'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-200 dark:hover:border-amber-800'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                  !
                </div>
                <div>
                  <div className="text-xs font-black">Amerita Observación</div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-400/80 leading-tight mt-0.5">
                    Vigilar débito, abdomen en evolución, fiebre o post-op inmediato.
                  </p>
                </div>
              </button>

              {/* 3. Crítico */}
              <button
                type="button"
                onClick={() => setStatus('critico')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  status === 'critico'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-200 ring-2 ring-rose-200 dark:ring-rose-900 animate-pulse'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-200 dark:hover:border-rose-800'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-black text-rose-700 dark:text-rose-400">Paciente Crítico</div>
                  <p className="text-[11px] text-rose-900/80 dark:text-rose-400/80 leading-tight mt-0.5">
                    Sepsis, inestabilidad, soporte invasivo o riesgo quirúrgico vital.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Datos Personales: Nombres, Apellidos, Edad, Género, Cama */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-sky-500" />
              Datos de Identificación del Paciente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Mateo"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Morales Ruiz"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Edad (Años)
                </label>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={ageYears}
                  onChange={(e) => setAgeYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meses (0-11)
                </label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sexo
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="M">Masculino (Niño)</option>
                  <option value="F">Femenino (Niña)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asignar Cama (1-20)
                </label>
                <select
                  value={bedNumber}
                  onChange={(e) => setBedNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-black text-sky-700 dark:text-sky-400"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((b) => {
                    const isOccupiedByOther =
                      occupiedBeds.includes(b) && (!patient || patient.bedNumber !== b);
                    return (
                      <option key={b} value={b} disabled={isOccupiedByOther}>
                        Cama {String(b).padStart(2, '0')} {isOccupiedByOther ? '(Ocupada)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Sticker Infantil Favorito */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Distintivo / Mascota Infantil:
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'bear', label: 'Osito', emoji: '🧸' },
                  { id: 'lion', label: 'Leoncito', emoji: '🦁' },
                  { id: 'rabbit', label: 'Conejito', emoji: '🐰' },
                  { id: 'dino', label: 'Dino', emoji: '🦖' },
                  { id: 'star', label: 'Estrellita', emoji: '⭐' },
                  { id: 'rocket', label: 'Cohete', emoji: '🚀' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setAvatarSticker(st.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1 font-bold transition-all cursor-pointer ${
                      avatarSticker === st.id
                        ? 'border-sky-500 bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{st.emoji}</span>
                    <span className="hidden sm:inline">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnósticos Quirúrgicos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Diagnóstico Quirúrgico Principal *
            </label>
            <input
              type="text"
              required
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              placeholder="Ej. Apendicitis aguda complicada con peritonitis flemosa"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Procedimiento Quirúrgico Realizado o Previsto
              </label>
              <input
                type="text"
                value={surgicalProcedure}
                onChange={(e) => setSurgicalProcedure(e.target.value)}
                placeholder="Ej. Apendicectomía laparoscópica + lavado peritoneal"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Día Postoperatorio (PO)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={postOpDay}
                onChange={(e) => setPostOpDay(e.target.value)}
                placeholder="Ej. 2 (Día 2)"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          {/* REQUISITO CLAVE: ¿Qué exámenes o plan tiene? */}
          <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 space-y-1.5">
            <label className="block text-xs font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              ¿Qué Exámenes o Plan Tiene? (Plan Activo) *
            </label>
            <p className="text-[11px] text-sky-800/80 dark:text-sky-400">
              Detalla los tratamientos activos, medicamentos, infusiones, tolerancia y estudios realizados.
            </p>
            <textarea
              rows={3}
              required
              value={currentPlans}
              onChange={(e) => setCurrentPlans(e.target.value)}
              placeholder="Ej. Ampicilina/Sulbactam + Metronidazol EV. Paracetamol c/8h. Hemograma y ecografía tomada en la mañana. Tolera líquidos claros."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none font-medium"
            />
          </div>

          {/* REQUISITO CLAVE: ¿Qué plan pendiente está? */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
            <label className="block text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ¿Qué Plan Pendiente Está? (Tareas / Procedimientos Pendientes) *
            </label>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-400">
              Registra los estudios por realizar, interconsultas pendientes, retiro de drenes o cirugías en turno.
            </p>
            <textarea
              rows={3}
              required
              value={pendingPlans}
              onChange={(e) => setPendingPlans(e.target.value)}
              placeholder="Ej. Pendiente reporte de cultivo de herida operatoria. Interconsulta con cardiología pediátrica para alta. Retiro de dren Penrose a las 18:00."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 outline-none font-medium"
            />
          </div>

          {/* Signos Vitales y Régimen Dietario */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Signos Vitales y Régimen Dietario Pediátrico
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">FC (lpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="100"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">PA (mmHg)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="95/60"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">FR (rpm)</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  placeholder="22"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">SatO2 (%)</label>
                <input
                  type="number"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value)}
                  placeholder="99"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="36.8"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Dieta / Estado Nutricional</label>
                <input
                  type="text"
                  value={dietStatus}
                  onChange={(e) => setDietStatus(e.target.value)}
                  placeholder="Ej. Ayuno preoperatorio / Líquidos orales / Dieta general"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Alergias Conocidas</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Ej. Penicilina, Latex o Ninguna"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción del pie */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              {!isNew && onDischargePatient && (
                <button
                  type="button"
                  onClick={handleDischarge}
                  className="px-4 py-2 text-xs font-black rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Dar Alta Médica a Domicilio 🏠
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-md shadow-sky-200 dark:shadow-none flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isNew ? 'Guardar e Ingresar a Cama' : 'Actualizar Ficha Clínica'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
