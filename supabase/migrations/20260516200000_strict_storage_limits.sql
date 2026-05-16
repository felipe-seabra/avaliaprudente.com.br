-- Update storage bucket configuration to enforce stricter file size limits
-- Note: Supabase Storage bucket configurations are sometimes managed via the dashboard, 
-- but we can attempt to update the metadata if the schema allows.

-- Ensure the bucket exists and set a strict file size limit of 512KB (safety margin over 300KB)
-- This acts as our "backend" validation for direct client uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-assets', 'business-assets', true, 524288, '{image/jpeg,image/png,image/webp,image/svg+xml}')
on conflict (id) do update set 
  file_size_limit = 524288,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,image/svg+xml}';
