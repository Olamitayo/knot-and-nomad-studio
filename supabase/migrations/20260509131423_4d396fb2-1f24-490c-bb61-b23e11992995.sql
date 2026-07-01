
create table public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  whatsapp text not null,
  clothing_type text not null,
  preferred_color text,
  size text,
  quantity int,
  print_position text,
  print_text text,
  design_description text,
  design_file_url text,
  deadline date,
  budget text,
  ai_idea text,
  additional_notes text,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.custom_orders enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "anyone can submit custom orders"
  on public.custom_orders for insert
  to anon, authenticated
  with check (true);

create policy "anyone can submit contact"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "anyone can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

insert into storage.buckets (id, name, public) values ('design-uploads', 'design-uploads', true)
on conflict (id) do nothing;

create policy "anyone can upload design files"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'design-uploads');

create policy "design files are public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'design-uploads');
