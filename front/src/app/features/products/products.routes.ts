import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/product-list/product-list').then(m => m.ProductListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-detail/product-detail').then(m => m.ProductDetailComponent),
  },
];
