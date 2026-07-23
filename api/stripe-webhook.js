import Stripe from 'stripe';
import { formatMXN, correoClienteHTML, correoVendedorHTML, enviarPorResend } from './_lib/correo.js';

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK DE STRIPE — Marca el pedido como "pagado" y manda DOS correos:
// uno de confirmación al cliente, y un aviso de "nueva venta" a Gerardo.
// ─────────────────────────────────────────────────────────────────────────────
// Stripe llama a esta función cuando un pago se completa. Aquí verificamos que
// de verdad viene de Stripe (con la firma), actualizamos el pedido en Supabase
// y mandamos los correos.
//
// Variables de entorno necesarias en Vercel:
//   • STRIPE_SECRET_KEY          (la misma llave secreta de Stripe)
//   • STRIPE_WEBHOOK_SECRET      (el "Signing secret" del webhook, empieza con whsec_)
//   • SUPABASE_SERVICE_ROLE_KEY  (llave secreta de Supabase, SOLO vive aquí en el servidor)
//   • RESEND_API_KEY             (llave de Resend, empieza con re_). Si falta, se
//     omiten los DOS correos (el pedido se marca pagado de todas formas).
//   • SELLER_EMAIL                (opcional) correo donde Gerardo recibe el aviso
//     de "nueva venta". Si falta, se omite solo ese correo (el del cliente sí sale).
//
// Los correos salen de contacto@dondomstudio.com (dominio propio verificado
// en Resend) — funciona para cualquier cliente real, no solo para pruebas.
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

// Trae el pedido y sus productos desde Supabase (una sola vez, para los dos correos)
async function obtenerDetallePedido(orderId, serviceRole) {
  const headersSupabase = { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` };

  const [rPedido, rItems] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/pedidos?id=eq.${orderId}&select=id,nombre,correo,telefono,direccion,total_mxn`,
      { headers: headersSupabase },
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/pedido_items?pedido_id=eq.${orderId}&select=nombre,size,cantidad,precio_unitario_mxn`,
      { headers: headersSupabase },
    ),
  ]);

  const pedidos = await rPedido.json();
  const items = await rItems.json();
  const pedido = Array.isArray(pedidos) ? pedidos[0] : null;

  if (!pedido || !Array.isArray(items) || items.length === 0) return null;
  return { pedido, items };
}

// Manda el correo del cliente y, si SELLER_EMAIL está configurado, el aviso de
// venta a Gerardo. Nunca truena el webhook — el pedido ya quedó "pagado".
async function mandarCorreos(orderId, serviceRole) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('RESEND_API_KEY no configurada: se omiten los correos.');
    return;
  }

  try {
    const detalle = await obtenerDetallePedido(orderId, serviceRole);
    if (!detalle) {
      console.error('No se pudo armar el correo: faltan datos del pedido', orderId);
      return;
    }
    const { pedido, items } = detalle;
    const folio = pedido.id.slice(0, 8).toUpperCase();

    const tareas = [];

    // Correo al cliente (si dejó su correo al comprar)
    if (pedido.correo) {
      tareas.push(
        enviarPorResend({
          resendKey,
          from: 'DONDOM STUDIO <contacto@dondomstudio.com>',
          to: pedido.correo,
          replyTo: 'Dondommanagment@gmail.com',
          subject: `Confirmamos tu pago — Pedido #${folio}`,
          html: correoClienteHTML({ pedido, items }),
        }),
      );
    }

    // Aviso de venta a Gerardo (solo si configuró SELLER_EMAIL en Vercel)
    const sellerEmail = process.env.SELLER_EMAIL;
    if (sellerEmail) {
      tareas.push(
        enviarPorResend({
          resendKey,
          from: 'DONDOM STUDIO <contacto@dondomstudio.com>',
          to: sellerEmail,
          subject: `Nueva venta — Pedido #${folio} — ${formatMXN(pedido.total_mxn)}`,
          html: correoVendedorHTML({ pedido, items }),
        }),
      );
    } else {
      console.log('SELLER_EMAIL no configurada: se omite el aviso de venta.');
    }

    await Promise.all(tareas);
  } catch (e) {
    console.error('Error mandando los correos del pedido:', e);
  }
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
      // Si no logramos marcar el pedido, respondemos error para que
      // Stripe REINTENTE el aviso más tarde (así el pedido no se queda
      // en "pendiente" por un fallo pasajero de la base de datos).
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/pedidos?id=eq.${orderId}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ estado: 'pagado' }),
        });
        if (!r.ok) {
          console.error('Supabase no aceptó la actualización:', r.status);
          res.status(500).json({ error: 'No se pudo marcar el pedido como pagado' });
          return;
        }
      } catch (e) {
        console.error('Error marcando pedido pagado:', e);
        res.status(500).json({ error: 'No se pudo marcar el pedido como pagado' });
        return;
      }

      // 3) Ya marcado como pagado: mandamos el correo al cliente y el aviso
      // de venta a Gerardo. No bloqueamos ni hacemos fallar la respuesta a Stripe.
      await mandarCorreos(orderId, serviceRole);
    }
  }

  // 4) Le decimos a Stripe que recibimos el evento
  res.status(200).json({ received: true });
}
