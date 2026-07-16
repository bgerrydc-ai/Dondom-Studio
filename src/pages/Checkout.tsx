import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../cart';
import { useLang } from '../i18n';
import { useAuth } from '../auth';
import { formatMXN, PAYMENTS } from '../constants';
import { supabase } from '../supabase';

interface ShippingData {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  calle: string;
  noExt: string;
  noInt: string;
  cp: string;
  colonia: string;
  ciudad: string;
  municipio: string;
  estado: string;
  notas: string;
}

const EMPTY: ShippingData = {
  nombres: '', apellidos: '', correo: '', telefono: '',
  calle: '', noExt: '', noInt: '', cp: '', colonia: '',
  ciudad: '', municipio: '', estado: '', notas: '',
};

// Estilo compartido de las casillas
const inputBase =
  'w-full border border-brand-gray-300 px-4 py-3 font-mono text-[11px] uppercase tracking-widest placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-blue transition-colors bg-brand-white';

// Casilla reutilizable (definida FUERA del componente para no perder el foco al escribir)
type FieldProps = {
  label: string;
  name: keyof ShippingData;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  full?: boolean;
};

function Field({ label, name, value, onChange, placeholder, type = 'text', required = false, full = false }: FieldProps) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputBase}
      />
    </div>
  );
}

