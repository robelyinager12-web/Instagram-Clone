import type { Metadata } from "next";
import { ThemeSwitcher } from "@/features/settings/components/theme-switcher";

export const metadata: Metadata = { title: "Appearance" };

export default function AppearanceSettingsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Appearance</h1>
      <ThemeSwitcher />
    </div>
  );
}
