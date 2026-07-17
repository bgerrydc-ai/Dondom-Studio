import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
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
  const { user, loading, signUp, signIn, signOut, resetPassword, updatePassword, isRecovery } = useAuth();

  // ── Formulario de acceso (registro / inicio de sesión / recuperar) ──
  const [modo, setModo] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaMarketing, setAceptaMarketing] = useState(false);
  const [authMsg, setAuthMsg] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // ── Nueva contraseña (cuando llega por el enlace de recuperación) ──
  const [newPassword, setNewPassword] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryDone, setRecoveryDone] = useState(false);

  // Enviar el correo con el enlace para restablecer la contraseña
  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setAuthMsg('');
    if (!email.trim()) {
      setAuthMsg(t.cuenta.fillFields);
      return;
    }
    setAuthBusy(true);
    const { error } = await resetPassword(email.trim());
    setAuthBusy(false);
    if (error) {
      setAuthMsg(error);
      return;
    }
    setResetSent(true); // mostramos "revisa tu correo"
  };

  // Guardar la nueva contraseña
  const handleNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    setRecoveryMsg('');
    if (newPassword.length < 6) {
      setRecoveryMsg(t.cuenta.minPassword);
      return;
    }
    setRecoveryBusy(true);
    const { error } = await updatePassword(newPassword);
    setRecoveryBusy(false);
    if (error) {
      setRecoveryMsg(error);
      return;
    }
    setRecoveryDone(true); // isRecovery pasa a false → luego se ve la cuenta
  };

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
    if (modo === 'signup' && !aceptaTerminos) {
      setAuthMsg(t.cuenta.mustAcceptTerms);
      return;
    }
    setAuthBusy(true);
    if (modo === 'signup') {
      const { error, needsConfirm } = await signUp(email.trim(), password, {
        acepta_marketing: aceptaMarketing,
        acepto_terminos: aceptaTerminos,
      });
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
  // MODO RECUPERACIÓN → el usuario abrió el enlace del correo
  // ═══════════════════════════════════════════════════════════════════
  if (isRecovery && !recoveryDone) {
    return (
      <div className="min-h-screen bg-brand-white">
        <Header />
        <main className="max-w-[420px] mx-auto px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
            {t.cuenta.newPassTitle}
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-8 leading-relaxed">
            {t.cuenta.newPassSub}
          </p>
          <form onSubmit={handleNewPassword} className="flex flex-col gap-5">
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                {t.cuenta.newPassLabel}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.cuenta.passwordPh}
                className={inputBase}
                autoComplete="new-password"
              />
            </div>
            {recoveryMsg && (
              <p className="font-mono text-[9px] uppercase tracking-widest text-red-500">
                {recoveryMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={recoveryBusy}
              className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <span>{recoveryBusy ? t.cuenta.processing : t.cuenta.newPassBtn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RECUPERAR CONTRASEÑA → pedir correo para enviar el enlace
  // ═══════════════════════════════════════════════════════════════════
  if (!user && modo === 'reset') {
    return (
      <div className="min-h-screen bg-brand-white">
        <Header />
        <main className="max-w-[420px] mx-auto px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
            {t.cuenta.resetTitle}
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-8 leading-relaxed">
            {t.cuenta.resetSub}
          </p>

          {resetSent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-brand-blue p-6 flex flex-col items-center gap-4 text-center"
            >
              <CheckCircle className="w-10 h-10 text-brand-blue" />
              <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                {t.cuenta.resetSent}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-5">
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
                <span>{authBusy ? t.cuenta.processing : t.cuenta.resetBtn}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setModo('login');
              setAuthMsg('');
              setResetSent(false);
            }}
            className="mt-6 font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors"
          >
            ← {t.cuenta.backToLogin}
          </button>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // SIN SESIÓN → formulario de acceso
  // ═══════════════════════════════════════════════════════════════════
  if (!user) {
    const isSignup = modo === 'signup';
    return (
      <div className="min-h-screen bg-brand-white">
        <Header />
        <main
          className={`mx-auto px-8 py-16 transition-all duration-300 ${
            isSignup ? 'max-w-[560px]' : 'max-w-[420px]'
          }`}
        >
          {/* Pestañas grandes: Iniciar sesión / Crear cuenta */}
          <div className="flex border border-brand-gray-300 mb-10">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setAuthMsg('');
              }}
              className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-4 transition-colors ${
                modo === 'login'
                  ? 'bg-brand-black text-brand-white'
                  : 'text-brand-gray-400 hover:text-brand-black'
              }`}
            >
              {t.cuenta.loginTitle}
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('signup');
                setAuthMsg('');
              }}
              className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-4 transition-colors border-l border-brand-gray-300 ${
                modo === 'signup'
                  ? 'bg-brand-blue text-brand-white'
                  : 'text-brand-gray-400 hover:text-brand-black'
              }`}
            >
              {t.cuenta.signupTitle}
            </button>
          </div>

          {/* Encabezado distinto según el modo */}
          <motion.div key={modo + '-head'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
              {isSignup ? t.cuenta.signupHeading : t.cuenta.loginHeading}
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-8 leading-relaxed">
              {isSignup ? t.cuenta.signupSub : t.cuenta.loginSub}
            </p>
          </motion.div>

          {/* Panel de beneficios — SOLO al crear cuenta (lo hace más llamativo) */}
          {isSignup && !confirmSent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-brand-blue bg-brand-blue/5 p-6 mb-8"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-blue font-bold mb-4">
                {t.cuenta.benefitsTitle}
              </p>
              <ul className="flex flex-col gap-3">
                {[t.cuenta.benefit1, t.cuenta.benefit2, t.cuenta.benefit3].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

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
                {/* ¿Olvidaste tu contraseña? — solo al iniciar sesión */}
                {modo === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModo('reset');
                      setAuthMsg('');
                    }}
                    className="mt-2 font-mono text-[9px] uppercase tracking-widest text-brand-blue hover:underline"
                  >
                    {t.cuenta.forgotLink}
                  </button>
                )}
              </div>

              {/* Consentimientos (solo al crear cuenta) */}
              {modo === 'signup' && (
                <div className="flex flex-col gap-4 pt-1">
                  {/* Obligatorio: términos y privacidad */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--color-brand-blue,#002395)]"
                    />
                    <span className="font-mono text-[9px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
                      {t.cuenta.termsPre}{' '}
                      <a
                        href="/terminos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-blue underline"
                      >
                        {t.cuenta.termsLink}
                      </a>{' '}
                      {t.cuenta.termsMid}{' '}
                      <a
                        href="/privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-blue underline"
                      >
                        {t.cuenta.privacyLink}
                      </a>{' '}
                      {t.cuenta.termsPost}
                    </span>
                  </label>

                  {/* Opcional: marketing */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aceptaMarketing}
                      onChange={(e) => setAceptaMarketing(e.target.checked)}
                      className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--color-brand-blue,#002395)]"
                    />
                    <span className="font-mono text-[9px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
                      {t.cuenta.marketingLabel}
                    </span>
                  </label>
                </div>
              )}

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
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>(EMPTY_PERFIL);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cambiar contraseña (estando dentro de la cuenta)
  const [nuevaPass, setNuevaPass] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [cambioPassMsg, setCambioPassMsg] = useState('');
  const [cambioPassOk, setCambioPassOk] = useState(false);

  const handleCambiarPass = async (e: FormEvent) => {
    e.preventDefault();
    setCambioPassMsg('');
    setCambioPassOk(false);
    if (nuevaPass.length < 6) {
      setCambioPassMsg(t.cuenta.minPassword);
      return;
    }
    setCambiandoPass(true);
    const { error } = await updatePassword(nuevaPass);
    setCambiandoPass(false);
    if (error) {
      setCambioPassMsg(error);
      return;
    }
    setNuevaPass('');
    setCambioPassOk(true);
  };

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

            <div className="mt-6">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 group"
              >
                <span>{savingProfile ? t.cuenta.saving : t.cuenta.saveProfile}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Confirmación grande + invitación a comprar */}
              {savedProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 border border-brand-blue p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-brand-blue">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    {t.cuenta.profileSaved}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/tienda')}
                    className="flex items-center justify-center gap-2 bg-brand-black text-brand-white font-mono text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-brand-blue hover:text-white transition-colors shrink-0"
                  >
                    {t.cuenta.goShop}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
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

        {/* ── CAMBIAR CONTRASEÑA ── */}
        <form onSubmit={handleCambiarPass} className="mt-16 pt-10 border-t border-brand-gray-200 max-w-md">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 border-b border-brand-gray-200 pb-3 mb-5">
            {t.cuenta.changePassTitle}
          </h2>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
              {t.cuenta.newPassLabel}
            </label>
            <input
              type="password"
              value={nuevaPass}
              onChange={(e) => {
                setNuevaPass(e.target.value);
                setCambioPassOk(false);
              }}
              placeholder={t.cuenta.passwordPh}
              className={inputBase}
              autoComplete="new-password"
            />
          </div>

          {cambioPassMsg && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-red-500 mt-3">
              {cambioPassMsg}
            </p>
          )}

          <div className="flex items-center gap-4 mt-5">
            <button
              type="submit"
              disabled={cambiandoPass}
              className="flex items-center gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 group"
            >
              <span>{cambiandoPass ? t.cuenta.saving : t.cuenta.newPassBtn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {cambioPassOk && (
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-brand-blue">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {t.cuenta.passUpdated}
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
