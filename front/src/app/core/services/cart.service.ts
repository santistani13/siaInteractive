import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'sia_cart';

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.precio * item.quantity, 0)
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
  }

  add(product: Product): void {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    this.save();
  }

  remove(productId: number): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
    this.save();
  }

  decreaseQuantity(productId: number): void {
    this._items.update(items =>
      items
        .map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
    this.save();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
    this.save();
  }

  clear(): void {
    this._items.set([]);
    this.save();
  }

  isInCart(productId: number): boolean {
    return this._items().some(i => i.product.id === productId);
  }

  getQuantity(productId: number): number {
    return this._items().find(i => i.product.id === productId)?.quantity ?? 0;
  }
}
