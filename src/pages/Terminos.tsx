import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../i18n';
import { CONTACT } from '../constants';
import { usePageTitle } from '../usePageTitle';

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA DE TÉRMINOS Y CONDICIONES
// El texto es una PLANTILLA base para una tienda en línea en México.
// Gerardo: revísalo y ajústalo a tu operación real (o pásalo con un abogado).
// Para editar, cambia el texto de las secciones de abajo.
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

export default function Terminos() {
  const navigate = useNavigate();
  const { t } = useLang();
  usePageTitle(t.legal.terms);

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
          {t.legal.terms}
        </h1>
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-12 border-b border-brand-gray-200 pb-6">
          {t.legal.updated}: {ULTIMA_ACTUALIZACION}
        </p>

        <Seccion titulo="1. Identificación">
          <p>
            Este sitio es operado por DONDOM STUDIO ("nosotros", "el sitio").
            Al usar este sitio y realizar una compra, aceptas los presentes
            Términos y Condiciones. Si no estás de acuerdo, por favor no utilices
            el sitio.
          </p>
          <p>Contacto: {CONTACT.email} · {CONTACT.phone}</p>
        </Seccion>

        <Seccion titulo="2. Productos y precios">
          <p>
            Los productos que ofrecemos son aromatizantes y artículos
            relacionados. Procuramos que las descripciones, imágenes y precios
            sean correctos, pero pueden existir errores; en tal caso nos
            reservamos el derecho de corregirlos.
          </p>
          <p>
            Todos los precios están expresados en pesos mexicanos (MXN) e
            incluyen los impuestos aplicables, salvo que se indique lo contrario.
            Los precios pueden cambiar sin previo aviso, pero el precio aplicable
            a tu pedido será el mostrado al momento de confirmarlo.
          </p>
        </Seccion>

        <Seccion titulo="3. Pedidos y pagos">
          <p>
            Al realizar un pedido haces una oferta de compra que queda sujeta a
            nuestra confirmación y a la disponibilidad del producto. Los pagos se
            procesan a través de plataformas externas (por ejemplo, Stripe);
            nosotros no almacenamos los datos completos de tu tarjeta.
          </p>
          <p>
            Nos reservamos el derecho de rechazar o cancelar un pedido en caso de
            sospecha de fraude, error de precio o falta de existencias, en cuyo
            caso te reembolsaremos cualquier cantidad pagada.
          </p>
        </Seccion>

        <Seccion titulo="4. Envíos y entregas">
          <p>
            Los tiempos y costos de envío se informan durante el proceso de
            compra. Las fechas de entrega son estimadas y pueden variar por
            causas ajenas a nosotros (paqueterías, clima, etc.).
          </p>
        </Seccion>

        <Seccion titulo="5. Cambios y devoluciones">
          <p>
            Si tu producto llega dañado o presenta un defecto, contáctanos dentro
            de los primeros días posteriores a la entrega para gestionar un
            cambio o reembolso. Por tratarse de productos aromáticos, podríamos
            no aceptar devoluciones de artículos abiertos o usados, salvo defecto
            de fábrica.
          </p>
        </Seccion>

        <Seccion titulo="6. Cuenta de usuario">
          <p>
            Crear una cuenta es opcional. Eres responsable de mantener la
            confidencialidad de tu contraseña y de la actividad que ocurra en tu
            cuenta. Notifícanos si detectas un uso no autorizado.
          </p>
        </Seccion>

        <Seccion titulo="7. Propiedad intelectual">
          <p>
            Las marcas, logotipos, textos, imágenes y demás contenidos del sitio
            son propiedad de DONDOM STUDIO o de sus titulares y están protegidos
            por la ley. No pueden usarse sin autorización.
          </p>
        </Seccion>

        <Seccion titulo="8. Responsabilidad">
          <p>
            El sitio se ofrece "tal cual". En la medida permitida por la ley, no
            seremos responsables por daños indirectos derivados del uso del sitio
            o de los productos, más allá del monto pagado por el pedido
            correspondiente.
          </p>
        </Seccion>

        <Seccion titulo="9. Cambios a estos términos">
          <p>
            Podemos actualizar estos Términos y Condiciones en cualquier momento.
            La versión vigente será siempre la publicada en esta página, con su
            fecha de última actualización.
          </p>
        </Seccion>

        <Seccion titulo="10. Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.
            Cualquier controversia se someterá a los tribunales competentes,
            respetando los derechos que la legislación de protección al
            consumidor te otorga.
          </p>
        </Seccion>

        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 border-t border-brand-gray-200 pt-6">
          Documento base de plantilla — sujeto a revisión.
        </p>
      </main>
    </div>
  );
}
