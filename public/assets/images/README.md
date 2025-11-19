# Image Assets

This directory contains image assets for TheCallGrid website.

## Required Images

### For Production:

1. **Logo & Branding**
   - `logo.svg` ✓ (already included)
   - `favicon.ico` - Website favicon (16x16, 32x32)
   - `apple-touch-icon.png` - iOS icon (180x180)
   - `og-image.jpg` - Open Graph image for social sharing (1200x630)

2. **Hero & Landing Page**
   - `hero-bg.jpg` - Hero background image (1920x1080, optimized)

3. **Industries**
   - `industry-realestate.jpg` - Real estate photo (800x600)
   - `industry-solar.jpg` - Solar panels photo (800x600)
   - `industry-roofing.jpg` - Roofing services photo (800x600)

4. **About Page**
   - `wyoming-office.jpg` - Office or location photo (1200x800)
   - `automation-system.jpg` - Dashboard or tech photo (1200x800)
   - `automation-dashboard.jpg` - Automation platform screenshot (1200x800)

5. **Team Members**
   - `team/placeholder-1.jpg` - Team member photo (400x400)
   - `team/placeholder-2.jpg` - Team member photo (400x400)
   - `team/placeholder-3.jpg` - Team member photo (400x400)

6. **Testimonials**
   - `placeholder-avatar.jpg` - Default avatar (200x200)

## Placeholder Images

For development and testing, you can use placeholder services:
- https://via.placeholder.com/
- https://unsplash.com/ (free high-quality images)
- https://picsum.photos/ (Lorem Picsum)

Example:
```html
<img src="https://via.placeholder.com/800x600/667eea/ffffff?text=Real+Estate" alt="Real Estate">
```

## Image Optimization

Before deploying to production:

1. **Compress images**: Use tools like TinyPNG, ImageOptim, or Squoosh
2. **Create responsive versions**: Generate multiple sizes for srcset
3. **Convert to WebP**: Modern format for better performance
4. **Lazy loading**: Images use `data-src` with IntersectionObserver

## Recommended Sizes

- Hero images: 1920x1080 (max 200KB)
- Feature images: 800x600 (max 100KB)
- Team photos: 400x400 (max 50KB)
- Thumbnails: 200x200 (max 20KB)

## Attribution

If using stock photos, ensure proper licensing and attribution where required.

