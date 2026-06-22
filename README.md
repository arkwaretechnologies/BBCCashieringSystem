# BBC Cashiering System

Offline LAN-hosted school cashiering app built with Next.js and SQLite.

## Features

- Student ledger (records, charges, payments, balances, receipts)
- School expenses (categories, entries, monthly reports, cash flow)
- Administration (login, admin/cashier roles, backup/restore, dashboard)

## Requirements

- Node.js 20+
- Windows PC to act as the LAN server

## Setup

```bash
npm install
npm approve-scripts better-sqlite3
copy .env.example .env
npm run dev
```

Default login after first run:

- Username: `admin`
- Password: `admin123`

Change the admin password after first login via Users settings.

**LAN client login:** If cashiers get stuck on the login page after signing in, ensure `.env` has `SESSION_SECURE=false` when using HTTP (not HTTPS). Production mode previously forced secure cookies, which browsers reject on `http://192.168.x.x:3000`.

## LAN Deployment

1. On the server PC, build the app:

```bash
npm run build
```

2. Double-click `scripts/start-server.bat` or run:

```bash
npm run start
```

3. On the server PC, open `http://localhost:3000`
4. On other cashier PCs, bookmark `http://<server-ip>:3000`
5. Allow port **3000** through Windows Firewall on the server PC

To find the server IP on Windows:

```powershell
ipconfig
```

Look for the IPv4 address on your LAN adapter (e.g. `192.168.1.50`).

## Backup & Restore

- **Backup:** Settings → Download Backup (admin only)
- **Restore:** Upload a `.db` file and type `RESTORE` to confirm, then restart the server

Database file location: `data/bbc-cashier.db`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server (binds `0.0.0.0:3000`) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run seed:admin` | Seed admin user and defaults |

## Tech Stack

- Next.js 16 App Router
- SQLite + Drizzle ORM
- iron-session auth
- Tailwind CSS + shadcn-style UI
