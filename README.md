# Rota Portal

A staff scheduling portal for your takeaway restaurant. Staff can view rotas, request time off, and swap shifts. You manage everything through an admin dashboard.

## Features

- **Staff View**: Current and next week's rota (no hours visible)
- **Supervisor View**: Same as staff, plus hours visible
- **Admin Dashboard**: 
  - Approve new user registrations
  - Manage time-off requests
  - Manage shift swap requests
  - Post announcements
  - Upload rota from Excel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Admin User

```bash
node scripts/create-admin.js
```

This will prompt you for admin username, password, and name.

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to access the portal.

## Excel Export Setup

To export your rota from Excel:

1. Open your rota workbook in Excel
2. Press Alt+F11 to open the VBA editor
3. Insert > Module
4. Copy the contents of `VBA_Export_Module.bas` into the new module
5. Close the VBA editor
6. Create a button on your Dashboard sheet:
   - Developer tab > Insert > Button (Form Control)
   - Draw button, assign macro "ExportRotaForPortal"
   - Label it "Export for Portal"

When you click the button, it will generate a JSON file you can upload to the portal.

## Deployment (Free)

### Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com and import your repository
3. Add environment variables:
   - `NEXTAUTH_SECRET`: Generate at https://generate-secret.vercel.app/32
   - `DATABASE_URL`: Use Vercel Postgres (free tier) or Turso
4. Deploy

### Database Options (Free Tier)

- **Vercel Postgres**: Included with Vercel, 256MB free
- **Turso**: SQLite-based, 9GB free tier
- **PlanetScale**: MySQL-based, generous free tier

## User Roles

- **Staff**: View rota, request time off, request swaps
- **Supervisor**: Staff permissions + view hours + submit mid-week changes
- **Admin**: Full access to all features

## File Structure

```
rota-portal/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   ├── components/     # Shared components
│   ├── login/          # Login page
│   ├── profile/        # User profile
│   ├── register/       # Registration page
│   ├── requests/       # Request pages
│   └── page.js         # Main dashboard
├── lib/
│   ├── auth.js         # NextAuth config
│   └── db.js           # Database setup
├── scripts/
│   └── create-admin.js # Admin creation script
└── VBA_Export_Module.bas # Excel export VBA code
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL=file:./data.db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```
