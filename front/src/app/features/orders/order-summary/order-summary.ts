import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummaryComponent {
  protected readonly cart = inject(CartService);
  protected readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    customerEmail: ['', [Validators.required, Validators.email]],
  });

  protected submitOrder(): void {
    if (this.form.invalid || this.cart.isEmpty()) return;

    const { customerName, customerEmail } = this.form.value;
    this.orderService
      .submitOrder(this.cart.items(), customerName!, customerEmail!)
      .subscribe({
        next: () => {
          this.cart.clear();
          this.router.navigate(['/order/confirmation']);
        },
        error: () => {},
      });
  }
}
