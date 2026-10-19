-- Run once in a NEW Supabase project. No public account creation.
create table if not exists public.opus_state (
 id integer primary key check(id=1), version bigint not null default 0,
 draft jsonb not null default '{}'::jsonb, published jsonb not null default '{}'::jsonb,
 images_hidden boolean not null default true, updated_at timestamptz not null default now()
);
insert into public.opus_state(id) values(1) on conflict do nothing;
create table if not exists public.opus_revisions (
 id bigint generated always as identity primary key, version bigint not null,
 draft jsonb not null, published jsonb not null, action text not null, created_at timestamptz not null default now()
);
create table if not exists public.opus_media (
 id uuid primary key, path text not null unique, name text not null, mime text not null,
 bytes integer not null check(bytes>0 and bytes<=8388608), watermarked boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.opus_limits (key text primary key, started timestamptz not null default now(), count integer not null default 1);
alter table public.opus_state enable row level security;
alter table public.opus_revisions enable row level security;
alter table public.opus_media enable row level security;
alter table public.opus_limits enable row level security;
revoke all on public.opus_state,public.opus_revisions,public.opus_media,public.opus_limits from anon,authenticated;
-- No storage SELECT policies for anon/authenticated: all media through server proxy.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('opus-private','opus-private',false,8388608,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=false,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;
create or replace function public.opus_commit(expected bigint, next_draft jsonb, publish_now boolean, label text)
returns bigint language plpgsql security definer set search_path=public as $$
declare s public.opus_state; n bigint;
begin
 select * into s from public.opus_state where id=1 for update;
 if s.version<>expected then raise exception 'VERSION_CONFLICT'; end if;
 insert into public.opus_revisions(version,draft,published,action) values(s.version,s.draft,s.published,left(label,100));
 n:=s.version+1;
 update public.opus_state set version=n,draft=next_draft,
 published=case when publish_now then next_draft else s.published end,updated_at=now() where id=1;
 -- Keep last 100 revisions; exported backups provide longer history.
 delete from public.opus_revisions where id in(select id from public.opus_revisions order by id desc offset 100);
 return n;
end $$;
create or replace function public.opus_rate(bucket text, window_seconds integer, maximum integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into public.opus_limits(key) values(bucket)
 on conflict(key) do update set count=case when opus_limits.started<now()-make_interval(secs=>window_seconds) then 1 else opus_limits.count+1 end,
 started=case when opus_limits.started<now()-make_interval(secs=>window_seconds) then now() else opus_limits.started end returning count into n;
 delete from public.opus_limits where started<now()-interval '2 days';
 return n<=maximum;
end $$;
revoke execute on function public.opus_commit(bigint,jsonb,boolean,text),public.opus_rate(text,integer,integer) from public,anon,authenticated;
grant execute on function public.opus_commit(bigint,jsonb,boolean,text),public.opus_rate(text,integer,integer) to service_role;
grant all on public.opus_state,public.opus_revisions,public.opus_media,public.opus_limits to service_role;
grant usage,select on all sequences in schema public to service_role;
