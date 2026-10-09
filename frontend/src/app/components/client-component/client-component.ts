import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ProductService } from '../../services/product-service';
import { Product } from '../../models/product';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart-service';
import { CartItem } from '../../models/cart-item';
import { OrderService } from '../../services/order-service';
import { Order } from '../../models/order';
import { CommonModule, DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { Procurement } from '../../models/procurement';
import { ProcurementService } from '../../services/procurement-service';

@Component({
  selector: 'app-client-component',
  imports: [FormsModule, DatePipe, UpperCasePipe, SlicePipe, CommonModule],
  templateUrl: './client-component.html',
  styleUrl: './client-component.css',
})
export class ClientComponent implements OnInit {
  activeTab: 'catalog' | 'cart' | 'profile' | 'procurements' = 'catalog';
  products: Product[] = [];

  // user data
  currentUser: any = null;
  isDropdownOpen = false;
  editProfileData: any = {};
  selectedProfileImage: File | null = null;
  profileUpdateMessage: string = '';

  // search data
  categories: string[] = ['All categories'];
  searchName = '';
  searchCategory = 'All categories';
  searchResults: Product[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';

  // cart
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  // checkout
  orders: Order[] = [];
  orderSortField: string = 'createdAt';
  orderSortDirection: 'asc' | 'desc' = 'desc';

  // procurements
  procurements: Procurement[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private procurementService = inject(ProcurementService);

  ngOnInit(): void {
    this.loadCatalog();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.editProfileData = { ...this.currentUser };
      this.loadCart();
      this.loadOrders();
      if (this.currentUser.userType === 'client_legal') {
      this.loadProcurements();
    }
    }

    console.log(this.currentUser);

    this.productService.getActiveCategories().subscribe(res => {
      this.categories = ['All categories', ...res];
    });
    this.search();
  }

  search() {
    this.productService.searchProducts(this.searchName, this.searchCategory).subscribe({
      next: (products) => {
        this.searchResults = products.filter(p => p.stockQuantity > 0);;
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

  loadCatalog() {
    this.productService.searchProducts('', 'All categories').subscribe({
      next: (res) => {
        this.products = res;
      },
      error: (error) => console.error('Error loading catalog: ', error)
    });
  }

  viewDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  // cart functions
  loadCart() {
    if (!this.currentUser?._id) return;
    this.cartService.getCart(this.currentUser._id).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: (err) => console.error('Error loading cart', err)
    });
  }

  removeFromCart(item: CartItem) {
    if (!this.currentUser?._id || !item.product._id) return;

    this.cartService.removeFromCart(
      this.currentUser._id,
      item.product._id,
      item.selectedServiceId,
      item.selectedColor,
      item.customText,
      item.customImage
    ).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: (err) => console.error('Error removing from cart', err)
    });
  }

  updateQuantity(item: CartItem, event: Event) {
    if (!this.currentUser?._id || !item.product._id) return;
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);

    if (newQuantity > 0) {
      this.cartService.updateQuantity(
        this.currentUser._id,
        item.product._id,
        item.selectedServiceId,
        newQuantity,
        item.selectedColor,
        item.customText,
        item.customImage
      ).subscribe({
        next: (items) => {
          this.cartItems = items;
          this.calculateTotal();
        },
        error: (err) => console.error('Error updating quantity', err)
      });
    }
  }

  getItemUnitPrice(item: CartItem): number {
    let price = item.product.unitPrice;
    if (item.selectedServiceId && item.product.printServices) {
      const service = item.product.printServices.find((s: any) => s._id === item.selectedServiceId);
      if (service) {
        price += service.additionalPricePerPiece;
      }
    }
    return price;
  }

  getServiceName(item: CartItem): string {
    if (!item.selectedServiceId || !item.product.printServices) return 'None (Product only)';
    const service = item.product.printServices.find((s: any) => s._id === item.selectedServiceId);
    return service ? service.printType : 'Unknown Service';
  }

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce((total, item) => total + (this.getItemUnitPrice(item) * item.quantity), 0);
  }

  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfileImage = file;
    }
  }

  updateProfile() {
    const formData = new FormData();

    if (this.currentUser && this.currentUser.username) {
      formData.append('username', this.currentUser.username);
    }

    formData.append('firstname', this.editProfileData.firstname);
    formData.append('lastname', this.editProfileData.lastname);
    formData.append('email', this.editProfileData.email);
    formData.append('phone', this.editProfileData.phone);

    if (this.selectedProfileImage) {
      formData.append('profilePicture', this.selectedProfileImage);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res: any) => {
        console.log('Update sent to backend, backend replied: ', res);

        this.currentUser = res.user;
        localStorage.setItem('user', JSON.stringify(res.user));

        this.profileUpdateMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.profileUpdateMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile: ', error);
        const errorMsg = error.error?.message || 'Error occured while updating profile.';
        alert(errorMsg);
      }
    });
  }

  // checkout
  loadOrders() {
    if (!this.currentUser?._id) return;
    this.orderService.getClientOrders(this.currentUser._id).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (err) => console.error('Error loading orders', err)
    });
  }

  checkout() {
    if (!this.currentUser?._id) return;

    if (confirm('Are you sure you want to check out?')) {
      this.orderService.checkout(this.currentUser._id).subscribe({
        next: (res) => {
          alert(res.message);
          this.cartItems = [];
          this.cartTotal = 0;
          this.loadOrders();
          this.activeTab = 'catalog';
        },
        error: (err) => {
          console.error('Checkout failed', err);
          alert(err.error?.message || 'Error creating order.');
        }
      });
    }
  }

  loadProcurements() {
    if (!this.currentUser?._id) return;
    this.procurementService.getClientProcurements(this.currentUser._id).subscribe({
    next: (data) => this.procurements = data,
    error: (err) => console.error('Error loading procurements', err)
    });
  }

  startProcurement() {
  if (!this.currentUser?._id) return;
    if (confirm('Do you wish to start a public procurement for the items in the cart? The auction lasts for 10 minutes.')) {
      this.procurementService.startProcurement(this.currentUser._id).subscribe({
        next: (res) => {
          alert(res.message);
          this.cartItems = [];
          this.cartTotal = 0;
          this.loadProcurements();
          this.activeTab = 'procurements';
        },
        error: (err) => alert(err.error?.message || 'Error starting procurement.')
      });
    }
  }

  getPrinterName(printerId: any): string {
    if (typeof printerId === 'object' && printerId !== null) {
      return printerId.institutionName || printerId.username || 'Priner';
    }
    return 'Printer';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleOrderSort(field: string) {
    if (this.orderSortField === field) {
      this.orderSortDirection = this.orderSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderSortField = field;
      this.orderSortDirection = 'asc';
    }

    this.orders.sort((a, b) => {
      let valA, valB;

      if (field === 'totalAmount') {
        valA = a.totalAmount;
        valB = b.totalAmount;
      } else if (field === 'printer') {
        valA = a.printerId?.institutionName || '';
        valB = b.printerId?.institutionName || '';
      } else {
        // Подразумевано сортирање по датуму (createdAt)
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return this.orderSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.orderSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  cancelOrder(orderId: string) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (res) => {
          alert(res.message);
          this.loadOrders();
        },
        error: (err) => {
          alert(err.error?.message || 'Error canceling order.');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
