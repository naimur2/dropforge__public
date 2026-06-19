export const RESERVATION_DURATION_SECONDS = 60;
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// ─── Socket Event Names ───────────────────────────────────────────────────────
// Re-exported here so both frontend and backend can import from @contracts/constants

export const SOCKET_EVENTS = {
  // Drop events
  DROP_CREATED: 'drop.created',
  // Server → Client
  STOCK_UPDATED: 'stock.updated',
  RESERVATION_CREATED: 'reservation.created',
  RESERVATION_EXPIRED: 'reservation.expired',
  PURCHASE_COMPLETED: 'purchase.completed',

  // Client → Server
  JOIN_DROP: 'drop.join',
  LEAVE_DROP: 'drop.leave',
} as const;
