import { ReservationStatus } from '../enums';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserDto;
  token: string;
}

export interface LatestPurchaserDto {
  username: string;
}

export interface DropDto {
  id: string;
  name: string;
  imageUrl: string;
  totalStock: number;
  availableStock: number;
  startAt: string;
  createdAt: string;
  latestPurchasers: LatestPurchaserDto[];
}

export interface CreateDropDto {
  name: string;
  imageUrl: string;
  totalStock: number;
  startAt: string;
}

export type UpdateDropDto = Partial<CreateDropDto>;

export interface ReservationDto {
  id: string;
  userId: string;
  dropId: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  drop: Pick<DropDto, 'id' | 'name' | 'imageUrl'>;
}

export interface CreateReservationDto {
  dropId: string;
}

export interface PurchaseDto {
  id: string;
  userId: string;
  dropId: string;
  reservationId: string;
  createdAt: string;
  drop: Pick<DropDto, 'id' | 'name' | 'imageUrl'>;
}

export interface CreatePurchaseDto {
  reservationId: string;
}
