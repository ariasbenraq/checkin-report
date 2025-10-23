import React, { useEffect, useRef, useState } from 'react';
import { signIn } from '../api/client'; // ajusta la ruta según tu alias de paths
import { useNavigate } from 'react-router-dom';


/**
 * AuthLanding.tsx — versión sin librerías UI externas (solo React + Tailwind)
 *
 * Endpoints esperados (NestJS):
 *  - POST /auth/signin  -> { accessToken: string }
 *  - POST /auth/signup  -> 201 Created
 *
 * Configuración:
 *  - Define VITE_API_URL en tu .env (ej.: http://localhost:3000)
 *  - Esta versión NO usa shadcn/ui, lucide, ni framer-motion.
 *
 * Accesibilidad básica, validación mínima, manejo de errores del backend
 * y redirección tras login (ROUTE_AFTER_LOGIN).
 */

const ROUTE_AFTER_LOGIN = '/app'; // Cambia a tu ruta post-login


// async function httpPost<T>(url: string, data: unknown): Promise<T> {
//   const res = await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data),
//   });
//   const contentType = res.headers.get('content-type') || '';
//   const isJson = contentType.includes('application/json');
//   const payload = isJson ? await res.json().catch(() => ({})) : await res.text();
//   if (!res.ok) {
//     const message = (isJson ? (payload as any)?.message : String(payload)) || `HTTP ${res.status}`;
//     throw new Error(Array.isArray(message) ? message.join('. ') : message);
//   }
//   return payload as T;
// }

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert" aria-live="assertive">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span>{message}</span>
    </div>
  );
}

export default function AuthLanding() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Signin state
  const [siUser, setSiUser] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siErr, setSiErr] = useState('');
  const [siLoading, setSiLoading] = useState(false);
  const [siShow, setSiShow] = useState(false);

  // // Signup state
  // const [suUser, setSuUser] = useState('');
  // const [suPass, setSuPass] = useState('');
  // const [suErr, setSuErr] = useState('');
  // const [suLoading, setSuLoading] = useState(false);
  // const [suShow, setSuShow] = useState(false);

  // Auto-focus por pestaña
  const siUserRef = useRef<HTMLInputElement>(null);
  const suUserRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (tab === 'signin' ? siUserRef : suUserRef).current?.focus();
  }, [tab]);

  const canSignin = siUser.trim().length >= 3 && siPass.length >= 3 && !siLoading;
  const navigate = useNavigate();
  // const canSignup = suUser.trim().length >= 3 && suPass.length >= 8 && !suLoading;

  async function onSignin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSignin) return;
    setSiErr('');
    setSiLoading(true);
    try {
      const token = await signIn(siUser.trim(), siPass);
      localStorage.setItem('accessToken', token); // 👈 MISMA KEY que usa getToken()
      navigate(ROUTE_AFTER_LOGIN, { replace: true });  // ej. '/app'
    } catch (err: any) {
      setSiErr(err?.message || 'Error al iniciar sesión');
    } finally {
      setSiLoading(false);
    }
  }


  // async function onSignup(e?: React.FormEvent) {
  //   e?.preventDefault();
  //   if (!canSignup) return;
  //   setSuErr('');
  //   setSuLoading(true);
  //   try {
  //     await httpPost<void>(`${API_BASE}/auth/signup`, {
  //       username: suUser.trim(),
  //       password: suPass,
  //     });
  //     setTab('signin');
  //     setSiUser(suUser.trim());
  //     setSiPass('');
  //   } catch (err: any) {
  //     setSuErr(err?.message || 'No se pudo crear la cuenta');
  //   } finally {
  //     setSuLoading(false);
  //   }
  // }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-100">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-12 md:px-8 lg:px-10">
        <div className="mb-8 text-center">
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-black md:text-5xl">
            Logistica CDV
          </h1>
          <p className="mx-auto mt-3 max-w-prose text-balance text-sm text-black/60 md:text-base">Inicia sesión para continuar</p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur">
          <header className="mb-4">
            <h2 className="text-2xl font-semibold">Tu cuenta</h2>
            <p className="text-sm text-black/60">Usa tu <em>username</em> y una contraseña segura.</p>
          </header>

          {/* Tabs simples */}
          <div className="mb-4 grid grid-cols-2 rounded-lg bg-black/5 p-1 text-sm">
            <button
              className={`rounded-md px-3 py-2 transition ${tab === 'signin' ? 'bg-white shadow' : 'hover:bg-white/70'}`}
              onClick={() => setTab('signin')}
              type="button"
              aria-selected={tab === 'signin'}
            >
              Iniciar sesión
            </button>
            <button
              className={`rounded-md px-3 py-2 transition ${tab === 'signup' ? 'bg-white shadow' : 'hover:bg-white/70'}`}
              onClick={() => setTab('signup')}
              type="button"
              aria-selected={tab === 'signup'}
            >
              Crear cuenta
            </button>
          </div>

          {tab === 'signin' && (
            <form onSubmit={onSignin} className="space-y-4">
              <ErrorBanner message={siErr} />
              <div className="space-y-2">
                <label htmlFor="si-username" className="text-sm font-medium text-black/80">Usuario</label>
                <input
                  id="si-username"
                  ref={siUserRef}
                  value={siUser}
                  onChange={(e) => setSiUser(e.target.value)}
                  placeholder="tu.usuario"
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="si-password" className="text-sm font-medium text-black/80">Contraseña</label>
                <div className="relative">
                  <input
                    id="si-password"
                    type={siShow ? 'text' : 'password'}
                    value={siPass}
                    onChange={(e) => setSiPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 pr-10 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSiShow((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-black/50 hover:text-black/70"
                    aria-label={siShow ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {siShow ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={!canSignin}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${canSignin ? 'bg-sky-600 text-white hover:bg-sky-700' : 'cursor-not-allowed bg-sky-200 text-white'}`}
              >
                {siLoading ? 'Accediendo…' : 'Entrar'}
              </button>
            </form>
          )}

          {/* {tab === 'signup' && (
            <form onSubmit={onSignup} className="space-y-4">
              <ErrorBanner message={suErr} />
              <div className="space-y-2">
                <label htmlFor="su-username" className="text-sm font-medium text-black/80">Usuario</label>
                <input
                  id="su-username"
                  ref={suUserRef}
                  value={suUser}
                  onChange={(e) => setSuUser(e.target.value)}
                  placeholder="elige-un-usuario"
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="su-password" className="text-sm font-medium text-black/80">Contraseña</label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={suShow ? 'text' : 'password'}
                    value={suPass}
                    onChange={(e) => setSuPass(e.target.value)}
                    placeholder="mínimo 8 caracteres"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 pr-10 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSuShow((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-black/50 hover:text-black/70"
                    aria-label={suShow ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {suShow ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-black/50">Debe incluir mayúsculas, minúsculas y números o símbolos.</p>
              </div>
              <button
                type="submit"
                disabled={!canSignup}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${canSignup ? 'bg-violet-600 text-white hover:bg-violet-700' : 'cursor-not-allowed bg-violet-200 text-white'}`}
              >
                {suLoading ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </form>
          )} */}

          <div className="mt-4 flex items-center justify-between text-xs text-black/50">
            <span>Protegido con JWT · NestJS</span>
            <a className="underline-offset-2 hover:underline" href="#recuperar">¿Olvidaste tu contraseña?</a>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-black/50">
          <p><span className="opacity-75">© {new Date().getFullYear()} CheckIn Report.</span> Hecho con ♥ en React + Tailwind.</p>
        </footer>
      </div>
    </div>
  );
}
