create type user_role as enum ('coach', 'student');
create type training_type as enum ('Rodagem leve', 'Rodagem moderada', 'Fartlek', 'Tiros', 'Longao', 'Rampa', 'Prova');
create type session_status as enum ('scheduled', 'done', 'missed');
create type payment_status as enum ('paid', 'pending', 'overdue');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  business_name text not null,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  coach_id uuid not null references coaches(id) on delete cascade,
  goal text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table trainings (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now()
);

create table training_sessions (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  type training_type not null,
  title text not null,
  scheduled_for date not null,
  distance_km numeric(5,2),
  target_pace text,
  notes text,
  status session_status not null default 'scheduled',
  completed_at timestamptz
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  amount numeric(10,2) not null,
  due_date date not null,
  status payment_status not null default 'pending',
  paid_at timestamptz
);

create table feedbacks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  feeling text not null,
  comment text,
  created_at timestamptz not null default now()
);
