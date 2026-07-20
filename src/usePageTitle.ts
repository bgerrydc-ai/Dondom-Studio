import { useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════
// TÍTULO DE LA PESTAÑA DEL NAVEGADOR
// ═══════════════════════════════════════════════════════════════════
// Cada página llama usePageTitle('Tienda') y la pestaña del navegador
// muestra "Tienda — DONDOM STUDIO". Ayuda al visitante a ubicarse
// cuando tiene varias pestañas y mejora cómo aparece el sitio en Google.
// ═══════════════════════════════════════════════════════════════════

const BASE = 'DONDOM STUDIO';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Instrumentos de Aroma`;
    // Al salir de la página, regresamos el título general
    return () => {
      document.title = `${BASE} — Instrumentos de Aroma`;
    };
  }, [title]);
}
