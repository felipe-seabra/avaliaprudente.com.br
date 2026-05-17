-- 1. Create verification_requests table
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message text,
  admin_response text,
  created_at timestamp with time zone default now() not null,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id) on delete set null
);

-- 2. Create notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'info', -- 'info', 'success', 'warning', 'error'
  is_read boolean default false not null,
  action_url text,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.verification_requests enable row level security;
alter table public.notifications enable row level security;

-- Policies for verification_requests
create policy "Users can view their own verification requests"
  on public.verification_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own verification requests"
  on public.verification_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all verification requests"
  on public.verification_requests for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Policies for notifications
create policy "Users can manage their own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

create policy "Admins can create notifications for anyone"
  on public.notifications for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- 3. Trigger to notify admins on new verification request
create or replace function public.notify_admin_on_verification_request()
returns trigger as $$
declare
  admin_id uuid;
  biz_name text;
begin
  select name into biz_name from public.businesses where id = new.business_id;
  
  -- Create notification for all admins
  for admin_id in (select id from public.profiles where role = 'admin') loop
    insert into public.notifications (user_id, title, message, action_url, type)
    values (admin_id, 'Novo pedido de verificação', biz_name || ' solicitou o selo de verificação.', '/admin/verifications', 'info');
  end loop;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_verification_request_created
  after insert on public.verification_requests
  for each row execute procedure public.notify_admin_on_verification_request();

-- 4. Trigger to notify user on verification status change
create or replace function public.notify_user_on_verification_status_change()
returns trigger as $$
begin
  if (new.status = 'approved') then
    insert into public.notifications (user_id, title, message, type)
    values (new.user_id, 'Empresa Verificada', 'Seu negócio foi aprovado e agora exibe o selo de verificação.', 'success');
  elsif (new.status = 'rejected') then
    insert into public.notifications (user_id, title, message, type)
    values (new.user_id, 'Pedido de Verificação Rejeitado', 'Seu pedido de verificação não foi aprovado no momento.', 'error');
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_verification_request_updated
  after update on public.verification_requests
  for each row 
  when (old.status != new.status)
  execute procedure public.notify_user_on_verification_status_change();

-- 5. Indexes
create index idx_verification_requests_business on public.verification_requests(business_id);
create index idx_verification_requests_user on public.verification_requests(user_id);
create index idx_verification_requests_status on public.verification_requests(status);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(is_read);
