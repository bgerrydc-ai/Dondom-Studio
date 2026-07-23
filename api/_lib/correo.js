// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES COMPARTIDAS PARA LOS CORREOS DE DONDOM STUDIO
// ─────────────────────────────────────────────────────────────────────────────
// Lo usan tanto el webhook de Stripe (confirmación automática + aviso de
// venta) como el reenvío manual desde "Mis pedidos". El prefijo "_" en el
// nombre de la carpeta le dice a Vercel que esto NO es una ruta de API,
// solo código compartido.
// ─────────────────────────────────────────────────────────────────────────────

export function formatMXN(amount) {
  return '$' + Number(amount).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function filasProductosHTML(items) {
  return items
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">
            ${it.nombre}${it.size ? ` — ${it.size}` : ''}<br/>
            <span style="color:#888;font-size:11px;">Cantidad: ${it.cantidad}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-family:monospace;font-size:12px;">
            ${formatMXN(it.precio_unitario_mxn * it.cantidad)}
          </td>
        </tr>`,
    )
    .join('');
}

function plantillaCorreoHTML({ tituloEncabezado, textoIntro, pedido, items, extra = '' }) {
  return `
  <div style="background:#f2f2f2;padding:32px 16px;font-family:Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;">
      <div style="background:#002395;padding:24px 28px;">
        <span style="color:#fff;font-weight:800;letter-spacing:2px;font-size:14px;">DONDOM STUDIO</span>
      </div>
      <div style="padding:28px;">
        <h1 style="font-size:22px;margin:0 0 8px;">${tituloEncabezado}</h1>
        <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 24px;">
          ${textoIntro} <strong>#${pedido.id.slice(0, 8).toUpperCase()}</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${filasProductosHTML(items)}
        </table>
        <table style="width:100%;margin-top:12px;">
          <tr>
            <td style="font-family:monospace;font-size:11px;text-transform:uppercase;color:#888;">Total</td>
            <td style="text-align:right;font-family:monospace;font-size:15px;font-weight:bold;">
              ${formatMXN(pedido.total_mxn)}
            </td>
          </tr>
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;">
          <p style="font-family:monospace;font-size:10px;text-transform:uppercase;color:#888;margin:0 0 6px;">
            Dirección de envío
          </p>
          <p style="font-size:12px;color:#333;line-height:1.6;margin:0;">${pedido.direccion || '—'}</p>
        </div>
        ${extra}
      </div>
    </div>
  </div>`;
}

export function correoClienteHTML({ pedido, items }) {
  return plantillaCorreoHTML({
    tituloEncabezado: '¡Gracias por tu compra!',
    textoIntro: 'Confirmamos tu pago. Aquí está el resumen de tu pedido',
    pedido,
    items,
    extra: `
        <p style="font-size:11px;color:#888;margin-top:28px;line-height:1.6;">
          Te avisaremos cuando tu pedido salga a reparto. Si tienes dudas, contáctanos
          respondiendo este correo.
        </p>`,
  });
}

export function correoVendedorHTML({ pedido, items }) {
  return plantillaCorreoHTML({
    tituloEncabezado: '¡Tienes una venta nueva! 🎉',
    textoIntro: 'Se pagó el pedido',
    pedido,
    items,
    extra: `
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
          <p style="font-family:monospace;font-size:10px;text-transform:uppercase;color:#888;margin:0 0 6px;">
            Contacto del cliente
          </p>
          <p style="font-size:12px;color:#333;line-height:1.6;margin:0;">
            ${pedido.nombre || '—'}<br/>${pedido.correo || '—'}${pedido.telefono ? `<br/>${pedido.telefono}` : ''}
          </p>
        </div>`,
  });
}

// Manda un correo por Resend. Devuelve true/false según si se pudo mandar,
// para que cada quien decida qué hacer (el webhook solo lo registra en el
// log; el reenvío manual sí le avisa al cliente si algo falló).
export async function enviarPorResend({ resendKey, from, to, replyTo, subject, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, reply_to: replyTo, subject, html }),
  });
  if (!r.ok) {
    const detalle = await r.text();
    console.error(`Resend no aceptó el correo para ${to}:`, r.status, detalle);
    return false;
  }
  return true;
}
