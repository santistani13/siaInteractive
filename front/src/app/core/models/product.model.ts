export type ProductType = 'almacen' | 'congelados' | 'kiosco' | 'limpieza' | 'bebidas';

export interface Product {
  id: number;
  nombre: string;
  detalle: string;
  tipo: ProductType;
  precio: number;
}

export interface ProductFilter {
  query: string;
  tipo: string;
  minPrice: number | null;
  maxPrice: number | null;
}
