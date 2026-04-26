/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "tertiary-fixed": "#e2e2e2",
        "tertiary": "#dbdbdb",
        "secondary-fixed": "#ffddb9",
        "on-primary-fixed-variant": "#614000",
        "on-error-container": "#ffdad6",
        "tertiary-container": "#bebfbf",
        "surface-container-low": "#1b1b1b",
        "background": "#131313",
        "surface-bright": "#393939",
        "error-container": "#93000a",
        "surface-container-lowest": "#0e0e0e",
        "secondary-container": "#66410d",
        "on-surface": "#e2e2e2",
        "on-secondary-fixed-variant": "#633f0b",
        "primary-fixed-dim": "var(--accent-color)",
        "tertiary-fixed-dim": "#c6c6c7",
        "on-primary-fixed": "#281800",
        "outline": "#9f8e78",
        "on-secondary-fixed": "#2b1700",
        "on-secondary-container": "#e3af71",
        "on-tertiary-fixed-variant": "#454747",
        "surface-variant": "#353535",
        "on-primary": "#432c00",
        "surface-dim": "#131313",
        "on-tertiary": "#2f3131",
        "inverse-primary": "#805600",
        "outline-variant": "#524533",
        "on-background": "#e2e2e2",
        "primary-fixed": "var(--accent-color)",
        "secondary-fixed-dim": "#f2bd7e",
        "secondary": "#f2bd7e",
        "surface-tint": "var(--accent-color)",
        "surface-container": "#1f1f1f",
        "primary-container": "var(--accent-color)",
        "error": "#ffb4ab",
        "on-tertiary-container": "#4c4e4e",
        "surface-container-highest": "#353535",
        "on-tertiary-fixed": "#1a1c1c",
        "on-error": "#690005",
        "inverse-surface": "#e2e2e2",
        "surface": "#131313",
        "surface-container-high": "#2a2a2a",
        "on-surface-variant": "#d7c4ac",
        "on-secondary": "#472a00",
        "on-primary-container": "#6a4700",
        "primary": "var(--accent-color)",
        "inverse-on-surface": "#303030"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "gutter": "2ch",
        "char-width": "1ch",
        "margin": "4ch",
        "line-height": "1rem"
      },
      "fontFamily": {
        "body-lg": ["JetBrains Mono", "monospace"],
        "headline-lg": ["VT323", "monospace"],
        "headline-md": ["VT323", "monospace"],
        "body-sm": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"]
      },
      "fontSize": {
        "body-lg": ["18px", { "lineHeight": "26px", "letterSpacing": "0px", "fontWeight": "400" }],
        "headline-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "2px", "fontWeight": "400" }],
        "headline-md": ["28px", { "lineHeight": "36px", "letterSpacing": "1px", "fontWeight": "400" }],
        "body-sm": ["15px", { "lineHeight": "22px", "letterSpacing": "0.2px", "fontWeight": "400" }],
        "label-caps": ["13px", { "lineHeight": "18px", "letterSpacing": "1.5px", "fontWeight": "700" }]
      }
    }
  },
  plugins: [],
}
