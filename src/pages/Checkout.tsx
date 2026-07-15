import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../cart';
import { useLang } from '../i18n';
import { formatMXN, PAYMENTS } from '../constants';
import { supabase } from '../supabase';

interface ShippingData {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
}

const EMPTY: ShippingData = { nombre: '', correo: '', telefono: '', direccion: '' };

export default function Checkout() {
  const { items, subtotalMXN, clear } = useCart();
  const navigate = useNavigate();
  const { t } = useLang();

  const [form, setForm] = useState<ShippingData>(EMPTY);
  const [placing, setPlacing] = useState(false);   // guardando el pedido
  const [orderId, setOrderId] = useState('');      // número de pedido creado
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.correo.trim() || !form.telefono.trim() || !form.direccion.trim()) {
      setErrMsg(t.checkout.required);
      return;
    }
    setErrMsg('');
    setPlacing(true);

    // Creamos el pedido en la base de datos con la función segura crear_pedido
    const { data, error } = await supabase.rpc('crear_pedido', {
      p_nombre: form.nombre.trim(),
      p_correo: form.correo.trim(),
      p_telefono: form.telefono.trim(),
      p_direccion: form.direccion.trim(),
      p_total: subtotalMXN,
      p_items: items.map((i) => ({
        producto_codigo: i.code,
        nombre: i.name,
        size: i.size,
        precio_unitario_mxn: i.priceMXN,
        cantidad: i.qty,
      })),
    });

    setPlacing(false);

    if (error || !data) {
      setErrMsg(t.checkout.orderError);
      return;
    }

    // ¡Pedido creado! Mostramos la confirmación y vaciamos el carrito
    setOrderId(String(data));
    clear();
  };

  const inputBase =
    'w-full border border-brand-gray-300 px-4 py-3 font-mono text-[11px] uppercase tracking-widest placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-blue transition-colors bg-brand-white';

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
              {/* Mostramos solo los primeros 8 caracteres: más fácil de leer y dictar */}
              <p className="font-mono text-lg font-bold tracking-widest uppercase">
                {orderId.slice(0, 8)}
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed text-brand-gray-400 max-w-sm">
              {t.checkout.orderNote}
            </p>

            {/* Pago con Mercado Pago */}
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
            {/* ── DATOS DE ENVÍO ── */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePlaceOrder}
              className="flex-1 flex flex-col gap-5 w-full"
            >
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 border-b border-brand-gray-200 pb-3">
                {t.checkout.shipping}
              </h2>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.checkout.name}
                </label>
                <input
                  type="text" name="nombre" placeholder={t.checkout.namePh}
                  value={form.nombre} onChange={handleChange} className={inputBase} required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                    {t.checkout.email}
                  </label>
                  <input
                    type="email" name="correo" placeholder={t.checkout.emailPh}
                    value={form.correo} onChange={handleChange} className={inputBase} required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                    {t.checkout.phone}
                  </label>
                  <input
                    type="tel" name="telefono" placeholder={t.checkout.phonePh}
                    value={form.telefono} onChange={handleChange} className={inputBase} required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.checkout.address}
                </label>
                <textarea
                  name="direccion" placeholder={t.checkout.addressPh} rows={3}
                  value={form.direccion} onChange={handleChange}
                  className={`${inputBase} resize-none`} required
                />
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
              className="w-full lg:w-[380px] shrink-0"
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
