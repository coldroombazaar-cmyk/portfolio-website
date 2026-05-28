-- Create splash_settings table in Supabase
CREATE TABLE public.splash_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    is_enabled boolean DEFAULT true NOT NULL,
    splash_text text DEFAULT 'Atanu Mondal' NOT NULL,
    duration_ms integer DEFAULT 900 NOT NULL,
    fade_duration_ms integer DEFAULT 900 NOT NULL,
    show_once_per_session boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert one default row
INSERT INTO public.splash_settings (is_enabled, splash_text, duration_ms, fade_duration_ms, show_once_per_session)
VALUES (true, 'Atanu Mondal', 900, 900, false);
