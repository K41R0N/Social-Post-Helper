/**
 * ComponentRenderer - Renders JSON Schema-Based Layouts
 *
 * Takes a LayoutSchema and ComponentContext, and renders it as React components.
 * This enables layouts to be defined as data (JSON) instead of code.
 */

import { CSSProperties } from 'react';
import type {
  LayoutComponent,
  ContainerComponent,
  TextComponent,
  HeadingComponent,
  ImageComponent,
  ShapeComponent,
  SpacerComponent,
  DividerComponent,
  IconComponent,
  ComponentStyle,
  TextStyle,
  Spacing,
  Border,
  Shadow,
  ComponentContext,
} from '../types/componentLayout';
import { resolveField, applyColorVariables } from '../types/componentLayout';
import * as LucideIcons from 'lucide-react';

// ============================================================================
// Style Conversion Utilities
// ============================================================================

function spacingToCSS(spacing: Spacing | undefined): string | undefined {
  if (!spacing) return undefined;
  const { top = 0, right = 0, bottom = 0, left = 0 } = spacing;
  return `${top}px ${right}px ${bottom}px ${left}px`;
}

function borderToCSS(border: Border | undefined): Partial<CSSProperties> {
  if (!border) return {};
  return {
    borderWidth: border.width ? `${border.width}px` : undefined,
    borderColor: border.color,
    borderStyle: border.style || 'solid',
    borderRadius: border.radius ? `${border.radius}px` : undefined,
  };
}

function shadowToCSS(shadow: Shadow | undefined): string | undefined {
  if (!shadow) return undefined;
  const { offsetX, offsetY, blur, spread = 0, color } = shadow;
  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
}

function componentStyleToCSS(
  style: ComponentStyle | undefined,
  context: ComponentContext
): CSSProperties {
  if (!style) return {};

  // Apply color variables
  const processed = applyColorVariables(style, context);
  if (!processed) return {};

  return {
    // Layout
    width: typeof processed.width === 'number' ? `${processed.width}px` : processed.width,
    height: typeof processed.height === 'number' ? `${processed.height}px` : processed.height,
    minWidth: typeof processed.minWidth === 'number' ? `${processed.minWidth}px` : processed.minWidth,
    maxWidth: typeof processed.maxWidth === 'number' ? `${processed.maxWidth}px` : processed.maxWidth,
    minHeight: typeof processed.minHeight === 'number' ? `${processed.minHeight}px` : processed.minHeight,
    maxHeight: typeof processed.maxHeight === 'number' ? `${processed.maxHeight}px` : processed.maxHeight,

    // Spacing
    margin: spacingToCSS(processed.margin),
    padding: spacingToCSS(processed.padding),

    // Positioning
    position: processed.position,
    top: processed.top != null ? `${processed.top}px` : undefined,
    right: processed.right != null ? `${processed.right}px` : undefined,
    bottom: processed.bottom != null ? `${processed.bottom}px` : undefined,
    left: processed.left != null ? `${processed.left}px` : undefined,
    zIndex: processed.zIndex,

    // Flexbox
    display: processed.display,
    flexDirection: processed.flexDirection,
    alignItems: processed.alignItems,
    justifyContent: processed.justifyContent,
    flexWrap: processed.flexWrap,
    gap: processed.gap ? `${processed.gap}px` : undefined,

    // Visual
    backgroundColor: processed.backgroundColor,
    backgroundImage: processed.backgroundImage ? `url(${processed.backgroundImage})` : undefined,
    backgroundSize: processed.backgroundSize,
    backgroundPosition: processed.backgroundPosition,
    opacity: processed.opacity,

    // Borders & Shadows
    ...borderToCSS(processed.border),
    borderRadius: processed.borderRadius ? `${processed.borderRadius}px` : undefined,
    boxShadow: shadowToCSS(processed.boxShadow),

    // Transform
    transform: [
      processed.rotation ? `rotate(${processed.rotation}deg)` : '',
      processed.scale ? `scale(${processed.scale})` : '',
    ].filter(Boolean).join(' ') || undefined,
  };
}

function textStyleToCSS(textStyle: TextStyle | undefined, context: ComponentContext): CSSProperties {
  if (!textStyle) return {};

  return {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.fontSize ? `${textStyle.fontSize}px` : undefined,
    fontWeight: textStyle.fontWeight,
    lineHeight: textStyle.lineHeight,
    letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
    color: textStyle.color === '{{font_color}}' ? context.slideData.font_color :
           textStyle.color === '{{accent_color}}' ? context.slideData.accent_color :
           textStyle.color,
    textAlign: textStyle.textAlign,
    textTransform: textStyle.textTransform,
    textDecoration: textStyle.textDecoration,
    fontStyle: textStyle.fontStyle,
  };
}

// ============================================================================
// Conditional Rendering
// ============================================================================

function shouldRenderComponent(component: LayoutComponent, context: ComponentContext): boolean {
  if (!component.conditional) return true;
  if (component.visible === false) return false;

  const { field, operator, value } = component.conditional;
  const fieldValue = context.slideData[field as keyof typeof context.slideData];

  switch (operator) {
    case 'exists':
      return !!fieldValue;
    case 'equals':
      return fieldValue === value;
    case 'contains':
      return typeof fieldValue === 'string' && value ? fieldValue.includes(value) : false;
    default:
      return true;
  }
}

// ============================================================================
// Component Renderers
// ============================================================================

