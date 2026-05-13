import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, ProductFilter } from '../models/product.model';
import { catchError, finalize, of, tap } from 'rxjs';

const PRODUCTS_FALLBACK: Product[] = [
  { id: 1, nombre: 'Arroz Largo Fino', detalle: 'Arroz largo fino de primera calidad. Bolsa de 1kg.', tipo: 'almacen', precio: 1850 },
  { id: 2, nombre: 'Harina 000 Blanca', detalle: 'Harina de trigo triple cero para panificación. Bolsa de 1kg.', tipo: 'almacen', precio: 1200 },
  { id: 3, nombre: 'Aceite de Girasol', detalle: 'Aceite de girasol puro. Botella de 1.5 litros.', tipo: 'almacen', precio: 2750 },
  { id: 4, nombre: 'Fideos Spaghetti', detalle: 'Spaghetti de sémola de trigo candeal. Paquete de 500g.', tipo: 'almacen', precio: 980 },
  { id: 5, nombre: 'Salsa de Tomate Casera', detalle: 'Salsa de tomate con hierbas aromáticas. Frasco de 420g.', tipo: 'almacen', precio: 1450 },
  { id: 6, nombre: 'Azúcar Blanca', detalle: 'Azúcar refinada de caña. Bolsa de 1kg.', tipo: 'almacen', precio: 1100 },
  { id: 7, nombre: 'Lentejas', detalle: 'Lentejas secas de primera selección. Bolsa de 500g.', tipo: 'almacen', precio: 870 },
  { id: 8, nombre: 'Atún al Natural', detalle: 'Atún en agua, alto contenido proteico. Lata de 170g.', tipo: 'almacen', precio: 1350 },
  { id: 9, nombre: 'Pizza Muzzarella Congelada', detalle: 'Pizza de muzzarella con masa crocante. Tamaño mediano 450g.', tipo: 'congelados', precio: 3200 },
  { id: 10, nombre: 'Helado de Chocolate', detalle: 'Helado cremoso de chocolate con trozos de cacao. Pote de 1 litro.', tipo: 'congelados', precio: 2800 },
  { id: 11, nombre: 'Pollo Entero Congelado', detalle: 'Pollo entero eviscerado y limpio. Peso aproximado 1.8kg.', tipo: 'congelados', precio: 5500 },
  { id: 12, nombre: 'Vegetales Mixtos Congelados', detalle: 'Arvejas, choclo y zanahoria congelados. Bolsa de 500g.', tipo: 'congelados', precio: 1600 },
  { id: 13, nombre: 'Empanadas de Carne Congeladas', detalle: 'Empanadas criollas de carne cortada a cuchillo. Pack de 12 unidades.', tipo: 'congelados', precio: 4200 },
  { id: 14, nombre: 'Medallones de Merluza', detalle: 'Medallones de merluza rebozados. Pack de 500g.', tipo: 'congelados', precio: 3800 },
  { id: 15, nombre: 'Papas Fritas Congeladas', detalle: 'Papas precocidas y congeladas. Bolsa de 700g.', tipo: 'congelados', precio: 1900 },
  { id: 16, nombre: 'Papas Fritas Clásicas', detalle: 'Papas fritas onduladas sabor original. Bolsa de 120g.', tipo: 'kiosco', precio: 850 },
  { id: 17, nombre: 'Alfajor Doble Chocolate', detalle: 'Alfajor triple con dulce de leche bañado en chocolate. Unidad 80g.', tipo: 'kiosco', precio: 750 },
  { id: 18, nombre: 'Galletas de Agua', detalle: 'Galletas crackers livianas. Pack 200g.', tipo: 'kiosco', precio: 680 },
  { id: 19, nombre: 'Chicles Menta', detalle: 'Chicles de menta intensa, sin azúcar. Blíster de 10 unidades.', tipo: 'kiosco', precio: 350 },
  { id: 20, nombre: 'Caramelos Surtidos', detalle: 'Mix de caramelos de diferentes sabores. Bolsa de 150g.', tipo: 'kiosco', precio: 490 },
  { id: 21, nombre: 'Barrita Cereal con Chocolate', detalle: 'Barrita de cereal con chips de chocolate. Unidad 30g.', tipo: 'kiosco', precio: 420 },
  { id: 22, nombre: 'Detergente Lavavajillas', detalle: 'Detergente concentrado para vajilla. Botella de 750ml.', tipo: 'limpieza', precio: 1750 },
  { id: 23, nombre: 'Jabón en Polvo', detalle: 'Jabón en polvo para ropa, con suavizante. Bolsa 1kg.', tipo: 'limpieza', precio: 2200 },
  { id: 24, nombre: 'Limpiador Multiuso', detalle: 'Limpiador líquido para superficies. Botella 500ml.', tipo: 'limpieza', precio: 1300 },
  { id: 25, nombre: 'Lavandina Concentrada', detalle: 'Lavandina al 55g/L, desinfectante potente. Botella de 1 litro.', tipo: 'limpieza', precio: 980 },
  { id: 26, nombre: 'Jugo de Naranja Natural', detalle: 'Jugo de naranja 100% exprimida, sin conservantes. Botella 1 litro.', tipo: 'bebidas', precio: 2100 },
  { id: 27, nombre: 'Agua Mineral Sin Gas', detalle: 'Agua mineral natural de manantial. Botella de 1.5 litros.', tipo: 'bebidas', precio: 650 },
  { id: 28, nombre: 'Gaseosa Cola', detalle: 'Gaseosa cola clásica, presentación familiar. Botella de 2.25 litros.', tipo: 'bebidas', precio: 1800 },
  { id: 29, nombre: 'Leche Entera', detalle: 'Leche entera de larga vida UTH, rica en calcio. Caja de 1 litro.', tipo: 'bebidas', precio: 1400 },
  { id: 30, nombre: 'Cerveza Rubia Lager', detalle: 'Cerveza rubia tipo Lager, suave y refrescante. Lata de 473ml.', tipo: 'bebidas', precio: 1150 },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5001/api/products';

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly tipos = computed(() =>
    [...new Set(this.products().map(p => p.tipo))].sort()
  );

  loadProducts(filter?: Partial<ProductFilter>): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (filter?.query) params = params.set('query', filter.query);
    if (filter?.tipo) params = params.set('tipo', filter.tipo);
    if (filter?.minPrice != null) params = params.set('minPrice', filter.minPrice);
    if (filter?.maxPrice != null) params = params.set('maxPrice', filter.maxPrice);

    this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      tap(products => this.products.set(products)),
      catchError(() => {
        this.products.set(this._applyLocalFilter(filter));
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  getById(id: number) {
    const fromCache = this.products().find(p => p.id === id);
    if (fromCache) return of(fromCache);

    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(PRODUCTS_FALLBACK.find(p => p.id === id) ?? null))
    );
  }

  private _applyLocalFilter(filter?: Partial<ProductFilter>): Product[] {
    return PRODUCTS_FALLBACK.filter(p => {
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        if (!p.nombre.toLowerCase().includes(q) && !p.detalle.toLowerCase().includes(q)) return false;
      }
      if (filter?.tipo && p.tipo !== filter.tipo) return false;
      if (filter?.minPrice != null && p.precio < filter.minPrice) return false;
      if (filter?.maxPrice != null && p.precio > filter.maxPrice) return false;
      return true;
    });
  }
}
