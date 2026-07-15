import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// CONEXIÓN CON SUPABASE (la base de datos)
// ═══════════════════════════════════════════════════════════════════
// La llave de abajo es la "publishable" (pública): está DISEÑADA para
// ir en el sitio web. La seguridad real vive en las reglas (RLS) de la
// base de datos: el público solo puede leer productos, enviar mensajes
// de contacto y crear pedidos. Nada más.
// La llave secreta (service_role) NUNCA va aquí.
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://atfxlrsufenzchkjbiwe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AG36P8hSZw0jg-7WTsx9jQ_7ToRIUVE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
