import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

interface CategoryDef {
  tipo: string;
  label: string;
  icon: string;
  color: string;
}

const CATEGORIES: CategoryDef[] = [
  { tipo: 'almacen',   label: 'Almacén',    icon: '🏪', color: '#3498db' },
  { tipo: 'bebidas',   label: 'Bebidas',    icon: '🥤', color: '#9b59b6' },
  { tipo: 'congelados',label: 'Congelados', icon: '🧊', color: '#00b4d8' },
  { tipo: 'kiosco',    label: 'Kiosco',     icon: '🍬', color: '#e67e22' },
  { tipo: 'limpieza',  label: 'Limpieza',   icon: '🧹', color: '#2ecc71' },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  protected readonly productService = inject(ProductService);
  protected readonly cart = inject(CartService);
  protected readonly categories = CATEGORIES;

  protected readonly sliders = computed(() => {
    const all = this.productService.products();
    return CATEGORIES.map(cat => {
      const products = all.filter(p => p.tipo === cat.tipo).slice(0, 8);
      return { ...cat, products, loopItems: [...products, ...products] };
    }).filter(s => s.products.length > 0);
  });

  ngOnInit(): void {
    if (this.productService.products().length === 0) {
      this.productService.loadProducts();
    }
  }

  protected addToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    this.cart.add(product);
  }
}
