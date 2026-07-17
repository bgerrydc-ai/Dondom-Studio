import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { AuthProvider } from './auth';
import { ProductsProvider } from './products';
import { CartProvider } from './cart';
import CartDrawer from './components/CartDrawer';
import Home         from './pages/Home';
import Tienda       from './pages/Tienda';
import Contacto     from './pages/Contacto';
import QuienesSomos from './pages/QuienesSomos';
import Mocca        from './pages/Mocca';
import Checkout     from './pages/Checkout';
import Cuenta       from './pages/Cuenta';
import Terminos     from './pages/Terminos';
import Privacidad   from './pages/Privacidad';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/tienda"        element={<Tienda />} />
                <Route path="/contacto"      element={<Contacto />} />
                <Route path="/quienes-somos" element={<QuienesSomos />} />
                <Route path="/mocca"         element={<Mocca />} />
                <Route path="/checkout"      element={<Checkout />} />
                <Route path="/cuenta"        element={<Cuenta />} />
                <Route path="/terminos"      element={<Terminos />} />
                <Route path="/privacidad"    element={<Privacidad />} />
              </Routes>
              {/* La ventanita del carrito vive fuera de las rutas para que
                  esté disponible en todas las páginas */}
              <CartDrawer />
            </BrowserRouter>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
