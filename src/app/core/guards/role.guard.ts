import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { TokenStorageService } from '../services/token-storage.service';

interface JwtPayload {
  id: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const expectedRoles: string[] = route.data['expectedRoles'];
    const token = this.tokenStorage.getToken();
    if (!token) {
      return this.router.parseUrl('/auth/login');
    }

    let payload: JwtPayload;
    try {
      payload = jwtDecode<JwtPayload>(token);
    } catch {
      this.tokenStorage.signOut();
      return this.router.parseUrl('/auth/login');
    }

    const userRoles = payload.roles;
    const hasRole = userRoles.some((r) => expectedRoles.includes(r));
    if (!hasRole) {
      return this.router.parseUrl('/');
    }

    return true;
  }
}
