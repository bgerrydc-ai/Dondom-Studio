import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, ShoppingBag } from 'lucide-react';
import { useLang } from '../i18n';
import { useCart } from '../cart';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, toggle, t } = useLang();
  const { count, open: openCart } = useCart();

  const LINKS = [
    { to: '/',              label: t.nav.inicio },
    { to: '/tienda',        label: t.nav.tienda },
    { to: '/contacto',      label: t.nav.contacto },
    { to: '/quienes-somos', label: t.nav.quienesSomos },
  ];

  // ¿Está activo el modo oscuro? Lo leemos de la clase del <html>
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'),
  );

  // Interruptor: prende/apaga el modo oscuro y lo recuerda para la próxima visita
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !root.classList.contains('dark');
    root.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch (e) {}
    setIsDark(next);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-white/95 backdrop-blur-md border-b border-brand-gray-200">
      <div className="px-8 py-5 flex justify-between items-center max-w-[1440px] mx-auto">
        {/* Logo */}
        <NavLink
          to="/"
          className="font-extrabold text-xs tracking-widest uppercase hover:text-brand-blue transition-colors"
        >
          DONDOM STUDIO
        </NavLink>

        {/* Lado derecho: navegación + idioma + tema + menú móvil */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-10">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `font-mono text-[10px] uppercase tracking-widest pb-0.5 transition-colors ${
                    isActive
                      ? 'text-brand-blue border-b border-brand-blue'
                      : 'text-brand-gray-400 hover:text-brand-black'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Carrito con contador */}
          <button
            onClick={openCart}
            aria-label={t.cart.title}
            className="relative p-1.5 hover:text-brand-blue transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {/* Interruptor de idioma ES / EN */}
          <button
            onClick={toggle}
            aria-label="Cambiar idioma / Change language"
            className="font-mono text-[10px] tracking-widest border border-brand-gray-300 px-2.5 py-1.5 hover:border-brand-blue transition-colors"
          >
            <span className={lang === 'es' ? 'text-brand-blue font-bold' : 'text-brand-gray-400'}>
              ES
            </span>
            <span className="text-brand-gray-400"> / </span>
            <span className={lang === 'en' ? 'text-brand-blue font-bold' : 'text-brand-gray-400'}>
              EN
            </span>
          </button>

          {/* Interruptor modo claro / oscuro */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="p-1.5 border border-brand-gray-300 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Botón hamburguesa (móvil) */}
          <button
            className="md:hidden p-1 hover:text-brand-blue transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {open && (
        <nav className="md:hidden px-8 pb-6 flex flex-col gap-5 border-t border-brand-gray-200 pt-5">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  isActive ? 'text-brand-blue' : 'text-brand-gray-400'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