function renderContainer(
  component: ContainerComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = componentStyleToCSS(component.style, context);

  return (
    <div key={key} style={style}>
      {component.children.map((child, index) =>
        renderComponent(child, context, `${key}-child-${index}`)
      )}
    </div>
  );
}

function renderText(
  component: TextComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = {
    ...componentStyleToCSS(component.style, context),
    ...textStyleToCSS(component.textStyle, context),
  };

  const content = resolveField(component.content, context);

  const textStyle: CSSProperties = {};
  if (component.maxLines) {
    textStyle.display = '-webkit-box';
    textStyle.WebkitLineClamp = component.maxLines;
    textStyle.WebkitBoxOrient = 'vertical';
    textStyle.overflow = 'hidden';
    if (component.ellipsis !== false) {
      textStyle.textOverflow = 'ellipsis';
    }
  }

  return (
    <p key={key} style={{ ...style, ...textStyle }}>
      {content}
    </p>
  );
}

function renderHeading(
  component: HeadingComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = {
    ...componentStyleToCSS(component.style, context),
    ...textStyleToCSS(component.textStyle, context),
  };

  const content = resolveField(component.content, context);
  const Tag = `h${component.level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag key={key} style={style}>
      {content}
    </Tag>
  );
}

function renderImage(
  component: ImageComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = {
    ...componentStyleToCSS(component.style, context),
    objectFit: component.objectFit || 'cover',
  };

  const src = resolveField(component.src, context);

  if (!src) return <div key={key} style={style} />;

  return (
    <img
      key={key}
      src={src}
      alt={component.alt || ''}
      style={style}
    />
  );
}

function renderShape(
  component: ShapeComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = componentStyleToCSS(component.style, context);

  const shapeStyles: CSSProperties = {
    ...style,
    backgroundColor: component.fill,
  };

  if (component.stroke) {
    shapeStyles.border = `${component.stroke.width}px solid ${component.stroke.color}`;
  }

  switch (component.shape) {
    case 'circle':
      shapeStyles.borderRadius = '50%';
      break;
    case 'rectangle':
      // Default shape, no additional styles needed
      break;
    case 'triangle':
      // CSS triangle using borders
      shapeStyles.width = 0;
      shapeStyles.height = 0;
      shapeStyles.borderLeft = '50px solid transparent';
      shapeStyles.borderRight = '50px solid transparent';
      shapeStyles.borderBottom = `100px solid ${component.fill}`;
      shapeStyles.backgroundColor = 'transparent';
      break;
    case 'line':
      shapeStyles.height = component.stroke?.width || 1;
      shapeStyles.backgroundColor = component.stroke?.color || component.fill;
      break;
  }

  return <div key={key} style={shapeStyles} />;
}

function renderSpacer(
  component: SpacerComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = componentStyleToCSS(component.style, context);

  return (
    <div
      key={key}
      style={{
        ...style,
        height: `${component.size}px`,
      }}
    />
  );
}

function renderDivider(
  component: DividerComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = componentStyleToCSS(component.style, context);

  const dividerStyles: CSSProperties = {
    ...style,
    backgroundColor: component.color || '#000',
  };

  if (component.orientation === 'horizontal') {
    dividerStyles.width = '100%';
    dividerStyles.height = `${component.thickness || 1}px`;
  } else {
    dividerStyles.width = `${component.thickness || 1}px`;
    dividerStyles.height = '100%';
  }

  if (component.lineStyle === 'dashed' || component.lineStyle === 'dotted') {
    dividerStyles.background = 'none';
    dividerStyles.border = 'none';
    dividerStyles[component.orientation === 'horizontal' ? 'borderTop' : 'borderLeft'] =
      `${component.thickness || 1}px ${component.lineStyle} ${component.color || '#000'}`;
  }

  return <div key={key} style={dividerStyles} />;
}

function renderIcon(
  component: IconComponent,
  context: ComponentContext,
  key: string
): JSX.Element {
  const style = componentStyleToCSS(component.style, context);

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[component.name];

  if (!IconComponent) {
    console.warn(`Icon "${component.name}" not found in lucide-react`);
    return <div key={key} style={style} />;
  }

  return (
    <div key={key} style={style}>
      <IconComponent
        size={component.size || 24}
        color={component.color || context.slideData.font_color}
      />
    </div>
  );
}

// ============================================================================
// Main Component Renderer
// ============================================================================

function renderComponent(
  component: LayoutComponent,
  context: ComponentContext,
  key: string
): JSX.Element | null {
  // Check conditional rendering
  if (!shouldRenderComponent(component, context)) {
    return null;
  }

  switch (component.type) {
    case 'container':
      return renderContainer(component, context, key);
    case 'text':
      return renderText(component, context, key);
    case 'heading':
      return renderHeading(component, context, key);
    case 'image':
      return renderImage(component, context, key);
    case 'shape':
      return renderShape(component, context, key);
    case 'spacer':
      return renderSpacer(component, context, key);
    case 'divider':
      return renderDivider(component, context, key);
    case 'icon':
      return renderIcon(component, context, key);
    default:
      console.warn(`Unknown component type: ${(component as any).type}`);
      return null;
  }
}

// ============================================================================
// Main Component
// ============================================================================

export interface ComponentRendererProps {
  schema: {
    root: LayoutComponent;
    width: number;
    height: number;
  };
  context: ComponentContext;
}

export default function ComponentRenderer({ schema, context }: ComponentRendererProps) {
  return (
    <div
      style={{
        width: `${schema.width}px`,
        height: `${schema.height}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {renderComponent(schema.root, context, 'root')}
    </div>
  );
}
