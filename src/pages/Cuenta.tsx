import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, LogOut, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../i18n';
import { useAuth } from '../auth';
import { supabase } from '../supabase';
import { formatMXN } from '../constants';

// Estilo compartido de las casillas
const inputBase =
  'w-full border border-brand-gray-300 px-4 py-3 font-mono text-[11px] uppercase tracking-widest placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-blue transition-colors bg-brand-white';

// Casilla reutilizable (fuera del componente para no perder el foco al escribir)
type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  full?: boolean;
};
function Field({ label, name, value, onChange, type = 'text', full = false }: FieldProps) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
        {label}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} className={inputBase} />
    </div>
  );
}

// Datos del perfil (coinciden con la tabla `perfiles` de Supabase)
interface Perfil {
  nombres: string;
  apellidos: string;
  telefono: string;
  calle: string;
  no_ext: string;
  no_int: string;
  cp: string;
  colonia: string;
  ciudad: string;
  municipio: string;
  estado: string;
}
const EMPTY_PERFIL: Perfil = {
  nombres: '', apellidos: '', telefono: '', calle: '', no_ext: '', no_int: '',
  cp: '', colonia: '', ciudad: '', municipio: '', estado: '',
};

// Un pedido en el historial
interface Pedido {
  id: string;
  total_mxn: number;
  estado: string;
  creado_en: string;
}

export default function Cuenta() {
  const { t, lang } = useLang();
  const { user, loading, signUp, signIn, signOut } = useAuth();

  // ── Formulario de acceso (registro / inicio de sesión) ──
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthMsg('');
    if (!email.trim() || !password) {
      setAuthMsg(t.cuenta.fillFields);
      return;
    }
    if (modo === 'signup' && password.length < 6) {
      setAuthMsg(t.cuenta.minPassword);
      return;
    }
    setAuthBusy(true);
    if (modo === 'signup') {
      const { error, needsConfirm } = await signUp(email.trim(), password);
      setAuthBusy(false);
      if (error) {
        setAuthMsg(error);
        return;
      }
      if (needsConfirm) {
        setConfirmSent(true); // hay que confirmar el correo
      }
      // Si no necesita confirmación, la sesión inicia sola (user cambia)
    } else {
      const { error } = await signIn(email.trim(), password);
      setAuthBusy(false);
      if (error) setAuthMsg(t.cuenta.loginError);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white">
        <Header />
        <main className="max-w-[1000px] mx-auto px-8 py-24 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
            {t.common.loading}
          </p>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIN SESIÓN → formulario de acceso
  // ═══════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-white">
        <Header />
        <main className="max-w-[440px] mx-auto px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
            {modo === 'login' ? t.cuenta.loginTitle : t.cuenta.signupTitle}
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-10">
            {t.cuenta.optionalNote}
          </p>

          {confirmSent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-brand-blue p-6 flex flex-col items-center gap-4 text-center"
            >
              <CheckCircle className="w-10 h-10 text-brand-blue" />
              <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                {t.cuenta.confirmEmail}
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAuth}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.cuenta.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.cuenta.emailPh}
                  className={inputBase}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.cuenta.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.cuenta.passwordPh}
                  className={inputBase}
                  autoComplete={modo === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>

              {authMsg && (
                <p className="font-mono text-[9px] uppercase tracking-widest text-red-500">
                  {authMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span>
                  {authBusy
                    ? t.cuenta.processing
                    : modo === 'login'
                      ? t.cuenta.loginBtn
                      : t.cuenta.signupBtn}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Cambiar entre iniciar sesión y registrarse */}
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center pt-2">
                {modo === 'login' ? t.cuenta.noAccount : t.cuenta.hasAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setModo(modo === 'login' ? 'signup' : 'login');
                    setAuthMsg('');
                  }}
                  className="text-brand-blue hover:underline"
                >
                  {modo === 'login' ? t.cuenta.goSignup : t.cuenta.goLogin}
                </button>
              </p>
            </motion.form>
          )}
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // CON SESIÓN → perfil + historial de pedidos
  // ═══════════════════════════════════════════════════════════════════
  return <CuentaPrivada user={user} signOut={signOut} t={t} lang={lang} />;
}

