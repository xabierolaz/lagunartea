-- Schema for Supabase persistence used by the Lagunartea app
-- Run this in your Supabase SQL editor or as a migration.

-- Members
create table if not exists public.members (
  id integer primary key,
  first_name text not null,
  last_name text not null,
  phone text
);

-- Reservations
create table if not exists public.reservations (
  id uuid primary key,
  member_id integer not null references public.members(id),
  date date not null,
  start_time text not null,
  type text not null,
  diners integer,
  member_diners integer,
  space text,
  spaces text[],
  kitchen_services text[],
  light_included boolean default false,
  created_at bigint not null
);

-- Ensure multi-space support even if table existed before
alter table public.reservations add column if not exists spaces text[];
-- migrate legacy single space into array on first run
update public.reservations
set spaces = array[space]
where spaces is null and space is not null;

-- Consumptions
create table if not exists public.consumptions (
  id uuid primary key,
  member_id integer not null references public.members(id),
  date date not null,
  amount numeric not null,
  description text not null,
  created_at bigint not null
);

-- Enable RLS and open access for the anon key (public app)
alter table public.members enable row level security;
alter table public.reservations enable row level security;
alter table public.consumptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'members' and policyname = 'Members are readable by anyone'
  ) then
    create policy "Members are readable by anyone" on public.members
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'members' and policyname = 'Members can be updated by anyone'
  ) then
    create policy "Members can be updated by anyone" on public.members
      for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reservations' and policyname = 'Reservations are readable by anyone'
  ) then
    create policy "Reservations are readable by anyone" on public.reservations
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reservations' and policyname = 'Reservations can be inserted by anyone'
  ) then
    create policy "Reservations can be inserted by anyone" on public.reservations
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reservations' and policyname = 'Reservations can be deleted by anyone'
  ) then
    create policy "Reservations can be deleted by anyone" on public.reservations
      for delete using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'consumptions' and policyname = 'Consumptions are readable by anyone'
  ) then
    create policy "Consumptions are readable by anyone" on public.consumptions
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'consumptions' and policyname = 'Consumptions can be inserted by anyone'
  ) then
    create policy "Consumptions can be inserted by anyone" on public.consumptions
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'consumptions' and policyname = 'Consumptions can be deleted by anyone'
  ) then
    create policy "Consumptions can be deleted by anyone" on public.consumptions
      for delete using (true);
  end if;
end $$;

-- Catalog of editable items (prices, beverages, services, fees)
create table if not exists public.items (
  id text primary key,
  name text not null,
  icon text,
  price numeric not null,
  category text not null, -- e.g. bebida, servicio, cuota
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'items' and policyname = 'Items are readable by anyone'
  ) then
    create policy "Items are readable by anyone" on public.items
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'items' and policyname = 'Items can be inserted by anyone'
  ) then
    create policy "Items can be inserted by anyone" on public.items
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'items' and policyname = 'Items can be updated by anyone'
  ) then
    create policy "Items can be updated by anyone" on public.items
      for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'items' and policyname = 'Items can be deleted by anyone'
  ) then
    create policy "Items can be deleted by anyone" on public.items
      for delete using (true);
  end if;
end $$;

-- Seed default items (upsert)
insert into public.items (id, name, icon, price, category, sort_order) values
  ('luz_fronton', 'Luz Frontón', '💡', 6.00, 'servicio', 10),
  ('lena', 'Leña', '🪵', 4.00, 'servicio', 20),
  ('descorche', 'Descorche', '🍾', 2.00, 'servicio', 30),
  ('comensal_socio', 'Comensal Socio', '👤', 1.75, 'cuota', 40),
  ('comensal_no_socio', 'Comensal No Socio', '👥', 3.00, 'cuota', 50),
  ('cerveza', 'Cerveza', '🍺', 1.80, 'bebida', 100),
  ('refresco', 'Refresco/Gaseosa', '🥤', 1.80, 'bebida', 110),
  ('vino_blanco', 'Vino Blanco (Bornos)', '🥂', 7.50, 'bebida', 120),
  ('vino_rosado', 'Vino Rosado (Sarria)', '🍷', 6.00, 'bebida', 130),
  ('vino_tinto', 'Vino Tinto (Sarria)', '🍷', 6.00, 'bebida', 140),
  ('vino_lopez_haro', 'Vino López de Haro', '🍷', 8.00, 'bebida', 150),
  ('sidra', 'Sidra', '🍾', 5.00, 'bebida', 160)
