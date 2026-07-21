import type { Config } from "tailwindcss";

/*
 * トークンの生値は globals.css の :root が単一の情報源。
 * ここではそれを Tailwind のユーティリティクラスに接続するだけ（DESIGN.md §2–§4）。
 */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "var(--color-primary-100)",
          400: "var(--color-primary-400)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          DEFAULT: "var(--color-primary-600)",
        },
        accent: {
          100: "var(--color-accent-100)",
          600: "var(--color-accent-600)",
          DEFAULT: "var(--color-accent-600)",
        },
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        foreground: "var(--color-text)",
        muted: "var(--color-text-muted)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        ended: "var(--color-ended)",
        error: "var(--color-error)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
      },
      fontFamily: {
        // ロケール別のフォント出し分けは globals.css で --font-display / --font-body を切替
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        // [サイズ, 行間]。body 系のみロケールで行間が切り替わる（--leading-*）
        display: ["40px", { lineHeight: "1.35" }],
        h2: ["28px", { lineHeight: "1.45" }],
        h3: ["20px", { lineHeight: "1.5" }],
        "body-lg": ["18px", { lineHeight: "var(--leading-body-lg)" }],
        body: ["16px", { lineHeight: "var(--leading-body)" }],
        caption: ["13px", { lineHeight: "1.6" }],
      },
      maxWidth: {
        content: "1120px",
        reading: "720px",
      },
      spacing: {
        section: "80px",
        "section-sm": "56px",
      },
    },
  },
  plugins: [],
} satisfies Config;
