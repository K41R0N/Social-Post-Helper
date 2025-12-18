# LLM Prompt for Generating Component Layouts

This document contains a comprehensive prompt you can use with any LLM (ChatGPT, Claude, Gemini, etc.) to generate compatible JSON layouts for go round's component-based layout system.

---

## Quick Start

Copy the prompt below and paste it into your favorite LLM, then describe the layout you want to create.

---

## The Prompt

```
I need you to generate a JSON schema for a visual component-based layout system. The layout will be used to create social media carousel slides (1080x1080px by default).

## Schema Structure

The JSON must follow this exact structure:

{
  "width": number,        // Layout width in pixels (default: 1080)
  "height": number,       // Layout height in pixels (default: 1080)
  "root": ComponentNode   // Root container component
}

## Component Node Structure

Each component (including root) must have:

{
  "id": string,           // Unique identifier for this component
  "type": string,         // Component type (see types below)
  "children"?: ComponentNode[],  // Optional array of child components
  "content"?: string,     // Optional text content or template variable
  "style": {              // Required style object
    // Layout properties
    "display"?: "flex" | "block" | "inline-block",
    "flexDirection"?: "row" | "column" | "row-reverse" | "column-reverse",
    "alignItems"?: "flex-start" | "center" | "flex-end" | "stretch",
    "justifyContent"?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around",
    "gap"?: number,       // Gap between flex items in pixels

    // Positioning
    "position"?: "relative" | "absolute",
    "top"?: number | string,
    "right"?: number | string,
    "bottom"?: number | string,
    "left"?: number | string,

    // Dimensions
    "width"?: number | string | "100%",
    "height"?: number | string | "100%" | "auto",
    "minWidth"?: number | string,
    "maxWidth"?: number | string,

    // Spacing
    "padding"?: { top?: number, right?: number, bottom?: number, left?: number } | number,
    "margin"?: { top?: number, right?: number, bottom?: number, left?: number } | number,

    // Colors and Backgrounds
    "backgroundColor"?: string,  // Hex color or template variable like "{{background_color}}"
    "color"?: string,           // Text color (hex or template variable like "{{font_color}}")
    "borderColor"?: string,

    // Borders
    "borderWidth"?: number,
    "borderStyle"?: "solid" | "dashed" | "dotted",
    "borderRadius"?: number,

    // Typography
    "fontSize"?: number,
    "fontWeight"?: number | "normal" | "bold" | "bolder",
    "fontFamily"?: string | "{{heading_font}}" | "{{body_font}}" | "{{accent_font}}",
    "lineHeight"?: number | string,
    "textAlign"?: "left" | "center" | "right",
    "textTransform"?: "uppercase" | "lowercase" | "capitalize",
    "letterSpacing"?: number | string,

    // Effects
    "opacity"?: number,
    "boxShadow"?: string,
    "overflow"?: "visible" | "hidden" | "scroll" | "auto"
  }
}

## Available Component Types

1. **container** - Generic container for layout structure
2. **text** - Text content (uses "content" field)
3. **heading** - Heading text (uses "content" field)
4. **image** - Image component (uses "content" for URL or "{{image_url}}")
5. **shape** - Decorative shapes (rectangle, circle via borderRadius)

## Template Variables

Use these template variables to inject dynamic content:

- **{{title}}** - Slide title
- **{{body_text}}** - Main body content
- **{{subtitle}}** - Subtitle text
- **{{quote}}** - Quote text
- **{{image_url}}** - Background or content image URL
- **{{background_color}}** - Background color (hex)
- **{{font_color}}** - Text color (hex)
- **{{accent_color}}** - Accent color (hex)
- **{{heading_font}}** - Heading font family
- **{{body_font}}** - Body font family
- **{{accent_font}}** - Accent font family

## Example: Minimalist Quote Card

{
  "width": 1080,
  "height": 1080,
  "root": {
    "id": "root",
    "type": "container",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "justifyContent": "center",
      "width": "100%",
      "height": "100%",
      "backgroundColor": "{{background_color}}",
      "padding": { "top": 80, "right": 80, "bottom": 80, "left": 80 }
    },
    "children": [
      {
        "id": "quote-mark",
        "type": "text",
        "content": """,
        "style": {
          "fontSize": 120,
          "fontWeight": "bold",
          "color": "{{accent_color}}",
          "lineHeight": 1,
          "fontFamily": "{{heading_font}}"
        }
      },
      {
        "id": "quote-text",
        "type": "text",
        "content": "{{quote}}",
        "style": {
          "fontSize": 42,
          "fontWeight": "500",
          "color": "{{font_color}}",
          "textAlign": "center",
          "lineHeight": 1.4,
          "fontFamily": "{{body_font}}",
          "margin": { "top": 20, "bottom": 40 }
        }
      },
      {
        "id": "separator",
        "type": "shape",
        "style": {
          "width": 60,
          "height": 4,
          "backgroundColor": "{{accent_color}}"
        }
      }
    ]
  }
}

## Design Guidelines

1. **Hierarchy**: Use flex containers to create layout structure
2. **Spacing**: Use padding for internal spacing, margin for external spacing
3. **Typography**: Use fontSize, fontWeight, and fontFamily for text styling
4. **Colors**: Always use template variables for colors ({{background_color}}, {{font_color}}, {{accent_color}})
5. **Fonts**: Always use template variables for fonts ({{heading_font}}, {{body_font}}, {{accent_font}})
6. **Content**: Use template variables ({{title}}, {{quote}}, etc.) for dynamic content
7. **Responsive**: Use percentage widths (e.g., "100%") and flexbox for responsive layouts
8. **Keep it Simple**: Don't over-complicate - simpler layouts are easier to customize

## Common Patterns

### Centered Content
```json
{
  "display": "flex",
  "flexDirection": "column",
  "alignItems": "center",
  "justifyContent": "center"
}
```

### Split Layout (Left/Right)
```json
{
  "display": "flex",
  "flexDirection": "row",
  "children": [
    { "id": "left", "style": { "width": "50%" } },
    { "id": "right", "style": { "width": "50%" } }
  ]
}
```

### Card with Shadow
```json
{
  "backgroundColor": "#ffffff",
  "borderRadius": 20,
  "boxShadow": "0 10px 40px rgba(0,0,0,0.1)",
  "padding": 40
}
```

## Now Generate My Layout

Based on the above schema and guidelines, please generate a complete JSON layout for:

[DESCRIBE YOUR LAYOUT HERE]

Example: "A bold quote card with a large centered quote, small attribution text below, and a decorative line accent"

Please respond with ONLY the valid JSON, no additional text or explanation.
```

