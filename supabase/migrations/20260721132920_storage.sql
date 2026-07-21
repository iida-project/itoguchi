-- Storage: 画像用の公開バケット（REQUIREMENTS.md §7 / DESIGN.md §9）
-- 公開読み取り（誰でも閲覧可）、書き込みは認証済みのみ。

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 公開読み取り（storage.objects の RLS は Supabase が有効化済み）
create policy "images_public_read" on storage.objects
  for select
  using (bucket_id = 'images');

-- 認証済みのみアップロード・更新・削除
create policy "images_authenticated_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images');

create policy "images_authenticated_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'images')
  with check (bucket_id = 'images');

create policy "images_authenticated_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images');
