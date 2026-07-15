import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONTACT, PAYMENTS } from '../constants';
import Header from '../components/Header';
import { useLang } from '../i18n';

// Foto del producto en página de detalles
const PRODUCT_IMAGE = '/products/ar01-frente.jpg';

export default function Mocca() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [selectedFormat, setSelectedFormat] = useState('spray-s');
  const [qty, setQty] = useState(1);

  const FORMATS = [
    { id: 'spray-s', label: t.mocca.spray, size: t.mocca.sizeTbd },
  ];

  const whatsappMsg = encodeURIComponent(
    t.mocca.waMessage.replace('{qty}', String(qty)),
  );
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${whatsappMsg}`;

  // Compra directa (D2C): si ya hay link de Mercado Pago, el botón principal
  // cobra directo. Si aún no, cae a WhatsApp para no perder la venta.
  const hasDirectPay = Boolean(PAYMENTS.mercadoPagoLink);
  const buyUrl = hasDirectPay ? PAYMENTS.mercadoPagoLink : whatsappUrl;
  const buyLabel = hasDirectPay ? t.mocca.buyNow : t.mocca.buyNowWhatsApp;

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      {/* Breadcrumb / volver */}
      <div className="max-w-[1440px] mx-auto px-8 py-4 border-b border-brand-gray-200">
        <button
          onClick={() => navigate('/tienda')}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {t.mocca.breadcrumb}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >

        <div className="max-w-[1200px] mx-auto px-8 py-10 md:py-14 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* ── COLUMNA IZQUIERDA — imagen del producto ── */}
          {/* Marco compacto que abraza la foto, sin paneles gigantes alrededor */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-[400px] mx-auto lg:mx-0 lg:w-[38%] shrink-0"
          >
            {/* Mini barra superior del marco */}
            <div className="flex justify-between items-center border border-b-0 border-brand-gray-200 px-4 py-2.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                001
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                {t.mocca.serie}
              </span>
            </div>

            {/* La foto con su marco pegado */}
            <div className="border border-brand-gray-200 bg-white">
              <img
                src={PRODUCT_IMAGE}
                alt={t.mocca.imgAlt}
                className="w-full h-auto"
              />
            </div>

            {/* Mini barra inferior con datos técnicos */}
            <div className="flex justify-between items-center border border-t-0 border-brand-gray-200 px-4 py-2.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                {t.mocca.format}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-black font-bold">
                {t.mocca.serieYear}
              </span>
            </div>
          </motion.div>

          {/* ── COLUMNA DERECHA — info y compra ── */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Encabezado del producto */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-3">
                  {t.mocca.subtitle}
                </p>
                <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter leading-[0.85] mb-6">
                  MOCCA
                </h1>
                <p className="font-mono text-xs uppercase tracking-widest leading-relaxed text-brand-gray-400 max-w-sm mb-10">
                  {t.mocca.description}
                </p>
              </motion.div>

              {/* Separador */}
              <div className="w-full h-px bg-brand-gray-200 mb-10" />

              {/* Selector de formato */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-4">
                  {t.mocca.selectFormat}
                </p>
                <div className="flex flex-wrap gap-3">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={`font-mono text-[10px] uppercase tracking-widest px-5 py-3 border transition-colors ${
                        selectedFormat === f.id
                          ? 'bg-brand-black text-brand-white border-brand-black'
                          : 'border-brand-gray-300 text-brand-gray-400 hover:border-brand-black hover:text-brand-black'
                      }`}
                    >
                      {f.label}
                      <span className="block text-[8px] mt-0.5 opacity-70">{f.size}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Selector de cantidad */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-4">
                  {t.mocca.quantity}
                </p>
                <div className="flex items-center gap-0 border border-brand-gray-300 w-fit">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-brand-gray-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-mono text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-brand-gray-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>

              {/* Precio */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.mocca.price}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand-gray-400 border border-dashed border-brand-gray-300 px-4 py-2 inline-block">
                  {t.mocca.priceWhatsApp}
                </p>
              </motion.div>
            </div>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-4"
            >
              {/* Botón principal — compra directa (Mercado Pago cuando esté activo) */}
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-5 hover:bg-brand-black hover:text-brand-white transition-colors group"
              >
                <span>{buyLabel}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Nota bajo el botón */}
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
                {hasDirectPay ? t.mocca.securePay : t.mocca.weContact}
              </p>

              {/* Separador */}
              <div className="w-full h-px bg-brand-gray-200 my-2" />

              {/* Volver al catálogo */}
              <button
                onClick={() => navigate('/tienda')}
                className="flex items-center justify-center gap-2 border border-brand-gray-300 font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:border-brand-black transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                {t.mocca.moreScents}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <footer className="border-t border-brand-gray-200 px-8 py-6 mt-8 bg-brand-white">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
          {t.common.copyright}
        </p>
      </footer>
    </div>
  );
}
