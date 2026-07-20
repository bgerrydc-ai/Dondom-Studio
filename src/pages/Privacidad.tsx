import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../i18n';
import { CONTACT } from '../constants';
import { usePageTitle } from '../usePageTitle';

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA DE POLÍTICA DE PRIVACIDAD (AVISO DE PRIVACIDAD)
// Plantilla base alineada a la Ley Federal de Protección de Datos Personales
// en Posesión de los Particulares (México), incluyendo derechos ARCO.
// Gerardo: revísala y ajústala a tu operación real (o pásala con un abogado).
// ─────────────────────────────────────────────────────────────────────────────

const ULTIMA_ACTUALIZACION = '16 de julio de 2026';

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold tracking-tighter mb-3">{titulo}</h2>
      <div className="font-mono text-[11px] leading-relaxed text-brand-gray-400 space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function Privacidad() {
  const navigate = useNavigate();
  const { t } = useLang();
  usePageTitle(t.legal.privacy);

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-[760px] mx-auto px-8 py-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" />
          {t.legal.backHome}
        </button>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">
          {t.legal.privacy}
        </h1>
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-12 border-b border-brand-gray-200 pb-6">
          {t.legal.updated}: {ULTIMA_ACTUALIZACION}
        </p>

        <Seccion titulo="1. Responsable de tus datos">
          <p>
            DONDOM STUDIO es responsable del tratamiento de tus datos personales.
            Para cualquier tema relacionado con tu privacidad puedes contactarnos
            en {CONTACT.email} o al {CONTACT.phone}.
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recabamos">
          <p>Podemos recabar los siguientes datos personales:</p>
          <p>
            • Nombre y apellidos.<br />
            • Correo electrónico.<br />
            • Teléfono.<br />
            • Dirección de envío.<br />
            • Datos de tus pedidos (productos, montos).
          </p>
          <p>
            Los pagos se procesan por plataformas externas; no almacenamos los
            datos completos de tu tarjeta.
          </p>
        </Seccion>

        <Seccion titulo="3. Para qué usamos tus datos">
          <p>Finalidades principales (necesarias para darte el servicio):</p>
          <p>
            • Procesar y entregar tus pedidos.<br />
            • Contactarte sobre tu compra o tus dudas.<br />
            • Gestionar tu cuenta, si decides crear una.
          </p>
          <p>Finalidades secundarias (solo con tu consentimiento):</p>
          <p>
            • Enviarte noticias, promociones y anuncios por correo electrónico.
            Puedes negarte a estas desde el inicio o darte de baja después
            escribiéndonos a {CONTACT.email}.
          </p>
        </Seccion>

        <Seccion titulo="4. Con quién compartimos tus datos">
          <p>
            Solo compartimos tus datos con proveedores que nos ayudan a operar,
            por ejemplo: servicios de base de datos y hospedaje, plataformas de
            pago (como Stripe) y empresas de paquetería para el envío. Estos
            proveedores solo usan tus datos para prestarnos su servicio.
          </p>
        </Seccion>

        <Seccion titulo="5. Tus derechos (ARCO)">
          <p>
            Tienes derecho a Acceder a tus datos, Rectificarlos si son inexactos,
            Cancelarlos cuando consideres que no se requieren, y Oponerte a su
            uso para fines específicos. También puedes revocar el consentimiento
            que nos hayas otorgado.
          </p>
          <p>
            Para ejercer cualquiera de estos derechos, escríbenos a{' '}
            {CONTACT.email} indicando tu solicitud. Te responderemos en los plazos
            que marca la ley.
          </p>
        </Seccion>

        <Seccion titulo="6. Cookies y tecnologías similares">
          <p>
            El sitio puede usar almacenamiento local del navegador para recordar
            tu carrito, tu idioma y tu sesión. Puedes borrarlos desde la
            configuración de tu navegador.
          </p>
        </Seccion>

        <Seccion titulo="7. Cambios a este aviso">
          <p>
            Podemos actualizar este Aviso de Privacidad. La versión vigente será
            siempre la publicada en esta página, con su fecha de última
            actualización.
          </p>
        </Seccion>

        <Seccion titulo="8. Consentimiento">
          <p>
            Al proporcionarnos tus datos y aceptar este aviso, consientes su
            tratamiento conforme a lo aquí descrito.
          </p>
        </Seccion>

        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 border-t border-brand-gray-200 pt-6">
          Documento base de plantilla — sujeto a revisión.
        </p>
      </main>
    </div>
  );
}
