import { create } from 'zustand';

export const themeConfig = {
  cricket: {
    primary: "from-green-400 to-green-600",
    accent: "text-green-500",
    description: "Cricket theme"
  },
  space: {
    primary: "from-purple-500 to-indigo-600",
    accent: "text-purple-500",
    description: "Space theme"
  },
  science: {
    primary: "from-blue-400 to-cyan-600",
    accent: "text-cyan-500",
    description: "Science theme"
  },
  history: {
    primary: "from-yellow-500 to-orange-600",
    accent: "text-yellow-500",
    description: "History theme"
  },
  technology: {
    primary: "from-gray-700 to-gray-900",
    accent: "text-gray-400",
    description: "Technology theme"
  },
  art: {
    primary: "from-pink-400 to-red-600",
    accent: "text-pink-500",
    description: "Art theme"
  }
};

interface ThemeState {
  theme: keyof typeof themeConfig;
  backgrounds: string[];
  setTheme: (theme: keyof typeof themeConfig) => void;
  setDynamicBackgrounds: (bgs: string[]) => void;
  getThemeStyles: () => { backgrounds: string[] } & typeof themeConfig[keyof typeof themeConfig];
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'cricket', // default, will be replaced after login fetch
  backgrounds: [],
  setTheme: (theme) => set({ theme }),
  setDynamicBackgrounds: (bgs) => set({ backgrounds: bgs }),
  getThemeStyles: () => {
    const { theme, backgrounds } = get();
    return {
      ...themeConfig[theme],
      backgrounds, // ✅ comes ONLY from backend fetch, not from themeConfig
    };
  }
}));