---

## Usage Examples

### Example 1: Quote Card

**Your Input to LLM:**
> Based on the schema above, create a minimalist quote card with:
> - Large centered quote text
> - Small author attribution below
> - Decorative accent line between them
> - Use a clean, modern design

**LLM Output:** (Copy this JSON into go round's Schema Editor)
```json
{
  "width": 1080,
  "height": 1080,
  "root": {
    "id": "root",
    "type": "container",
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "justifyContent": "center",
      "width": "100%",
      "height": "100%",
      "backgroundColor": "{{background_color}}",
      "padding": 80
    },
    "children": [
      {
        "id": "quote",
        "type": "heading",
        "content": "{{quote}}",
        "style": {
          "fontSize": 48,
          "fontWeight": "bold",
          "color": "{{font_color}}",
          "textAlign": "center",
          "lineHeight": 1.3,
          "fontFamily": "{{heading_font}}",
          "marginBottom": 40
        }
      },
      {
        "id": "line",
        "type": "shape",
        "style": {
          "width": 100,
          "height": 4,
          "backgroundColor": "{{accent_color}}",
          "marginBottom": 40
        }
      },
      {
        "id": "author",
        "type": "text",
        "content": "{{subtitle}}",
        "style": {
          "fontSize": 24,
          "fontWeight": "normal",
          "color": "{{accent_color}}",
          "textAlign": "center",
          "fontFamily": "{{body_font}}"
        }
      }
    ]
  }
}
```

### Example 2: Feature Card

**Your Input to LLM:**
> Create a feature showcase card with:
> - Large title at the top
> - Body text in the middle
> - Small accent text at the bottom
> - Use a card-style design with padding

**LLM Output:**
```json
{
  "width": 1080,
  "height": 1080,
  "root": {
    "id": "root",
    "type": "container",
    "style": {
      "display": "flex",
      "alignItems": "center",
      "justifyContent": "center",
      "width": "100%",
      "height": "100%",
      "backgroundColor": "{{background_color}}",
      "padding": 60
    },
    "children": [
      {
        "id": "card",
        "type": "container",
        "style": {
          "display": "flex",
          "flexDirection": "column",
          "width": "100%",
          "backgroundColor": "#ffffff",
          "borderRadius": 30,
          "padding": 60,
          "boxShadow": "0 20px 60px rgba(0,0,0,0.15)"
        },
        "children": [
          {
            "id": "title",
            "type": "heading",
            "content": "{{title}}",
            "style": {
              "fontSize": 56,
              "fontWeight": "bold",
              "color": "{{accent_color}}",
              "marginBottom": 30,
              "fontFamily": "{{heading_font}}"
            }
          },
          {
            "id": "body",
            "type": "text",
            "content": "{{body_text}}",
            "style": {
              "fontSize": 28,
              "lineHeight": 1.6,
              "color": "#333333",
              "marginBottom": 40,
              "fontFamily": "{{body_font}}"
            }
          },
          {
            "id": "footer",
            "type": "text",
            "content": "{{subtitle}}",
            "style": {
              "fontSize": 20,
              "color": "{{accent_color}}",
              "textTransform": "uppercase",
              "letterSpacing": "2px",
              "fontFamily": "{{accent_font}}"
            }
          }
        ]
      }
    ]
  }
}
```

---

## Tips for Best Results

1. **Be Specific**: Describe exactly what you want (sizes, positions, colors)
2. **Reference Examples**: Point to similar designs you like
3. **Iterate**: Ask the LLM to adjust if the first result isn't perfect
4. **Test**: Paste the JSON into go round's Schema Editor and preview
5. **Refine**: Use the visual editor to fine-tune the generated layout

---

## Troubleshooting

**Problem**: JSON validation error
**Solution**: Make sure the LLM only returns valid JSON. Say "Return ONLY the JSON, no markdown formatting or explanation"

**Problem**: Layout looks broken
**Solution**: Check that:
- Root container has `width: "100%"` and `height: "100%"`
- Container uses `display: "flex"` for layout
- Template variables use correct syntax: `{{variable_name}}`

**Problem**: Text not showing
**Solution**: Make sure text components have `content` field with a template variable

---

## Advanced: Custom Components

You can ask the LLM to create complex nested structures:

> Create a two-column layout with:
> - Left column: Large title and body text
> - Right column: Decorative accent shape and small quote
> - Both columns have equal width
> - Add subtle shadows and rounded corners

The LLM will generate nested containers with proper flexbox configuration.

---

**Happy Creating! 🎨**

Use this prompt to generate unlimited layout variations with AI assistance.
