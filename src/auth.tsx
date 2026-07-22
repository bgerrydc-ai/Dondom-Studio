import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════
// CUENTAS DE CLIENTE (Supabase Auth)
// ═══════════════════════════════════════════════════════════════════
// Maneja el registro, el inicio de sesión y el cierre de sesión.
// Las cuentas son OPCIONALES: se puede comprar como invitado. Quien crea
// cuenta puede ver su historial de pedidos y guardar su dirección.
//
// Cualquier página usa:  const { user, signIn, signOut } = useAuth();
//   • user = null  → nadie ha iniciado sesión (invitado)
//   • user != null → hay una sesión activa
// ═══════════════════════════════════════════════════════════════════

interface SignUpResult {
  error: string | null;
  needsConfirm: boolean; // true si Supabase pide confirmar el correo
}

interface AuthValue {
  user: User | null;
  session: Session | null;
  loading: boolean; // true mientras revisamos si ya había sesión
  signUp: (
    email: string,
    password: string,
    extra?: { acepta_marketing: boolean; acepto_terminos: boolean },
  ) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // Recuperación de contraseña:
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  isRecovery: boolean; // true cuando el usuario llegó por el enlace de recuperación
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase siempre manda sus mensajes de error en INGLÉS, sin importar el
// idioma de la página. Aquí traducimos los más comunes; si no reconocemos
// el mensaje, mostramos el original de Supabase (mejor eso que nada).
// ─────────────────────────────────────────────────────────────────────────────
const ERRORES_CONOCIDOS: { test: RegExp; es: string; en: string }[] = [
  {
    test: /new password should be different/i,
    es: 'La nueva contraseña debe ser diferente a la anterior.',
    en: 'The new password must be different from the previous one.',
  },
  {
    test: /invalid login credentials/i,
    es: 'Correo o contraseña incorrectos.',
    en: 'Incorrect email or password.',
  },
  {
    test: /user already registered/i,
    es: 'Ya existe una cuenta con este correo.',
    en: 'An account with this email already exists.',
  },
  {
    test: /email not confirmed/i,
    es: 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.',
    en: 'You need to confirm your email before signing in. Check your inbox.',
  },
  {
    test: /password should be at least/i,
    es: 'La contraseña debe tener al menos 6 caracteres.',
    en: 'The password must be at least 6 characters.',
  },
  {
    test: /unable to validate email address/i,
    es: 'El correo electrónico no es válido.',
    en: 'The email address is not valid.',
  },
  {
    test: /email rate limit exceeded/i,
    es: 'Se alcanzó el límite de correos por ahora. Intenta de nuevo en unos minutos.',
    en: 'Email limit reached for now. Try again in a few minutes.',
  },
  {
    test: /for security purposes.*after (\d+) seconds/i,
    es: 'Por seguridad, espera unos segundos antes de intentar de nuevo.',
    en: 'For security purposes, please wait a few seconds before trying again.',
  },
  {
    test: /same password/i,
    es: 'La nueva contraseña debe ser diferente a la anterior.',
    en: 'The new password must be different from the previous one.',
  },
];

export function traducirErrorAuth(message: string | null, lang: 'es' | 'en'): string | null {
  if (!message) return null;
  const encontrado = ERRORES_CONOCIDOS.find((e) => e.test.test(message));
  if (!encontrado) return message; // sin traducción conocida: mostramos el original
  return lang === 'es' ? encontrado.es : encontrado.en;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // 1) ¿Ya había una sesión guardada de una visita anterior?
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2) Escuchamos cambios (iniciar/cerrar sesión) para actualizar solos
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      // Cuando el usuario abre el enlace de "recuperar contraseña", Supabase
      // dispara este evento: entramos en modo recuperación para pedirle la nueva.
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
      // Si cierra sesión (por ejemplo, para CANCELAR la recuperación y volver
      // al login normal), salimos también del modo recuperación.
      if (event === 'SIGNED_OUT') setIsRecovery(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    extra?: { acepta_marketing: boolean; acepto_terminos: boolean },
  ): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Si Supabase pide confirmar el correo, el enlace regresa al MISMO
        // dominio desde donde se registró (tu sitio real, no localhost).
        emailRedirectTo: `${window.location.origin}/cuenta`,
        // Guardamos el consentimiento (términos y marketing) junto con el
        // registro; el trigger de la base de datos lo pasa a `perfiles`.
        data: {
          acepta_marketing: extra?.acepta_marketing ?? false,
          acepto_terminos: extra?.acepto_terminos ?? false,
        },
      },
    });
    if (error) return { error: error.message, needsConfirm: false };
    // Si no hay sesión de inmediato, es porque Supabase pide confirmar el correo
    return { error: null, needsConfirm: !data.session };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Paso 1: enviar el correo con el enlace para restablecer la contraseña.
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/cuenta`,
    });
    return { error: error ? error.message : null };
  };

  // Paso 2: ya con el enlace abierto, guardar la nueva contraseña.
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setIsRecovery(false);
    return { error: error ? error.message : null };
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, isRecovery }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
