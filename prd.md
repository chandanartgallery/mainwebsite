# MASTER PROMPT FOR KIRO — BUILD “CHANDAN ART GALLERY” GLOBAL E-COMMERCE PLATFORM

You are a senior full-stack architect, UI/UX designer, DevOps engineer, SEO strategist, and production deployment expert.

Build a COMPLETE, PRODUCTION-READY, ULTRA-PREMIUM, GLOBAL E-COMMERCE WEBSITE for a family business named:

# CHANDAN ART GALLERY

---

# BUSINESS CATEGORIES

- Photo Frames
- Custom Photo Frames
- Acrylic Frames
- Canvas Prints
- Religious Frames & Idols
- Home Decor
- Wall Decor
- Personalized Gifts
- Wooden Art
- Mandir Decor
- Premium Wall Art
- Traditional Indian Decor
- Festival Decor
- Corporate Gifting
- Custom Art Prints

---

# PROJECT GOAL

This is NOT a demo project.

The final product must feel like a REAL global luxury ecommerce brand comparable to:

- Amazon
- Flipkart
- Pepperfry
- Printo
- Zoomin
- Walraft
- IKEA
- Apple-level clean premium UI

The final product must be:

- Ultra polished
- Premium
- Minimal
- Elegant
- Blazing fast
- SEO optimized
- Mobile-first
- Fully responsive
- Production ready
- Scalable globally
- Fully connected to database
- No mock/demo data
- No broken links
- No placeholder pages
- No 404s
- Clean architecture
- Enterprise-grade

Use the attached reference screenshots ONLY for inspiration.

DO NOT copy layouts directly.

Create something significantly better and more premium.

---

# TECH STACK (MANDATORY)

## Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn/UI
- Lucide Icons
- Zustand or Redux Toolkit
- React Hook Form
- Zod validation

## Backend
- Next.js Server Actions + API Routes
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

## Other
- TanStack Query
- UploadThing or Supabase Storage Uploads
- Nodemailer or Resend
- Cloudflare-compatible setup
- reCAPTCHA
- Progressive Web App support
- Image optimization
- Structured metadata
- Dynamic sitemap
- Robots.txt generation

Run localhost on:

```bash
PORT=3000
```

Run command:

```bash
npm run dev
```

---

# VERY IMPORTANT — SUPABASE INDIA PROXY REQUIREMENT

Supabase is unreliable/banned in some Indian networks.

DO NOT connect frontend directly to Supabase.

Architecture MUST be:

User  
→ Next.js frontend  
→ Secure internal API/proxy routes  
→ Supabase

Create a secure proxy layer:

- `/api/supabase/*`
- All DB/auth requests pass through backend
- Never expose service role key to frontend
- Use middleware + rate limiting
- Secure session handling
- CSRF protection where needed

This architecture is MANDATORY.

---

# ENV VARIABLES

Create a proper `.env.local`

Add and USE these credentials:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://pykgahwdzqotbchvaviq.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

SUPABASE_PROJECT_ID=pykgahwdzqotbchvaviq

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=YOUR_RECAPTCHA_SITE_KEY

RECAPTCHA_SECRET_KEY=YOUR_RECAPTCHA_SECRET_KEY

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

WHATSAPP_NUMBER=8468845759
```

IMPORTANT:

- Country code `91` should ONLY be added while generating WhatsApp URL.
- DO NOT store `918468845759` directly in env.
- Store ONLY `8468845759`
- Final WhatsApp redirect should correctly become:

```txt
https://wa.me/918468845759
```

without duplicating country code.

Use proper env validation.

Never hardcode secrets anywhere else.

---

# AUTHENTICATION SYSTEM

Implement FULL authentication system.

## Login Methods
- Email/password
- Google OAuth (already configured in Supabase)
- Magic link login
- Forgot password
- Reset password

## Security
- Google reCAPTCHA on:
  - signup
  - login
  - forgot password
- Rate limiting
- Session management
- JWT validation
- Secure cookies
- Email verification
- Password strength indicator

## User Features
- User dashboard
- Profile settings
- Saved addresses
- Wishlist/favorites
- Recently viewed products
- Inquiry history
- Account settings
- Notification preferences
- Profile photo upload
- Delete account option

---

# E-COMMERCE FEATURES

Implement EVERYTHING expected from modern ecommerce.

## Core Features
- Product listing
- Product details page
- Categories
- Subcategories
- Product variants
- Image galleries
- Zoom on hover
- Related products
- Recommended products
- Recently viewed
- Trending products
- New arrivals
- Best sellers

## Search
- Smart search bar
- Instant suggestions
- Search history
- Typo tolerance
- Filtered search

## Filters
- Price
- Size
- Material
- Color
- Category
- Orientation
- Religious category
- Style
- Popularity
- Latest

## Favorites / Wishlist
- Heart icon
- Save products
- Sync with account
- Wishlist page

## Cart System
- Add to cart
- Remove from cart
- Update quantity
- Save for later
- Persistent cart
- Cart drawer
- Animated interactions

---

# IMPORTANT — BUY FLOW

NO ONLINE PAYMENT GATEWAY.

Instead:

Every product page MUST have:

- “Contact to Buy”
- “Buy on WhatsApp”

Button behavior:

Open WhatsApp chat to:

```txt
+91 8468845759
```

Prewritten message format:

```txt
Hello,

