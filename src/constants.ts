export interface Product {
  id: string;
  code: string;
  name: string;
  series: string;
  image: string;
  description: string;
  slug: string;
  available: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "001",
    code: "AR 01",
    name: "MOCCA",
    series: "Serie A",
    slug: "mocca",
    image: "/products/ar01-ingredientes.jpg",
    description: "Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.",
    available: true,
  },
  {
    // Espacio reservado para el siguiente aroma (aún no existe)
    id: "002",
    code: "AR 02",
    name: "PRÓXIMAMENTE",
    series: "Serie A",
    slug: "proximamente",
    image: "",
    description: "Nuevo aroma en desarrollo.",
    available: false,
  }
];

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
