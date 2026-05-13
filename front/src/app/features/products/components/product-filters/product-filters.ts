import { Component, inject, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductFilter } from '../../../../core/models/product.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-product-filters',
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
})
export class ProductFiltersComponent implements OnInit {
  readonly tipos = input<string[]>([]);
  readonly initialTipo = input('');
  readonly filtersChange = output<Partial<ProductFilter>>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    query: [''],
    tipo: [''],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
  });

  ngOnInit(): void {
    if (this.initialTipo()) {
      this.form.patchValue({ tipo: this.initialTipo() }, { emitEvent: false });
    }

    this.form.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(values => this.filtersChange.emit(values as Partial<ProductFilter>));
  }

  protected clearFilters(): void {
    this.form.reset({ query: '', tipo: '', minPrice: null, maxPrice: null });
  }

  protected get hasActiveFilters(): boolean {
    const v = this.form.value;
    return !!(v.query || v.tipo || v.minPrice != null || v.maxPrice != null);
  }
}
