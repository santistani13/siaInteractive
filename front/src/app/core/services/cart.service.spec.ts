import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';

const PRODUCT_A: Product = { id: 1, nombre: 'Arroz', detalle: 'Arroz largo fino', tipo: 'almacen', precio: 1850 };
const PRODUCT_B: Product = { id: 2, nombre: 'Leche', detalle: 'Leche entera UTH', tipo: 'bebidas', precio: 1400 };

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────────────────
  it('should start empty', () => {
    expect(service.isEmpty()).toBe(true);
    expect(service.totalItems()).toBe(0);
    expect(service.total()).toBe(0);
    expect(service.items().length).toBe(0);
  });

  // ── add ────────────────────────────────────────────────────────────────────
  it('should add a new product with quantity 1', () => {
    service.add(PRODUCT_A);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(1);
    expect(service.isEmpty()).toBe(false);
  });

  it('should increment quantity when adding the same product again', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_A);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
  });

  it('should add multiple different products independently', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_B);
    expect(service.items().length).toBe(2);
  });

  // ── remove ─────────────────────────────────────────────────────────────────
  it('should remove a product completely', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_B);
    service.remove(PRODUCT_A.id);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].product.id).toBe(PRODUCT_B.id);
  });

  it('should not affect other products when removing one', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_B);
    service.remove(PRODUCT_A.id);
    expect(service.getQuantity(PRODUCT_B.id)).toBe(1);
  });

  // ── decreaseQuantity ───────────────────────────────────────────────────────
  it('should decrease quantity by 1', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_A);
    service.decreaseQuantity(PRODUCT_A.id);
    expect(service.getQuantity(PRODUCT_A.id)).toBe(1);
  });

  it('should remove product when quantity reaches 0 via decrease', () => {
    service.add(PRODUCT_A);
    service.decreaseQuantity(PRODUCT_A.id);
    expect(service.isEmpty()).toBe(true);
  });

  // ── updateQuantity ─────────────────────────────────────────────────────────
  it('should update quantity to a specific value', () => {
    service.add(PRODUCT_A);
    service.updateQuantity(PRODUCT_A.id, 5);
    expect(service.getQuantity(PRODUCT_A.id)).toBe(5);
  });

  it('should remove product when updateQuantity is called with 0', () => {
    service.add(PRODUCT_A);
    service.updateQuantity(PRODUCT_A.id, 0);
    expect(service.isEmpty()).toBe(true);
  });

  it('should remove product when updateQuantity is called with a negative number', () => {
    service.add(PRODUCT_A);
    service.updateQuantity(PRODUCT_A.id, -1);
    expect(service.isEmpty()).toBe(true);
  });

  // ── clear ──────────────────────────────────────────────────────────────────
  it('should clear all items', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_B);
    service.clear();
    expect(service.isEmpty()).toBe(true);
    expect(service.totalItems()).toBe(0);
  });

  // ── computed: total & totalItems ───────────────────────────────────────────
  it('should calculate total correctly', () => {
    service.add(PRODUCT_A);  // 1850
    service.add(PRODUCT_A);  // × 2 = 3700
    service.add(PRODUCT_B);  // + 1400 = 5100
    expect(service.total()).toBe(5100);
  });

  it('should calculate totalItems correctly', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_A);
    service.add(PRODUCT_B);
    expect(service.totalItems()).toBe(3);
  });

  it('should recalculate total after removal', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_B);
    service.remove(PRODUCT_A.id);
    expect(service.total()).toBe(PRODUCT_B.precio);
  });

  // ── isInCart / getQuantity ─────────────────────────────────────────────────
  it('should return false for isInCart when product not added', () => {
    expect(service.isInCart(PRODUCT_A.id)).toBe(false);
  });

  it('should return true for isInCart after adding', () => {
    service.add(PRODUCT_A);
    expect(service.isInCart(PRODUCT_A.id)).toBe(true);
  });

  it('should return 0 for getQuantity when product not in cart', () => {
    expect(service.getQuantity(PRODUCT_A.id)).toBe(0);
  });

  // ── localStorage persistence ───────────────────────────────────────────────
  it('should persist cart to localStorage on add', () => {
    service.add(PRODUCT_A);
    const raw = localStorage.getItem('sia_cart');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed[0].product.id).toBe(PRODUCT_A.id);
    expect(parsed[0].quantity).toBe(1);
  });

  it('should update localStorage when quantity changes', () => {
    service.add(PRODUCT_A);
    service.add(PRODUCT_A);
    const parsed = JSON.parse(localStorage.getItem('sia_cart')!);
    expect(parsed[0].quantity).toBe(2);
  });

  it('should restore cart from localStorage on init', () => {
    const saved = [{ product: PRODUCT_A, quantity: 3 }];
    localStorage.setItem('sia_cart', JSON.stringify(saved));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(CartService);

    expect(restored.items().length).toBe(1);
    expect(restored.getQuantity(PRODUCT_A.id)).toBe(3);
    expect(restored.total()).toBe(PRODUCT_A.precio * 3);
  });

  it('should start empty when localStorage contains invalid JSON', () => {
    localStorage.setItem('sia_cart', 'invalid-json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const recovered = TestBed.inject(CartService);

    expect(recovered.isEmpty()).toBe(true);
  });
});
