-- Update handle_new_user trigger to include terms metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    terms_accepted_at,
    terms_version
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.raw_user_meta_data->>'terms_accepted_at' IS NOT NULL 
      THEN (new.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMPTZ 
      ELSE NULL 
    END,
    new.raw_user_meta_data->>'terms_version'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
