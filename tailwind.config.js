/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          container: "hsl(var(--primary-container))",
          fixed: "hsl(var(--primary-fixed))",
          "fixed-dim": "hsl(var(--primary-fixed-dim))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          container: "hsl(var(--secondary-container))",
          fixed: "hsl(var(--secondary-fixed))",
          "fixed-dim": "hsl(var(--secondary-fixed-dim))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
          container: "hsl(var(--tertiary-container))",
          fixed: "hsl(var(--tertiary-fixed))",
          "fixed-dim": "hsl(var(--tertiary-fixed-dim))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          variant: "hsl(var(--surface-variant))",
          dim: "hsl(var(--surface-dim))",
          bright: "hsl(var(--surface-bright))",
          container: {
            DEFAULT: "hsl(var(--surface-container))",
            low: "hsl(var(--surface-container-low))",
            high: "hsl(var(--surface-container-high))",
            highest: "hsl(var(--surface-container-highest))",
            lowest: "hsl(var(--surface-container-lowest))",
          },
        },
        "on-surface": {
          DEFAULT: "hsl(var(--on-surface))",
          variant: "hsl(var(--on-surface-variant))",
        },
        "on-primary": {
          DEFAULT: "hsl(var(--on-primary))",
          container: "hsl(var(--on-primary-container))",
          fixed: "hsl(var(--on-primary-fixed))",
          "fixed-variant": "hsl(var(--on-primary-fixed-variant))",
        },
        "on-secondary": {
          DEFAULT: "hsl(var(--on-secondary))",
          container: "hsl(var(--on-secondary-container))",
        },
        "on-tertiary": {
          DEFAULT: "hsl(var(--on-tertiary))",
          container: "hsl(var(--on-tertiary-container))",
          fixed: "hsl(var(--on-tertiary-fixed))",
          "fixed-variant": "hsl(var(--on-tertiary-fixed-variant))",
        },
        outline: {
          DEFAULT: "hsl(var(--outline))",
          variant: "hsl(var(--outline-variant))",
        },
        inverse: {
          surface: "hsl(var(--inverse-surface))",
          primary: "hsl(var(--inverse-primary))",
          "on-surface": "hsl(var(--inverse-on-surface))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "body-md": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "400" }],
        "label-caps": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.05em", fontWeight: "600" }],
        "data-mono": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "500" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
