CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    short_description text NOT NULL,
    full_description text,
    tags text,
    image_url text,
    image_bg_color text,
    button_text text DEFAULT 'View Case Study →',
    button_link text DEFAULT '#',
    status text DEFAULT 'draft',
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
