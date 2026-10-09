import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-component',
  imports: [FormsModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  printersCount = 0;
  topProducts: Product[] = [];
  categories: string[] = ['All categories'];

  searchName = '';
  searchCategory = 'All categories';
  searchResults: Product[] = [];

  sortDirection: 'asc' | 'desc' = 'asc';

  private productService = inject(ProductService);
  private router = inject(Router);

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('login_token');

    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      if (user.userType === 'client_individual' || user.userType === 'client_legal') {
        this.router.navigate(['/client']);
      } else if (user.userType === 'printer') {
        this.router.navigate(['/printer']);
      } else if (user.userType === 'admin') {
        this.router.navigate(['/admin']);
      }
    }

    this.loadDashboardData();
    this.search();
  }

  loadDashboardData() {
    this.productService.getPrintersCount().subscribe(res => this.printersCount = res.count);
    this.productService.getTopProducts().subscribe(res => this.topProducts = res);

    this.productService.getActiveCategories().subscribe(res => {
      this.categories = ['All categories', ...res];
    });
  }

  search() {
    this.productService.searchProducts(this.searchName, this.searchCategory).subscribe({
      next: (products) => {
        this.searchResults = products;
        this.applySorting();
      },
      error: (error) => console.error('Search failed.', error)
    });
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

  private applySorting() {
    this.searchResults.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return this.sortDirection === 'asc' ? -1 : 1;
      if (nameA > nameB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  viewDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
