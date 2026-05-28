-- Create the career_timeline table in Supabase
CREATE TABLE public.career_timeline (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    year text NOT NULL,
    role text NOT NULL,
    company text NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    status text DEFAULT 'published', -- 'published' or 'draft'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert the 4 default timeline items
INSERT INTO public.career_timeline (year, role, company, description, display_order, status)
VALUES 
('2024', 'Senior UX Designer', 'Razorpay', 'Leading checkout redesign for 8M users.', 1, 'published'),
('2022', 'UX Designer', 'Byju''s', 'Owned learner onboarding for the K-12 app.', 2, 'published'),
('2021', 'Product Designer', 'Practo', 'Designed doctor-patient chat MVP.', 3, 'published'),
('2020', 'Design Intern', 'Zomato', 'Reshaped restaurant onboarding flow.', 4, 'published');
