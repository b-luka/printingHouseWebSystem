import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  login() {
    this.message = '';

    if (!this.username || !this.password) {
      this.message = 'Please enter username and password.';
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        localStorage.setItem('user_type', res.user.userType);
        localStorage.setItem('user', JSON.stringify(res.user));

        if (res.user.userType === 'client_individual' || res.user.userType === 'client_corporate') {
          this.router.navigate(['/client']);
        } else if (res.user.userType === 'printer') {
          this.router.navigate(['/printer']);
        } else if (res.user.userType === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.message = error.error.message || 'Error during login.'
      }
    });
  }
}
