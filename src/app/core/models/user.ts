export interface User {
  id: string;
  name: string;
  password: string;
  email: string;
  roles: string[];
  img?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roles: string[];
  img?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  roles?: string[];
  img?: string;
}
