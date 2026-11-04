-- Additive migration: existing orders and legacy API clients retain their columns.
-- Legacy rows use [] to signal that the original scalar fields are authoritative.
alter table public.custom_orders
  add column items jsonb not null default '[]'::jsonb,
  add column is_first_custom_order boolean,
  add column consultation_requested boolean not null default false,
  add column consultation_status text,
  add column consultation_method text,
  add column consultation_date date,
  add column consultation_time time,
  add column consultation_questions text,
  add constraint custom_order_items_array check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 5),
  add constraint custom_order_consultation_status check (consultation_status in ('Requested', 'Assigned', 'In progress', 'Completed')),
  add constraint custom_order_consultation_required check (
    not consultation_requested or (
      consultation_status is not null and
      consultation_method is not null and consultation_method in ('WhatsApp call', 'Phone call', 'Video consultation') and
      consultation_date is not null and consultation_time is not null
    )
  );
comment on column public.custom_orders.items is 'Canonical garment line items; legacy scalar design fields mirror the first item and quantity is the overall total.';
