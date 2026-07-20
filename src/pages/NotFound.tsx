import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../i18n';
import { usePageTitle } from '../usePageTitle';

// Página que se muestra cuando la dirección no existe (error 404)
export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useLang();
  usePageTitle('404');

  return (
    <div className="min-h-screen bg-brand-white">
      <Header />
      <main className="max-w-[700px] mx-auto px-8 py-24 flex flex-col items-center text-center gap-6">
        <h1 className="text-8xl md:text-9xl font-extrabold tracking-tighter text-brand-blue">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter">
          {t.notFound.title}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-brand-gray-400">
          {t.notFound.text}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 flex items-center gap-3 bg-brand-blue text-white font-mono text-[10px] uppercase tracking-widest px-8 py-4 hover:bg-brand-black hover:text-brand-white transition-colors group"
        >
          <span>{t.notFound.back}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </main>
    </div>
  );
}
