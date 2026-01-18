# Blog Setup Guide

This guide explains how to set up and populate the blog system for CheckSiteAEO.

## Database Setup

### Step 1: Run the Database Migrations

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migrations in order:

**First, create the blog_posts table:**
```sql
-- Run: supabase/migrations/20250102_create_blog_posts.sql
```

**Then, insert the initial blog posts:**
```sql
-- Run: supabase/migrations/20250102_insert_initial_blog_posts.sql
```

### Step 2: Verify the Setup

Run this query to check if posts were inserted:

```sql
SELECT slug, title, is_published, published_at 
FROM blog_posts 
WHERE is_published = true 
ORDER BY published_at DESC;
```

You should see 3 blog posts.

## Frontend Pages

The following pages have been created:

- ✅ `/blog` - Blog listing page (fetches from database)
- ✅ `/blog/[slug]` - Individual blog post pages (dynamic routes)

## SEO Features

The blog includes comprehensive SEO:

1. **Dynamic Sitemap** (`/sitemap.xml`)
   - Automatically includes all published blog posts
   - Updates when new posts are added

2. **Robots.txt** (`/robots.txt`)
   - Properly configured to allow blog pages
   - Points to sitemap

3. **Metadata for Each Post**
   - Title and description
   - Open Graph tags
   - Twitter Card tags
   - Canonical URLs
   - Article structured data (JSON-LD)

4. **Blog Listing SEO**
   - Proper meta tags
   - Blog schema markup

## Adding New Blog Posts

### Option 1: Via Supabase SQL Editor

```sql
INSERT INTO public.blog_posts (
    slug,
    title,
    excerpt,
    content,
    category,
    read_time,
    author_name,
    published_at,
    is_published,
    meta_title,
    meta_description,
    meta_keywords
) VALUES (
    'your-post-slug',
    'Your Post Title',
    'A brief excerpt that appears on the blog listing page.',
    '<p>Your full HTML content here...</p>',
    'Education', -- or 'Trends', 'Technical', 'Case Study'
    '5 min read',
    'Author Name',
    NOW(),
    true,
    'SEO Title (optional)',
    'SEO Description (optional)',
    ARRAY['keyword1', 'keyword2'] -- optional
);
```

### Option 2: Via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Select `blog_posts` table
3. Click "Insert row"
4. Fill in all required fields:
   - `slug`: URL-friendly version (e.g., "my-new-post")
   - `title`: Post title
   - `excerpt`: Short description
   - `content`: Full HTML content
   - `category`: Education, Trends, Technical, or Case Study
   - `read_time`: e.g., "5 min read"
   - `author_name`: Author's name
   - `is_published`: Set to `true`
   - `published_at`: Set to current date/time

## Content Guidelines

### Slug Format
- Use lowercase
- Replace spaces with hyphens
- Keep it short and descriptive
- Example: `why-i-stopped-worrying-about-google-rankings`

### Content Format
- Use HTML tags for formatting
- Use `<h2>` for main headings
- Use `<h3>` for subheadings
- Use `<p>` for paragraphs
- Use `<ul>` and `<li>` for lists
- Use `<strong>` for bold text

### Categories
- `Education` - Educational content
- `Trends` - Industry trends and predictions
- `Technical` - Technical guides and tutorials
- `Case Study` - Real-world examples and case studies

## Testing

1. **Check Blog Listing:**
   - Visit `/blog` - should show all published posts

2. **Check Individual Posts:**
   - Visit `/blog/[slug]` - should show full post content

3. **Check SEO:**
   - Visit `/sitemap.xml` - should include all blog posts
   - Visit `/robots.txt` - should be properly configured
   - Check page source for meta tags and structured data

## Troubleshooting

### Posts Not Showing

1. Check `is_published` is set to `true`
2. Verify RLS policies allow public read access
3. Check browser console for errors

### SEO Issues

1. Verify `NEXT_PUBLIC_APP_URL` is set in `.env.local`
2. Check sitemap at `/sitemap.xml`
3. Verify meta tags in page source

### Database Connection

1. Verify Supabase credentials in `.env.local`
2. Check Supabase dashboard for connection issues
3. Verify RLS policies are correct

## Next Steps

- Consider adding an admin interface for blog management
- Add image upload functionality
- Add blog post categories filtering
- Add related posts section
- Add comments system (optional)
