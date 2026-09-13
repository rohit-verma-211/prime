# Employee Portal — Supabase Setup

The employee/intern portal now runs on real Postgres via Supabase instead
of hardcoded data. Follow these steps once to wire it up.

## 1. Create a Supabase project
Go to https://supabase.com → New project. Pick any name/region, set a DB
password (save it somewhere), and wait ~2 min for it to provision.

## 2. Run the schema
Dashboard → **SQL Editor** → New query → paste the entire contents of
`supabase/schema.sql` → Run.

This creates:
- `office_locations` — geofence centers, admin-managed
- `employees` — one row per person, linked to Supabase Auth
- `attendance` — one row per employee per day
- Row Level Security policies (employees can only see their own data;
  only admins can approve accounts or set salary)
- `mark_attendance()` — a Postgres function that does the actual
  time-window and distance check **on the server**, using the
  database's clock and the office coordinates stored in the DB. This
  is what replaces the old client-side-only check.

## 3. Add your office location(s)
Table Editor → `office_locations` → Insert row:
- `label`: e.g. "Primebulls HQ — Gurugram"
- `lat` / `lng`: get these from Google Maps (right-click your office → the
  coordinates shown at the top of the menu)
- `radius_meters`: how far from that point counts as "at office" (200 is
  a reasonable default for one building)

## 4. Get your API keys
Project Settings → API → copy the **Project URL** and **anon public** key.

In the project root:
```
cp .env.example .env
```
Fill in:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 5. Turn off email confirmation for internal use (optional but recommended)
Authentication → Providers → Email → toggle off "Confirm email" — since
this is an internal staff tool, not a public product, most teams skip the
confirmation email step. If you leave it on, new employees will need to
click a confirmation link in their inbox before their first login creates
their profile row.

## 6. Create the first HR/Admin account
1. Run `npm run dev`, go to `/employee-signup`, and register using your
   own HR email address (the form doesn't ask for salary — that's the point).
2. In Supabase → Table Editor → `employees`, find your new row and run
   this in the SQL Editor instead (safer than editing the grid directly):
   ```sql
   update employees
   set is_admin = true, status = 'active'
   where email = 'your-hr-email@primebulls.live';
   ```
3. Log in again at `/employee-login` — you'll land on `/employee-dashboard`.
   Visit `/admin` directly to reach the HR panel.

## 7. Approve real employees
Every new signup at `/employee-signup` appears under **Pending approval**
in `/admin`. From there HR sets:
- Monthly salary
- Salary credit day (1–28)
- Assigned office location

...and clicks Approve. Only then can that person mark attendance.

## What this does and doesn't guarantee
- ✅ Salary data is no longer sitting in plaintext inside the JS bundle —
  it's in Postgres, behind Row Level Security, readable only by the
  employee themself or an admin.
- ✅ The "sharp 10:00 AM"/"6:00 PM" check now uses the **database clock**
  (IST), so an employee changing their phone's date/time doesn't help.
- ✅ The pass/fail geofence decision is computed **inside Postgres**, not
  in browser JS the employee could edit — they can only submit raw
  lat/lng, never decide "I'm close enough" themselves.
- ⚠️ No web app (this one included) can fully stop **GPS spoofing** at the
  OS level — a fake-location app can still lie about where the phone is.
  If that's a real risk for your team, pair this with something the
  device can't fake as easily: a rotating office Wi-Fi/QR-code check-in,
  or a physical biometric device for anyone whose attendance is
  compliance-sensitive.
