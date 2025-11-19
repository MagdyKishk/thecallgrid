# SCSS Architecture

This directory contains the modular SCSS files for TheCallGrid. The CSS is organized using a component-based architecture for better maintainability.

## Structure

```
scss/
├── main.scss              # Main entry point (imports all partials)
├── abstracts/            # Variables, mixins, functions
│   ├── _variables.scss   # Color palette, spacing, typography
│   └── _mixins.scss      # Reusable mixins
├── base/                 # Base styles
│   ├── _reset.scss       # CSS reset and root styles
│   ├── _typography.scss  # Typography styles
│   └── _animations.scss  # Keyframes and animations
├── components/           # Reusable components
│   ├── _buttons.scss     # Button styles
│   ├── _forms.scss       # Form elements
│   ├── _cards.scss       # Card components
│   ├── _testimonials.scss# Testimonial slider
│   └── _chat-widget.scss # Chat widget component
├── layout/               # Layout components
│   ├── _container.scss   # Containers and sections
│   ├── _header.scss      # Site header and navigation
│   └── _footer.scss      # Site footer
└── pages/                # Page-specific styles
    ├── _home.scss        # Home page styles
    ├── _about.scss       # About page styles
    └── _contact.scss     # Contact page styles
```

## Scripts

### Compile SCSS once
```bash
npm run scss
```

### Watch for changes
```bash
npm run scss:watch
```

### Build compressed CSS for production
```bash
npm run build:css
```

## Usage

1. Edit SCSS files in their respective directories
2. Run `npm run scss:watch` during development
3. The compiled CSS will be output to `/public/css/main.css`
4. For production builds, use `npm run build:css` for compressed output

## Naming Conventions

- Use BEM (Block Element Modifier) methodology
- Variables: `$color-primary`, `$spacing-lg`
- Mixins: descriptive names like `@mixin flex-center`
- Classes: follow existing pattern (e.g., `.hero-title`, `.btn-primary`)

## Notes

- The original CSS has been backed up to `main.css.backup`
- All styles have been translated from CSS to SCSS without changes
- SCSS nesting and variables are used for better organization
- Media queries are abstracted into mixins for consistency