export default function Checkout() {
  const { items, subtotalMXN, clear } = useCart();
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useAuth();

  const [form, setForm] = useState<ShippingData>(EMPTY);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errMsg, setErrMsg] = useState('');

  // Si el cliente tiene sesión iniciada, llenamos el formulario con sus
  // datos guardados (perfil) para que compre más rápido.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data: p } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!alive) return;
      setForm((prev) => ({
        ...prev,
        correo: prev.correo || user.email || '',
        nombres: prev.nombres || p?.nombres || '',
        apellidos: prev.apellidos || p?.apellidos || '',
        telefono: prev.telefono || p?.telefono || '',
        calle: prev.calle || p?.calle || '',
        noExt: prev.noExt || p?.no_ext || '',
        noInt: prev.noInt || p?.no_int || '',
        cp: prev.cp || p?.cp || '',
        colonia: prev.colonia || p?.colonia || '',
        ciudad: prev.ciudad || p?.ciudad || '',
        municipio: prev.municipio || p?.municipio || '',
        estado: prev.estado || p?.estado || '',
      }));
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();

    // Campos obligatorios (todos menos No. Interior y Notas)
    const requeridos = [
      form.nombres, form.apellidos, form.correo, form.telefono,
      form.calle, form.noExt, form.cp, form.colonia,
      form.ciudad, form.municipio, form.estado,
    ];
    if (requeridos.some((v) => !v.trim())) {
      setErrMsg(t.checkout.required);
      return;
    }
    setErrMsg('');
    setPlacing(true);

    // Armamos el nombre completo y la dirección en una línea legible
    const nombre = `${form.nombres.trim()} ${form.apellidos.trim()}`;
    const direccion =
      `${form.calle.trim()} ${form.noExt.trim()}` +
      `${form.noInt.trim() ? ' Int. ' + form.noInt.trim() : ''}, ` +
      `Col. ${form.colonia.trim()}, C.P. ${form.cp.trim()}, ` +
      `${form.municipio.trim()}, ${form.ciudad.trim()}, ${form.estado.trim()}` +
      `${form.notas.trim() ? ' — Notas: ' + form.notas.trim() : ''}`;

    // Creamos el pedido con la función segura crear_pedido.
    // IMPORTANTE: solo mandamos el código del producto y la cantidad.
    // El PRECIO y el TOTAL los calcula el servidor (Supabase) con los
    // precios reales de la tabla `productos`, para que nadie pueda pagar
    // menos "editando" el precio desde su navegador.
    const { data, error } = await supabase.rpc('crear_pedido', {
      p_nombre: nombre,
      p_correo: form.correo.trim(),
      p_telefono: form.telefono.trim(),
      p_direccion: direccion,
      p_items: items.map((i) => ({
        codigo: i.code,
        cantidad: i.qty,
      })),
    });

    setPlacing(false);

    if (error || !data) {
      setErrMsg(t.checkout.orderError);
      return;
    }

    setOrderId(String(data));
    clear();
  };

  // ── Pantalla de confirmación (pedido creado) ──
  if (orderId) {
    return (
      <div className="min-h-screen bg-brand-white">
        <Header />
        <main className="max-w-[700px] mx-auto px-8 py-24 flex flex-col items-center text-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <CheckCircle className="w-14 h-14 text-brand-blue" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
              {t.checkout.orderOk}
            </h1>
            <div className="border border-brand-gray-200 px-6 py-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                {t.checkout.orderNum}
              </p>
              <p className="font-mono text-lg font-bold tracking-widest uppercase">
                {orderId.slice(0, 8)}
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed text-brand-gray-400 max-w-sm">
              {t.checkout.orderNote}
            </p>

            {PAYMENTS.mercadoPagoLink && (
              <a
                href={PAYMENTS.mercadoPagoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors group"
              >
                <span>{t.checkout.payNow}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}

            <button
              onClick={() => navigate('/')}
              className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors"
            >
              {t.checkout.backHome}
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-[1100px] mx-auto px-8 md:px-12 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-10">
          {t.checkout.title}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
              {t.checkout.empty}
            </p>
            <button
              onClick={() => navigate('/tienda')}
              className="font-mono text-[10px] uppercase tracking-widest border border-brand-gray-300 px-6 py-3 hover:border-brand-black transition-colors"
            >
              {t.checkout.goShop}
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* ── FORMULARIO ── */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePlaceOrder}
              className="flex-1 flex flex-col gap-10 w-full"
            >
              {/* Sección 1: contacto */}
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 border-b border-brand-gray-200 pb-3 mb-5">
                  {t.checkout.contactSection}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t.checkout.firstName} name="nombres" value={form.nombres} onChange={handleChange} required />
                  <Field label={t.checkout.lastName} name="apellidos" value={form.apellidos} onChange={handleChange} required />
                  <Field label={t.checkout.email} name="correo" value={form.correo} onChange={handleChange} placeholder={t.checkout.emailPh} type="email" required />
                  <Field label={t.checkout.phone} name="telefono" value={form.telefono} onChange={handleChange} placeholder={t.checkout.phonePh} type="tel" required />
                </div>
              </div>

              {/* Sección 2: dirección */}
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 border-b border-brand-gray-200 pb-3 mb-5">
                  {t.checkout.addressSection}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t.checkout.street} name="calle" value={form.calle} onChange={handleChange} required full />
                  <Field label={t.checkout.extNum} name="noExt" value={form.noExt} onChange={handleChange} required />
                  <Field label={t.checkout.intNum} name="noInt" value={form.noInt} onChange={handleChange} />
                  <Field label={t.checkout.zip} name="cp" value={form.cp} onChange={handleChange} required />
                  <Field label={t.checkout.colonia} name="colonia" value={form.colonia} onChange={handleChange} required />
                  <Field label={t.checkout.city} name="ciudad" value={form.ciudad} onChange={handleChange} required />
                  <Field label={t.checkout.municipio} name="municipio" value={form.municipio} onChange={handleChange} required />
                  <Field label={t.checkout.state} name="estado" value={form.estado} onChange={handleChange} required full />

                  {/* Notas de entrega (casilla grande) */}
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                      {t.checkout.notes}
                    </label>
                    <textarea
                      name="notas"
                      value={form.notas}
                      onChange={handleChange}
                      placeholder={t.checkout.notesPh}
                      rows={2}
                      className={`${inputBase} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {errMsg && (
                <p className="font-mono text-[9px] uppercase tracking-widest text-red-500">
                  {errMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={placing}
                className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span>{placing ? t.checkout.placing : t.checkout.placeOrder}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>

            {/* ── RESUMEN DEL PEDIDO ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24"
            >
              <div className="border border-brand-gray-200">
                <div className="px-5 py-3 border-b border-brand-gray-200 font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
                  {t.checkout.summary}
                </div>
                <div className="divide-y divide-brand-gray-200">
                  {items.map((i) => (
                    <div key={i.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-14 h-16 bg-brand-gray-100 border border-brand-gray-200 overflow-hidden shrink-0">
                        {i.image && (
                          <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold tracking-tighter">{i.name}</p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-1">
                          {i.code} · {i.size} · x{i.qty}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] tracking-widest">
                        {formatMXN(i.priceMXN * i.qty)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-5 py-4 border-t border-brand-gray-200">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
                    {t.checkout.subtotal}
                  </span>
                  <span className="font-mono text-sm font-bold tracking-widest">
                    {formatMXN(subtotalMXN)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
