import React, { useState } from 'react';
import { Patient, DischargeRecord } from '../types';
import { calculateHospitalDays, formatPediatricAge } from '../utils/helpers';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Bed,
  Calendar,
  X,
  CheckCircle2,
  Home,
  Hospital,
  FileText,
  UserCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DischargeModalProps {
  patient: Patient;
  onClose: () => void;
  onConfirmDischarge: (
    dischargeData: DischargeRecord,
    actionAfter: 'free_bed' | 'reassign_now'
  ) => void;
  occupiedBeds: number[];
  onChangeBed?: (patientId: string, newBedNumber: number) => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  patient,
  onClose,
  onConfirmDischarge,
  occupiedBeds,
  onChangeBed,
}) => {
  const daysHospitalized = calculateHospitalDays(patient.admissionDate);
  const [dischargeType, setDischargeType] = useState<
    'domicilio' | 'traslado_uci' | 'otra_institucion' | 'otro'
  >('domicilio');
  const [dischargeNotes, setDischargeNotes] = useState(
    'Paciente en buenas condiciones generales, afebril, tolerando vía oral, herida operatoria limpia y sin signos de infección.'
  );
  const [prescription, setPrescription] = useState(
    'Paracetamol jarabe 10-15 mg/kg c/8h condicional a dolor. Curación diaria con agua y jabón neutro. Cita de control en consulta externa de Cirugía Pediátrica en 7 días para retiro de puntos.'
  );
  const [actionAfter, setActionAfter] = useState<'free_bed' | 'reassign_now'>('free_bed');
  const [transferBedNumber, setTransferBedNumber] = useState<number>(patient.bedNumber);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleProcessDischarge = () => {
    if (dischargeType === 'domicilio') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch (e) {
        // ignore
      }
    }

    const dischargeRecord: DischargeRecord = {
      id: `disc-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      bedNumber: patient.bedNumber,
      dischargeDate: new Date().toISOString(),
      admissionDate: patient.admissionDate,
      daysHospitalized,
      primaryDiagnosis: patient.primaryDiagnosis,
      dischargeType,
      dischargeNotes,
      dischargePrescription: prescription,
    };

    onConfirmDischarge(dischargeRecord, actionAfter);
  };

  const handleTransferBed = () => {
    if (transferBedNumber === patient.bedNumber) {
      alert('La cama seleccionada es la misma cama actual.');
      return;
    }
    onChangeBed?.(patient.id, transferBedNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-emerald-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors">
        {/* Encabezado festivo / profesional */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🏠
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Fredoka',sans-serif] flex items-center gap-2">
                Procesar Alta Médica y Liberar Cama
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Cama {String(patient.bedNumber).padStart(2, '0')} · {patient.firstName} {patient.lastName}
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

        {/* Contenido */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800 dark:text-slate-100">
          {/* Resumen del paciente y días de estancia */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Paciente Pediátrico</p>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {formatPediatricAge(patient.ageYears, patient.ageMonths)} · Diagnóstico: {patient.primaryDiagnosis}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Estancia Total</span>
              <span className="px-2.5 py-1 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-transparent dark:border-sky-800 font-black text-xs inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {daysHospitalized} {daysHospitalized === 1 ? 'Día' : 'Días'}
              </span>
            </div>
          </div>

          {/* Opción de Transferir / Cambiar de Cama sin dar de alta */}
          <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <div>
                <span className="font-bold text-sky-950 dark:text-sky-200 block">¿Deseas solo mover o cambiar de cama al paciente?</span>
                <span className="text-[11px] text-sky-800/80 dark:text-sky-400">Puedes trasladarlo a otra de las 20 camas disponibles.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTransferring(!isTransferring)}
              className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              {isTransferring ? 'Volver al Alta' : 'Transferir Cama'}
            </button>
          </div>

          {isTransferring ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-sky-300 dark:border-sky-700 space-y-3 animate-fade-in">
              <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Selecciona la nueva cama para {patient.firstName}:
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((b) => {
                  const isCurrent = b === patient.bedNumber;
                  const isOccupiedByOther = occupiedBeds.includes(b) && !isCurrent;
                  return (
                    <button
                      key={b}
                      type="button"
                      disabled={isOccupiedByOther}
                      onClick={() => setTransferBedNumber(b)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        transferBedNumber === b
                          ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                          : isOccupiedByOther
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-600'
                      }`}
                    >
                      Cama {String(b).padStart(2, '0')}
                      {isCurrent && <span className="block text-[9px]">Actual</span>}
                      {isOccupiedByOther && <span className="block text-[9px]">Ocupada</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferring(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleTransferBed}
                  className="px-4 py-1.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm cursor-pointer"
                >
                  Confirmar Traslado a Cama {transferBedNumber}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tipo de Alta */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Destino / Tipo de Alta Médica:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDischargeType('domicilio')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      dischargeType === 'domicilio'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-800'
                    }`}
                  >
                    <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs">Alta Médica a Domicilio</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Recuperación completa / egreso</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDischargeType('traslado_uci')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      dischargeType === 'traslado_uci'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-200 dark:hover:border-amber-800'
                    }`}
                  >
                    <Hospital className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs">Traslado a UCI / UCIN</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Complejidad intensiva</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDischargeType('otra_institucion')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      dischargeType === 'otra_institucion'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-200 dark:hover:border-sky-800'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <div>
                      <div className="text-xs">Contra-referencia / Otro Hospital</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Traslado a centro de origen</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDischargeType('otro')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      dischargeType === 'otro'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-200 dark:hover:border-purple-800'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs">Alta Voluntaria / Administrativa</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Petición familiar o firma</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Indicaciones / Receta al alta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Indicaciones y Receta Médica de Egreso
                </label>
                <textarea
                  rows={2}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Medicamentos, dosis ponderal, signos de alarma y fecha de control..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none"
                />
              </div>

              {/* ¿Qué hacer con la cama después del alta? */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider block">
                  Estado posterior de la Cama {patient.bedNumber}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionAfter('free_bed')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      actionAfter === 'free_bed'
                        ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-950 dark:text-emerald-200 font-bold shadow-2xs'
                        : 'border-emerald-200 dark:border-emerald-900/60 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                      {actionAfter === 'free_bed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </span>
                    <span>Dejar Cama Disponible (Limpia)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionAfter('reassign_now')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      actionAfter === 'reassign_now'
                        ? 'border-sky-600 bg-white dark:bg-slate-800 text-sky-950 dark:text-sky-200 font-bold shadow-2xs'
                        : 'border-emerald-200 dark:border-emerald-900/60 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-sky-600 flex items-center justify-center">
                      {actionAfter === 'reassign_now' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                      )}
                    </span>
                    <span>Asignar Cama a Nuevo Paciente Ya</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pie de modal */}
        {!isTransferring && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleProcessDischarge}
              className="px-5 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Alta y Liberar Cama {patient.bedNumber}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
