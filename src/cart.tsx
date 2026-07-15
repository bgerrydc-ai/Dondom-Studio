import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from './constants';

// ═══════════════════════════════════════════════════════════════════
// EL CARRITO (estado global)
// ═══════════════════════════════════════════════════════════════════
// Guarda los productos que el visitante va agregando. Cualquier página
// puede usarlo con:  const { add, items, ... } = useCart();
// Se recuerda en el navegador (localStorage) aunque cierre la pestaña.
// ═══════════════════════════════════════════════════════════════════

export interface CartItem {
  id: string;
  name: string;
  code: string;
  size: string;
  priceMXN: number;
  image: string;
  qty: number;
}

interface CartValue {
  items: CartItem[];
  count: number;         // total de piezas
  subtotalMXN: number;   // suma de precios
  isOpen: boolean;       // ¿está abierta la ventanita?
  open: () => void;
  close: () => void;
  add: (product: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Cada vez que cambia el carrito, lo guardamos en el navegador
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {
      // sin localStorage: el carrito solo dura la visita
    }
  }, [items]);

  const add = (product: Product, qty: number = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        // Ya estaba: solo sumamos la cantidad
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i,
        );
      }
      // Nuevo: lo agregamos
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          code: product.code,
          size: product.size,
          priceMXN: product.priceMXN,
          image: product.image,
          qty,
        },
      ];
    });
    setIsOpen(true); // abrimos la ventanita al agregar
  };

  const setQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    );
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotalMXN = items.reduce((s, i) => s + i.priceMXN * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotalMXN,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        add,
        setQty,
        remove,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
