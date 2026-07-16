export interface Product {
  id: string;          // identificador único (uuid de Supabase)
  num: string;         // número visible en la tarjeta, ej. "001"
  code: string;        // "AR/01"
  name: string;
  series: string;
  image: string;       // foto principal (tarjetas de catálogo/tienda)
  imageDetail: string; // foto de la página de producto
  description: string;
  slug: string;        // para la URL, ej. "mocca"
  categoria: string;   // "cafe", "flores"... (para los filtros de la tienda)
  available: boolean;
  priceMXN: number;    // precio en pesos mexicanos
  size: string;        // tamaño, ej. "250 ml"
}

// ─── LISTA DE RESPALDO ───────────────────────────────────────────────
// La página normalmente carga los productos y precios DESDE SUPABASE
// (tabla `productos`) — ver src/products.tsx. Esta lista solo se usa si
// la base de datos no responde, para que la tienda nunca se vea vacía.
// Para cambiar precios o agregar productos, hazlo en Supabase, no aquí.
export const PRODUCTS_FALLBACK: Product[] = [
  {
    id: "001",
    num: "001",
    code: "AR/01",
    name: "MOCCA",
    series: "Serie A",
    slug: "mocca",
    image: "/products/ar01-ingredientes.jpg",
    imageDetail: "/products/ar01-frente.jpg",
    description: "Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.",
    categoria: "cafe",
    available: true,
    priceMXN: 289,
    size: "250 ml",
  },
  {
    // Espacio reservado para el siguiente aroma (aún no existe)
    id: "002",
    num: "002",
    code: "AR/02",
    name: "PRÓXIMAMENTE",
    series: "Serie A",
    slug: "proximamente",
    image: "",
    imageDetail: "",
    description: "Nuevo aroma en desarrollo.",
    categoria: "frescos",
    available: false,
    priceMXN: 0,
    size: "",
  }
];

// Formatea un número como precio en pesos mexicanos: 490 -> "$490.00"
export function formatMXN(amount: number): string {
  return "$" + amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const CONTACT = {
  phone: "+52 999 552 2572",
  whatsapp: "5219995522572", // formato para links de WhatsApp: 52 + 1 + número
  email: "Dondommanagment@gmail.com",
};

// ─── PAGOS (D2C — venta directa al consumidor) ───
// Mercado Pago: cuando Gerardo genere el "link de pago" en su panel de
// Mercado Pago, se pega aquí y el botón "Comprar ahora" lo usará.
// Mientras esté vacío (""), el botón usa WhatsApp como respaldo para no
// perder ventas.
export const PAYMENTS = {
  mercadoPagoLink: "https://mpago.la/2QfH8Rr",
  // Futuro: paypalLink: "", stripeLink: ""
};
