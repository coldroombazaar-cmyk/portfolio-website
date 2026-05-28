-- Create footer_settings table in Supabase
CREATE TABLE IF NOT EXISTS public.footer_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_name text,
    tagline text,
    quick_links_heading text,
    social_heading text,
    copyright_text text,
    footer_icon text,
    show_theme_toggle boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create footer_links table in Supabase
CREATE TABLE IF NOT EXISTS public.footer_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section text NOT NULL, -- 'quick' or 'social'
    label text NOT NULL,
    icon text,
    url text NOT NULL,
    display_order integer DEFAULT 0,
    status text DEFAULT 'active', -- 'active' or 'inactive'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default footer settings
INSERT INTO public.footer_settings (brand_name, tagline, quick_links_heading, social_heading, copyright_text, footer_icon, show_theme_toggle)
VALUES (
    'Atanu Mondal',
    'Designing calm products for noisy industries.',
    'Quick Links',
    'Social',
    '© 2026 Atanu Mondal — Built with curiosity and Cursor.',
    '❤️',
    true
)
ON CONFLICT DO NOTHING;

-- Seed default footer links
INSERT INTO public.footer_links (section, label, icon, url, display_order, status)
VALUES
('quick', 'Home', NULL, 'index.html', 1, 'active'),
('quick', 'About', NULL, 'about.html', 2, 'active'),
('quick', 'Projects', NULL, 'projects.html', 3, 'active'),
('quick', 'Contact', NULL, 'contact.html', 4, 'active'),
('social', 'LinkedIn', '💼', 'https://linkedin.com', 1, 'active'),
('social', 'Dribbble', '🎨', 'https://dribbble.com', 2, 'active'),
('social', 'Twitter', '🐦', 'https://twitter.com', 3, 'active'),
('social', 'Email', '✉️', 'mailto:hello@atanudesign.com', 4, 'active')
ON CONFLICT DO NOTHING;
