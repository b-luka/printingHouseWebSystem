import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('login_token');

  if (token ) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      if (decodedPayload.userType === 'admin') {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp > currentTime) return true;
      }
    } catch (error) {
      console.error('Error decoding token: ', error);
    }
  }

  router.navigate(['/']);
  return false;
};
