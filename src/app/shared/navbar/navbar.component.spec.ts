import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const tokenStorage = jasmine.createSpyObj('TokenStorageService', [
      'signOut',
    ]);
    const router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    tokenStorageSpy = TestBed.inject(
      TokenStorageService
    ) as jasmine.SpyObj<TokenStorageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle logout', () => {
    component.logout();
    expect(tokenStorageSpy.signOut).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });
});
