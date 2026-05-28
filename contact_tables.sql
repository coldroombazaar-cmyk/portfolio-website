-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Contact Page Settings Table
CREATE TABLE IF NOT EXISTS contact_page_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_title text NOT NULL DEFAULT 'Let''s build something good.',
  page_subtitle text NOT NULL DEFAULT 'Project enquiries, mentorship, or just a chai-chat. I reply within 24 hours.',
  contact_heading text NOT NULL DEFAULT 'Get in touch',
  email_label text NOT NULL DEFAULT 'Email',
  email_address text NOT NULL DEFAULT 'hello@atanudesign.com',
  location_label text NOT NULL DEFAULT 'Location',
  location_text text NOT NULL DEFAULT 'Bengaluru, India',
  success_message text NOT NULL DEFAULT '✅ Thanks! Your message was sent. I''ll reply within 24 hours.',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert default row if table is empty
INSERT INTO contact_page_settings (page_title, page_subtitle, contact_heading, email_label, email_address, location_label, location_text, success_message)
SELECT 'Let''s build something good.', 'Project enquiries, mentorship, or just a chai-chat. I reply within 24 hours.', 'Get in touch', 'Email', 'hello@atanudesign.com', 'Location', 'Bengaluru, India', '✅ Thanks! Your message was sent. I''ll reply within 24 hours.'
WHERE NOT EXISTS (SELECT 1 FROM contact_page_settings LIMIT 1);

-- 2. Contact Social Links Table
CREATE TABLE IF NOT EXISTS contact_social_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  label text NOT NULL,
  icon text NOT NULL,
  url text NOT NULL,
  display_order integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert default social links
INSERT INTO contact_social_links (label, icon, url, display_order, status)
SELECT 'LinkedIn', '💼', 'https://linkedin.com', 1, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_social_links WHERE label = 'LinkedIn');

INSERT INTO contact_social_links (label, icon, url, display_order, status)
SELECT 'Dribbble', '🎨', 'https://dribbble.com', 2, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_social_links WHERE label = 'Dribbble');

INSERT INTO contact_social_links (label, icon, url, display_order, status)
SELECT 'Twitter', '🐦', 'https://twitter.com', 3, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_social_links WHERE label = 'Twitter');

-- 3. Contact Subject Options Table
CREATE TABLE IF NOT EXISTS contact_subject_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_label text NOT NULL,
  option_value text NOT NULL,
  display_order integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert default subject options
INSERT INTO contact_subject_options (option_label, option_value, display_order, status)
SELECT 'Project Inquiry', 'Project Inquiry', 1, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_subject_options WHERE option_label = 'Project Inquiry');

INSERT INTO contact_subject_options (option_label, option_value, display_order, status)
SELECT 'Collaboration', 'Collaboration', 2, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_subject_options WHERE option_label = 'Collaboration');

INSERT INTO contact_subject_options (option_label, option_value, display_order, status)
SELECT 'Mentorship', 'Mentorship', 3, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_subject_options WHERE option_label = 'Mentorship');

INSERT INTO contact_subject_options (option_label, option_value, display_order, status)
SELECT 'Speaking', 'Speaking', 4, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_subject_options WHERE option_label = 'Speaking');

INSERT INTO contact_subject_options (option_label, option_value, display_order, status)
SELECT 'Other', 'Other', 5, 'active'
WHERE NOT EXISTS (SELECT 1 FROM contact_subject_options WHERE option_label = 'Other');

-- Set up RLS policies (Allow public read, require auth for write - assuming typical setup)
ALTER TABLE contact_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_subject_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on contact_page_settings" ON contact_page_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on contact_social_links" ON contact_social_links FOR SELECT USING (true);
CREATE POLICY "Allow public read access on contact_subject_options" ON contact_subject_options FOR SELECT USING (true);

-- Allow authenticated users to perform all operations
CREATE POLICY "Allow authenticated full access on contact_page_settings" ON contact_page_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access on contact_social_links" ON contact_social_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access on contact_subject_options" ON contact_subject_options FOR ALL USING (auth.role() = 'authenticated');