I want to buy this product:

[PRODUCT NAME]

Product Link:
[CURRENT PRODUCT URL]

Please share price and availability.
```

Use encoded WhatsApp URL.

Must work perfectly on:

- Mobile
- Desktop
- WhatsApp app
- WhatsApp web

---

# PRODUCT SYSTEM

Create advanced product schema.

Each product should support:

- Name
- Slug
- SKU
- Description
- Short description
- Multiple images
- Category
- Subcategory
- Tags
- Dimensions
- Material
- Weight
- Color
- Customizable or not
- Featured product
- Trending product
- SEO title
- SEO description
- SEO keywords
- OpenGraph image
- FAQs
- Related products

---

# PRODUCT COMMENTS & REVIEWS

Implement a COMPLETE comments and reviews system under every product.

Features:

- Star ratings
- Customer reviews
- Product comments
- Nested replies
- Verified badges
- Image uploads
- Review moderation
- Admin approval system
- Sort reviews
- Helpful votes
- Report abuse
- Review analytics

Store everything in Supabase.

---

# ADMIN PANEL (VERY IMPORTANT)

Create FULL admin dashboard.

Admin Features:

- Dashboard analytics
- Product management
- Category management
- Upload images
- Inventory management
- Customer inquiries
- Wishlist analytics
- Traffic analytics
- SEO management
- Homepage editor
- Hero banner editor
- Featured section editor
- User management
- Review moderation
- Contact submissions
- WhatsApp inquiry tracking
- Blog management
- Blog editor
- Product comments moderation

---

# WEBSITE ANALYTICS INSIGHTS (VERY IMPORTANT)

Create ADVANCED analytics dashboard inside admin panel.

Track:

- Most clicked products
- Most viewed products
- Most wishlisted products
- Most searched products
- Most contacted products
- Daily traffic
- Weekly traffic
- Monthly traffic
- Device analytics
- Browser analytics
- User activity
- Conversion intent tracking
- Bounce rate estimation
- Top landing pages
- Traffic sources
- User engagement
- Search analytics
- Scroll depth tracking

Add beautiful charts and graphs.

Admin dashboard should feel enterprise-grade.

---

# BLOG SYSTEM

Create FULL blog CMS connected to Supabase.

Features:

- Rich text editor
- Blog categories
- Tags
- SEO fields
- Featured image
- Table of contents
- Reading time
- Share buttons
- Draft/publish mode
- Blog comments
- Related articles
- Blog analytics

Admin panel must include:
- Full blog editor
- Create/edit/delete blog posts
- Upload blog thumbnails
- Manage categories/tags
- SEO controls

Store blogs in Supabase database and fetch dynamically.

Create sample blogs related to:
- home decor
- frame styling
- wall art
- gifting ideas
- festive decor
- photo frame trends

---

# HOMEPAGE DESIGN

Design a WORLD-CLASS homepage.

Style:
- Minimal luxury
- Warm premium tones
- Elegant typography
- Clean spacing
- High-end visuals
- Smooth animations
- Cinematic hero section

Use:
- beige
- matte black
- off white
- gold accents
- walnut brown
- subtle gradients

DO NOT make it overly colorful.

---

# HOMEPAGE SECTIONS

1. Premium Hero Section
2. Category Showcase
3. Featured Collections
4. Personalized Frames
5. Religious Decor
6. Best Sellers
7. Trending This Week
8. Gallery Wall Inspiration
9. Customer Stories
10. Video Section
11. Why Choose Us
12. Testimonials
13. Instagram-style feed
14. FAQ section
15. Newsletter section
16. Contact CTA
17. Footer

---

# UI / UX REQUIREMENTS

The UI must feel:
- luxurious
- international
- polished
- cinematic
- emotional
- elegant

Add:
- micro interactions
- hover animations
- page transitions
- smooth scrolling
- loading skeletons
- shimmer effects
- lazy loading
- blur-up images

Use:
- Framer Motion animations
- subtle glassmorphism
- soft shadows
- rounded corners
- premium cards

---

# TYPOGRAPHY

Use premium font combinations.

Suggested:
- Playfair Display
- Inter
- Manrope
- Poppins

Use proper hierarchy and spacing.

---

# SEO (EXTREMELY IMPORTANT)

Make this rank globally.

Implement:
- Dynamic metadata
- JSON-LD schema
- Product schema
- Breadcrumb schema
- Organization schema
- FAQ schema
- Sitemap.xml
- Robots.txt
- Canonical URLs
- OpenGraph
- Twitter cards
- SEO-friendly slugs

Create SEO pages for:
- custom photo frames
- religious wall decor
- personalized gifts India
- acrylic photo frames
- wall decor online
- custom frames India
- home decor India
- wooden photo frames
- canvas prints
- gallery wall frames

Generate highly optimized metadata everywhere.

---

# CONTACT PAGE

Create a PREMIUM contact page.

Include:
- business story
- craftsmanship section
- trust section
- maps section
- WhatsApp CTA
- email form
- FAQ
- social links

Tone:
Authentic premium Indian decor brand becoming global.

---

# ABOUT PAGE

Write a BEAUTIFUL premium brand story.

Theme:
A traditional Indian art & framing business evolving into a modern premium global decor brand.

Make it:
- emotional
- elegant
- trustworthy
- premium

---

# PERFORMANCE OPTIMIZATION

Target:
- 95+ Lighthouse score
- Excellent Core Web Vitals
- Optimized bundle size
- Image optimization
- Server rendering
- Edge caching

---

# ACCESSIBILITY

Support:
- keyboard navigation
- ARIA labels
- semantic HTML
- color contrast
- screen readers

---

# RESPONSIVE DESIGN

Perfect on:
- mobile
- tablet
- laptop
- ultrawide

Mobile experience should feel APP-LIKE.

---

# DATABASE

Create proper PostgreSQL schema using Supabase.

Tables:

- users
- profiles
- products
- product_images
- categories
- wishlist
- cart
- inquiries
- reviews
- product_comments
- blog_posts
- blog_categories
- recently_viewed
- analytics
- settings
- banners
- testimonials

Add:
- indexes
- foreign keys
- RLS policies
- proper relations

NO MOCK DATA.

Everything must connect properly.

Use real Supabase queries.

---

# IMAGE HANDLING

Support:
- multiple uploads
- drag/drop
- compression
- webp conversion
- blur placeholders
- CDN optimization

---

# NAVBAR

Premium sticky navbar with:
- mega menu
- categories
- search
- cart
- favorites
- profile
- mobile drawer
- elegant animations

---

# FOOTER

Detailed premium footer:
- quick links
- categories
- about
- policies
- social media
- newsletter
- trust badges
- copyright

---

# EXTRA PREMIUM FEATURES

Add:
- dark mode
- recently viewed
- floating WhatsApp button
- toast notifications
- loading animations
- empty states
- beautiful error pages
- custom 404 page
- maintenance mode
- cookie consent
- analytics integration hooks

---

# CODE QUALITY

Code must be:
- production-grade
- modular
- scalable
- maintainable
- clean architecture
- reusable components
- strict TypeScript
- no lint errors
- no console errors

---

# FINAL REQUIREMENTS

Before finishing:

- test everything
- ensure no broken routes
- ensure no hydration errors
- ensure auth works
- ensure Google OAuth works
- ensure reCAPTCHA works
- ensure database works
- ensure admin works
- ensure analytics works
- ensure blog system works
- ensure comments work
- ensure WhatsApp flow works
- ensure SEO works
- ensure mobile responsiveness works

Final deliverable must feel like:

“A premium global ecommerce brand ready for international scaling.”

DO NOT leave placeholders.

DO NOT leave TODO comments.

DO NOT use fake APIs.

DO NOT use demo data.

Build the FINAL PRODUCT completely.