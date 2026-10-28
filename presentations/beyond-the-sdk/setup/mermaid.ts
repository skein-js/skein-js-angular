import { defineMermaidSetup } from '@slidev/types';

export default defineMermaidSetup(() => ({
  "theme": "base",
  "themeVariables": {
    "darkMode": true,
    "background": "#080d14",
    "primaryColor": "#10263d",
    "primaryTextColor": "#e7f1ff",
    "primaryBorderColor": "#527ca9",
    "secondaryColor": "#0d1b2c",
    "tertiaryColor": "#0d1b2c",
    "lineColor": "#86b5e8",
    "textColor": "#e7f1ff",
    "fontFamily": "system-ui",
    "fontSize": "19px",
    "clusterBkg": "#0b1623",
    "clusterBorder": "#355574",
    "actorBkg": "#10263d",
    "actorBorder": "#527ca9",
    "actorTextColor": "#e7f1ff",
    "signalTextColor": "#d3e6ff",
    "signalColor": "#86b5e8",
    "labelBoxBkgColor": "#080d14",
    "edgeLabelBackground": "#080d14",
    "noteBkgColor": "#10263d",
    "noteTextColor": "#d3e6ff"
  },
  "flowchart": {
    "nodeSpacing": 22,
    "rankSpacing": 30,
    "padding": 12,
    "wrappingWidth": 240
  },
  "sequence": {
    "mirrorActors": false,
    "actorMargin": 28,
    "messageMargin": 22,
    "boxMargin": 5,
    "noteMargin": 8
  }
}));
