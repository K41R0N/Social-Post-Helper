import type { CustomLayout } from '../types/customLayout';

export const ANTI_MARKETING_LAYOUTS: CustomLayout[] = [
  {
    id: 'anti-marketing-hook',
    name: 'Anti-Marketing Hook',
    description: 'Bold, high-contrast hook slide matching SVG design.',
    htmlTemplate: `<div class="slide-container">
  <div class="content-wrapper">
    <h1 class="title">{{title}}</h1>
    <p class="subtitle">{{subtitle}}</p>
    <div class="separator"></div>
  </div>
  <div class="footer">
    <p class="footer-text">{{body_text}}</p>
  </div>
</div>`,
    cssTemplate: `.slide-container {
  width: 100%;
  height: 100%;
  background-color: #101010;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 80px 100px 60px 100px;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
  position: relative;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  padding-top: 40px;
}

.title {
  font-size: 200px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 0.85;
  text-align: left;
  letter-spacing: 0.02em;
  margin: 0;
  padding: 0;
  color: #fff;
  font-family: 'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif;
  font-stretch: condensed;
}

.subtitle {
  font-size: 48px;
  font-weight: 400;
  margin: 8px 0 0 0;
  padding: 0;
  color: #fff;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.separator {
  width: 400px;
  height: 3px;
  background-color: #fff;
  margin: 30px 0 0 0;
}

.footer {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 0;
  margin-top: auto;
}

.footer-text {
  font-size: 36px;
  font-style: italic;
  color: #fff;
  margin: 0;
  padding: 0;
  letter-spacing: 0.02em;
  line-height: 1.2;
}`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: 'anti-marketing-value',
    name: 'Anti-Marketing Value',
    description: 'Left-aligned, raw aesthetic for value delivery.',
    htmlTemplate: `<div class="slide-container">
  <div class="header-bar">
    <span class="slide-num">02</span>
    <span class="topic">{{subtitle}}</span>
  </div>
  <div class="main-content">
    <h2 class="headline">{{title}}</h2>
    <div class="body-text">{{body_text}}</div>
  </div>
</div>`,
    cssTemplate: `.slide-container {
  width: 100%;
  height: 100%;
  background-color: #000000;
  color: #e5e5e5;
  padding: 60px;
  font-family: 'Helvetica Neue', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #333;
  padding-bottom: 20px;
  font-family: monospace;
  color: {{accent_color}};
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.headline {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
  color: #fff;
}

.body-text {
  font-size: 24px;
  line-height: 1.5;
  color: #ccc;
  white-space: pre-wrap;
  border-left: 4px solid {{accent_color}};
  padding-left: 30px;
}`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: 'anti-marketing-cta',
    name: 'Anti-Marketing CTA',
    description: 'Brutalist call to action.',
    htmlTemplate: `<div class="slide-container">
  <div class="cta-wrapper">
    <h2 class="cta-title">{{title}}</h2>
    <div class="arrow">↓</div>
    <div class="action-box">
      {{body_text}}
    </div>
  </div>
</div>`,
    cssTemplate: `.slide-container {
  width: 100%;
  height: 100%;
  background-color: {{accent_color}};
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  font-family: 'Arial Black', sans-serif;
}

.cta-wrapper {
  background: #fff;
  padding: 60px;
  border: 8px solid #000;
  box-shadow: 20px 20px 0px #000;
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.cta-title {
  font-size: 60px;
  text-transform: uppercase;
  margin: 0 0 30px 0;
  line-height: 1;
}

.arrow {
  font-size: 80px;
  line-height: 1;
  margin-bottom: 30px;
}

.action-box {
  font-size: 30px;
  font-weight: bold;
  text-decoration: underline;
}`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  }
];
