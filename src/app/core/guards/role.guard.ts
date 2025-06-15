import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.verifyToken().pipe(
      map(() => {
        const requiredRoles = route.data['roles'] as string[];
        const currentUser = this.authService.getCurrentUser();

        if (!currentUser) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const hasRequiredRole = requiredRoles.some((role) =>
          currentUser.roles.includes(role)
        );

        if (!hasRequiredRole) {
          this.toastr.error(
            'No tienes permisos para acceder a esta página',
            'Error'
          );
          this.router.navigate(['/']);
          return false;
        }

        return true;
      }),
      catchError(() => {
        this.toastr.error('Sesión expirada', 'Error');
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
