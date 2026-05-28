CREATE TABLE public.about_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    years_experience integer DEFAULT 0,
    years_label text DEFAULT 'years experience',
    shipped_projects integer DEFAULT 0,
    shipped_label text DEFAULT 'shipped projects',
    awards_count integer DEFAULT 0,
    awards_label text DEFAULT 'awards',
    profile_image_url text,
    paragraph_1 text,
    paragraph_2 text,
    paragraph_3 text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.about_content (
    years_experience, years_label, 
    shipped_projects, shipped_label, 
    awards_count, awards_label, 
    profile_image_url, 
    paragraph_1, paragraph_2, paragraph_3
) VALUES (
    5, '+ years experience', 
    30, '+ shipped projects', 
    12, 'awards', 
    'https://placehold.co/400x400/4f46e5/ffffff?text=Atanu', 
    'I design products at the intersection of business goals and human emotion. My happiest projects are the ones where a measurable metric (conversion, retention, time-on-task) moves <em>and</em> users send unsolicited thank-you messages.', 
    'Before design, I trained as a psychology major — which still shows up in how I run research. I believe the best interviews feel like good conversations, not interrogations.', 
    'When I''m not in Figma, you''ll find me sketching in cafés, running ultra-marathons very slowly, or trying (and failing) to keep my plants alive.'
);
