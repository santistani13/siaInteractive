import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { firstValueFrom } from 'rxjs';

const MOCK_PRODUCTS: Product[] = [
  { id: 1, nombre: 'Arroz Largo Fino', detalle: 'Arroz de primera calidad', tipo: 'almacen',    precio: 1850 },
  { id: 2, nombre: 'Helado Chocolate', detalle: 'Helado cremoso',           tipo: 'congelados', precio: 2800 },
  { id: 3, nombre: 'Papas Fritas',     detalle: 'Snack clásico',            tipo: 'kiosco',     precio: 850  },
  { id: 4, nombre: 'Leche Entera',     detalle: 'Leche UTH 1 litro',        tipo: 'bebidas',    precio: 1400 },
];

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────────────────
  it('should start with empty products and loading false', () => {
    expect(service.products().length).toBe(0);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  // ── loadProducts ───────────────────────────────────────────────────────────
  it('should set loading to true while request is in flight', () => {
    service.loadProducts();
    expect(service.loading()).toBe(true);
    http.expectOne(r => r.url.includes('/api/products')).flush([]);
    expect(service.loading()).toBe(false);
  });

  it('should populate products after successful response', () => {
    service.loadProducts();
    http.expectOne(r => r.url.includes('/api/products')).flush(MOCK_PRODUCTS);
    expect(service.products().length).toBe(4);
    expect(service.products()[0].nombre).toBe('Arroz Largo Fino');
  });

  it('should clear error on new load', () => {
    service.loadProducts();
    http.expectOne(r => r.url.includes('/api/products'))
      .flush(null, { status: 500, statusText: 'Error' });

    service.loadProducts();
    expect(service.error()).toBeNull();
    http.expectOne(r => r.url.includes('/api/products')).flush(MOCK_PRODUCTS);
  });

  it('should fall back to local data on HTTP error', () => {
    service.loadProducts();
    http.expectOne(r => r.url.includes('/api/products'))
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(service.products().length).toBeGreaterThan(0);
    expect(service.loading()).toBe(false);
  });

  // ── filtros via queryParams ────────────────────────────────────────────────
  it('should include query param in request', () => {
    service.loadProducts({ query: 'arroz' });
    const req = http.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.params.get('query')).toBe('arroz');
    req.flush([]);
  });

  it('should include tipo param in request', () => {
    service.loadProducts({ tipo: 'almacen' });
    const req = http.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.params.get('tipo')).toBe('almacen');
    req.flush([]);
  });

  it('should include price range params in request', () => {
    service.loadProducts({ minPrice: 500, maxPrice: 2000 });
    const req = http.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.params.get('minPrice')).toBe('500');
    expect(req.request.params.get('maxPrice')).toBe('2000');
    req.flush([]);
  });

  it('should not include empty string params in request', () => {
    service.loadProducts({ query: '', tipo: '' });
    const req = http.expectOne(r => r.url.includes('/api/products'));
    expect(req.request.params.has('query')).toBe(false);
    expect(req.request.params.has('tipo')).toBe(false);
    req.flush([]);
  });

  // ── computed: tipos ────────────────────────────────────────────────────────
  it('should compute unique sorted tipos from products', () => {
    service.loadProducts();
    http.expectOne(r => r.url.includes('/api/products')).flush(MOCK_PRODUCTS);
    const tipos = service.tipos();
    expect(tipos).toContain('almacen');
    expect(tipos).toContain('bebidas');
    expect(tipos).toContain('congelados');
    expect(tipos).toContain('kiosco');
    expect(tipos.length).toBe(new Set(tipos).size);
  });

  // ── getById ────────────────────────────────────────────────────────────────
  it('should return product from cache without HTTP call', async () => {
    service.loadProducts();
    http.expectOne(r => r.url.includes('/api/products')).flush(MOCK_PRODUCTS);

    const product = await firstValueFrom(service.getById(1));
    expect(product?.nombre).toBe('Arroz Largo Fino');
    http.expectNone(r => r.url.includes('/api/products/1'));
  });

  it('should fetch from API when product is not in cache', async () => {
    const promise = firstValueFrom(service.getById(1));
    http.expectOne(r => r.url.includes('/api/products/1')).flush(MOCK_PRODUCTS[0]);
    const product = await promise;
    expect(product?.id).toBe(1);
  });
});
