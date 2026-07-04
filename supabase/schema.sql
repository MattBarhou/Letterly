-- Run this in the Supabase SQL editor to set up Letterly tables.

create table if not exists user_profiles (
  user_id text primary key,
  resume_text text,
  default_tone text default 'Professional',
  default_years_experience text default '0',
  updated_at timestamptz default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  company text not null,
  job_title text not null,
  job_description text not null,
  job_url text,
  tone text not null,
  years_experience text not null,
  status text not null default 'saved',
  outputs jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  applied_at timestamptz
);

create index if not exists applications_user_id_created_at
  on applications (user_id, created_at desc);

create table if not exists application_materials (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  user_id text not null,
  type text not null,
  content jsonb not null,
  created_at timestamptz default now()
);

create index if not exists application_materials_app_id
  on application_materials (application_id);
