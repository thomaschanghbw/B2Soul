# Running the app

Install pnpm and have Docker running.

Install dependencies:

```
pnpm install
```

Start up development database:

```
pnpm run dev:services:up
```

Run Prisma Migrate if needed:

```
pnpm prisma migrate dev
```

Start the app:

```
pnpm run dev
```
