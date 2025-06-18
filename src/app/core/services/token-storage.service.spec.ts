import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/user';

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let store: { [key: string]: string };

  const TOKEN_KEY = 'auth-token';
  const USER_KEY = 'auth-user';
  const mockToken = 'Bearer faketoken1234567890';
  const mockUser: User = {
    id: '1',
    name: 'testuser',
    password: 'testpass',
    email: 'test@example.com',
    roles: ['user'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    store = {};
    spyOn(window.localStorage, 'getItem').and.callFake(
      (key: string) => store[key] || null
    );
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key: string, value: string) => {
        store[key] = value;
      }
    );
    spyOn(window.localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(window.localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and get token', () => {
    service.saveToken(mockToken);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      TOKEN_KEY,
      mockToken
    );
    expect(service.getToken()).toBe(mockToken);
  });

  it('should not save null or undefined token', () => {
    service.saveToken(undefined as any);
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    service.saveToken(null as any);
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should remove token and user on signOut', () => {
    service.saveToken(mockToken);
    service.saveUser(mockUser);
    service.signOut();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    expect(window.localStorage.clear).toHaveBeenCalled();
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });

  it('should save and get user', () => {
    service.saveUser(mockUser);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      USER_KEY,
      JSON.stringify(mockUser)
    );
    const user = service.getUser();
    expect(user).toEqual(mockUser);
  });

  it('should return null if no user is stored', () => {
    expect(service.getUser()).toBeNull();
  });

  it('should return null if no token is stored', () => {
    expect(service.getToken()).toBeNull();
  });

  describe('isTokenValid', () => {
    it('should return false if no token', () => {
      expect(service.isTokenValid()).toBeFalse();
    });
    it('should return true for Bearer token', () => {
      service.saveToken(mockToken);
      expect(service.isTokenValid()).toBeTrue();
    });
    it('should return true for token with length > 10', () => {
      service.saveToken('12345678901');
      expect(service.isTokenValid()).toBeTrue();
    });
    it('should return false for short token', () => {
      service.saveToken('short');
      expect(service.isTokenValid()).toBeFalse();
    });
  });
});
