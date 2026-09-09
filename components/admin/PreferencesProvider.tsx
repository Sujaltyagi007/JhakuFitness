"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { updatePreferences as updatePreferencesApi } from "@/lib/api";

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  accentColor?: string;
  density?: "compact" | "comfortable" | "spacious";
  defaultPage?: string;
  currency?: string;
  timeFormat?: "12h" | "24h";
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
  isHydrated: boolean;
  /** The actually-applied light/dark mode — resolves "system" against the OS preference. */
  resolvedTheme: "light" | "dark";
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  accentColor: "#fbbf24", // Default gold
  density: "comfortable",
  defaultPage: "analytics",
  currency: "INR",
  timeFormat: "12h",
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { data: session, update, status } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const isHydrated = status !== "loading";

  useEffect(() => {
    if (session?.user && (session.user as any).preferences) {
      const userPrefs = (session.user as any).preferences;
      setPreferences((prev) => ({ ...prev, ...userPrefs }));
    }
  }, [session]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = preferences.theme === "dark" || (preferences.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setResolvedTheme(isDark ? "dark" : "light");
    if (preferences.accentColor) {
      root.style.setProperty("--gold", preferences.accentColor);
      // Derive hover/deep shades from the chosen accent so bg-gold-bright /
      // text-gold-deep usages stay in sync without hardcoding a shade per swatch.
      root.style.setProperty("--gold-bright", `color-mix(in srgb, ${preferences.accentColor} 82%, white)`);
      root.style.setProperty("--gold-deep", `color-mix(in srgb, ${preferences.accentColor} 78%, black)`);
    }
    if (preferences.density === "compact") {
      root.classList.add("density-compact");
      root.classList.remove("density-spacious");
    } else if (preferences.density === "spacious") {
      root.classList.add("density-spacious");
      root.classList.remove("density-compact");
    } else {
      root.classList.remove("density-compact", "density-spacious");
    }
  }, [preferences.theme, preferences.accentColor, preferences.density]);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    setIsLoading(true);
    const previous = preferences;
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    try {
      await updatePreferencesApi(newPrefs);
      await update({ preferences: updated });
    } catch (error) {
      setPreferences(previous);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, isLoading, isHydrated, resolvedTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
