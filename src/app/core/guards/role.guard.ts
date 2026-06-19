import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const expectedRoles = route.data['expectedRoles'] as string[];
  const userRole = authService.getRole();

  if (expectedRoles && expectedRoles.includes(userRole || '')) {
    return true;
  }

  // Si no está autorizado, lo redirigimos al inicio del panel
  router.navigate(['/dashboard']);
  return false;
};
