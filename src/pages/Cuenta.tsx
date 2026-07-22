import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, CheckCircle, Eye, EyeOff, User, Package, Lock, Bell } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../i18n';
import { useAuth, traducirErrorAuth } from '../auth';
import { supabase } from '../supabase';
import { formatMXN } from '../constants';
import { usePageTitle } from '../usePageTitle';

// Estilo compartido de las casillas
const inputBase =
  'w-full border border-brand-gray-300 px-4 py-3 font-mono text-[11px] uppercase tracking-widest placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-blue transition-colors bg-brand-white';

// Estilo para correo y contraseña: SIN mayúsculas forzadas, para que se vea
// tal cual lo escribes (importante: la contraseña distingue may/minúsculas).
const inputAuth =
  'w-full border border-brand-gray-300 px-4 py-3 font-mono text-[13px] normal-case tracking-normal placeholder:text-brand-gray-400 placeholder:normal-case focus:outline-none focus:border-brand-blue transition-colors bg-brand-white';

// Campo de contraseña con botón de ver / ocultar (ojito).
// Está fuera del componente para no perder el foco al escribir.
function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  toggleLabel,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  toggleLabel: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputAuth} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={toggleLabel}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-blue transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

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
  usePageTitle(t.nav.cuenta);
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
      setAuthMsg(traducirErrorAuth(error, lang) ?? error);
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
      setRecoveryMsg(traducirErrorAuth(error, lang) ?? error);
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
        setAuthMsg(traducirErrorAuth(error, lang) ?? error);
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
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.cuenta.passwordPh}
                autoComplete="new-password"
                toggleLabel={t.cuenta.togglePass}
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
                  className={inputAuth}
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
                  className={inputAuth}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.cuenta.password}
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.cuenta.passwordPh}
                  autoComplete={modo === 'signup' ? 'new-password' : 'current-password'}
                  toggleLabel={t.cuenta.togglePass}
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
  lang: ReturnType<typeof useLang>['lang'];
}) {
  const navigate = useNavigate();
  const { updatePassword, resetPassword } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>(EMPTY_PERFIL);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Pestañas de la cuenta: mis datos / mis pedidos / seguridad / preferencias
  const [tab, setTab] = useState<'datos' | 'pedidos' | 'seguridad' | 'prefs'>('datos');
  // ¿Mostrar también las compras que se quedaron sin pagar?
  const [verPendientes, setVerPendientes] = useState(false);

  // Preferencias: recibir (o no) correos de novedades
  const [marketing, setMarketing] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);

  const handleSavePrefs = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    await supabase.from('perfiles').upsert({ id: user.id, acepta_marketing: marketing });
    setSavingPrefs(false);
    setSavedPrefs(true);
  };

  // Cambiar contraseña (estando dentro de la cuenta)
  const [passActual, setPassActual] = useState('');
  const [nuevaPass, setNuevaPass] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [cambioPassMsg, setCambioPassMsg] = useState('');
  const [cambioPassOk, setCambioPassOk] = useState(false);

  // "¿No recuerdas tu contraseña actual?" → mandamos el enlace al correo
  const [resetEnviado, setResetEnviado] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  const handleCambiarPass = async (e: FormEvent) => {
    e.preventDefault();
    setCambioPassMsg('');
    setCambioPassOk(false);
    if (!passActual || !nuevaPass) {
      setCambioPassMsg(t.cuenta.fillFields);
      return;
    }
    if (nuevaPass.length < 6) {
      setCambioPassMsg(t.cuenta.minPassword);
      return;
    }
    setCambiandoPass(true);

    // SEGURIDAD: antes de cambiar nada, comprobamos que la contraseña
    // actual sea correcta (volvemos a iniciar sesión con ella). Así, si
    // alguien encuentra tu sesión abierta, NO puede cambiarte la contraseña.
    const { error: errActual } = await supabase.auth.signInWithPassword({
      email: user.email ?? '',
      password: passActual,
    });
    if (errActual) {
      setCambiandoPass(false);
      setCambioPassMsg(t.cuenta.wrongCurrentPass);
      return;
    }

    const { error } = await updatePassword(nuevaPass);
    setCambiandoPass(false);
    if (error) {
      setCambioPassMsg(traducirErrorAuth(error, lang) ?? error);
      return;
    }
    setPassActual('');
    setNuevaPass('');
    setCambioPassOk(true);
  };

  const handleOlvideActual = async () => {
    setEnviandoReset(true);
    await resetPassword(user.email ?? '');
    setEnviandoReset(false);
    setResetEnviado(true);
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
        setMarketing(!!p.acepta_marketing);
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

  // Pedidos reales (pagados/enviados/entregados) vs. compras sin terminar
  const pedidosReales = pedidos.filter((p) => p.estado !== 'pendiente');
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente');

  // Traducción y color de cada estado
  const estadoTexto = (estado: string) =>
    (({
      pendiente: t.cuenta.estadoPendiente,
      pagado: t.cuenta.estadoPagado,
      enviado: t.cuenta.estadoEnviado,
      entregado: t.cuenta.estadoEntregado,
    }) as Record<string, string>)[estado] ?? estado;

  const estadoEstilo = (estado: string) =>
    estado === 'pagado'
      ? 'text-brand-blue border-brand-blue'
      : estado === 'pendiente'
        ? 'text-brand-gray-400 border-brand-gray-300'
        : 'text-brand-black border-brand-black';

  // Renglón de un pedido en la lista
  const renderPedido = (ped: Pedido) => (
    <div key={ped.id} className="px-5 py-4 flex flex-col gap-1.5">
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
        <span
          className={`font-mono text-[8px] uppercase tracking-widest border px-2 py-0.5 ${estadoEstilo(ped.estado)}`}
        >
          {estadoTexto(ped.estado)}
        </span>
      </div>
    </div>
  );

  const TABS = [
    { id: 'datos', label: t.cuenta.tabDatos, Icon: User },
    { id: 'pedidos', label: t.cuenta.tabPedidos, Icon: Package },
    { id: 'seguridad', label: t.cuenta.tabSeguridad, Icon: Lock },
    { id: 'prefs', label: t.cuenta.tabPrefs, Icon: Bell },
  ] as const;

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />
      <main className="max-w-[1000px] mx-auto px-8 py-16">
        {/* Encabezado */}
        <div className="mb-10 border-b border-brand-black pb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-2">
            {t.cuenta.greeting}, {user.email}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
            {t.cuenta.accountTitle}
          </h1>
        </div>

        {/* ── Layout tipo panel: menú lateral + contenido ── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* MENÚ LATERAL */}
          <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24">
            <nav className="grid grid-cols-2 lg:flex lg:flex-col gap-1">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-3 px-4 py-3.5 font-mono text-[10px] uppercase tracking-widest transition-colors text-left border-l-2 ${
                    tab === id
                      ? 'border-brand-blue bg-brand-gray-100 text-brand-black font-bold'
                      : 'border-transparent text-brand-gray-400 hover:text-brand-black hover:bg-brand-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Cerrar sesión */}
            <button
              onClick={signOut}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3.5 font-mono text-[10px] uppercase tracking-widest border border-brand-gray-300 text-brand-gray-400 hover:border-brand-black hover:text-brand-black transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {t.cuenta.signOut}
            </button>
          </aside>

          {/* CONTENIDO DE LA SECCIÓN ACTIVA */}
          <section className="flex-1 min-w-0 w-full">
            <motion.h2
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs uppercase tracking-widest font-bold border-b border-brand-gray-200 pb-4 mb-8"
            >
              {TABS.find((x) => x.id === tab)?.label}
            </motion.h2>

        {/* ══ SECCIÓN: MIS DATOS ══ */}
        {tab === 'datos' && (
          <form onSubmit={handleSaveProfile} className="max-w-2xl">
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
        )}

        {/* ══ PESTAÑA: MIS PEDIDOS ══ */}
        {tab === 'pedidos' && (
          <div className="max-w-2xl">
            {loadingData ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                {t.common.loading}
              </p>
            ) : (
              <>
                {pedidosReales.length === 0 ? (
                  <div className="flex flex-col items-start gap-5">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                      {t.cuenta.ordersEmptyPaid}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/tienda')}
                      className="flex items-center gap-2 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-brand-black transition-colors"
                    >
                      {t.cuenta.goShop}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-brand-gray-200 divide-y divide-brand-gray-200">
                    {pedidosReales.map(renderPedido)}
                  </div>
                )}

                {/* Compras que se empezaron pero no se pagaron (ocultas por defecto) */}
                {pendientes.length > 0 && (
                  <div className="mt-10">
                    <button
                      type="button"
                      onClick={() => setVerPendientes((v) => !v)}
                      className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-black border border-brand-gray-300 px-4 py-2.5 transition-colors"
                    >
                      {verPendientes ? t.cuenta.ocultarPendientes : t.cuenta.verPendientes} ({pendientes.length})
                    </button>
                    {verPendientes && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 leading-relaxed mt-4 mb-4 max-w-md">
                          {t.cuenta.pendientesNote}
                        </p>
                        <div className="border border-brand-gray-200 divide-y divide-brand-gray-200 opacity-60">
                          {pendientes.map(renderPedido)}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ PESTAÑA: SEGURIDAD (cambiar contraseña) ══ */}
        {tab === 'seguridad' && (
          <div className="max-w-md">
            <form onSubmit={handleCambiarPass}>
              {/* Contraseña actual (obligatoria, por seguridad) */}
              <div className="mb-5">
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.cuenta.currentPassLabel}
                </label>
                <PasswordInput
                  value={passActual}
                  onChange={(e) => {
                    setPassActual(e.target.value);
                    setCambioPassOk(false);
                  }}
                  placeholder={t.cuenta.passwordPh}
                  autoComplete="current-password"
                  toggleLabel={t.cuenta.togglePass}
                />
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.cuenta.newPassLabel}
                </label>
                <PasswordInput
                  value={nuevaPass}
                  onChange={(e) => {
                    setNuevaPass(e.target.value);
                    setCambioPassOk(false);
                  }}
                  placeholder={t.cuenta.passwordPh}
                  autoComplete="new-password"
                  toggleLabel={t.cuenta.togglePass}
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

            {/* ¿No recuerdas tu contraseña actual? → enlace por correo */}
            <div className="mt-10 pt-6 border-t border-brand-gray-200">
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3">
                {t.cuenta.forgotInsideQ}
              </p>
              {resetEnviado ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 font-mono text-[9px] uppercase tracking-widest text-brand-blue leading-relaxed"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {t.cuenta.forgotInsideSent}
                </motion.p>
              ) : (
                <button
                  type="button"
                  onClick={handleOlvideActual}
                  disabled={enviandoReset}
                  className="font-mono text-[9px] uppercase tracking-widest border border-brand-gray-300 px-4 py-2.5 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-60"
                >
                  {enviandoReset ? t.cuenta.processing : t.cuenta.forgotInsideBtn}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ PESTAÑA: PREFERENCIAS (correos de novedades) ══ */}
        {tab === 'prefs' && (
          <form onSubmit={handleSavePrefs} className="max-w-xl">
            <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-6">
              {t.cuenta.prefsNote}
            </p>
            <label className="flex items-start gap-3 cursor-pointer border border-brand-gray-200 p-5">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => {
                  setMarketing(e.target.checked);
                  setSavedPrefs(false);
                }}
                className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--color-brand-blue,#002395)]"
              />
              <span className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                {t.cuenta.marketingLabel}
              </span>
            </label>

            <div className="flex items-center gap-4 mt-6">
              <button
                type="submit"
                disabled={savingPrefs}
                className="flex items-center gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 group"
              >
                <span>{savingPrefs ? t.cuenta.saving : t.cuenta.saveProfile}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              {savedPrefs && (
                <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-brand-blue">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {t.cuenta.prefsSaved}
                </span>
              )}
            </div>
          </form>
        )}

          </section>
        </div>
      </main>
    </div>
  );
}
