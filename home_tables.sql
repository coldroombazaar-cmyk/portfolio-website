-- Create home_hero table in Supabase
CREATE TABLE IF NOT EXISTS public.home_hero (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    is_enabled boolean DEFAULT true NOT NULL,
    eyebrow text NOT NULL,
    headline text NOT NULL,
    subheadline text NOT NULL,
    cta_text text NOT NULL,
    cta_link text DEFAULT 'projects.html' NOT NULL,
    skills_heading text DEFAULT 'What I Do' NOT NULL,
    skills_tagline text DEFAULT 'A toolkit shaped by 5 years of shipping real products.' NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create home_skills table in Supabase
CREATE TABLE IF NOT EXISTS public.home_skills (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    icon text, -- emoji or emoji-icon representation
    title text NOT NULL,
    description text NOT NULL,
    display_order integer DEFAULT 0,
    status text DEFAULT 'published', -- 'published' or 'draft'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default home hero and skills settings
INSERT INTO public.home_hero (is_enabled, eyebrow, headline, subheadline, cta_text, cta_link, skills_heading, skills_tagline)
VALUES (
    true,
    'PORTFOLIO 2026',
    'I design products people actually enjoy using.',
    'Senior UX Designer with 5 years of experience in fintech, edtech and healthcare.',
    'See My Work →',
    'projects.html',
    'What I Do',
    'A toolkit shaped by 5 years of shipping real products.'
)
ON CONFLICT DO NOTHING;

-- Seed default home skills cards
INSERT INTO public.home_skills (icon, title, description, display_order, status)
VALUES
('🎨', 'User Research', 'Interviews, surveys and usability tests that uncover real user needs.', 1, 'published'),
('🖌️', 'UI Design', 'Pixel-perfect interfaces built in Figma with reusable design systems.', 2, 'published'),
('🧭', 'Information Architecture', 'Clear sitemaps and flows that make complex products feel simple.', 3, 'published'),
('📐', 'Prototyping', 'High-fidelity, clickable prototypes that validate ideas before a single line of code.', 4, 'published'),
('♿', 'Accessibility', 'WCAG-compliant designs that work for everyone, on every device.', 5, 'published'),
('📊', 'Design Systems', 'Scalable component libraries that keep teams shipping fast and consistently.', 6, 'published')
ON CONFLICT DO NOTHING;
