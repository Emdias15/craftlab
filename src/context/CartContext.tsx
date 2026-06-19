"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  foto: string;
  qty: number;
};

type State = { items: CartItem[] };
type Action =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty?: number }
  | { type: "REMOVE"; id: string }
  | { type: "INC"; id: string }
  | { type: "DEC"; id: string }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const qty = action.qty ?? 1;
      const exists = state.items.find(i => i.id === action.item.id);
      if (exists) {
        return { items: state.items.map(i => i.id === action.item.id ? { ...i, qty: i.qty + qty } : i) };
      }
      return { items: [...state.items, { ...action.item, qty }] };
    }
    case "REMOVE":
      return { items: state.items.filter(i => i.id !== action.id) };
    case "INC":
      return { items: state.items.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i) };
    case "DEC":
      return { items: state.items.map(i => i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextType = {
  items: CartItem[];
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("craftlab-cart");
    if (saved) dispatch({ type: "CLEAR" });
    if (saved) {
      const parsed: CartItem[] = JSON.parse(saved);
      parsed.forEach(i => {
        for (let q = 0; q < i.qty; q++) dispatch({ type: "ADD", item: i });
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("craftlab-cart", JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((s, i) => s + i.preco * i.qty, 0);
  const count = state.items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      total,
      count,
      open,
      setOpen,
      addItem: (item, qty) => { dispatch({ type: "ADD", item, qty }); setOpen(true); },
      removeItem: id => dispatch({ type: "REMOVE", id }),
      inc: id => dispatch({ type: "INC", id }),
      dec: id => dispatch({ type: "DEC", id }),
      clear: () => dispatch({ type: "CLEAR" }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
