import { motion } from 'motion/react';
import Header from '../components/Header';
import { useLang } from '../i18n';

export default function QuienesSomos() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      <main>
        {/* ── HERO de sección: Quiénes Somos ── */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-16 border-b border-brand-gray-200">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-4">
            {t.about.kicker}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.85] mb-10 max-w-3xl"
          >
            {t.about.titleL1}
            <br />
            {t.about.titleL2}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400 max-w-2xl"
          >
            {t.about.intro}
          </motion.p>
        </section>

        {/* ── FILOSOFÍA ── */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-16 border-b border-brand-gray-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 block mb-6">
              {t.about.philosophyLabel}
            </span>
            <blockquote className="text-3xl md:text-5xl font-extrabold tracking-tighter leading-tight max-w-4xl text-brand-blue">
              {t.about.philosophyQuoteL1}
              <br />
              {t.about.philosophyQuoteL2}
            </blockquote>
            <p className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400 max-w-xl mt-8">
              {t.about.philosophySub}
            </p>
          </motion.div>
        </section>

        {/* ── MISIÓN & VISIÓN ── */}
        <section className="flex flex-col lg:flex-row border-b border-brand-gray-200">
          {/* Misión */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 px-8 md:px-16 py-16 border-b lg:border-b-0 lg:border-r border-brand-gray-200"
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 block mb-6">
              {t.about.missionLabel}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-8 leading-tight">
              {t.about.missionTitle}
            </h2>
            <div className="space-y-6">
              <p className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
                {t.about.mission1}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
                {t.about.mission2}
              </p>
            </div>
          </motion.div>

          {/* Visión */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex-1 px-8 md:px-16 py-16 bg-brand-gray-100"
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 block mb-6">
              {t.about.visionLabel}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-8 leading-tight">
              {t.about.visionTitle}
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
              {t.about.vision}
            </p>
          </motion.div>
        </section>

        {/* ── DONDOM EN UNA FRASE ── */}
        {/* Sección negra SIEMPRE (colores fijos, no cambian con el modo oscuro) */}
        <section className="bg-black text-white px-8 md:px-16 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-10">
              {t.about.phraseLabel}
            </span>
            <p className="text-2xl md:text-4xl font-extrabold tracking-tighter leading-tight">
              {t.about.phrase}
            </p>
            <div className="mt-12 pt-8 border-t border-neutral-400/20 inline-block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                {t.about.location}
              </span>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-brand-gray-200 px-8 py-6">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
          {t.about.copyright}
        </p>
      </footer>
    </div>
  );
}
