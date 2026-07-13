import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { PRODUCTS } from '../constants';

const FILTROS = [
  { id: 'todos',   label: 'Todos' },
  { id: 'cafe',    label: 'Café y Especias' },
  { id: 'flores',  label: 'Flores' },
  { id: 'madera',  label: 'Maderas' },
  { id: 'frescos', label: 'Frescos' },
];

// Etiqueta de categoría por producto (para el filtro)
const CATEGORIAS: Record<string, string> = {
  '001': 'cafe',
  '002': 'frescos',
};

export default function Tienda() {
  const navigate   = useNavigate();
  const [filtro, setFiltro] = useState('todos');

  const productosFiltrados = PRODUCTS.filter(
    (p) => filtro === 'todos' || CATEGORIAS[p.id] === filtro,
  );

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-[1440px] mx-auto px-8 md:px-16 py-16">

        {/* Encabezado de sección */}
        <div className="mb-14 border-b border-brand-black pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-2">
              Catálogo / Serie A
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter">
              Tienda
            </h1>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
            {PRODUCTS.filter((p) => p.available).length} aroma
            {PRODUCTS.filter((p) => p.available).length !== 1 ? 's' : ''} disponible
            {PRODUCTS.filter((p) => p.available).length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-14">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 border transition-colors ${
                filtro === f.id
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'border-brand-gray-300 text-brand-gray-400 hover:border-brand-black hover:text-brand-black'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
              No hay aromas en esta categoría aún — pronto habrá más.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {productosFiltrados.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`group ${
                  product.available ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                }`}
                onClick={() => product.available && navigate(`/${product.slug}`)}
              >
                {/* Imagen / placeholder */}
                <div className="aspect-[4/5] bg-brand-gray-100 border border-brand-gray-200 relative flex items-center justify-center mb-5 overflow-hidden">
                  <span className="absolute top-4 left-4 z-10 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    {product.id}
                  </span>

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 opacity-25">
                      <div className="w-16 h-16 border-2 border-brand-black rounded-full" />
                      <span className="font-mono text-[8px] uppercase tracking-widest">
                        {product.available ? 'Foto próximamente' : 'Próximamente'}
                      </span>
                    </div>
                  )}

                  {/* Badge "próximamente" */}
                  {!product.available && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest border border-brand-gray-400 px-4 py-2 text-brand-gray-400 bg-brand-white/80">
                        Próximamente
                      </span>
                    </div>
                  )}

                  {/* Flecha hover */}
                  {product.available && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 bg-brand-black text-white flex items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tighter group-hover:text-brand-blue transition-colors">
                      {product.name}
                    </h3>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-1">
                      {product.code} — {product.series}
                    </p>
                  </div>
                  {product.available && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 group-hover:text-brand-blue border-b border-transparent group-hover:border-brand-blue transition-all">
                      Ver
                    </span>
                  )}
                </div>

                {/* Descripción breve */}
                <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-brand-gray-200 px-8 py-6 mt-16">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
          © 2026 DONDOM STUDIO — Instrumentos de Aroma
        </p>
      </footer>
    </div>
  );
}
