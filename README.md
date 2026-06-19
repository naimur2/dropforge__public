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

### Environment Variables

Before running the application, you need to configure the environment variables for both the frontend and backend.

#### Backend (`dropforge-backend/.env`)
Create a `.env` file in the `dropforge-backend` directory based on the provided `.env.example`:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dropforge
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000
```

#### Frontend (`dropforge-web/.env`)
Create a `.env` file in the `dropforge-web` directory. You will need to provide the Turnstile site key for bot protection and the API URL:

```env
VITE_API_URL=http://localhost:4000
VITE_TURNSTILE_SITE_KEY=0x4AAAAAADnqTo2z_5KGesHr
```

### 1. Database and Backend Setup

We use Docker Compose to spin up PostgreSQL, Redis, and the backend API container.

```bash
# From the root directory, start all services
docker compose up -d --build

# The API will be available at http://localhost:4000
# The database runs on port 5432 and Redis on 6379
```

_Note: Prisma migrations are automatically generated and applied during the Docker build process, so no manual SQL schema setup is required!_

### 2. Frontend Setup

Run the frontend locally.

```bash
cd dropforge-web
yarn install
yarn dev
```

The application will be available at `http://localhost:3000`.

### 3. Production Deployment (CI/CD Pipeline)

This repository includes a robust **GitHub Actions CI/CD Pipeline** that automatically deploys the application to a self-hosted VPS while optimizing resource usage.

#### Architecture

To prevent the VPS from experiencing CPU/RAM spikes during build time, the pipeline uses a hybrid approach:

1. **GitHub-hosted runner**: Builds the Docker images and pushes them to GitHub Container Registry (`ghcr.io`).
2. **Self-hosted runner (VPS)**: Connects to GHCR, pulls the pre-compiled images, and spins them up.

#### Prerequisites

Your VPS must have the following installed:

- Docker & Docker Compose
- Caddy (running as a system service)
- GitHub Actions Self-Hosted Runner (configured and running)

#### Required GitHub Secrets

You must configure the following Action Secrets in your GitHub repository before deploying:

- `GITHUB_TOKEN` (usually auto-provided, or provide a Personal Access Token with package write permissions).
- `SUDO_PASSWORD`: The sudo password for your VPS user (used to safely execute Docker and Caddy commands without granting passwordless sudo).
- `FRONTEND_ENV`: The full string contents of your production `dropforge-web/.env` file.
- `BACKEND_ENV`: The full string contents of your production `dropforge-backend/.env` file.

#### Automated Deployment Flow

1. **Push to `main`**: Trigger the pipeline automatically.
2. **Build**: The images are built by GitHub and pushed to GHCR.
3. **VPS Execution**: The self-hosted runner will:
   - Securely dump the environment secrets into local `.env` files via `cat EOF`.
   - Run `docker system prune -f` to clean up dangling caches and save disk space.
   - Pull the new images using `docker-compose.prod.yml`.
   - Start the containers.
   - Reload the local `Caddyfile` to update the reverse proxy rules.

### 3. API Documentation & Creating Drops

DropForge provides a fully documented OpenAPI (Swagger) interface for the backend.

You can access the API documentation here: **[http://localhost:4000/api/docs](http://localhost:4000/api/docs)**

#### How to Create a Drop

Since there is no dedicated Admin UI panel, you can easily create new drops directly through the Swagger documentation:

1. **Register/Login** through the frontend UI or the Swagger `/api/auth` endpoints to get your JWT token.
2. In Swagger, click the green **Authorize** button at the top and paste your JWT token.
3. Scroll down to the `POST /api/drops` endpoint, click **Try it out**, and provide the drop details (name, image URL, stock, start date).
4. Any logged-in user can add a drop to test the system!

![Create Drop via Swagger](./screnshots/create-drop.png)

## Architecture Choices

### How is the 60-second expiration logic handled?

When a user successfully clicks "Reserve", two things happen:

1. The backend creates a `Reservation` record in Postgres with an `expiresAt` timestamp set to 60 seconds in the future.
2. The backend enqueues a delayed job in **BullMQ (backed by Redis)** configured to execute after exactly 60 seconds.

When the BullMQ worker picks up the job 60 seconds later, it checks the database to see if the reservation is still `ACTIVE`.

- If the user purchased the item, the status would be `PURCHASED`, and the worker does nothing.
- If it is still `ACTIVE`, the worker transitions the reservation to `EXPIRED`, increments the available stock back by 1 in the `drops` table, and emits a `STOCK_UPDATED` WebSocket event. This creates the "Stock Recovery" mechanism.

### Concurrency: How are multiple users prevented from claiming the same last item?

To prevent "Overselling" when 100 users hit "Reserve" at the exact same millisecond, the backend utilizes **PostgreSQL Row-Level Locks** (`SELECT ... FOR UPDATE`).

Within a Prisma `$transaction`, the backend runs a raw SQL query:

```sql
SELECT * FROM drops WHERE id = $1::text FOR UPDATE
```

This forces Postgres to acquire an exclusive row-level lock on that specific drop. If 100 requests hit the database simultaneously, the database forces them into a queue, processing them one at a time. The first request will see `availableStock: 1`, reserve the item, and decrement the stock to `0`. The 99 subsequent queued requests will then read the updated row (seeing `availableStock: 0`) and fail gracefully with a Conflict error, guaranteeing that stock never drops below zero.

### How is the app secured against Bots and DDoS attacks?

High-traffic sneaker drops are prime targets for automated bots. To combat this, the application implements a multi-layered defense strategy:

1. **Frontend Proof-of-Work (Cloudflare Turnstile):** The frontend leverages `@marsidev/react-turnstile` running in invisible mode. When a user clicks "Reserve Now", Turnstile silently analyzes the browser environment and generates a cryptographic token. The backend `turnstile.middleware.ts` verifies this token directly with Cloudflare, immediately rejecting any headless browsers, scripts, or automated API requests trying to bypass the UI.
2. **Infrastructure Rate Limiting (Redis Sliding Window):** Even if an attacker manages to solve the Turnstile challenge, their request volume is strictly throttled by an atomic Sliding Window Log algorithm. Using a custom Express middleware and Redis Sorted Sets (`ZADD`, `ZREMRANGEBYSCORE`), the backend limits the `/api/reservations` endpoint to exactly 10 requests per 60 seconds per IP address. This prevents DDoS bursting and ensures fair access for real users without affecting legitimate retries.
3. **Frontend Cooldown Throttle:** The "Reserve Now" button itself enforces a strict 2-second cooldown on consecutive clicks, which prevents double-submissions and accidental spamming of the backend.

## Real-Time Synchronization

The frontend leverages RTK Query's `onCacheEntryAdded` lifecycle to hook directly into the global Socket.IO instance. When the backend emits `STOCK_UPDATED` or `PURCHASE_COMPLETED` events, the frontend patches the Redux cache directly without needing to re-fetch from the API, providing zero-lag visual updates for all connected clients.
