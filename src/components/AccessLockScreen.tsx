import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Moon, Sun, ArrowRight, AlertCircle, Stethoscope } from 'lucide-react';

interface AccessLockScreenProps {
  onUnlock: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AccessLockScreen: React.FC<AccessLockScreenProps> = ({
  onUnlock,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const trimmed = password.trim();
    if (trimmed === 'Residentes2026') {
      try {
        sessionStorage.setItem('pediacirugia_access_unlocked', 'true');
        if (rememberDevice) {
          localStorage.setItem('pediacirugia_access_unlocked', 'true');
        } else {
          localStorage.removeItem('pediacirugia_access_unlocked');
        }
      } catch (err) {
        // ignore
      }
      setTimeout(() => {
        setIsSubmitting(false);
        onUnlock();
      }, 300);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setError('Contraseña incorrecta. Verifique mayúsculas y minúsculas e intente nuevamente.');
      }, 300);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative font-['Nunito',sans-serif] transition-colors duration-200 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-sky-50 via-indigo-50/50 to-teal-50 text-slate-900'
      }`}
    >
      {/* Botón flotante superior para alternar Modo Noche */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            isDarkMode
              ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
              : 'bg-white/90 backdrop-blur-xs border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title={isDarkMode ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Modo Día</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Modo Noche</span>
            </>
          )}
        </button>
      </div>

      {/* Tarjeta Central de Acceso */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-sky-100 dark:border-slate-800 overflow-hidden relative transition-colors animate-fade-in my-auto">
        {/* Cabecera Pediátrica */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500 p-6 sm:p-7 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white p-1.5 mb-3 shadow-xl border-2 border-white/50 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Logo Residentes2026"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.fallback-emoji')) {
                  const span = document.createElement('span');
                  span.className = 'fallback-emoji text-4xl';
                  span.textContent = '🧸';
                  parent.appendChild(span);
                }
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wide drop-shadow-sm">
            Residentes2026
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 font-bold mt-1">
            Cirugía Pediátrica · Hospitalización Quirúrgica
          </p>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold text-white mt-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Sala de 20 Camas Pediátricas</span>
          </div>
        </div>

        {/* Formulario de Contraseña */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div className="space-y-1 text-center sm:text-left">
            <label
              htmlFor="access-password"
              className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Ingrese la Contraseña de Acceso:
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Para ingresar y gestionar las 20 camas hospitalarias, digite la clave de servicio.
            </p>
          </div>

          {/* Campo de Contraseña */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="access-password"
              type={showPassword ? 'text' : 'password'}
              autoFocus
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••••••"
              className={`w-full pl-10 pr-11 py-3 text-sm font-bold rounded-2xl border transition-all outline-none ${
                error
                  ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-3 focus:ring-sky-100 dark:focus:ring-sky-950'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Casilla Recordar Dispositivo */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400 cursor-pointer"
              />
              <span>Recordar en este navegador</span>
            </label>
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              Residentes y Médicos
            </span>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className={`w-full py-3 px-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              isSubmitting || !password.trim()
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sky-200 dark:shadow-none hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-1">⏳</span>
                <span>Verificando Clave...</span>
              </>
            ) : (
              <>
                <span>Ingresar a Hospitalización</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Nota de confidencialidad hospitalaria */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sistema protegido de confidencialidad médica pediátrica</span>
            </p>
          </div>
        </form>
      </div>

      {/* Pie con autoría clínica */}
      <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p className="font-semibold text-slate-600 dark:text-slate-400">
          Iniciativa y autoría clínica: <span className="text-sky-600 dark:text-sky-400 font-bold">MR Leví Mezones Peña</span>
        </p>
        <p className="text-[11px] mt-0.5">Servicio de Cirugía Pediátrica · Hospitalización Quirúrgica</p>
      </footer>
    </div>
  );
};
