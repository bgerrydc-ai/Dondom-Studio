import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home         from './pages/Home';
import Tienda       from './pages/Tienda';
import Contacto     from './pages/Contacto';
import QuienesSomos from './pages/QuienesSomos';
import Mocca        from './pages/Mocca';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/tienda"        element={<Tienda />} />
        <Route path="/contacto"      element={<Contacto />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/mocca"         element={<Mocca />} />
      </Routes>
    </BrowserRouter>
  );
}
