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
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          DEFAULT: "var(--color-primary-600)",
        },
        accent: {
          100: "var(--color-accent-100)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          DEFAULT: "var(--color-accent-600)",
        },
        // 金（§2「金の栞」）。text-gold-800 だけがテキストに使える階調
        gold: {
          100: "var(--color-gold-100)",
          400: "var(--color-gold-400)",
          500: "var(--color-gold-500)",
          600: "var(--color-gold-600)",
          700: "var(--color-gold-700)",
          800: "var(--color-gold-800)",
        },
        background: "var(--color-bg)",
        warm: "var(--color-bg-warm)", // 面 2（bg-warm の帯）
        translucent: "var(--color-bg-translucent)", // 追従ヘッダーの背景
        surface: "var(--color-surface)",
        foreground: "var(--color-text)",
        muted: "var(--color-text-muted)",
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)", // → border-border-strong
        },
        success: {
          DEFAULT: "var(--color-success)",
          100: "var(--color-success-100)",
          700: "var(--color-success-700)", // バッジ文字（AA 用の濃い階調）
        },
        ended: {
          DEFAULT: "var(--color-ended)",
          100: "var(--color-ended-100)",
        },
        error: "var(--color-error)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        deep: "var(--shadow-deep)",
      },
      transitionTimingFunction: {
        // Tailwind 既定の ease-out を意図的に上書きし、DESIGN §7 の基本カーブに統一する
        out: "var(--ease-out)",
        io: "var(--ease-io)",
      },
      transitionDuration: {
        250: "250ms", // §7 の基本 transition
      },
      fontFamily: {
        // ロケール別のフォント出し分けは globals.css で --font-display / --font-body を切替
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        /*
         * locale 非依存（§3.3 英字併走）。JA ページでも英字は必ず Cormorant で出す。
         * kicker は `Chapter 01 · 近日の体験` のように和文が混ざるため、Cormorant に無い
         * グリフが OS 既定フォントへ落ちないよう、和文フォントを 2 番目に置く。
         */
        jp: ["var(--font-display-jp)", "var(--font-body)", "serif"],
        en: ["var(--font-display-en)", "var(--font-body)", "serif"],
      },
      fontSize: {
        /*
         * [サイズ, 行間]（§3.2）。SP 値はメディアクエリで分岐させず、
         * viewport 640px → 1280px を線形補間する clamp で 1 系統に保つ。
         * body 系のみロケールで行間が切り替わる（--leading-*）。
         */
        "display-xl": [
          "clamp(44px, 8.125vw - 8px, 96px)",
          { lineHeight: "1.15", letterSpacing: "0.01em" },
        ],
        display: [
          "clamp(38px, 5.625vw + 2px, 74px)",
          { lineHeight: "1.2", letterSpacing: "0.01em" },
        ],
        h1: [
          "clamp(30px, 2.1875vw + 16px, 44px)",
          { lineHeight: "1.4", letterSpacing: "0.01em" },
        ],
        h2: [
          "clamp(28px, 1.875vw + 16px, 40px)",
          { lineHeight: "1.3", letterSpacing: "0.01em" },
        ],
        h3: ["clamp(20px, 0.3125vw + 18px, 22px)", { lineHeight: "1.5" }],
        h4: ["18px", { lineHeight: "1.6" }],
        lead: ["clamp(19px, 0.469vw + 16px, 22px)", { lineHeight: "1.75" }],
        "body-lg": ["18px", { lineHeight: "var(--leading-body-lg)" }],
        body: ["16px", { lineHeight: "var(--leading-body)" }],
        caption: ["13px", { lineHeight: "1.6" }],
        kicker: [
          "clamp(12px, 0.3125vw + 10px, 14px)",
          { lineHeight: "1.4", letterSpacing: "0.16em" },
        ],
      },
      maxWidth: {
        content: "1280px",
        wide: "1400px", // カレンダーページのみ（サイドバー 380px を抱える）
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
