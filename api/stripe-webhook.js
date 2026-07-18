import Stripe from 'stripe';

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK DE STRIPE — Marca el pedido como "pagado" automáticamente
// ─────────────────────────────────────────────────────────────────────────────
// Stripe llama a esta función cuando un pago se completa. Aquí verificamos que
// de verdad viene de Stripe (con la firma) y actualizamos el pedido en Supabase.
//
// Variables de entorno necesarias en Vercel:
//   • STRIPE_SECRET_KEY          (la misma llave secreta de Stripe)
//   • STRIPE_WEBHOOK_SECRET      (el "Signing secret" del webhook, empieza con whsec_)
//   • SUPABASE_SERVICE_ROLE_KEY  (llave secreta de Supabase, SOLO vive aquí en el servidor)
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://atfxlrsufenzchkjbiwe.supabase.co';

// Stripe necesita el cuerpo "crudo" (sin procesar) para verificar la firma
export const config = { api: { bodyParser: false } };

async function leerCuerpoCrudo(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !webhookSecret || !serviceRole) {
    res.status(500).json({ error: 'Faltan variables de entorno del webhook' });
    return;
  }

  const stripe = new Stripe(secret);

  // 1) Verificamos que el evento venga realmente de Stripe
  let event;
  try {
    const rawBody = await leerCuerpoCrudo(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 2) Cuando el pago se completa, marcamos el pedido como "pagado"
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.orderId;

    if (orderId) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/pedidos?id=eq.${orderId}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ estado: 'pagado' }),
        });
      } catch (e) {
        // No rompemos el webhook por esto; Stripe reintentará si respondemos error
        console.error('Error marcando pedido pagado:', e);
      }
    }
  }

  // 3) Le decimos a Stripe que recibimos el evento
  res.status(200).json({ received: true });
}
