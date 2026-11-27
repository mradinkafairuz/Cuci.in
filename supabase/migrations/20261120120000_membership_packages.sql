alter table public.memberships
  add column if not exists package_code text not null default 'legacy',
  add column if not exists package_name text not null default 'Membership',
  add column if not exists monthly_price integer not null default 0,
  add column if not exists discount_percent integer not null default 0,
  add column if not exists status text not null default 'active';

alter table public.memberships
  drop constraint if exists memberships_package_code_check,
  add constraint memberships_package_code_check
    check (package_code in ('hemat', 'prioritas', 'legacy')),
  drop constraint if exists memberships_monthly_price_check,
  add constraint memberships_monthly_price_check
    check (monthly_price >= 0),
  drop constraint if exists memberships_discount_percent_check,
  add constraint memberships_discount_percent_check
    check (discount_percent between 0 and 100),
  drop constraint if exists memberships_status_check,
  add constraint memberships_status_check
    check (status in ('pending_payment', 'active', 'expired', 'cancelled'));

comment on column public.memberships.package_code is 'Selected membership package: hemat, prioritas, or legacy';
comment on column public.memberships.status is 'Payment/activation state; new paid memberships wait for confirmation';