on conflict (id) do update
set name = excluded.name,
    icon = excluded.icon,
    price = excluded.price,
    category = excluded.category,
    sort_order = excluded.sort_order;

-- Seed members (upsert)
insert into public.members (id, last_name, first_name, phone) values
  (1, 'Alfonso', 'Ignacio', '671271927'),
  (2, 'Alfonso', 'Luis', '646143396'),
  (3, 'Amatriain', 'Domingo', '666444940'),
  (4, 'Araujo', 'Rafael', '627953993'),
  (5, 'Arbeloa', 'Joaquin Miguel', '656910513'),
  (6, 'Arenaza', 'Miguel A.', '635970169'),
  (7, 'Arguedas', 'Alberto', null),
  (8, 'Asiain', 'Jesus Javier', '600387412'),
  (9, 'Berrade', 'Xabi', '646905200'),
  (10, 'Beunza', 'Carlos', '685266274'),
  (11, 'Camats', 'Jorge', '609414447'),
  (12, 'Cruceira', 'Jose Antonio', '661802707'),
  (13, 'Cruz', 'Miguel Angel', '667523500'),
  (14, 'Cruz', 'Benedicto', '659776890'),
  (15, 'Domeño', 'Javier', '629471633'),
  (16, 'Echavarren', 'Alfonso', '636730484'),
  (17, 'Echavarren', 'Juan', '659298087'),
  (18, 'Echavarren', 'Enrique', '620546198'),
  (19, 'Echavarren', 'Guillermo', '678535407'),
  (20, 'Echeverria', 'Joaquin', '629778966'),
  (21, 'Echeverria', 'Miguel', '645434410'),
  (22, 'Echeverria', 'Juan Mi.', '609477661'),
  (23, 'Egaña', 'Fco. Javier', '620239024'),
  (24, 'Egaña', 'Pedro', '625688036'),
  (25, 'Elizalde', 'Mikel', '660268680'),
  (26, 'Erro', 'Jesus Alberto', '630066604'),
  (27, 'Erroz', 'Juan', '609859013'),
  (28, 'Fernandez', 'Miki', '660801211'),
  (29, 'Fernandez', 'Mitxel', '616684132'),
  (30, 'Goñi', 'Santiago', '656906031'),
  (31, 'Itarte', 'Alberto', '616085101'),
  (32, 'Lopez', 'Jose Manuel', '649235107'),
  (33, 'Mendioroz', 'Juan Simon', '616480019'),
  (34, 'Moriones', 'Iñaki', '629853485'),
  (35, 'Murillo', 'Carlos', '660321525'),
  (36, 'Nagore', 'Jesus', '618937153'),
  (37, 'Percaz', 'Joaquin', '637460019'),
  (38, 'Ramos', 'Daniel', '618241092'),
  (39, 'Purroy', 'Asier', '609380289'),
  (40, 'Rodriguez', 'Antonio', '948228928'),
  (41, 'Rodriguez', 'Fco. Javier', '669866706'),
  (42, 'Rodriguez', 'Santiago', '679502580'),
  (43, 'Saralegui', 'Fermin', '606984831'),
  (44, 'Tirapu', 'Fermin', '646079980'),
  (45, 'Tirapu', 'Javier', '619984954'),
  (46, 'Tirapu', 'Iñaki', '692698947'),
  (47, 'Zoco', 'Pedro Mª', '659334324'),
  (48, 'Zunzarren', 'Raul', '670533166'),
  (49, 'Zaratiegui', 'Fernando', '629662229'),
  (50, 'Urdiroz', 'Martin Jesus', '629454796'),
  (51, 'Urdiroz', 'Pablo', '628173287')
on conflict (id) do update
set first_name = excluded.first_name,
    last_name  = excluded.last_name,
    phone      = excluded.phone;
