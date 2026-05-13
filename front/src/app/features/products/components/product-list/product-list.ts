import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { ProductFilter } from '../../../../core/models/product.model';
import { ProductCardComponent } from '../product-card/product-card';
import { ProductFiltersComponent } from '../product-filters/product-filters';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent, ProductFiltersComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent implements OnInit {
  protected readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  protected readonly initialTipo = signal('');

  ngOnInit(): void {
    const tipo = this.route.snapshot.queryParamMap.get('tipo') ?? '';
    this.initialTipo.set(tipo);
    this.productService.loadProducts(tipo ? { tipo } : {});
  }

  protected onFiltersChange(filter: Partial<ProductFilter>): void {
    this.productService.loadProducts(filter);
  }
}
