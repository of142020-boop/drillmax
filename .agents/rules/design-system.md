# Drill Max — Industrial Editorial Design System (Anti-AI-Slop Rules)

Apply these visual and structural standards to every page, component, and redesign in `drilmax-astro`:

## 1. Art Direction
- **Aesthetic:** Architectural Concrete & Industrial Engineering (Hilti / Swiss Editorial Grid). Grounded, authoritative, crisp, and human-crafted.
- **Strictly Banned:** Purple/indigo gradients, gradient headline text, glowing background blobs, glassmorphism, generic SaaS 3-card icon grids stacked uniformly, bubbly `16px–24px` rounded cards everywhere, heavy blurred `box-shadow`, and emojis (`📞`, `📧`, `✅`, `🔥`) in UI chrome.

## 2. Color Tokens (60-30-10 Rule)
- `--bg-color: #ffffff` (Primary canvas)
- `--section-bg: #f5f4f0` (Warm architectural concrete/stone surface)
- `--surface-muted: #eae8e1` (Subtle specification surface)
- `--dark: #14171c` (Foundry charcoal ink)
- `--header-bg: #111419` / `--topbar-bg: #0b0d10` (Deep matte steel)
- `--gray: #4b5058` (Neutral engineering graphite — never blue-tinted Tailwind slate)
- `--border-color: #dad7ce` (1px hairline structural divider)
- `--primary: #c2410c` / `--primary-hover: #9a3412` (Industrial safety orange — used strictly for primary CTAs, active markers, and key emphasis)

## 3. Typography
- **Display (`h1, h2, h3`):** `'Cairo', 'IBM Plex Sans Arabic', sans-serif` (`700–800`), tight line-height, fluid `clamp()` scale.
- **Body, Tables, Specs, Nav:** `'IBM Plex Sans Arabic', 'Cairo', sans-serif` (`400–700`), high legibility, tabular numerals (`font-variant-numeric: tabular-nums`) for prices, diameters, and phone numbers.

## 4. Layout Rhythm & Craft
- Break vertical monotony: alternate asymmetric split layouts (`7/5` or `1.25fr / 1fr`), numbered engineering indices (`01`–`06`), full-width dark steel bands, hairline specification tables, and real site photography with crisp captions.
- Keep border-radius restrained (`2px–6px`). Use `1px` hairlines and tonal surface contrast instead of drop-shadows.
- Preserve exact intentional phone numbers: `01070046464` (concrete/rebar/demolition/cities), `01024596959` (all exhaust fan pages), `01055550195` (secondary where intentionally placed).
