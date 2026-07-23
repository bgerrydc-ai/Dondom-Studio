import { correoClienteHTML, enviarPorResend } from './_lib/correo.js';

// ─────────────────────────────────────────────────────────────────────────────
// REENVIAR EL CORREO DE UN PEDIDO — "Mis pedidos" → botón "Reenviar por correo"
// ─────────────────────────────────────────────────────────────────────────────
// El cliente (con sesión iniciada) puede pedir que le reenvíen el resumen de
// UNO DE SUS PEDIDOS a cualquier correo que escriba (por ejemplo, el que de
// verdad usa, si compró antes de cambiarlo).
//
// SEGURIDAD: en vez de usar la llave secreta (service_role), usamos el propio
// token de sesión del cliente para leer el pedido. Así, las reglas de
// seguridad (RLS) de Supabase se encargan solas de que NADIE pueda reenviar
// un pedido que no es suyo — ni con este endpoint ni de ninguna otra forma.
//
// Variable de entorno necesaria en Vercel: RESEND_API_KEY
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://atfxlrsufenzchkjbiwe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AG36P8hSZw0jg-7WTsx9jQ_7ToRIUVE';

function correoValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    res.status(500).json({ error: 'El reenvío de correos no está configurado todavía.' });
    return;
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ error: 'Debes iniciar sesión para reenviar tu pedido.' });
    return;
  }

  const { orderId, email } = req.body || {};
  if (!orderId || !email || !correoValido(String(email))) {
    res.status(400).json({ error: 'Escribe un correo válido.' });
    return;
  }

  try {
    // Usamos el token del propio cliente como Authorization: si el pedido no
    // es suyo, Supabase (RLS) simplemente no devuelve nada — no hace falta
    // validarlo nosotros mismos.
    const headersSupabase = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: authHeader };

    const [rPedido, rItems] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/pedidos?id=eq.${orderId}&select=id,direccion,total_mxn`,
        { headers: headersSupabase },
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/pedido_items?pedido_id=eq.${orderId}&select=nombre,size,cantidad,precio_unitario_mxn`,
        { headers: headersSupabase },
      ),
    ]);

    if (!rPedido.ok || !rItems.ok) {
      res.status(401).json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.' });
      return;
    }

    const pedidos = await rPedido.json();
    const items = await rItems.json();
    const pedido = Array.isArray(pedidos) ? pedidos[0] : null;

    if (!pedido || !Array.isArray(items) || items.length === 0) {
      res.status(404).json({ error: 'No encontramos ese pedido en tu cuenta.' });
      return;
    }

    const enviado = await enviarPorResend({
      resendKey,
      from: 'DONDOM STUDIO <onboarding@resend.dev>',
      to: email,
      replyTo: 'Dondommanagment@gmail.com',
      subject: `Tu pedido — #${pedido.id.slice(0, 8).toUpperCase()}`,
      html: correoClienteHTML({ pedido, items }),
    });

    if (!enviado) {
      res.status(502).json({ error: 'No se pudo enviar el correo. Intenta de nuevo.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Error reenviando el correo del pedido:', e);
    res.status(500).json({ error: 'No se pudo reenviar el correo. Intenta de nuevo.' });
  }
}
