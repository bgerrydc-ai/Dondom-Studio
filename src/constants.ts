export interface Product {
  id: string;
  code: string;
  name: string;
  series: string;
  image: string;
  description: string;
  slug: string;
  available: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "001",
    code: "AR 01",
    name: "MOCCA",
    series: "Serie A",
    slug: "mocca",
    image: "/products/ar01-ingredientes.jpg",
    description: "Spray aromático de edición limitada. Notas de café, chocolate y menta fresca.",
    available: true,
  },
  {
    id: "002",
    code: "AR 02",
    name: "CYAN",
    series: "Serie A",
    slug: "cyan",
    image: "",
    description: "Próximamente.",
    available: false,
  }
];

export const CONTACT = {
  phone: "+52 55 1234 5678",
  whatsapp: "5215512345678",
  email: "contacto@dondonstudio.com",
};
