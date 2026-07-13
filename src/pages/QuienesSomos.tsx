import { motion } from 'motion/react';
import Header from '../components/Header';

const VALORES = [
  {
    num: '01',
    titulo: 'Precisión',
    texto:
      'Cada fórmula es el resultado de un proceso riguroso. Creemos que los detalles marcan la diferencia entre un aroma ordinario y uno extraordinario.',
  },
  {
    num: '02',
    titulo: 'Autenticidad',
    texto:
      'No copiamos tendencias: las creamos. Nuestros aromas nacen de una visión propia, honesta y coherente con la identidad de cada espacio.',
  },
  {
    num: '03',
    titulo: 'Distinción',
    texto:
      'Diseñamos para quienes exigen más. DONDOM STUDIO es para marcas y personas que entienden que el aroma es parte del lenguaje visual.',
  },
  {
    num: '04',
    titulo: 'Innovación',
    texto:
      'Exploramos continuamente nuevas combinaciones, técnicas y formatos para llevar la experiencia olfativa a otro nivel.',
  },
];

export default function QuienesSomos() {
  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      <main>
        {/* ── HERO de sección ── */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-16 border-b border-brand-gray-200">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-4">
            Nuestra historia
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.85] mb-10 max-w-3xl"
          >
            Quiénes
            <br />
            Somos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400 max-w-xl"
          >
            {/* Texto provisional — reemplazar cuando Gerardo envíe el texto oficial */}
            DONDOM STUDIO es un estudio creativo de aromas fundado con una sola convicción: que el
            olfato es el sentido más poderoso y menos explorado del diseño. Nacimos para cambiar eso.
          </motion.p>
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
              01 — Misión
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-8 leading-tight">
              Misión
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
              {/* Texto provisional */}
              Crear aromas de alta precisión que transformen ambientes y refuercen identidades de marca,
              a través de fórmulas exclusivas y un diseño sensorial impecable. Ponemos el aroma al
              servicio de experiencias que dejan huella.
            </p>
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
              02 — Visión
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-8 leading-tight">
              Visión
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
              {/* Texto provisional */}
              Ser el estudio de aroma de referencia en Latinoamérica, reconocido por la calidad de
              sus fórmulas, la coherencia de su identidad y la capacidad de convertir el olfato en
              una herramienta estratégica para marcas que aspiran a la excelencia.
            </p>
          </motion.div>
        </section>

        {/* ── VALORES ── */}
        <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-16">
          <div className="mb-14 border-b border-brand-black pb-8">
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 block mb-2">
              03 — Valores
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
              Lo que nos define
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {VALORES.map((v, idx) => (
              <motion.div
                key={v.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-t border-brand-gray-200 pt-8"
              >
                <div className="flex items-start gap-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mt-1 shrink-0">
                    {v.num}
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tighter mb-3">{v.titulo}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed text-brand-gray-400">
                      {v.texto}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FRANJA FINAL ── */}
        <section className="bg-brand-black text-white px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3">
              Dondom Studio
            </p>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[0.9]">
              DONDOM
              <br />
              STUDIO
            </h3>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 max-w-xs">
            Un estudio de aroma creativo. Ingeniería de precisión para ambientes que exigen distinción.
          </p>
        </section>
      </main>

      <footer className="border-t border-brand-gray-200 px-8 py-6">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
          © 2026 DONDOM STUDIO — Instrumentos de Aroma
        </p>
      </footer>
    </div>
  );
}
