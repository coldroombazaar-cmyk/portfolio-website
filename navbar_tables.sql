-- Create navbar_settings table
CREATE TABLE public.navbar_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_text text NOT NULL,
    brand_link text DEFAULT 'index.html',
    show_theme_toggle boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create navbar_items table
CREATE TABLE public.navbar_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    label text NOT NULL,
    url text NOT NULL,
    display_order integer DEFAULT 0,
    status text DEFAULT 'active', -- 'active' or 'inactive'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default navbar settings row
INSERT INTO public.navbar_settings (brand_text, brand_link, show_theme_toggle)
VALUES ('Atanu Mondal', 'index.html', true);

-- Insert default navbar items rows
INSERT INTO public.navbar_items (label, url, display_order, status)
VALUES 
('Home', 'index.html', 1, 'active'),
('About', 'about.html', 2, 'active'),
('Projects', 'projects.html', 3, 'active'),
('Contact', 'contact.html', 4, 'active');
