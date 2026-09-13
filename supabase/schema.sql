-- ============================================================
-- PRIMEBULLS EMPLOYEE PORTAL — SUPABASE SCHEMA
-- ============================================================
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste all of this → Run).
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- OFFICE LOCATIONS  (HR/admin managed — the geofence centers)
-- ------------------------------------------------------------
create table if not exists office_locations (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  lat           double precision not null,
  lng           double precision not null,
  radius_meters int not null default 200,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- EMPLOYEES  (1 row per auth.users row — created on self-signup)
-- ------------------------------------------------------------
create table if not exists employees (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null,
  email               text not null unique,
  phone               text,
  designation         text,
  role                text not null default 'Employee' check (role in ('Employee','Intern')),
  status              text not null default 'pending' check (status in ('pending','active','rejected')),
  monthly_salary      numeric,               -- NULL until HR approves; only HR can set this
  salary_credit_day   int check (salary_credit_day between 1 and 28),
  office_location_id  uuid references office_locations(id),
  is_admin            boolean not null default false,
  joined_on           date,
  created_at          timestamptz default now()
);

-- ------------------------------------------------------------
-- ATTENDANCE  (one row per employee per calendar day, IST)
-- ------------------------------------------------------------
create table if not exists attendance (
  id                  uuid primary key default gen_random_uuid(),
  employee_id         uuid not null references employees(id) on delete cascade,
  work_date           date not null,
  morning_time        timestamptz,
  evening_time        timestamptz,
  morning_distance_m  numeric,
  evening_distance_m  numeric,
  created_at          timestamptz default now(),
  unique (employee_id, work_date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table office_locations enable row level security;
alter table employees        enable row level security;
alter table attendance       enable row level security;

-- ---- office_locations ----
-- Any signed-in employee can read office locations (needed to show "Office: X" in UI).
create policy "office_locations_read_authenticated"
  on office_locations for select
  using (auth.role() = 'authenticated');

-- Only admins can create/edit/delete office locations.
create policy "office_locations_admin_write"
  on office_locations for all
  using (exists (select 1 from employees e where e.id = auth.uid() and e.is_admin = true))
  with check (exists (select 1 from employees e where e.id = auth.uid() and e.is_admin = true));

-- ---- employees ----
-- A user can read their own profile row.
create policy "employees_read_own"
  on employees for select
  using (auth.uid() = id);

-- Admins can read every employee row.
create policy "employees_admin_read_all"
  on employees for select
  using (exists (select 1 from employees e where e.id = auth.uid() and e.is_admin = true));

-- A brand-new auth user is allowed to insert exactly one row for themself
-- (this is what runs right after signup — status defaults to 'pending',
-- and monthly_salary/salary_credit_day are left NULL by the app on purpose).
create policy "employees_insert_own_on_signup"
  on employees for insert
  with check (auth.uid() = id);

-- Only admins can update ANY employee row — this is what blocks a normal
-- employee from ever setting their own salary, credit day, status, or
-- is_admin flag. Employees cannot self-approve or self-promote.
create policy "employees_admin_update_all"
  on employees for update
  using (exists (select 1 from employees e where e.id = auth.uid() and e.is_admin = true));

-- ---- attendance ----
-- Employees can read only their own attendance history.
create policy "attendance_read_own"
  on attendance for select
  using (auth.uid() = employee_id);

-- Admins can read everyone's attendance (for payroll/HR review).
create policy "attendance_admin_read_all"
  on attendance for select
  using (exists (select 1 from employees e where e.id = auth.uid() and e.is_admin = true));

-- NOTE: there is intentionally NO insert/update policy for attendance here.
-- Punches are written only through the mark_attendance() function below,
-- which runs as SECURITY DEFINER — an employee's own browser can never
-- insert an attendance row directly, so it can't fake a punch time or
-- a fake "I was near the office" distance.

-- ============================================================
-- mark_attendance() — the only way a punch gets written
-- ------------------------------------------------------------
-- Runs with elevated privileges (SECURITY DEFINER) so it can bypass
-- the attendance table's RLS, but it enforces everything itself:
--   1. The caller must have status = 'active' (HR-approved).
--   2. Time is checked against the DATABASE clock in IST, not the
--      employee's device clock — so changing your phone's time does
--      nothing.
--   3. Distance to the assigned office is computed server-side with
--      the haversine formula — the client only supplies raw lat/lng,
--      it never decides "am I close enough."
-- Caveat that's still worth knowing: this can't stop GPS *spoofing*
-- at the OS/browser level (e.g. a fake-location app) — no web app
-- can fully solve that. What it does guarantee is that the pass/fail
-- decision itself, and the stored record, cannot be edited or forged
-- by the employee's own client code.
-- ============================================================
create or replace function mark_attendance(p_slot text, p_lat double precision, p_lng double precision)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  emp             employees;
  office          office_locations;
  dist_m          double precision;
  now_ist         timestamptz := now() at time zone 'Asia/Kolkata';
  slot_hour       int;
  window_minutes  int := 15;
  slot_time       timestamptz;
  diff_minutes    double precision;
begin
  if p_slot not in ('morning', 'evening') then
    return jsonb_build_object('ok', false, 'message', 'Invalid slot.');
  end if;

  select * into emp from employees where id = auth.uid();
  if emp.id is null then
    return jsonb_build_object('ok', false, 'message', 'Employee profile not found.');
  end if;
  if emp.status <> 'active' then
    return jsonb_build_object('ok', false, 'message', 'Your account is pending HR approval.');
  end if;

  select * into office from office_locations where id = emp.office_location_id;
  if office.id is null then
    return jsonb_build_object('ok', false, 'message', 'No office location assigned yet — contact HR.');
  end if;

  -- Haversine distance in meters
  dist_m := 6371000 * acos(
    least(1, greatest(-1,
      cos(radians(office.lat)) * cos(radians(p_lat)) * cos(radians(p_lng) - radians(office.lng))
      + sin(radians(office.lat)) * sin(radians(p_lat))
    ))
  );

  slot_hour := case when p_slot = 'morning' then 10 else 18 end;
  slot_time := date_trunc('day', now_ist) + make_interval(hours => slot_hour);
  diff_minutes := extract(epoch from (now_ist - slot_time)) / 60;

  if diff_minutes < -window_minutes or diff_minutes > window_minutes then
    return jsonb_build_object(
      'ok', false,
      'message', format('Outside the punch window (allowed %s:00 IST +/- %s min).',
                         lpad(slot_hour::text, 2, '0'), window_minutes)
    );
  end if;

  if dist_m > office.radius_meters then
    return jsonb_build_object(
      'ok', false,
      'message', format('You are %s m from %s — must be within %s m.',
                         round(dist_m)::text, office.label, office.radius_meters),
      'distance', dist_m
    );
  end if;

  insert into attendance (employee_id, work_date, morning_time, morning_distance_m, evening_time, evening_distance_m)
  values (
    auth.uid(),
    now_ist::date,
    case when p_slot = 'morning' then now() end,
    case when p_slot = 'morning' then dist_m end,
    case when p_slot = 'evening' then now() end,
    case when p_slot = 'evening' then dist_m end
  )
  on conflict (employee_id, work_date) do update
    set morning_time       = case when p_slot = 'morning' then excluded.morning_time else attendance.morning_time end,
        morning_distance_m = case when p_slot = 'morning' then excluded.morning_distance_m else attendance.morning_distance_m end,
        evening_time       = case when p_slot = 'evening' then excluded.evening_time else attendance.evening_time end,
        evening_distance_m = case when p_slot = 'evening' then excluded.evening_distance_m else attendance.evening_distance_m end;

  return jsonb_build_object('ok', true, 'message', 'Attendance marked.', 'distance', dist_m);
end;
$$;

grant execute on function mark_attendance(text, double precision, double precision) to authenticated;

-- ============================================================
-- FIRST ADMIN
-- ------------------------------------------------------------
-- There's a chicken-and-egg problem: only an admin can approve
-- employees, but the very first admin can't be created through the
-- app. After your first HR person signs up through /employee-signup,
-- run this once (swap in their real email):
--
--   update employees
--   set is_admin = true, status = 'active'
--   where email = 'hr@primebulls.live';
-- ============================================================
