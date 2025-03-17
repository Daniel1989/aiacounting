-- Create goals table
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('travel', 'shopping', 'savings')),
  target_amount decimal(12,2),
  monthly_income decimal(12,2) not null,
  description text not null,
  time_to_goal integer,
  daily_savings decimal(12,2),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for goals
alter table public.goals enable row level security;

create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Create goal_analyses table
create table if not exists public.goal_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_type text not null,
  target_amount decimal(12,2),
  monthly_income decimal(12,2) not null,
  time_to_goal integer not null,
  daily_savings decimal(12,2) not null,
  suggestions text[] not null,
  actionable_steps text[] not null,
  challenges jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for goal_analyses
alter table public.goal_analyses enable row level security;

create policy "Users can view their own analyses"
  on public.goal_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.goal_analyses for insert
  with check (auth.uid() = user_id);

-- Add updated_at trigger function if not exists
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at trigger to goals table
create trigger set_goals_updated_at
  before update on public.goals
  for each row
  execute function public.set_updated_at(); 