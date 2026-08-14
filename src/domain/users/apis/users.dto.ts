type RoleType = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER';

interface Role {
  id?: string;
  type: RoleType;
  description?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
}

interface Position {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  userId: string;
  username: string;
  role: Role;
  email: string;
  group?: Group;
  position?: Position;
  isDeleted: boolean;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

/*
 * dto
 */
type UserSearchRequest = {
  userId?: string;
  username?: string;
  isDeleted?: boolean;
};

interface UserRegisterRequest {
  userId: string;
  username: string;
  password: string;
  email: string;
  phone?: string;
  cellPhone?: string;
  roleType: RoleType;
}

export type { RoleType, User, UserSearchRequest, UserRegisterRequest };
