import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { CartService } from '../../services/cart-service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-product-details-component',
  imports: [FormsModule, DatePipe],
  templateUrl: './product-details-component.html',
  styleUrl: './product-details-component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  mainImage: string = '';
  allImages: string[] = [];

  currentUser: any = null;
  isClient: boolean = false;
  selectedServiceId: string | null = null;
  selectedColor: string = 'Bela';

  currentStep: 'details' | 'prepare' = 'details';
  customText: string = '';
  customImagePreview: string | null = null;
  customImageFile: File | null = null;
  quantity: number = 1;
  stockErrorMessage: string = '';

  newCommentText: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.isClient = this.currentUser.userType === 'client_individual' ||
                      this.currentUser.userType === 'client_legal';
    }

    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (res) => {
          this.product = res;
          this.setupGallery(productId, res);

          if (res.availableColors && res.availableColors.length > 0) {
            this.selectedColor = res.availableColors[0];
          } else {
            this.selectedColor = 'Bela';
          }
        },
        error: (error) => console.error('Failed to load product', error)
      });
    }
  }

  setupGallery(productId: string, product: Product) {
    this.allImages = [product.imageUrl];
    if (product.additionalImages && product.additionalImages.length > 0) {
      this.allImages = this.allImages.concat(product.additionalImages.slice(0, 3));
    }

    const cookieName = `main_image_${productId}=`;
    let savedImage = '';

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.startsWith(cookieName)) {
        // decodeURIComponent to read cookie
        savedImage = decodeURIComponent(c.substring(cookieName.length));
        break;
      }
    }

    if (savedImage && this.allImages.includes(savedImage)) {
      this.mainImage = savedImage;
    } else {
      this.mainImage = this.allImages[0];
    }
  }

  setMainImage(image: string) {
    this.mainImage = image;

    if (this.product && this.product._id) {
      const d = new Date();
      d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
      const expires = `expires=${d.toUTCString()}`;

      // encodeURIComponent to protect characters in the name, SameSite=Lax for cookies to work
      const cookieValue = encodeURIComponent(image);
      const cookieString = `main_image_${this.product._id}=${cookieValue};${expires};path=/;SameSite=Lax`;

      document.cookie = cookieString;
      console.log('Attempting to insert cookie:', cookieString);
    }
  }

  getPrinterData(): any {
    return this.product?.printerId;
  }

  addToCart() {
    if (!this.product) return;

    this.stockErrorMessage = '';

    if (this.quantity > this.product.stockQuantity) {
      this.stockErrorMessage = 'Not enough quantity in stock.';
      return;
    }

    if (this.quantity <= 0) {
      this.stockErrorMessage = 'Quantity must be at least 1.';
      return;
    }

    if (!this.currentUser?._id || !this.product?._id) return;

    const formData = new FormData();
    formData.append('productId', this.product._id);
    formData.append('quantity', this.quantity.toString());
    formData.append('selectedColor', this.selectedColor);

    if (this.selectedServiceId) formData.append('serviceId', this.selectedServiceId);
    if (this.customText) formData.append('customText', this.customText);
    if (this.customImageFile) formData.append('customImage', this.customImageFile);

    this.cartService.addToCart(this.currentUser._id, formData).subscribe({
      next: () => {
        alert(`${this.product?.name} added to cart!`);
        this.router.navigate(['/client']);
      },
      error: (error) => {
        console.error('Error adding to cart: ', error);
      }
    })
  }

  getMapUrl() : SafeResourceUrl {
    const printer = this.getPrinterData();
    const address = printer?.headquartersAddress || '';
    const city = printer?.city || '';
    const fullAddress = encodeURIComponent(`${address}, ${city}`);
    const mapUrl = `https://maps.google.com/maps?q=${fullAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  goToPreparation() {
    this.currentStep = 'prepare';
  }

  goBackToDetails() {
    this.currentStep = 'details';
  }

  resetPreparation() {
    this.customText = '';
    this.customImagePreview = null;
    this.quantity = 1;
    this.stockErrorMessage = '';
  }

  onCustomImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Молимо отпремите слику у JPG, PNG или GIF формату.');
        return;
      }
      this.customImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.customImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  goBackToHome() {
    if (this.currentUser && this.isClient) {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleLike() {
    if (!this.currentUser || !this.product) {
      alert('You need to be logged in to rate the product.');
      return;
    }
    this.productService.likeProduct(this.product._id, this.currentUser._id).subscribe({
      next: (updatedProduct) => this.product = updatedProduct,
      error: (error) => console.error(error)
    });
  }

  toggleDislike() {
    if (!this.currentUser || !this.product) {
      alert('You need to be logged in to rate the product.');
      return;
    }
    this.productService.dislikeProduct(this.product._id, this.currentUser._id).subscribe({
      next: (updatedProduct) => this.product = updatedProduct,
      error: (error) => console.error(error)
    });
  }

  postComment() {
    if (!this.currentUser || !this.product || !this.newCommentText.trim()) return;

    this.productService.addComment(
      this.product._id,
      this.currentUser._id,
      this.newCommentText
    ).subscribe({
      next: (updatedProduct) => {
        this.product = updatedProduct;
        this.newCommentText = '';
      },
      error: (error) => console.error(error)
    })
  }

  getCommentUsername(comment: any): string {
    if (comment.clientId && comment.clientId.username) {
      return comment.clientId.username;
    }
    return 'Deleted user';
  }
}
