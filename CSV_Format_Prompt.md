{
  "task": "Generate CSV data for Instagram carousel posts",
  "output_format": "CSV with specific columns and formatting rules",
  
  "csv_structure": {
    "required_columns": [
      "carousel_id",
      "slide_number",
      "layout_type",
      "background_color",
      "font_color",
      "accent_color"
    ],
    "optional_columns": [
      "title",
      "body_text",
      "subtitle",
      "quote",
      "image_url"
    ],
    "column_descriptions": {
      "carousel_id": "Unique identifier for the carousel (e.g., 'product_launch', 'solenopsism'). Use lowercase with underscores. All slides in the same carousel must share this ID.",
      "slide_number": "Integer starting from 1. Determines slide order in the carousel.",
      "layout_type": "Must be one of: dictionary_entry, minimalist_focus, bold_callout, header_body, quote_highlight, list_layout, stat_showcase, split_content, image_overlay, two_part_vertical",
      "background_color": "Hex color code with # (e.g., '#f4f1ee', '#1A1A1A'). Default: '#FFFFFF'",
      "font_color": "Hex color code for text. Default: '#000000'",
      "accent_color": "Hex color code for highlights/accents. Default: '#B8312F'",
      "title": "Main heading text. Required for most layouts.",
      "body_text": "Main content text. Can include HTML <br /> tags for line breaks.",
      "subtitle": "Secondary text. Usage varies by layout (pronunciation, attribution, etc.)",
      "quote": "Quote text for quote_highlight layout or etymology for dictionary_entry",
      "image_url": "URL to image. Required for image_overlay layout."
    }
  },

  "layout_types_and_requirements": {
    "dictionary_entry": {
      "description": "Dictionary-style definition with word, pronunciation, definition, and etymology",
      "required_fields": ["title", "body_text", "subtitle", "quote"],
      "field_usage": {
        "title": "The word being defined (e.g., 'SOLENOPSISM')",
        "body_text": "The definition text",
        "subtitle": "Pronunciation guide (e.g., '/ˈsoʊ.lən.ɑp.sɪz.əm/')",
        "quote": "Etymology or origin (e.g., 'A portmanteau of...')"
      }
    },
    "minimalist_focus": {
      "description": "Clean layout with title and body text, centered",
      "required_fields": ["title", "body_text"],
      "field_usage": {
        "title": "Main headline",
        "body_text": "Supporting paragraph. Use <br /><br /> for paragraph breaks"
      }
    },
    "bold_callout": {
      "description": "Large, bold statement without title",
      "required_fields": ["body_text"],
      "field_usage": {
        "body_text": "The bold statement or quote",
        "title": "Leave empty"
      }
    },
    "header_body": {
      "description": "Traditional header + body text layout",
      "required_fields": ["title", "body_text"],
      "field_usage": {
        "title": "Section heading",
        "body_text": "Main content. Use <br /><br /> for paragraph breaks"
      }
    },
    "quote_highlight": {
      "description": "Quote with attribution",
      "required_fields": ["quote", "subtitle"],
      "field_usage": {
        "quote": "The quote text",
        "subtitle": "Attribution (e.g., '— Author Name')"
      }
    },
    "list_layout": {
      "description": "Title with bulleted list",
      "required_fields": ["title", "body_text"],
      "field_usage": {
        "title": "List heading",
        "body_text": "Comma-separated list items (e.g., 'Item 1, Item 2, Item 3')"
      }
    },
    "stat_showcase": {
      "description": "Large statistic with context",
      "required_fields": ["title", "body_text"],
      "field_usage": {
        "title": "The statistic (e.g., '85%', '$2.4M', '10,000+')",
        "body_text": "Context or explanation"
      }
    },
    "split_content": {
      "description": "Two-column layout with title and body",
      "required_fields": ["title", "body_text"],
      "field_usage": {
        "title": "Left column heading",
        "body_text": "Right column content"
      }
    },
    "image_overlay": {
      "description": "Image background with text overlay",
      "required_fields": ["image_url", "title"],
      "field_usage": {
        "image_url": "Full URL to image",
        "title": "Text overlaid on image"
      }
    },
    "two_part_vertical": {
      "description": "Vertically split layout",
      "required_fields": ["title", "body_text"],
      "field_usage": {
        "title": "Top section content",
        "body_text": "Bottom section content"
      }
    }
  },

  "text_formatting_rules": {
    "line_breaks": "Use <br /> for single line break, <br /><br /> for paragraph break",
    "emphasis": "Text formatting (bold, italic) not supported in CSV. Use layout choice and color for emphasis.",
    "special_characters": "Wrap entire field in double quotes if it contains commas, quotes, or newlines",
    "escaping_quotes": "Use double quotes inside quoted fields: \"He said \"\"hello\"\"\"",
    "long_text": "No character limit, but keep body_text under 300 characters for readability"
  },

  "color_guidelines": {
    "format": "Always use hex codes with # prefix (e.g., '#1A1A1A', not '1A1A1A' or 'black')",
    "contrast": "Ensure sufficient contrast between font_color and background_color (WCAG AA: 4.5:1 minimum)",
    "consistency": "Use consistent color palette across carousel for brand cohesion",
    "accent_usage": "Accent color is used for highlights, borders, and decorative elements",
    "recommended_palettes": [
      {
        "name": "Dark & Bold",
        "background": "#1A1A1A",
        "font": "#FAF7F2",
        "accent": "#B8312F"
      },
      {
        "name": "Light & Clean",
        "background": "#f4f1ee",
        "font": "#1A1A1A",
        "accent": "#B8312F"
      },
      {
        "name": "Vibrant",
        "background": "#d01c1f",
        "font": "#FAF7F2",
        "accent": "#FAF7F2"
      }
    ]
  },

  "handling_multiple_carousels": {
    "description": "To create multiple carousels in a single CSV, use different carousel_id values",
    "example_structure": "Each carousel is a group of rows sharing the same carousel_id",
    "best_practices": [
      "Use descriptive carousel_id names (e.g., 'product_launch_q1', 'customer_testimonials')",
      "Keep slide_number sequential within each carousel (1, 2, 3...)",
      "Maintain consistent visual style within a carousel",
      "Separate different campaigns/topics with different carousel_ids"
    ]
  },

  "example_multi_carousel_csv": "carousel_id,slide_number,layout_type,background_color,title,body_text,subtitle,quote,font_color,accent_color\nproduct_launch,1,bold_callout,#1A1A1A,,\"Introducing the future of productivity\",,,,#FFFFFF,#00D9FF\nproduct_launch,2,header_body,#FFFFFF,Key Features,\"AI-powered automation<br /><br />Seamless integrations<br /><br />Real-time collaboration\",,,,#1A1A1A,#00D9FF\nproduct_launch,3,stat_showcase,#00D9FF,10x Faster,\"Teams report 10x productivity increase in first month\",,,,#1A1A1A,#FFFFFF\nproduct_launch,4,quote_highlight,#FFFFFF,,,,\"This tool transformed how we work. Game changer!\",— Sarah Chen, CEO,#1A1A1A,#00D9FF\nproduct_launch,5,bold_callout,#1A1A1A,,\"Ready to transform your workflow?\",,,,#FFFFFF,#00D9FF\neducation_series,1,dictionary_entry,#FFF8E7,COMPOUND INTEREST,\"The interest calculated on the initial principal and accumulated interest from previous periods.\",/ˈkɒmpaʊnd ˈɪntrəst/,\"From Latin 'componere' meaning to put together.\",#2C1810,#D4A574\neducation_series,2,minimalist_focus,#2C1810,The Power of Time,\"Starting early is the secret.<br /><br />Even small amounts grow exponentially when given time to compound.\",,,,#FFF8E7,#D4A574\neducation_series,3,stat_showcase,#D4A574,$1M,\"What $200/month becomes in 40 years at 7% annual return\",,,,#2C1810,#FFF8E7\neducation_series,4,list_layout,#FFF8E7,3 Steps to Start,\"Open a retirement account, Automate monthly contributions, Choose low-cost index funds\",,,,#2C1810,#D4A574\neducation_series,5,bold_callout,#2C1810,,\"The best time to start was yesterday. The second best time is today.\",,,,#FFF8E7,#D4A574\ntestimonials,1,bold_callout,#F0F4FF,,\"What our customers are saying\",,,,#1E3A8A,#3B82F6\ntestimonials,2,quote_highlight,#FFFFFF,,,,\"Exceeded all expectations. The team is incredibly responsive and the product just works.\",— Michael Rodriguez,#1E3A8A,#3B82F6\ntestimonials,3,quote_highlight,#F0F4FF,,,,\"We've tried many solutions, but this is the only one that actually delivered on its promises.\",— Jennifer Kim,#1E3A8A,#3B82F6\ntestimonials,4,stat_showcase,#3B82F6,4.9/5.0,\"Average rating from 2,847 reviews\",,,,#FFFFFF,#F0F4FF\ntestimonials,5,bold_callout,#1E3A8A,,\"Join thousands of satisfied customers\",,,,#FFFFFF,#3B82F6",

  "common_mistakes_to_avoid": [
    "Forgetting the # in color codes",
    "Using inconsistent carousel_id spelling/casing",
    "Skipping slide numbers (must be sequential: 1,2,3... not 1,3,5)",
    "Not wrapping text with commas in quotes",
    "Using unsupported layout_type names",
    "Missing required fields for specific layouts",
    "Poor color contrast making text unreadable",
    "Mixing up subtitle and quote fields for different layouts"
  ],

  "validation_checklist": [
    "All carousel_id values are lowercase with underscores",
    "slide_number starts at 1 and increments by 1 for each carousel",
    "layout_type matches one of the 10 supported types exactly",
    "All color codes include # and are valid hex",
    "Required fields for each layout_type are populated",
    "Text fields with commas are wrapped in double quotes",
    "HTML line breaks use <br /> not <br> or \\n",
    "Contrast ratio between font_color and background_color is sufficient"
  ],

  "prompt_template_for_ai_generation": "Generate a CSV file for Instagram carousel posts about [TOPIC]. Create [NUMBER] carousels with [SLIDES_PER_CAROUSEL] slides each. Use the following structure:\n\n1. Each carousel should have a unique carousel_id related to its theme\n2. Use a mix of layout types: dictionary_entry (for definitions), minimalist_focus (for key points), bold_callout (for impactful statements), header_body (for detailed content), quote_highlight (for testimonials/quotes), stat_showcase (for statistics), and list_layout (for lists)\n3. Maintain visual consistency within each carousel using a cohesive color palette\n4. Ensure proper contrast between background_color and font_color\n5. Use <br /><br /> for paragraph breaks in body_text\n6. Include all required fields for each layout_type\n7. Make content engaging, concise, and Instagram-optimized\n\nFormat: CSV with columns: carousel_id,slide_number,layout_type,background_color,title,body_text,subtitle,quote,font_color,accent_color\n\nTopic: [TOPIC]\nTone: [TONE - e.g., professional, casual, inspirational]\nTarget Audience: [AUDIENCE]\nKey Messages: [KEY_POINTS]",

  "usage_instructions": "1. Copy the prompt_template_for_ai_generation and fill in the bracketed placeholders\n2. Send to an AI assistant (Claude, GPT-4, etc.)\n3. Review the generated CSV for accuracy and formatting\n4. Save as .csv file\n5. Upload to the carousel builder using the 'Upload CSV' button\n6. The system will automatically parse and create multiple carousels based on carousel_id groupings"
}
