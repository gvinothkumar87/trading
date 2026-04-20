# Vortex AutoTrade Platform (Angel One + Supabase)

Vortex is a professional-grade automated trading platform that replicates the **ATI (Advanced Trailing Indicator)** logic from AmiBroker. It is designed for multi-symbol trading, high-end visualization, and cloud VPS deployment.

## Features
- **Angel One Integration**: Official SmartAPI support for orders and SmartStream (WebSockets).
- **AFL Logic Port**: Exact implementation of TR, ATR (Wilder's), and the recursive ATI trail.
- **Supabase Core**: Auth, Secret Management, and Trade Logging are all managed via Supabase.
- **Premium Dashboard**: Real-time charts and manual controls with a modern dark theme.

## Setup Instructions

### 1. Database (Supabase)
- I have already applied the database migrations to your project.
- You should see the following tables: `api_credentials`, `strategy_config`, `symbols`, and `trade_history`.
- **Crucial**: Go to `api_credentials` and add your Angel One details (`api_key`, `client_code`, `password`, `totp_secret`).

### 2. Backend (Trade Engine)
1. `cd backend`
2. Create a `.env` file based on `.env.example`.
3. Add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `npm run dev` to start the engine.

### 3. Frontend (Dashboard)
1. `cd frontend`
2. Create a `.env` file based on `.env.example`.
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run `npm run dev` to view the dashboard at `localhost:5173`.

### 4. GitHub Deployment
1. Create a **Private** repository on GitHub.
2. Run the following in the project root:
   ```bash
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

## Security Note
Secrets are **NEVER** stored in the code. They are stored in your private Supabase database and accessed via environment variables. Ensure your `.env` files are never pushed to GitHub.