// ── Vista privada (separada para cargar datos solo cuando hay sesión) ──
function CuentaPrivada({
  user,
  signOut,
  t,
  lang,
}: {
  user: { id: string; email?: string };
  signOut: () => Promise<void>;
  t: ReturnType<typeof useLang>['t'];
  lang: string;
}) {
  const [perfil, setPerfil] = useState<Perfil>(EMPTY_PERFIL);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cargamos el perfil y los pedidos del cliente
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: p }, { data: ped }] = await Promise.all([
        supabase.from('perfiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('pedidos').select('id,total_mxn,estado,creado_en').order('creado_en', { ascending: false }),
      ]);
      if (!alive) return;
      if (p) {
        setPerfil({
          nombres: p.nombres ?? '', apellidos: p.apellidos ?? '', telefono: p.telefono ?? '',
          calle: p.calle ?? '', no_ext: p.no_ext ?? '', no_int: p.no_int ?? '',
          cp: p.cp ?? '', colonia: p.colonia ?? '', ciudad: p.ciudad ?? '',
          municipio: p.municipio ?? '', estado: p.estado ?? '',
        });
      }
      if (ped) setPedidos(ped as Pedido[]);
      setLoadingData(false);
    })();
    return () => {
      alive = false;
    };
  }, [user.id]);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPerfil((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSavedProfile(false);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await supabase.from('perfiles').upsert({ id: user.id, ...perfil });
    setSavingProfile(false);
    setSavedProfile(true);
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />
      <main className="max-w-[1000px] mx-auto px-8 py-16">
        {/* Encabezado con saludo y cerrar sesión */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-brand-black pb-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-2">
              {t.cuenta.greeting}, {user.email}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
              {t.cuenta.accountTitle}
            </h1>
          </div>
          <button
            onClick={signOut}
            className="self-start flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-brand-gray-300 px-5 py-3 hover:border-brand-black transition-colors"
          >
            <LogOut className="w-3 h-3" />
            {t.cuenta.signOut}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* ── PERFIL ── */}
          <form onSubmit={handleSaveProfile} className="flex-1 w-full">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 border-b border-brand-gray-200 pb-3 mb-2">
              {t.cuenta.profileTitle}
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-5">
              {t.cuenta.profileNote}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.cuenta.firstName} name="nombres" value={perfil.nombres} onChange={handleProfileChange} />
              <Field label={t.cuenta.lastName} name="apellidos" value={perfil.apellidos} onChange={handleProfileChange} />
              <Field label={t.cuenta.phone} name="telefono" value={perfil.telefono} onChange={handleProfileChange} type="tel" full />
              <Field label={t.cuenta.street} name="calle" value={perfil.calle} onChange={handleProfileChange} full />
              <Field label={t.cuenta.extNum} name="no_ext" value={perfil.no_ext} onChange={handleProfileChange} />
              <Field label={t.cuenta.intNum} name="no_int" value={perfil.no_int} onChange={handleProfileChange} />
              <Field label={t.cuenta.zip} name="cp" value={perfil.cp} onChange={handleProfileChange} />
              <Field label={t.cuenta.colonia} name="colonia" value={perfil.colonia} onChange={handleProfileChange} />
              <Field label={t.cuenta.city} name="ciudad" value={perfil.ciudad} onChange={handleProfileChange} />
              <Field label={t.cuenta.municipio} name="municipio" value={perfil.municipio} onChange={handleProfileChange} />
              <Field label={t.cuenta.state} name="estado" value={perfil.estado} onChange={handleProfileChange} full />
            </div>

            <div className="flex items-center gap-4 mt-6">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 group"
              >
                <span>{savingProfile ? t.cuenta.saving : t.cuenta.saveProfile}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              {savedProfile && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-blue">
                  {t.cuenta.profileSaved}
                </span>
              )}
            </div>
          </form>

          {/* ── HISTORIAL DE PEDIDOS ── */}
          <div className="w-full lg:w-[360px] shrink-0">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 border-b border-brand-gray-200 pb-3 mb-5">
              {t.cuenta.ordersTitle}
            </h2>

            {loadingData ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                {t.common.loading}
              </p>
            ) : pedidos.length === 0 ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                {t.cuenta.ordersEmpty}
              </p>
            ) : (
              <div className="border border-brand-gray-200 divide-y divide-brand-gray-200">
                {pedidos.map((ped) => (
                  <div key={ped.id} className="px-4 py-4 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                        #{ped.id.slice(0, 8)}
                      </span>
                      <span className="font-mono text-[11px] tracking-widest">
                        {formatMXN(Number(ped.total_mxn))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                        {fmtDate(ped.creado_en)}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-blue">
                        {ped.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
