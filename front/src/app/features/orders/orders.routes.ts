import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./order-summary/order-summary').then(m => m.OrderSummaryComponent),
  },
  {
    path: 'confirmation',
    loadComponent: () =>
      import('./order-confirmation/order-confirmation').then(m => m.OrderConfirmationComponent),
  },
];
