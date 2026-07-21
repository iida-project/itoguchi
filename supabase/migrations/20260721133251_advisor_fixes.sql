-- get_advisors（security）の指摘対応
-- 1) set_updated_at の search_path を固定（function_search_path_mutable）
-- 2) 公開バケット images の広い SELECT ポリシーを削除（public_bucket_allows_listing）。
--    public バケットはオブジェクト URL 直アクセスに SELECT ポリシー不要で、
--    残すと全ファイルの列挙を許してしまうため削除する（最小権限）。

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop policy if exists "images_public_read" on storage.objects;
