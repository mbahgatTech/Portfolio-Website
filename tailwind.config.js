/** @type {import('tailwindcss').Config} */
// T-003/D15: cohesive design-token system consumed by the redesigned surfaces.
// The palette evolves the site's original purple/blue accent DNA into a full
// brand ramp plus electric-cyan/magenta accents, layered "ink" darks, glow
// shadows, and reusable motion keyframes.
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f1ff",
          100: "#ece5ff",
          200: "#d8ccff",
          300: "#bda4ff",
          400: "#9f76ff",
          500: "#8654ff",
          600: "#7433f5",
          700: "#6224d6",
          800: "#4f1fad",
          900: "#3f1d88",
          950: "#26124f",
        },
        electric: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        magenta: {
          400: "#e879f9",
          500: "#d946ef",
        },
        ink: {
          950: "#07070f",
          900: "#0b0b16",
          800: "#111124",
          700: "#181832",
        },
      },
      fontFamily: {
        // Wired to the next/font CSS variable set in pages/_app.jsx (A5).
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #8654ff 0%, #7433f5 45%, #38bdf8 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #9f76ff 0%, #38bdf8 100%)",
        aurora:
          "radial-gradient(60% 60% at 20% 20%, rgba(134,84,255,0.35) 0%, rgba(11,11,22,0) 60%), radial-gradient(50% 50% at 85% 25%, rgba(56,189,248,0.28) 0%, rgba(11,11,22,0) 60%), radial-gradient(60% 60% at 65% 100%, rgba(217,70,239,0.20) 0%, rgba(11,11,22,0) 60%)",
        grid:
          "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 45px -12px rgba(134,84,255,0.6)",
        "glow-lg": "0 0 80px -18px rgba(134,84,255,0.7)",
        "glow-cyan": "0 0 45px -12px rgba(56,189,248,0.55)",
        "inset-hair": "inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        aurora: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-2%,0) scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "fade-in-up": "fade-in-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        aurora: "aurora 18s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography")
  ],
}
