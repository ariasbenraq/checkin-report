import React, { useEffect, useRef, useState } from 'react';
import { signIn } from '../utils/auth';

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
  const [email, setEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siErr, setSiErr] = useState('');
  const [siLoading, setSiLoading] = useState(false);
  const [siShow, setSiShow] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const canSignin = email.trim().length >= 5 && siPass.length >= 6 && !siLoading;

  async function onSignin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSignin) return;
    setSiErr('');
    setSiLoading(true);
    try {
      await signIn(email.trim(), siPass);
    } catch (err: any) {
      setSiErr(err?.message || 'Error al iniciar sesión');
    } finally {
      setSiLoading(false);
    }
  }

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
            <p className="text-sm text-black/60">Inicia sesión con tu correo y contraseña de Supabase.</p>
          </header>

          <form onSubmit={onSignin} className="space-y-4">
            <ErrorBanner message={siErr} />
            <div className="space-y-2">
              <label htmlFor="si-email" className="text-sm font-medium text-black/80">Correo</label>
              <input
                id="si-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                autoComplete="email"
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
              {siLoading ? 'Accediendo…' : 'Entrar con Supabase'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-black/50">
            <span>Autenticación gestionada por Supabase</span>
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
