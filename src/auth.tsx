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
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) ¿Ya había una sesión guardada de una visita anterior?
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2) Escuchamos cambios (iniciar/cerrar sesión) para actualizar solos
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Si Supabase pide confirmar el correo, el enlace regresa al MISMO
      // dominio desde donde se registró (tu sitio real, no localhost).
      options: { emailRedirectTo: `${window.location.origin}/cuenta` },
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

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
