import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../cart';
import { useLang } from '../i18n';
import { formatMXN } from '../constants';

export default function CartDrawer() {
  const { items, isOpen, close, count, subtotalMXN, setQty, remove } = useCart();
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro que cubre la página */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 z-[60]"
          />

          {/* Panel lateral */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-white z-[61] flex flex-col border-l border-brand-gray-200 shadow-2xl"
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gray-200">
              <h2 className="font-mono text-[13px] uppercase tracking-widest font-bold">
                {t.cart.title} ({count})
              </h2>
              <button
                onClick={close}
                aria-label={t.cart.close}
                className="hover:text-brand-blue transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              /* Carrito vacío */
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                <p className="font-mono text-[12px] uppercase tracking-widest text-brand-gray-400">
                  {t.cart.empty}
                </p>
                <button
                  onClick={() => {
                    close();
                    navigate('/tienda');
                  }}
                  className="font-mono text-[12px] uppercase tracking-widest border border-brand-gray-300 px-6 py-3 hover:border-brand-black transition-colors"
                >
                  {t.cart.continueShopping}
                </button>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-brand-gray-100 border border-brand-gray-200 shrink-0 overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-extrabold tracking-tighter text-lg leading-none">
                              {item.name}
                            </h3>
                            <p className="font-mono text-[11px] uppercase tracking-widest text-brand-gray-400 mt-1">
                              {item.code} · {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label={t.cart.remove}
                            className="text-brand-gray-400 hover:text-brand-black transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between items-end mt-auto pt-3">
                          {/* Selector de cantidad */}
                          <div className="flex items-center border border-brand-gray-300">
                            <button
                              onClick={() => setQty(item.id, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-brand-gray-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono text-xs font-bold">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => setQty(item.id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-brand-gray-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-mono text-[13px] tracking-widest">
                            {formatMXN(item.priceMXN * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pie: subtotal + pagar */}
                <div className="border-t border-brand-gray-200 px-6 py-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[12px] uppercase tracking-widest text-brand-gray-400">
                      {t.cart.subtotal}
                    </span>
                    <span className="font-mono text-sm font-bold tracking-widest">
                      {formatMXN(subtotalMXN)}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 text-center">
                    {t.cart.freeShippingNote}
                  </p>
                  <button
                    onClick={() => {
                      close();
                      navigate('/checkout');
                    }}
                    className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[12px] uppercase tracking-widest px-6 py-4 hover:bg-brand-black hover:text-brand-white transition-colors group"
                  >
                    <span>{t.cart.checkout}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={close}
                    className="font-mono text-[11px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors"
                  >
                    {t.cart.continueShopping}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
