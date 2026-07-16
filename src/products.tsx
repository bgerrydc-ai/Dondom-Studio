import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from './constants';
import { PRODUCTS_FALLBACK } from './constants';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════
// LOS PRODUCTOS (cargados desde Supabase)
// ═══════════════════════════════════════════════════════════════════
// La tienda lee los productos y precios de la tabla `productos` de
// Supabase. Así puedes cambiar precios, tamaños, disponibilidad o
// agregar productos NUEVOS desde el panel de Supabase, sin tocar código.
//
// Cualquier página usa:  const { products, loading } = useProducts();
//
// Si Supabase no responde, se muestra la lista de respaldo
// (PRODUCTS_FALLBACK en src/constants.ts) para que nunca se vea vacía.
// ═══════════════════════════════════════════════════════════════════

interface ProductsValue {
  products: Product[];
  loading: boolean; // true mientras se consulta Supabase la primera vez
  fromDB: boolean;  // true si los productos vinieron de Supabase (no del respaldo)
}

const ProductsContext = createContext<ProductsValue | null>(null);

// Una fila de la tabla `productos` tal como viene de Supabase
interface DBRow {
  id: string;
  codigo: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  categoria: string | null;
  serie: string | null;
  size: string | null;
  price_mxn: number | null;
  imagen_principal: string | null;
  imagen_detalle: string | null;
  disponible: boolean | null;
}

// Convierte una fila de Supabase al formato que usa la web
function mapRow(row: DBRow, index: number): Product {
  return {
    id: row.id,
    num: String(index + 1).padStart(3, '0'), // "001", "002"...
    code: row.codigo,
    name: row.nombre,
    series: row.serie ?? 'Serie A',
    slug: row.slug,
    description: row.descripcion ?? '',
    categoria: row.categoria ?? '',
    image: row.imagen_principal ?? '',
    imageDetail: row.imagen_detalle ?? '',
    available: !!row.disponible,
    priceMXN: Number(row.price_mxn ?? 0),
    size: row.size ?? '',
  };
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  // Arrancamos con la lista de respaldo para que la tienda se vea al
  // instante; cuando lleguen los datos reales de Supabase, los cambiamos.
  const [products, setProducts] = useState<Product[]>(PRODUCTS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [fromDB, setFromDB] = useState(false);

  useEffect(() => {
    let alive = true; // evita actualizar si el componente ya se desmontó

    (async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('creado_en', { ascending: true });

      if (!alive) return;

      if (!error && data && data.length > 0) {
        setProducts((data as DBRow[]).map(mapRow));
        setFromDB(true);
      }
      // Si hubo error o no hay filas, se queda la lista de respaldo
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, fromDB }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductsProvider');
  return ctx;
}
