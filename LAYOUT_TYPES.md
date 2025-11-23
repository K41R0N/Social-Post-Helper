# Carousel Layout Types

This document defines all standardized layout types for the Instagram Carousel Generator.

## Layout Type Reference

### 1. `dictionary_entry`
**Description:** Classic dictionary-style layout with title, pronunciation, etymology, and definition.

**Required Fields:**
- `title`: Main word/term
- `body_text`: Definition text
- `subtitle`: Pronunciation (IPA format)
- `quote`: Etymology text

**Visual Structure:**
- Large title at top (Kyrios Standard Medium, 140px)
- Pronunciation below title (Merriweather italic, 36px)
- Red divider line
- "ETYMOLOGY" label (Kyrios Text Medium, uppercase, red)
- Etymology text (Merriweather italic, 24px)
- Definition text (Merriweather regular, 26px)

**Best For:** Word definitions, terminology, glossaries

---

### 2. `minimalist_focus`
**Description:** Dark background with large heading and body text, minimal distractions.

**Required Fields:**
- `title`: Main heading
- `body_text`: Main content

**Visual Structure:**
- Large heading (Kyrios Text Medium, 80px)
- Thin divider line below heading
- Body text (Merriweather regular, 36px)
- Ample whitespace (70-90% empty space)

**Best For:** Editorial content, philosophical statements, impactful quotes

---

### 3. `bold_callout`
**Description:** Centered, large text on solid background for maximum impact.

**Required Fields:**
- `body_text`: The callout message

**Visual Structure:**
- Centered text (Merriweather regular, 48px)
- No title or additional elements
- Full-bleed background color
- Maximum readability

**Best For:** Final slides, key takeaways, memorable statements

---

### 4. `split_content`
**Description:** Two-column layout with heading on one side, content on the other.

**Required Fields:**
- `title`: Section heading
- `body_text`: Main content

**Visual Structure:**
- Left column: Large title (vertical or horizontal)
- Right column: Body text
- Clear visual separation
- Balanced composition

**Best For:** Comparisons, before/after, problem/solution

---

### 5. `quote_highlight`
**Description:** Large quote with attribution.

**Required Fields:**
- `quote`: The quotation text
- `subtitle`: Attribution (author, source)

**Visual Structure:**
- Large quote marks or decorative element
- Quote text (Merriweather italic, 40-48px)
- Attribution below (smaller, regular weight)
- Centered or left-aligned

**Best For:** Testimonials, expert quotes, inspirational content

---

### 6. `list_layout`
**Description:** Title with numbered or bulleted list items.

**Required Fields:**
- `title`: List heading
- `body_text`: List items (separated by `|` or newlines)

**Visual Structure:**
- Title at top
- List items with numbers or bullets
- Consistent spacing between items
- Clear hierarchy

**Best For:** Steps, tips, features, benefits

---

### 7. `stat_showcase`
**Description:** Large number or statistic with context.

**Required Fields:**
- `title`: The statistic (number, percentage, etc.)
- `body_text`: Context or explanation
- `subtitle`: Optional label for the stat

**Visual Structure:**
- Huge title/number (120-200px)
- Subtitle label above or below
- Explanatory text
- Minimal design

**Best For:** Data visualization, key metrics, impressive numbers

---

### 8. `header_body`
**Description:** Simple header and body text layout.

**Required Fields:**
- `title`: Header text
- `body_text`: Body content

**Visual Structure:**
- Header at top (Kyrios Text Medium, 60-80px)
- Body text below (Merriweather regular, 28-36px)
- Optional divider line
- Standard padding

**Best For:** General content, explanations, storytelling

---

### 9. `image_overlay`
**Description:** Text overlaid on background image (requires image upload).

**Required Fields:**
- `title`: Overlay heading
- `body_text`: Optional overlay text
- `image_url`: Background image URL

**Visual Structure:**
- Background image at 25-40% opacity
- Text overlay with high contrast
- Optional gradient for readability
- Centered or positioned text

**Best For:** Visual storytelling, mood-setting, brand imagery

---

### 10. `two_part_vertical`
**Description:** Top and bottom sections with different content.

**Required Fields:**
- `title`: Top section heading
- `body_text`: Bottom section content
- `subtitle`: Optional top section subtext

**Visual Structure:**
- Top half: Title and optional subtitle
- Bottom half: Body content
- Clear horizontal division
- Different background colors optional

**Best For:** Question/answer, problem/solution, contrast

---

### 11. `anti_marketing_hook`
**Description:** Oversized brutalist hook with strapline and italic kicker.

**Required Fields:**
- `title`: Main hook statement
- `subtitle`: Upper strapline (e.g., label or topic)
- `body_text`: Short italic kicker line

**Visual Structure:**
- Subtitle set in uppercase with generous tracking
- Giant uppercase title (160-190px) hugging the left edge
- Thin accent line underneath title
- Italic footer copy anchored to the bottom

