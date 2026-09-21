import React, { useState } from 'react';
import { UserSession } from '../types';
import { Stethoscope, Lock, Mail, ShieldCheck, Heart, Sparkles, User, LogIn, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (session: UserSession) => void;
  currentUser: UserSession | null;
  onClose?: () => void;
  forceOpen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLoginSuccess,
  currentUser,
  onClose,
  forceOpen = false,
}) => {
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('levi.mezonesp144@gmail.com');
  const [password, setPassword] = useState('Residentes2026');
  const [doctorName, setDoctorName] = useState('Dr. Levi Mezones');
  const [role, setRole] = useState('Cirujano Pediátrico Titular');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = (customEmail?: string, customName?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      const session: UserSession = {
        email: customEmail || 'levi.mezonesp144@gmail.com',
        displayName: customName || 'Dr. Levi Mezones',
        role: 'Cirujano Pediátrico Jefe de Sala',
        medicalLicense: 'CMP-84219 / RNE-42105',
        photoURL: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
      };
      localStorage.setItem('pediacirugia_user', JSON.stringify(session));
      setIsLoading(false);
      onLoginSuccess(session);
    }, 600);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (password.trim() !== 'Residentes2026') {
      setErrorMessage('Contraseña incorrecta. La clave autorizada para el servicio es Residentes2026');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      const session: UserSession = {
        email: email.trim(),
        displayName: doctorName.trim() || 'Médico Cirujano Pediátrico',
        role: role,
        medicalLicense: 'CMP-REG-' + Math.floor(10000 + Math.random() * 90000),
        provider: 'email',
      };
      localStorage.setItem('pediacirugia_user', JSON.stringify(session));
      setIsLoading(false);
      onLoginSuccess(session);
    }, 600);
  };

  if (currentUser && !forceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-sky-100 dark:border-slate-800 overflow-hidden relative transition-colors">
        {/* Banner temático infantil */}
        <div className="bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-400 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-yellow-300/20 rounded-full blur-lg pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white p-1 mb-3 shadow-xl border-2 border-white/50 overflow-hidden">
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
                  span.className = 'fallback-emoji text-3xl';
                  span.textContent = '🧸';
                  parent.appendChild(span);
                }
              }}
            />
          </div>

          <h2 className="text-2xl font-black font-['Fredoka',sans-serif] tracking-wide drop-shadow-sm flex items-center justify-center gap-2">
            Residentes2026
            <Sparkles className="w-5 h-5 text-amber-300" />
          </h2>
          <p className="text-sky-100 text-sm font-semibold mt-1">
            Cirugía Pediátrica · Hospitalización Quirúrgica
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-white/25 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Acceso Médico Autorizado
          </div>
        </div>

        {/* Pestañas de método de acceso */}
        <div className="p-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => setAuthMode('google')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'google'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Acceso con Google
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'email'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              Correo Electrónico
            </button>
          </div>

          {authMode === 'google' ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Ingresa con tu cuenta de Google del hospital o servicio quirúrgico:
                </p>
              </div>

              {/* Botón principal de Google con cuenta del usuario */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleLogin('levi.mezonesp144@gmail.com', 'Dr. Levi Mezones')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-sky-200 dark:border-sky-900/80 bg-gradient-to-r from-sky-50 to-indigo-50/40 dark:from-sky-950/40 dark:to-indigo-950/40 hover:from-sky-100 hover:to-indigo-100/60 dark:hover:from-sky-900/60 dark:hover:to-indigo-900/60 transition-all shadow-sm group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      Dr. Levi Mezones
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-semibold">
                        Jefe de Sala
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">levi.mezonesp144@gmail.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Opción rápida secundaria: Cirujano de Guardia */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleLogin('cirugia.guardia@hospital.gob.pe', 'Cirugía Pediátrica - Guardia')}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Médico Residente / Asistencial
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">cirugia.guardia@hospital.gob.pe</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Autenticación segura con Google para el personal médico de Cirugía Infantil
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Médico / Especialista
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Ej. Dra. Camila Pérez"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.gob.pe"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rol Clínico
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Cirujano Pediátrico Titular">Cirujano Pediátrico Titular</option>
                  <option value="Residente de Cirugía Pediátrica">Residente de Cirugía Pediátrica</option>
                  <option value="Enfermera Especialista Pediátrica">Enfermera Especialista Pediátrica</option>
                  <option value="Interno de Medicina">Interno de Medicina</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña de Servicio
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-200 dark:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Ingresar al Censo de Camas
                  </>
                )}
              </button>
            </form>
          )}

          {onClose && currentUser && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
              >
                Continuar con la sesión actual ({currentUser.displayName})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
