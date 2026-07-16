import { createContext, useContext, useState, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════
// SISTEMA DE IDIOMAS (ES / EN)
// ═══════════════════════════════════════════════════════════════════
// Todos los textos de la página viven aquí, en español e inglés.
// Para editar un texto: búscalo aquí y cámbialo en los DOS idiomas.
// Las páginas los usan así:  const { t } = useLang();  →  t.home.viewCollection
// ═══════════════════════════════════════════════════════════════════

export const translations = {
  es: {
    nav: {
      inicio: 'Inicio',
      tienda: 'Tienda',
      contacto: 'Contacto',
      quienesSomos: 'Quiénes Somos',
    },
    common: {
      comingSoonName: 'PRÓXIMAMENTE',
      comingSoon: 'Próximamente',
      imageSoon: 'Imagen próximamente',
      photoSoon: 'Foto próximamente',
      viewProduct: 'Ver Producto',
      view: 'Ver',
      loading: 'Cargando…',
      copyright: '© 2026 DONDOM STUDIO — Instrumentos de Aroma',
    },
    home: {
      blurb1: 'Aromas diseñados para transformar ambientes con precisión.',
      blurb2: 'Difusores avant-garde. Ingeniería de aroma para entornos que exigen distinción.',
      viewCollection: 'Ver Colección',
      instruments: 'Instrumentos',
      ofScent: 'De Aroma',
      collection: 'Colección',
      catalog: 'Catálogo / Serie A',
      scents: 'Aromas',
      segment: 'Segmento 01',
      forCompanies: 'Para empresas y marcas',
      needScentL1: '¿Necesitas un aroma',
      needScentL2: 'para tu marca?',
      supplierText:
        'Formulamos aromas personalizados para proveedores, hoteles, tiendas y marcas que quieren dejar huella.',
      supplierCta: 'Contactar como proveedor',
      labTexture: 'Laboratorio de Aroma // V.01',
      about1: 'Un estudio de aroma creativo que opera en la intersección del diseño y la sensorialidad.',
      about2: 'Ingeniamos experiencias olfativas que transforman ambientes con precisión y distinción.',
      contact: 'Contacto',
      footerTagline: 'DONDOM STUDIO — Instrumentos de Aroma',
    },
    tienda: {
      title: 'Tienda',
      catalog: 'Catálogo / Serie A',
      filterTodos: 'Todos',
      filterCafe: 'Café y Especias',
      filterFlores: 'Flores',
      filterMaderas: 'Maderas',
      filterFrescos: 'Frescos',
      availableSg: 'aroma disponible',
      availablePl: 'aromas disponibles',
      empty: 'No hay aromas en esta categoría aún — pronto habrá más.',
    },
    mocca: {
      breadcrumb: 'Tienda / AR 01',
      serie: 'Serie A',
      format: 'Spray Aromático',
      formatLabel: 'Formato',
      collectionLabel: 'Colección',
      serieYear: 'Serie A — 2026',
      subtitle: 'AR 01 — Spray Aromático',
      description:
        'Notas de café tostado, chocolate y menta fresca. Un aroma que envuelve y persiste. Diseñado para espacios que buscan distinción.',
      selectFormat: 'Selecciona formato',
      spray: 'Spray',
      sizeTbd: '250 ml',
      quantity: 'Cantidad',
      price: 'Precio',
      priceWhatsApp: 'Consultar disponibilidad via WhatsApp',
      buyNow: 'Comprar ahora',
      buyNowWhatsApp: 'Comprar ahora — WhatsApp',
      securePay: 'Pago seguro procesado por Mercado Pago',
      weContact: 'Te contactamos directamente para confirmar tu pedido',
      moreScents: 'Ver más aromas',
      notFound: 'Producto no encontrado',
      imgAlt: 'AR/01 MOCCA — spray aromático, vista frontal',
      waMessage:
        'Hola DONDOM STUDIO! Me interesa comprar el spray aromático MOCCA. ¿Pueden darme el precio y disponibilidad? Cantidad: {qty}',
    },
    contacto: {
      kicker: 'Escríbenos',
      title: 'Contacto',
      name: 'Nombre *',
      namePh: 'Tu nombre',
      phone: 'Teléfono (opcional)',
      phonePh: '+52 00 0000 0000',
      comment: 'Comentario *',
      commentPh: '¿En qué podemos ayudarte?',
      required: 'Por favor llena los campos obligatorios (Nombre y Comentario).',
      send: 'Enviar mensaje',
      sending: 'Enviando…',
      sent: '¡Mensaje enviado! Te responderemos pronto.',
      sendAnother: 'Enviar otro mensaje',
      mailNotice: 'Tu mensaje se envía directamente a nuestro equipo',
      done: '¡Listo! Revisa tu app de correo y presiona enviar.',
      notOpened: '¿No se abrió nada? Usa una de estas opciones:',
      openGmail: 'Abrir en Gmail',
      copyMsg: 'Copiar mensaje',
      copied: '¡Copiado! ✓',
      orWrite: 'O escríbenos directo a',
      emailSubject: 'Mensaje de {nombre} — DONDOM STUDIO',
      emailBody: 'Hola, mi nombre es {nombre}. {comentario}.{telefonoParte} Saludos.',
      emailPhonePart: ' Mi número de teléfono es {telefono}.',
      emailTo: 'Para',
      emailSubjectLabel: 'Asunto',
      whatsapp: 'WhatsApp',
      email: 'Correo',
      hours: 'Horario',
      hoursValue: 'Lun – Vie / 9:00 – 18:00',
      supplierQ: '¿Eres proveedor?',
      supplierText: 'Formulamos aromas a medida para marcas, hoteles y comercios. Llámanos al {phone}.',
      copyright: '© 2026 DONDOM STUDIO — Instrumentos de Aroma',
    },
    about: {
      kicker: 'Nuestra historia',
      titleL1: 'Quiénes',
      titleL2: 'Somos',
      intro:
        'DonDom Studio es un estudio creativo dedicado al diseño y desarrollo de productos que transforman la vida cotidiana. Creamos objetos que combinan funcionalidad, diseño y cultura, desde prendas de vestir hasta artículos para el hogar, hospitalidad y estilo de vida. No estamos limitados por una categoría; nuestro trabajo consiste en imaginar, diseñar y lanzar productos que las personas quieran conservar, usar y coleccionar.',
      philosophyLabel: '01 — Filosofía',
      philosophyQuoteL1: '"No seguimos una industria.',
      philosophyQuoteL2: 'Seguimos una visión."',
      philosophySub: 'Si un producto puede diseñarse mejor, puede formar parte de DonDom Studio.',
      missionLabel: '02 — Misión',
      missionTitle: 'Misión',
      mission1:
        'Diseñar productos que las personas quieran incorporar a su vida por su calidad, funcionalidad y diseño, construyendo un universo creativo que trascienda cualquier categoría.',
      mission2:
        'No queremos ser "una marca de ropa" ni "una marca de aromatizantes". Queremos crear una marca capaz de diseñar cualquier objeto siempre que represente la filosofía de DonDom Studio.',
      visionLabel: '03 — Visión',
      visionTitle: 'Visión',
      vision:
        'Convertir a DonDom Studio en uno de los estudios creativos más reconocidos de México y, eventualmente, del mundo, desarrollando productos, colecciones y colaboraciones que definan una forma de vivir.',
      phraseLabel: 'DonDom en una frase',
      phrase:
        '"Un estudio creativo que diseña objetos, espacios y experiencias para elevar la vida cotidiana mediante un diseño honesto, funcional y atemporal."',
      location: 'DONDOM STUDIO — MÉXICO',
      copyright: '© 2026 DONDOM STUDIO',
    },
    products: {
      moccaDescription: 'Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.',
      placeholderDescription: 'Nuevo aroma en desarrollo.',
    },
    cart: {
      title: 'Mi carrito',
      close: 'Cerrar',
      empty: 'Tu carrito está vacío',
      continueShopping: 'Seguir comprando',
      subtotal: 'Subtotal',
      checkout: 'Pagar',
      addToCart: 'Agregar al carrito',
      remove: 'Quitar',
      freeShippingNote: 'Envío gratis en compras mayores a $1,500',
    },
    checkout: {
      title: 'Finalizar compra',
      summary: 'Resumen del pedido',
      subtotal: 'Subtotal',
      empty: 'Tu carrito está vacío.',
      goShop: 'Ir a la tienda',
      contactSection: 'Datos de contacto',
      addressSection: 'Dirección de envío',
      firstName: 'Nombre(s) *',
      lastName: 'Apellidos *',
      email: 'Correo electrónico *',
      emailPh: 'tu@correo.com',
      phone: 'Teléfono *',
      phonePh: '+52 00 0000 0000',
      street: 'Calle *',
      extNum: 'No. Exterior *',
      intNum: 'No. Interior',
      zip: 'Código Postal *',
      colonia: 'Colonia *',
      city: 'Ciudad *',
      municipio: 'Municipio / Alcaldía *',
      state: 'Estado *',
      notes: 'Notas de entrega',
      notesPh: 'Referencias o indicaciones (opcional)',
      required: 'Por favor llena todos los campos obligatorios.',
      placeOrder: 'Realizar pedido',
      placing: 'Procesando…',
      orderOk: '¡Pedido recibido!',
      orderNum: 'Número de pedido',
      orderNote: 'Guarda tu número de pedido. Te contactaremos para confirmar la entrega.',
      payNow: 'Pagar ahora — Mercado Pago',
      orderError: 'Hubo un error al crear el pedido. Intenta de nuevo o escríbenos por WhatsApp.',
      backHome: 'Volver al inicio',
    },
  },

  en: {
    nav: {
      inicio: 'Home',
      tienda: 'Shop',
      contacto: 'Contact',
      quienesSomos: 'About Us',
    },
    common: {
      comingSoonName: 'COMING SOON',
      comingSoon: 'Coming soon',
      imageSoon: 'Image coming soon',
      photoSoon: 'Photo coming soon',
      viewProduct: 'View Product',
      view: 'View',
      loading: 'Loading…',
      copyright: '© 2026 DONDOM STUDIO — Instruments of Scent',
    },
    home: {
      blurb1: 'Scents designed to transform environments with precision.',
      blurb2: 'Avant-garde diffusers. Scent engineering for environments that demand distinction.',
      viewCollection: 'View Collection',
      instruments: 'Instruments',
      ofScent: 'Of Scent',
      collection: 'Collection',
      catalog: 'Catalog / Series A',
      scents: 'Scents',
      segment: 'Segment 01',
      forCompanies: 'For companies and brands',
      needScentL1: 'Need a scent',
      needScentL2: 'for your brand?',
      supplierText:
        'We craft custom scents for suppliers, hotels, stores and brands that want to leave a mark.',
      supplierCta: 'Contact us as a supplier',
      labTexture: 'Scent Laboratory // V.01',
      about1: 'A creative scent studio operating at the intersection of design and the senses.',
      about2: 'We engineer olfactory experiences that transform environments with precision and distinction.',
      contact: 'Contact',
      footerTagline: 'DONDOM STUDIO — Instruments of Scent',
    },
    tienda: {
      title: 'Shop',
      catalog: 'Catalog / Series A',
      filterTodos: 'All',
      filterCafe: 'Coffee & Spices',
      filterFlores: 'Flowers',
      filterMaderas: 'Woods',
      filterFrescos: 'Fresh',
      availableSg: 'scent available',
      availablePl: 'scents available',
      empty: 'No scents in this category yet — more coming soon.',
    },
    mocca: {
      breadcrumb: 'Shop / AR 01',
      serie: 'Series A',
      format: 'Aromatic Spray',
      formatLabel: 'Format',
      collectionLabel: 'Collection',
      serieYear: 'Series A — 2026',
      subtitle: 'AR 01 — Aromatic Spray',
      description:
        'Notes of roasted coffee, chocolate and fresh mint. A scent that envelops and lingers. Designed for spaces that seek distinction.',
      selectFormat: 'Select format',
      spray: 'Spray',
      sizeTbd: '250 ml',
      quantity: 'Quantity',
      price: 'Price',
      priceWhatsApp: 'Check availability via WhatsApp',
      buyNow: 'Buy now',
      buyNowWhatsApp: 'Buy now — WhatsApp',
      securePay: 'Secure payment processed by Mercado Pago',
      weContact: "We'll contact you directly to confirm your order",
      moreScents: 'See more scents',
      notFound: 'Product not found',
      imgAlt: 'AR/01 MOCCA — aromatic spray, front view',
      waMessage:
        "Hello DONDOM STUDIO! I'm interested in buying the MOCCA aromatic spray. Could you tell me the price and availability? Quantity: {qty}",
    },
    contacto: {
      kicker: 'Write to us',
      title: 'Contact',
      name: 'Name *',
      namePh: 'Your name',
      phone: 'Phone (optional)',
      phonePh: '+52 00 0000 0000',
      comment: 'Comment *',
      commentPh: 'How can we help you?',
      required: 'Please fill in the required fields (Name and Comment).',
      send: 'Send message',
      sending: 'Sending…',
      sent: 'Message sent! We will get back to you soon.',
      sendAnother: 'Send another message',
      mailNotice: 'Your message goes directly to our team',
      done: 'Done! Check your email app and press send.',
      notOpened: "Nothing opened? Use one of these options:",
      openGmail: 'Open in Gmail',
      copyMsg: 'Copy message',
      copied: 'Copied! ✓',
      orWrite: 'Or write to us directly at',
      emailSubject: 'Message from {nombre} — DONDOM STUDIO',
      emailBody: 'Hello, my name is {nombre}. {comentario}.{telefonoParte} Best regards.',
      emailPhonePart: ' My phone number is {telefono}.',
      emailTo: 'To',
      emailSubjectLabel: 'Subject',
      whatsapp: 'WhatsApp',
      email: 'Email',
      hours: 'Hours',
      hoursValue: 'Mon – Fri / 9:00 – 18:00',
      supplierQ: 'Are you a supplier?',
      supplierText: 'We craft custom scents for brands, hotels and businesses. Call us at {phone}.',
      copyright: '© 2026 DONDOM STUDIO — Instruments of Scent',
    },
    about: {
      kicker: 'Our story',
      titleL1: 'About',
      titleL2: 'Us',
      intro:
        'DonDom Studio is a creative studio dedicated to designing and developing products that transform everyday life. We create objects that combine functionality, design and culture — from apparel to items for the home, hospitality and lifestyle. We are not limited by any category; our work is to imagine, design and launch products people want to keep, use and collect.',
      philosophyLabel: '01 — Philosophy',
      philosophyQuoteL1: '"We don\'t follow an industry.',
      philosophyQuoteL2: 'We follow a vision."',
      philosophySub: 'If a product can be designed better, it can be part of DonDom Studio.',
      missionLabel: '02 — Mission',
      missionTitle: 'Mission',
      mission1:
        'To design products people want to bring into their lives for their quality, functionality and design, building a creative universe that transcends any category.',
      mission2:
        'We don\'t want to be "a clothing brand" or "a home fragrance brand". We want to create a brand capable of designing any object, as long as it represents the philosophy of DonDom Studio.',
      visionLabel: '03 — Vision',
      visionTitle: 'Vision',
      vision:
        'To make DonDom Studio one of the most recognized creative studios in Mexico — and eventually the world — developing products, collections and collaborations that define a way of living.',
      phraseLabel: 'DonDom in one sentence',
      phrase:
        '"A creative studio that designs objects, spaces and experiences to elevate everyday life through honest, functional and timeless design."',
      location: 'DONDOM STUDIO — MEXICO',
      copyright: '© 2026 DONDOM STUDIO',
    },
    products: {
      moccaDescription: 'Limited edition aromatic spray. Notes of coffee, chocolate and fresh mint.',
      placeholderDescription: 'New scent in development.',
    },
    cart: {
      title: 'My cart',
      close: 'Close',
      empty: 'Your cart is empty',
      continueShopping: 'Continue shopping',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      addToCart: 'Add to cart',
      remove: 'Remove',
      freeShippingNote: 'Free shipping on orders over $1,500',
    },
    checkout: {
      title: 'Checkout',
      summary: 'Order summary',
      subtotal: 'Subtotal',
      empty: 'Your cart is empty.',
      goShop: 'Go to shop',
      contactSection: 'Contact details',
      addressSection: 'Shipping address',
      firstName: 'First name(s) *',
      lastName: 'Last name(s) *',
      email: 'Email *',
      emailPh: 'you@email.com',
      phone: 'Phone *',
      phonePh: '+52 00 0000 0000',
      street: 'Street *',
      extNum: 'Ext. number *',
      intNum: 'Int. number',
      zip: 'ZIP code *',
      colonia: 'Neighborhood *',
      city: 'City *',
      municipio: 'Municipality / Borough *',
      state: 'State *',
      notes: 'Delivery notes',
      notesPh: 'References or instructions (optional)',
      required: 'Please fill in all required fields.',
      placeOrder: 'Place order',
      placing: 'Processing…',
      orderOk: 'Order received!',
      orderNum: 'Order number',
      orderNote: "Save your order number. We'll contact you to confirm delivery.",
      payNow: 'Pay now — Mercado Pago',
      orderError: 'There was an error creating your order. Try again or reach us on WhatsApp.',
      backHome: 'Back to home',
    },
  },
} as const;

export type Lang = 'es' | 'en';
type Translations = (typeof translations)['es'];

interface LangContextValue {
  lang: Lang;
  toggle: () => void;
  t: Translations;
}

const LangContext = createContext<LangContextValue>({
  lang: 'es',
  toggle: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Español es el idioma predeterminado; se recuerda la elección del visitante
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem('lang') === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });

  // "fading" controla el fundido suave al cambiar de idioma
  const [fading, setFading] = useState(false);

  const toggle = () => {
    const next: Lang = lang === 'es' ? 'en' : 'es';

    // 1) La página se desvanece (fade out)
    setFading(true);

    // 2) A mitad del fundido, cambiamos el idioma mientras está invisible
    //    y volvemos a aparecer (fade in). El tiempo coincide con la
    //    transición CSS de abajo (250 ms).
    window.setTimeout(() => {
      setLang(next);
      try {
        localStorage.setItem('lang', next);
      } catch {
        // sin localStorage (modo incógnito estricto): el idioma solo dura la visita
      }
      setFading(false);
    }, 250);
  };

  return (
    <LangContext.Provider value={{ lang, toggle, t: translations[lang] }}>
      <div
        style={{
          transition: 'opacity 0.25s ease',
          opacity: fading ? 0 : 1,
        }}
      >
        {children}
      </div>
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
