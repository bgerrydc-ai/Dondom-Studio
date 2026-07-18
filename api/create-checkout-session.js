import Stripe from 'stripe';

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN DE SERVIDOR — Crea la sesión de pago de Stripe
// ─────────────────────────────────────────────────────────────────────────────
// Esto corre en el servidor de Vercel (NO en el navegador), para que la llave
// secreta de Stripe nunca sea pública. El navegador solo manda el código del
// producto y la cantidad; AQUÍ leemos los precios REALES desde Supabase y
// armamos el cobro, para que nadie pueda pagar menos.
//
// Requiere una variable de entorno en Vercel:  STRIPE_SECRET_KEY
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://atfxlrsufenzchkjbiwe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AG36P8hSZw0jg-7WTsx9jQ_7ToRIUVE';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: 'Falta configurar STRIPE_SECRET_KEY en Vercel' });
    return;
  }
  const stripe = new Stripe(secret);

  try {
    const { items, orderId, origin, email } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Carrito vacío' });
      return;
    }

    // Precios REALES desde Supabase (no confiamos en lo que mande el navegador)
    const codigos = items.map((i) => i.codigo);
    const inList = codigos.map((c) => `"${c}"`).join(',');
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/productos?select=codigo,nombre,price_mxn,disponible&codigo=in.(${inList})`,
      { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
    );
    const productos = await r.json();

    const line_items = [];
    for (const it of items) {
      const p = Array.isArray(productos)
        ? productos.find((x) => x.codigo === it.codigo && x.disponible)
        : null;
      if (!p) continue;
      const qty = Math.max(1, parseInt(it.cantidad, 10) || 1);
      line_items.push({
        price_data: {
          currency: 'mxn',
          product_data: { name: `${p.nombre} — ${p.codigo}` },
          unit_amount: Math.round(Number(p.price_mxn) * 100), // Stripe usa centavos
        },
        quantity: qty,
      });
    }

    if (line_items.length === 0) {
      res.status(400).json({ error: 'No hay productos válidos' });
      return;
    }

    const base = origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      // Correo del cliente: Stripe le manda el recibo (si activas los recibos)
      ...(email ? { customer_email: email } : {}),
      // A dónde regresa el cliente después de pagar (o de cancelar)
      success_url: `${base}/checkout?pagado=${encodeURIComponent(orderId || '')}`,
      cancel_url: `${base}/checkout?cancelado=1`,
      metadata: { orderId: orderId || '' },
    });

    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error al crear el pago' });
  }
}
