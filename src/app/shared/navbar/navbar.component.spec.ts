import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let tokenStorageServiceSpy: jasmine.SpyObj<TokenStorageService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let isLoggedInSubject: Subject<boolean>;

  beforeEach(async () => {
    tokenStorageServiceSpy = jasmine.createSpyObj('TokenStorageService', [
      'getToken',
      'signOut',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    isLoggedInSubject = new Subject<boolean>();
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoggedIn$: isLoggedInSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [MatToolbarModule],
      declarations: [NavbarComponent],
      providers: [
        { provide: TokenStorageService, useValue: tokenStorageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoggedIn to true if token exists on ngOnInit', () => {
    tokenStorageServiceSpy.getToken.and.returnValue('token');
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();
  });

  it('should set isLoggedIn to false if token does not exist on ngOnInit', () => {
    tokenStorageServiceSpy.getToken.and.returnValue(null);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
  });

  it('should update isLoggedIn when AuthService emits', () => {
    isLoggedInSubject.next(true);
    expect(component.isLoggedIn).toBeTrue();
    isLoggedInSubject.next(false);
    expect(component.isLoggedIn).toBeFalse();
  });

  it('should unsubscribe from authSubscription on ngOnDestroy', () => {
    spyOn(component['authSubscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['authSubscription'].unsubscribe).toHaveBeenCalled();
  });

  it('should call signOut, set isLoggedIn to false, and navigate to login on logout', () => {
    component.isLoggedIn = true;
    component.logout();
    expect(tokenStorageServiceSpy.signOut).toHaveBeenCalled();
    expect(component.isLoggedIn).toBeFalse();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });
});
