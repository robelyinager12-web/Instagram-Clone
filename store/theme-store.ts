import { create } from "zustand";

type Theme = "light" | "dark" | "system";

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

function applyThemeClass(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    applyThemeClass(theme);
    set({ theme });
  },
}));

export function initTheme() {
  const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
  applyThemeClass(stored);
  useThemeStore.setState({ theme: stored });
}
