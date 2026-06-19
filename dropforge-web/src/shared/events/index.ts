export const SOCKET_EVENTS = {
  DROP_CREATED: 'drop.created',
  STOCK_UPDATED: 'stock.updated',
  RESERVATION_CREATED: 'reservation.created',
  RESERVATION_EXPIRED: 'reservation.expired',
  PURCHASE_COMPLETED: 'purchase.completed',
  JOIN_DROP: 'drop.join',
  LEAVE_DROP: 'drop.leave',
} as const;

export interface StockUpdatedEvent {
  dropId: string;
  availableStock: number;
}

export interface ReservationCreatedEvent {
  dropId: string;
  reservationId: string;
  userId: string;
  expiresAt: string;
  availableStock: number;
}

export interface ReservationExpiredEvent {
  dropId: string;
  reservationId: string;
  availableStock: number;
}

export interface PurchaseCompletedEvent {
  dropId: string;
  reservationId: string;
  userId: string;
  username: string;
  purchaseId: string;
  latestPurchasers: { username: string }[];
}

export interface JoinDropEvent {
  dropId: string;
}

export interface LeaveDropEvent {
  dropId: string;
}

export interface ServerToClientEvents {
  [key: string]: (data: unknown) => void;
}

export interface ClientToServerEvents {
  [key: string]: (data: unknown) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  username: string;
}
