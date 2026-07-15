import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail } from 'lucide-react';
import Header from '../components/Header';
import { CONTACT } from '../constants';
import { useLang } from '../i18n';
import { supabase } from '../supabase';

// ─────────────────────────────────────────────────────────────────────────────
// CÓMO FUNCIONA ESTE FORMULARIO:
// Al presionar "Enviar mensaje" se intenta abrir la app de correo
// predeterminada del visitante con el mensaje ya redactado. Si no tiene
// ninguna configurada, aparecen respaldos: abrir Gmail web o copiar el
// mensaje. El destinatario es CONTACT.email (src/constants.ts).
// ─────────────────────────────────────────────────────────────────────────────

interface FormData {
  nombre: string;
  telefono: string;
  comentario: string;
}

const EMPTY: FormData = { nombre: '', telefono: '', comentario: '' };

export default function Contacto() {
  const { t } = useLang();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [sending, setSending] = useState(false); // guardando en la base de datos
  const [sent, setSent] = useState(false);       // guardado con éxito
  const [opened, setOpened] = useState(false);   // plan B: opciones de correo
  const [copied, setCopied] = useState(false);   // ya copió el mensaje
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // El mensaje se redacta con lo que haya en el formulario, en el idioma activo
  const telefonoParte = form.telefono.trim()
    ? t.contacto.emailPhonePart.replace('{telefono}', form.telefono.trim())
    : '';
  const body = t.contacto.emailBody
    .replace('{nombre}', form.nombre.trim())
    .replace('{comentario}', form.comentario.trim())
    .replace('{telefonoParte}', telefonoParte);
  const subject = t.contacto.emailSubject.replace('{nombre}', form.nombre.trim());

  // Tres caminos para que el mensaje llegue, del más directo al más manual:
  const mailtoUrl = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validación: nombre y comentario son obligatorios
    if (!form.nombre.trim() || !form.comentario.trim()) {
      setErrMsg(t.contacto.required);
      return;
    }
    setErrMsg('');
    setSending(true);

    // Camino principal: guardar el mensaje en la base de datos (Supabase)
    const { error } = await supabase.from('mensajes_contacto').insert({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || null,
      comentario: form.comentario.trim(),
    });

    setSending(false);

    if (!error) {
      // Guardado con éxito
      setSent(true);
      setOpened(false);
      return;
    }

    // Plan B: si la base de datos falló (sin internet, etc.), ofrecemos
    // las opciones de correo para que el mensaje no se pierda
    setOpened(true);
    try {
      window.location.href = mailtoUrl;
    } catch {
      // sin app de correo configurada: las opciones de respaldo ya están visibles
    }
  };

  // Plan B: copiar el mensaje completo al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${t.contacto.emailTo}: ${CONTACT.email}\n${t.contacto.emailSubjectLabel}: ${subject}\n\n${body}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Si el navegador bloquea el portapapeles, el visitante aún tiene
      // Gmail y el correo visible
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
            {t.contacto.kicker}
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter">
            {t.contacto.title}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* ── FORMULARIO ── */}
          <div className="flex-1 max-w-xl">
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* Nombre */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.contacto.name}
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder={t.contacto.namePh}
                  value={form.nombre}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.contacto.phone}
                </label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder={t.contacto.phonePh}
                  value={form.telefono}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              {/* Comentario */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-1">
                  {t.contacto.comment}
                </label>
                <textarea
                  name="comentario"
                  placeholder={t.contacto.commentPh}
                  value={form.comentario}
                  onChange={handleChange}
                  rows={6}
                  className={`${inputBase} resize-none`}
                  required
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
                disabled={sending}
                className="flex items-center justify-between gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span>{sending ? t.contacto.sending : t.contacto.send}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Aviso de cómo funciona */}
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 flex items-center gap-2">
                <Mail className="w-3 h-3 shrink-0" />
                {t.contacto.mailNotice}
              </p>

              {/* Éxito: el mensaje quedó guardado en la base de datos */}
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-brand-blue p-5 flex flex-col gap-4"
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-brand-blue">
                    {t.contacto.sent}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm(EMPTY);
                    }}
                    className="self-start font-mono text-[9px] uppercase tracking-widest border border-brand-gray-300 px-4 py-2.5 hover:border-brand-blue hover:text-brand-blue transition-colors"
                  >
                    {t.contacto.sendAnother}
                  </button>
                </motion.div>
              )}

              {/* Confirmación + respaldos por si la app de correo no abrió */}
              {opened && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-brand-blue p-5 flex flex-col gap-4"
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-brand-blue">
                    {t.contacto.done}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                    {t.contacto.notOpened}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center border border-brand-gray-300 font-mono text-[9px] uppercase tracking-widest px-4 py-3 hover:border-brand-blue hover:text-brand-blue transition-colors"
                    >
                      {t.contacto.openGmail}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 text-center border border-brand-gray-300 font-mono text-[9px] uppercase tracking-widest px-4 py-3 hover:border-brand-blue hover:text-brand-blue transition-colors"
                    >
                      {copied ? t.contacto.copied : t.contacto.copyMsg}
                    </button>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400">
                    {t.contacto.orWrite} {CONTACT.email}
                  </p>
                </motion.div>
              )}
            </motion.form>
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
                {t.contacto.whatsapp}
              </p>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-widest hover:text-brand-blue transition-colors"
              >
                {CONTACT.phone}
              </a>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3 border-b border-brand-gray-200 pb-2">
                {t.contacto.email}
              </p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-mono text-[10px] uppercase tracking-widest hover:text-brand-blue transition-colors break-all"
              >
                {CONTACT.email}
              </a>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-3 border-b border-brand-gray-200 pb-2">
                {t.contacto.hours}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest">
                {t.contacto.hoursValue}
              </p>
            </div>

            <div className="bg-brand-gray-100 border border-brand-gray-200 p-6">
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mb-2">
                {t.contacto.supplierQ}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest leading-relaxed">
                {t.contacto.supplierText.replace('{phone}', CONTACT.phone)}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-brand-gray-200 px-8 py-6 mt-16">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 text-center">
          {t.contacto.copyright}
        </p>
      </footer>
    </div>
  );
}
