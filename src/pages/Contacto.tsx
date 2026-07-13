import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';

// ─────────────────────────────────────────────────────────────────────────────
// PARA CONECTAR CON GOOGLE SHEETS:
//   1. Ve a script.google.com → Nuevo proyecto
//   2. Pega el código del archivo "google-apps-script.js" que está en este proyecto
//   3. Despliega como "Aplicación web" (Ejecutar como: yo; Acceso: Cualquier usuario)
//   4. Copia la URL generada y pégala abajo en SHEET_URL
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_URL = ''; // <-- Aquí va la URL de Google Apps Script cuando esté lista

interface FormData {
  nombre: string;
  correo: string;
  telefono: string;
  comentario: string;
}

const EMPTY: FormData = { nombre: '', correo: '', telefono: '', comentario: '' };

export default function Contacto() {
  const [form,    setForm]    = useState<FormData>(EMPTY);
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!form.nombre || !form.correo) {
      setErrMsg('Por favor llena los campos obligatorios (Nombre y Correo).');
      return;
    }
    setErrMsg('');
    setStatus('loading');

    // Si aún no hay URL de Google Sheets, simula éxito para pruebas
    if (!SHEET_URL) {
      setTimeout(() => setStatus('ok'), 1000);
      return;
    }

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', // necesario para Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fecha: new Date().toISOString() }),
      });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  const inputBase =
    'w-full border border-brand-gray-300 px-4 py-3 font-mono text-[11px] uppercase tracking-widest placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-blue transition-colors bg-brand-white';

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />

      <main className="max-w-[1440px] mx-auto px-8 md:px-16 py-16">

        {/* Encabezado */}
        <div className="mb-14 border-b border-brand-black pb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400 mb-2">
            Escríbenos
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter">
            Contacto
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* ── FORMULARIO ── */}
          <div className="flex-1 max-w-xl">
            {status === 'ok' ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-6 py-20 text-center"
              >
                <CheckCircle className="w-12 h-12 text-brand-blue" />
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tighter mb-2">¡Mensaje enviado!</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
                    Te responderemos a la brevedad.
                  </p>
                </div>
                <button
                  onClick={() => { setStatus('idle'); setForm(EMPTY); }}
                  className="font-mono text-[10px] uppercase tracking-widest border border-brand-gray-300 px-6 py-3 hover:border-brand-black transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                {/* Nombre + Correo */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className={inputBase}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      name="correo"
                      placeholder="tu@correo.com"
                      value={form.correo}
                      onChange={handleChange}
                      className={inputBase}
                      required
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="+52 55 0000 0000"
                    value={form.telefono}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>

                {/* Comentario */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                    Comentario
                  </label>
                  <textarea
                    name="comentario"
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.comentario}
                    onChange={handleChange}
                    rows={6}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                {/* Error */}
                {errMsg && (
                  <p className="font-mono text-[9px] uppercase tracking-widest text-red-500">
                    {errMsg}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  <span>{status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {status === 'error' && (
                  <p className="font-mono text-[9px] uppercase tracking-widest text-red-500">
                    Hubo un error. Escríbenos directamente a contacto@dondonstudio.com
                  </p>
                )}
              </motion.form>
            )}
          </div>

          {/* ── DATOS DE CONTACTO ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-72 flex flex-col gap-10"
          >
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3 border-b border-brand-gray-200 pb-2">
                WhatsApp
              </p>
              <a
                href="https://wa.me/5215512345678"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-widest hover:text-brand-blue transition-colors"
              >
                +52 55 1234 5678
              </a>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3 border-b border-brand-gray-200 pb-2">
                Correo
              </p>
              <a
                href="mailto:contacto@dondonstudio.com"
                className="font-mono text-[10px] uppercase tracking-widest hover:text-brand-blue transition-colors break-all"
              >
                contacto@dondonstudio.com
              </a>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3 border-b border-brand-gray-200 pb-2">
                Horario
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest">
                Lun – Vie / 9:00 – 18:00
              </p>
            </div>

            <div className="bg-brand-gray-100 border border-brand-gray-200 p-6">
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-2">
                ¿Eres proveedor?
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest leading-relaxed">
                Formulamos aromas a medida para marcas, hoteles y comercios.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-brand-gray-200 px-8 py-6 mt-16">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
          © 2026 DONDOM STUDIO — Instrumentos de Aroma
        </p>
      </footer>
    </div>
  );
}
