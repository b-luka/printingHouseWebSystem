import { Component, inject, OnInit } from '@angular/core';
import { Procurement } from '../../models/procurement';
import { ProcurementService } from '../../services/procurement-service';
import { User } from '../../models/user';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { OrderService } from '../../services/order-service';

@Component({
  selector: 'app-printer-component',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './printer-component.html',
  styleUrl: './printer-component.css',
})
export class PrinterComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: 'add-product' | 'my-products' | 'orders' | 'procurements' | 'profile' = 'my-products';
  isDropdownOpen: boolean = false;
  profileUpdateMessage: string = '';

  dbCategories: any[] = [];
  availableCategories: string[] = [];
  availableSubcategories: string[] = [];

  activeProcurements: Procurement[] = [];
  pastProcurements: Procurement[] = [];
  bidAmounts: { [key: string]: number } = {};

  newProduct: Partial<Product> = {
    code: '',
    category: '',
    subcategory: '',
    name: '',
    description: '',
    unitPrice: 0,
    stockQuantity: 0,
    printServices: []
  };

  newService: any = { printType: '', additionalPricePerPiece: 0, maxWidthMm: 0, maxHeightMm: 0 };

  selectedProductImage: File | null = null;
  selectedProfilePic: File | null = null;

  myProducts: any[] = [];
  myOrders: any[] = [];

  private procurementService = inject(ProcurementService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  ngOnInit(): void {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser) as User;
        if (this.currentUser.userType !== 'printer') {
          this.router.navigate(['/']);
          return;
        }
        this.loadData();
      } else {
        this.router.navigate(['/login']);
      }
  }

  loadData() {
    this.loadCategoriesFromDb();
    this.loadActiveProcurements();
    this.loadPastProcurements();
    this.loadMyProducts();
    this.loadMyOrders();
  }

  loadMyProducts() {
    if (!this.currentUser?._id) return;
    this.productService.getProductsByPrinter(this.currentUser._id).subscribe({
      next: (data) => this.myProducts = data,
      error: (err) => console.error('Error loading stock', err)
    });
  }

  loadMyOrders() {
    if (!this.currentUser?._id) return;
    this.orderService.getPrinterOrders(this.currentUser._id).subscribe({
      next: (data) => this.myOrders = data,
      error: (err) => console.error('Error loading orders', err)
    });
  }

  updateProfile() {
    if (!this.currentUser) return;

    const formData = new FormData();

    if (this.currentUser.username) {
      formData.append('username', this.currentUser.username);
    }

    formData.append('firstname', this.currentUser.firstname || '');
    formData.append('lastname', this.currentUser.lastname || '');
    formData.append('email', this.currentUser.email || '');
    formData.append('phone', this.currentUser.phone || '');

    if (this.currentUser.institutionName) {
      formData.append('institutionName', this.currentUser.institutionName);
    }
    if (this.currentUser.headquartersAddress) {
      formData.append('headquartersAddress', this.currentUser.headquartersAddress);
    }
    if (this.currentUser.city) {
      formData.append('city', this.currentUser.city);
    }
    if (this.currentUser.registrationNumber) {
      formData.append('registrationNumber', this.currentUser.registrationNumber);
    }
    if (this.currentUser.taxId) {
      formData.append('taxId', this.currentUser.taxId);
    }

    if (this.selectedProfilePic) {
      formData.append('profilePicture', this.selectedProfilePic);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res: any) => {
        console.log('Update sent to backend, backend replied: ', res);

        this.currentUser = res.user;
        localStorage.setItem('user', JSON.stringify(res.user));

        this.profileUpdateMessage = 'Profile updated successfully!';

        this.selectedProfilePic = null;

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

  onProfilePicSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfilePic = file;
      alert(`Odabrana slika za profil: ${file.name}`);
    }
  }

  onProductImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProductImage = file;
    }
  }

  loadCategoriesFromDb() {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.dbCategories = data;
        this.availableCategories = this.dbCategories.map(c => c.name);
      },
      error: (err) => console.error('Error adding categories', err)
    });
  }

  onCategoryChange() {
    const selected = this.dbCategories.find(c => c.name === this.newProduct.category);
    this.availableSubcategories = selected ? selected.subcategories : [];
    this.newProduct.subcategory = '';
  }

  addServiceToProduct() {
    if (this.newService.printType && this.newService.additionalPricePerPiece > 0) {
      if (!this.newProduct.printServices) {
        this.newProduct.printServices = [];
      }
      this.newProduct.printServices.push({ ...this.newService } as any);
      this.newService = { printType: '', additionalPricePerPiece: 0, maxWidthMm: 0, maxHeightMm: 0 };
    }
  }

  removeService(index: number) {
    if (this.newProduct.printServices) {
      this.newProduct.printServices.splice(index, 1);
    }
  }

  submitNewProduct() {
    if (!this.currentUser?._id) return;

    const formData = new FormData();
    formData.append('printerId', this.currentUser._id);
    formData.append('code', this.newProduct.code || '');
    formData.append('category', this.newProduct.category || '');
    formData.append('subcategory', this.newProduct.subcategory || '');
    formData.append('name', this.newProduct.name || '');
    formData.append('description', this.newProduct.description || '');
    formData.append('unitPrice', (this.newProduct.unitPrice || 0).toString());
    formData.append('stockQuantity', (this.newProduct.stockQuantity || 0).toString());

    formData.append('printServices', JSON.stringify(this.newProduct.printServices || []));

    if (this.selectedProductImage) {
      formData.append('image', this.selectedProductImage);
    }

    this.productService.addProduct(formData).subscribe({
      next: (res) => {
        alert('Product added successfully!');

        this.newProduct = { code: '', category: '', subcategory: '', name: '', description: '', unitPrice: 0, stockQuantity: 0, printServices: [] };
        this.selectedProductImage = null;

        this.loadMyProducts();
        this.activeTab = 'my-products';
      },
      error: (err) => {
        alert('Error adding product.');
        console.error(err);
      }
    });
  }

  onJsonUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonContent = e.target.result;
        const products = JSON.parse(jsonContent);

        if (!Array.isArray(products)) {
          alert('Error: JSON file must contain an array of products!');
          return;
        }

        if (!this.currentUser?._id) return;

        this.productService.addBulkProducts({
          printerId: this.currentUser._id,
          products: products
        }).subscribe({
          next: (res) => {
            alert(res.message);
            this.loadMyProducts();
            this.activeTab = 'my-products';
            event.target.value = '';
          },
          error: (err) => {
            alert('Error importing products.');
            console.error(err);
            event.target.value = '';
          }
        })
      } catch (err) {
        alert('Error parsing JSON, file format is incorrect.');
        console.error(err);
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  updateStock(productId: string, newQuantity: number) {
    if (newQuantity < 0) {
      alert('Quantity cannot be negative.');
      return;
    }

    this.productService.updateStock(productId, newQuantity).subscribe({
      next: (res) => {
        alert('Stock updated successfully!');
        this.loadMyProducts();
      },
      error: (err) => {
        alert('Error updating quantity.');
        console.error(err);
      }
    });
  }

  changeOrderStatus(orderId: string, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (res) => {
        alert('Order status successfully updated!');
        this.loadMyOrders();
      },
      error: (err) => {
        alert('Error updating order status.');
        console.error(err);
      }
    });
  }

  loadActiveProcurements() {
    this.procurementService.getActiveProcurements().subscribe({
      next: (data) => {
        this.activeProcurements = data;
      },
      error: (err) => console.error('Error loading active procurements.', err)
    });
  }

  loadPastProcurements() {
    this.procurementService.getPastProcurements().subscribe({
      next: (data) => {
        this.pastProcurements = data;
      },
      error: (err) => console.error('Error loading past procurements', err)
    });
  }

  submitBid(procurementId: string) {
    const price = this.bidAmounts[procurementId];

    if (!price || price <= 0) {
      alert('Enter valid bid (>= 0).');
      return;
    }

    if (!this.currentUser?._id) return;

    this.procurementService.placeOffer(procurementId, this.currentUser._id, price).subscribe({
      next: (res) => {
        alert(res.message);
        this.bidAmounts[procurementId] = 0;
        this.loadActiveProcurements();
      },
      error: (err) => {
        alert(err.error?.message || 'Greška pri slanju ponude. Proverite da li imate dovoljno lagera za tražene proizvode.');
      }
    });
  }

  getClientName(clientLegalId: any): string {
    if (typeof clientLegalId === 'object' && clientLegalId !== null) {
      return clientLegalId.institutionName || clientLegalId.username || 'Legal Entity';
    }
    return 'Legal Entity';
  }

  downloadReport(procurementId: string) {
    this.procurementService.downloadProcurementReport(procurementId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_procurement_${procurementId.substring(procurementId.length - 6)}.pdf`;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        alert('Error downloading report.');
        console.error(err);
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('login_token');
    this.router.navigate(['/login']);
  }
}
