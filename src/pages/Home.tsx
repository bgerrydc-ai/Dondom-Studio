import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CONTACT } from '../constants';
import Header from '../components/Header';
import { useLang } from '../i18n';
import { useProducts } from '../products';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { products } = useProducts();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        <main>
          {/* ── HERO ── */}
          <section className="relative min-h-[80vh] flex flex-col md:flex-row border-b border-brand-gray-200">
            {/* Columna izquierda */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex space-x-12 mb-20"
              >
                <motion.div variants={itemVariants} className="max-w-[150px]">
                  <h3 className="font-bold text-[10px] tracking-widest uppercase mb-3 border-b border-brand-gray-200 pb-1">
                    D/STUDIO
                  </h3>
                  <p className="font-mono text-[9px] text-brand-gray-400 uppercase leading-relaxed">
                    {t.home.blurb1}
                  </p>
                </motion.div>
                <motion.div variants={itemVariants} className="max-w-[200px] mt-4">
                  <p className="font-mono text-[9px] text-brand-gray-400 uppercase leading-relaxed pt-2">
                    {t.home.blurb2}
                  </p>
                </motion.div>
              </motion.div>

              <div className="mt-auto mb-20 lg:mb-32">
                <motion.h1
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.8] mb-8"
                >
                  DONDOM
                  <br />
                  STUDIO
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-brand-black hover:text-brand-white transition-colors"
                  >
                    {t.home.viewCollection}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              </div>

              {/* Número de página */}
              <div className="absolute left-8 bottom-12 hidden lg:block">
                <span className="vertical-text text-6xl font-extrabold tracking-tighter rotate-180-vertical text-brand-black">
                  001
                </span>
              </div>
            </div>

            {/* Columna derecha — bloque azul */}
            <div className="w-full md:w-[45%] relative min-h-[500px] bg-brand-white border-l border-brand-gray-200">
              <div className="absolute top-12 right-12 z-10 text-right flex flex-col items-end">
                <span className="font-bold text-xs tracking-widest uppercase">D-STUDIO</span>
                <div className="flex flex-col items-end mt-6">
                  <span className="vertical-text rotate-180-vertical font-mono text-[10px] text-brand-gray-400 uppercase tracking-widest">
                    {t.home.instruments}
                    <br />
                    {t.home.ofScent}
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-1/4 bottom-1/4 bg-brand-blue flex items-end p-8 origin-top"
              >
                <a
                  href="#catalogo"
                  aria-label={t.home.viewCollection}
                  className="w-12 h-12 bg-brand-black text-brand-white flex items-center justify-center hover:bg-brand-white hover:text-brand-black border border-brand-black transition-all group"
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            </div>
          </section>

          {/* ── CATÁLOGO ── */}
          <section id="catalogo" className="scroll-mt-24 p-8 md:p-24 bg-brand-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-10 border-b border-brand-black pb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold tracking-tighter uppercase"
                >
                  {t.home.collection}
                </motion.h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
                  {t.home.catalog}
                </span>
              </div>

              {/* ── Segmento: AROMAS ──
                  Cuando haya más tipos de producto (velas, difusores...),
                  se duplica este bloque de encabezado + su grid debajo. */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-5 mb-12"
              >
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase text-brand-blue">
                  {t.home.scents}
                </h3>
                <div className="flex-1 h-px bg-brand-gray-200" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                  {t.home.segment}
                </span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group ${product.available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => product.available && navigate(`/${product.slug}`)}
                  >
                    {/* Imagen del producto */}
                    <div className="aspect-[4/5] relative overflow-hidden bg-brand-gray-100 border border-brand-gray-200 mb-8 flex items-center justify-center">
                      <div className="absolute top-6 left-6 z-10 text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-widest">
                        {product.num}
                      </div>

                      {/* Placeholder visual cuando no hay imagen */}
                      {!product.image ? (
                        <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                          <div className="w-24 h-24 border-2 border-brand-black rounded-full" />
                          <span className="font-mono text-[9px] uppercase tracking-widest">
                            {product.available ? t.common.imageSoon : t.common.comingSoon}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}

                      {product.available && (
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-brand-black text-brand-white flex items-center justify-center">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      )}

                      {!product.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-mono text-[10px] uppercase tracking-widest border border-brand-gray-400 px-4 py-2 text-brand-gray-400">
                            {t.common.comingSoon}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info del producto */}
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-2xl font-bold tracking-tighter mb-1 group-hover:text-brand-blue transition-colors">
                          {product.available ? product.name : t.common.comingSoonName}
                        </h4>
                        <p className="font-mono text-[10px] text-brand-gray-400 uppercase tracking-widest">
                          {product.code} — {product.series}
                        </p>
                      </div>
                      {product.available && (
                        <span className="font-mono text-[9px] uppercase tracking-widest border-b border-transparent group-hover:border-brand-blue transition-all">
                          {t.common.viewProduct}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FRANJA DE PROVEEDORES ── */}
          {/* Esta sección es negra SIEMPRE (colores fijos, no cambian con el modo oscuro) */}
          <section className="bg-black text-white px-8 md:px-24 py-16 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-brand-gray-200">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                {t.home.forCompanies}
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tighter leading-tight">
                {t.home.needScentL1}
                <br />
                {t.home.needScentL2}
              </h3>
            </div>
            <div className="flex flex-col items-start md:items-end gap-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 max-w-xs text-left md:text-right">
                {t.home.supplierText}
              </p>
              <button
                onClick={() => navigate('/contacto')}
                className="inline-flex items-center gap-3 border border-white text-white font-mono text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-white hover:text-black transition-colors"
              >
                {t.home.supplierCta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* ── NOSOTROS ── */}
          <section className="flex flex-col lg:flex-row min-h-[80vh] border-t border-brand-black">
            {/* Panel izquierdo — textura */}
            <div className="lg:w-1/2 bg-brand-gray-200 relative overflow-hidden flex items-center justify-center p-12 min-h-[400px]">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
                  backgroundSize: '10px 10px',
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="relative z-10 bg-brand-white p-4 border border-brand-black"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  {t.home.labTexture}
                </span>
              </motion.div>
            </div>

            {/* Panel derecho — texto (negro SIEMPRE, colores fijos) */}
            <div className="lg:w-1/2 bg-black text-white p-12 lg:p-24 flex flex-col justify-center relative">
              <span className="absolute top-12 right-12 font-mono text-[10px] text-neutral-400 tracking-widest">
                003
              </span>
              <div className="max-w-md">
                <motion.h2
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-12 leading-[0.9]"
                >
                  DONDOM
                  <br />
                  STUDIO
                </motion.h2>

                <div className="space-y-6 font-mono text-xs uppercase tracking-widest leading-relaxed text-neutral-300">
                  <p>{t.home.about1}</p>
                  <p className="text-neutral-400">{t.home.about2}</p>
                </div>

                <div className="mt-20 pt-8 border-t border-neutral-400/20 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                  <span>© 2026 DONDOM STUDIO</span>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {t.home.contact}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer className="p-8 border-t border-brand-gray-200 bg-brand-white flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
            {t.home.footerTagline}
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/terminos"
              className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-blue transition-colors"
            >
              {t.legal.terms}
            </Link>
            <Link
              to="/privacidad"
              className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-blue transition-colors"
            >
              {t.legal.privacy}
            </Link>
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
              {CONTACT.phone}
            </span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
