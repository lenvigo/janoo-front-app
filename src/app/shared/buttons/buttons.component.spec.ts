import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonsComponent } from './buttons.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { of, Subject } from 'rxjs';

describe('ButtonsComponent', () => {
  let component: ButtonsComponent;
  let fixture: ComponentFixture<ButtonsComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: Partial<AuthService> & { isLoggedIn$: Subject<boolean> };
  let mockTokenStorage: jasmine.SpyObj<TokenStorageService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'isAdmin',
      'isManager',
    ]);
    mockAuthService = {
      isLoggedIn$: new Subject<boolean>(),
    };
    mockTokenStorage = jasmine.createSpyObj('TokenStorageService', [
      'getToken',
    ]);

    await TestBed.configureTestingModule({
      declarations: [ButtonsComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenStorageService, useValue: mockTokenStorage },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    mockAuthService.isLoggedIn$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isAdmin and isManager on ngOnInit', () => {
    mockUserService.isAdmin.and.returnValue(true);
    mockUserService.isManager.and.returnValue(false);
    mockTokenStorage.getToken.and.returnValue('token123');

    component.ngOnInit();

    expect(component.isAdmin).toBeTrue();
    expect(component.isManager).toBeFalse();
    expect(component.isLoggedIn).toBeTrue();
  });

  it('should set isLoggedIn to false if no token on ngOnInit', () => {
    mockUserService.isAdmin.and.returnValue(false);
    mockUserService.isManager.and.returnValue(false);
    mockTokenStorage.getToken.and.returnValue(null);

    component.ngOnInit();

    expect(component.isLoggedIn).toBeFalse();
  });

  it('should update isLoggedIn when authService emits', () => {
    mockUserService.isAdmin.and.returnValue(false);
    mockUserService.isManager.and.returnValue(false);
    mockTokenStorage.getToken.and.returnValue(null);

    fixture = TestBed.createComponent(ButtonsComponent);
    component = fixture.componentInstance;

    mockAuthService.isLoggedIn$.next(true);
    expect(component.isLoggedIn).toBeTrue();

    mockAuthService.isLoggedIn$.next(false);
    expect(component.isLoggedIn).toBeFalse();
  });
});