**Best For:** Carousel slide 1 hooks, contrarian statements, manifesto openers

---

### 12. `anti_marketing_content`
**Description:** Editorial column with slide number bar and accent ruler for copy.

**Required Fields:**
- `title`: Main content headline
- `body_text`: Supporting bullet points or paragraphs
- `subtitle`: Optional label displayed in the header bar

**Visual Structure:**
- Monospace slide number paired with label bar
- Uppercase headline spanning most of the canvas
- Body copy indented behind a vertical accent rule
- Works well with short bullet lines (use `\n` or `|`)

**Best For:** Value slides, field notes, blunt lessons

---

### 13. `anti_marketing_cta`
**Description:** Brutalist CTA card with underline action and oversized arrow.

**Required Fields:**
- `title`: CTA headline
- `body_text`: Action copy (underlined for emphasis)
- `subtitle`: Optional label above the card

**Visual Structure:**
- Solid background color with centered white card
- Heavy border and offset drop shadow using accent color
- Arrow icon between title and CTA copy
- CTA text rendered bold with underline styling

**Best For:** Final slide CTAs, download prompts, DM/lead magnets

---

## CSV Column Mapping

| CSV Column | Purpose | Required | Default |
|------------|---------|----------|---------|
| `carousel_id` | Groups slides into carousels | Yes | - |
| `slide_number` | Order within carousel | Yes | - |
| `layout_type` | One of the layouts above | Yes | - |
| `background_color` | Hex color (#RRGGBB) | Yes | #FFFFFF |
| `title` | Main heading/word | Depends on layout | - |
| `body_text` | Main content | Depends on layout | - |
| `subtitle` | Secondary text | Optional | - |
| `quote` | Quote or special text | Optional | - |
| `font_color` | Text color (hex) | Yes | #000000 |
| `accent_color` | Dividers, highlights (hex) | Yes | #B8312F |
| `image_url` | Background image URL | Optional | - |

## Example CSV Structure

```csv
carousel_id,slide_number,layout_type,background_color,title,body_text,subtitle,quote,font_color,accent_color
solenopsism,1,dictionary_entry,#f4f1ee,SOLENOPSISM,"A state of paradoxical loneliness...",/ˈsoʊ.lən.ɑp.sɪz.əm/,"A portmanteau of solipsism and Solenopsis...",#1A1A1A,#B8312F
solenopsism,2,minimalist_focus,#1A1A1A,Solipsistic Tendencies,"We exist in a sea of shared experience...",,,,#FAF7F2,#B8312F
solenopsism,3,minimalist_focus,#d01c1f,People are a Hivemind,"Solenopsis—fire ants—move as one...",,,,#FAF7F2,#FAF7F2
solenopsism,4,header_body,#f4f1ee,OUR DIGITAL HIVE,"Modern society has perfected...",,,,#1A1A1A,#B8312F
solenopsism,5,bold_callout,#d01c1f,,"We are fire ants in a digital colony...",,,,#FAF7F2,#FAF7F2
antimarketing,1,anti_marketing_hook,#0f0f0f,STOP TRUSTING MARKETING,"The best hook is honesty.",ANTI MARKETING,,,#F9F6F1,#F97316
antimarketing,2,anti_marketing_content,#050505,The raw truth,"Ship what people actually need<br /><br />Tell them the truth about it<br /><br />Let proof replace persuasion",FIELD NOTES,,,#F5F5F5,#F97316
antimarketing,3,anti_marketing_cta,#F97316,Build trust by skipping the hype,"DM “ANTI” for the raw playbook",DO THE OPPOSITE,,,#111111,#111111
```

## Font Specifications

### Title Fonts
- **Kyrios Standard Medium** (500 weight): Main titles, large headings
- **Kyrios Text Medium** (500 weight): Section headings, labels
- **Kyrios Text Bold** (700 weight): Emphasis, callouts

### Body Fonts
- **Merriweather Regular** (400 weight): Body text, definitions
- **Merriweather Italic** (400 weight italic): Quotes, pronunciation, etymology
- **Merriweather Bold** (700 weight): Emphasis within body text

## Design Principles

1. **Whitespace**: Maintain 70-90% empty space for premium feel
2. **Contrast**: Ensure text is always readable against background
3. **Consistency**: Use same fonts and spacing across carousel
4. **Hierarchy**: Clear visual distinction between title, subtitle, body
5. **Alignment**: Center-aligned for impact, left-aligned for readability
6. **Color**: Limit to 3-4 colors per slide (background, text, accent)

## Adding New Layout Types

To add a new layout type:

1. Document it in this file with all required fields
2. Add the layout type to `LAYOUT_TYPES` constant in code
3. Create a render function in `LayoutRenderer` component
4. Update CSV template and examples
5. Test with sample data
