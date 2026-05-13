import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../models/cart.model';
import { OrderRequest, OrderResponse } from '../models/order.model';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5001/api/orders';

  readonly loading = signal(false);
  readonly lastOrder = signal<OrderResponse | null>(null);
  readonly error = signal<string | null>(null);

  submitOrder(items: CartItem[], customerName: string, customerEmail: string): Observable<OrderResponse> {
    const request: OrderRequest = {
      items: items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitPrice: i.product.precio,
      })),
      customerName,
      customerEmail,
    };

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<OrderResponse>(this.apiUrl, request).pipe(
      tap(response => this.lastOrder.set(response)),
      catchError(err => {
        const msg = err.error?.message ?? 'Error al procesar el pedido. Intente nuevamente.';
        this.error.set(msg);
        return throwError(() => new Error(msg));
      }),
      finalize(() => this.loading.set(false))
    );
  }
}
