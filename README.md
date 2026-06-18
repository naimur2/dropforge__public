# DropForge - High-Traffic Inventory System

DropForge is a real-time, high-traffic limited edition merch drop platform. It features atomic reservations, auto-expiring temporary inventory holds, and real-time WebSocket synchronization across all connected clients.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Redux Toolkit (RTK Query)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-Time**: WebSockets (Socket.IO)
- **Job Queue**: Redis + BullMQ

## How to Run the App

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Yarn or npm

### 1. Database and Backend Setup
We use Docker Compose to spin up PostgreSQL, Redis, and the backend API container.

```bash
# From the root directory, start all services
docker compose up -d --build

# The API will be available at http://localhost:4000
# The database runs on port 5432 and Redis on 6379
```

*Note: Prisma migrations are automatically generated and applied during the Docker build process, so no manual SQL schema setup is required!*

### 2. Frontend Setup
Run the frontend locally.

```bash
cd dropforge-web
yarn install
yarn dev
```

The application will be available at `http://localhost:3000`.

## Architecture Choices

### How did you handle the 60-second expiration logic?
When a user successfully clicks "Reserve", two things happen:
1. The backend creates a `Reservation` record in Postgres with an `expiresAt` timestamp set to 60 seconds in the future.
2. The backend enqueues a delayed job in **BullMQ (backed by Redis)** configured to execute after exactly 60 seconds.

When the BullMQ worker picks up the job 60 seconds later, it checks the database to see if the reservation is still `ACTIVE`. 
- If the user purchased the item, the status would be `PURCHASED`, and the worker does nothing.
- If it is still `ACTIVE`, the worker transitions the reservation to `EXPIRED`, increments the available stock back by 1 in the `drops` table, and emits a `STOCK_UPDATED` WebSocket event. This creates the "Stock Recovery" mechanism.

### Concurrency: How did you prevent multiple users from claiming the same last item?
To prevent "Overselling" when 100 users hit "Reserve" at the exact same millisecond, the backend utilizes **PostgreSQL Row-Level Locks** (`SELECT ... FOR UPDATE`).

Within a Prisma `$transaction`, the backend runs a raw SQL query:
```sql
SELECT * FROM drops WHERE id = $1::text FOR UPDATE
```
This forces Postgres to acquire an exclusive row-level lock on that specific drop. If 100 requests hit the database simultaneously, the database forces them into a queue, processing them one at a time. The first request will see `availableStock: 1`, reserve the item, and decrement the stock to `0`. The 99 subsequent queued requests will then read the updated row (seeing `availableStock: 0`) and fail gracefully with a Conflict error, guaranteeing that stock never drops below zero.

## Real-Time Synchronization
The frontend leverages RTK Query's `onCacheEntryAdded` lifecycle to hook directly into the global Socket.IO instance. When the backend emits `STOCK_UPDATED` or `PURCHASE_COMPLETED` events, the frontend patches the Redux cache directly without needing to re-fetch from the API, providing zero-lag visual updates for all connected clients.
