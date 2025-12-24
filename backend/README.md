 # Express API starter

 Small Express server for playing with HTTP APIs.

 It has:
 - health check at `/health` with a fixed JSON envelope
 - basic wiring for Prisma and Redis
 - Jest + Supertest test for the health endpoint

 ## Setup

 ```bash
 npm install
 cp .env.example .env
 npm run dev
 ```

 ## Tests

 ```bash
 npm test
 ```

## Health checks: DB and Redis

The `/health` endpoint returns an envelope with `checks` that indicate the status of dependencies used by the service.

- **DB check (Prisma)**
  - The service uses Prisma Client to verify that the database is reachable.
  - In SQL setups (e.g. PostgreSQL) this is often done with a trivial query such as `SELECT 1` using `prisma.$queryRaw`.
  - In the current MongoDB setup the check uses `prisma.$runCommandRaw({ ping: 1 })` to send a `ping` command to the MongoDB server.
  - If the command succeeds, the `db` check is marked as `up`. If it fails (or the connection cannot be established), the `db` check is marked as `down` or `unknown` depending on whether Prisma is configured.

- **Redis check**
  - A single shared Redis client is created from `REDIS_URL` and connected on startup.
  - The health service calls `initRedis()` and then `redisClient.ping()`.
  - If the Redis server responds, the `cache` check is marked as `up`.
  - If Redis is not running or the connection fails (for example, `ECONNREFUSED` on `localhost:6379`), the `cache` check is marked as `down`.

Together these checks give a quick view of whether the API process is running and whether its main dependencies (database and Redis) are available.

