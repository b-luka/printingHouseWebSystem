import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  // general fields
  userType = 'client_individual';
  username = '';
  password = '';
  confirmPassword = '';
  firstname = '';
  lastname = '';
  phone = '';
  email = '';

  // printer/legal specific fields
  institutionName = '';
  headquartersAddress = '';
  city = '';
  registrationNumber = '';
  taxId = '';

  selectedFile: File | null = null;
  message = '';
  isSuccess = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  register() {
    this.message = '';

    if(!this.username || !this.password || !this.email) {
      this.message = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    const formData = new FormData();
    formData.append('userType', this.userType);
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('firstname', this.firstname);
    formData.append('lastname', this.lastname);
    formData.append('phone', this.phone);
    formData.append('email', this.email);

    if (this.userType === 'printer' || this.userType === 'client_legal') {
      formData.append('institutionName', this.institutionName);
      formData.append('headquartersAddress', this.headquartersAddress);
      formData.append('city', this.city);
      formData.append('taxId', this.taxId);
      formData.append('registrationNumber', this.registrationNumber);
    }

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: (res: any) => {
        this.isSuccess = true;
        this.message = res.message || 'Registration successful! Waiting for approval.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.message = error.error.message || 'Registration failed.';
      }
    });
  }
}
