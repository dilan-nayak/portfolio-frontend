import type React from "react";
import { ColorField, Field } from "../FormFields";
import type { BaseSectionProps } from "./types";
import type { ThemePalette } from "../../types";

const paletteFieldDefs: { key: keyof ThemePalette; label: string; type: "color" | "text" }[] = [
  { key: "appBg", label: "App Background", type: "color" },
  { key: "sectionBg", label: "Section Background", type: "color" },
  { key: "surface1", label: "Surface 1", type: "color" },
  { key: "surface2", label: "Surface 2", type: "color" },
  { key: "surface3", label: "Surface 3", type: "color" },
  { key: "text1", label: "Text Primary", type: "color" },
  { key: "text2", label: "Text Secondary", type: "color" },
  { key: "text3", label: "Text Tertiary", type: "color" },
  { key: "border1", label: "Border", type: "color" },
  { key: "accent1", label: "Accent 1", type: "color" },
  { key: "accent2", label: "Accent 2", type: "color" },
  { key: "accentSoft", label: "Accent Soft (rgba)", type: "text" },
  { key: "success", label: "Success", type: "color" },
  { key: "info", label: "Info", type: "color" },
];

const ThemePaletteEditor: React.FC<{
  title: string;
  mode: "light" | "dark";
  palette: ThemePalette;
  onChange: (updates: Partial<ThemePalette>) => void;
}> = ({ title, palette, onChange }) => {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3 space-y-2">
      <h4 className="text-sm font-semibold theme-text-1">{title}</h4>
      {paletteFieldDefs.map((fieldDef) => {
        const value = palette[fieldDef.key];
        const handleChange = (nextValue: string) => onChange({ [fieldDef.key]: nextValue });

        if (fieldDef.type === "text") {
          return (
            <Field
              key={fieldDef.key}
              label={fieldDef.label}
              value={value}
              onChange={handleChange}
            />
          );
        }

        return (
          <ColorField
            key={fieldDef.key}
            label={fieldDef.label}
            value={value}
            onChange={handleChange}
          />
        );
      })}
    </div>
  );
};

const ThemeSection: React.FC<BaseSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3">
        <h3 className="text-sm font-semibold theme-text-1 mb-2">Theme Color Studio</h3>
        <p className="text-xs theme-text-2">
          Update both palettes from here. Changes apply instantly on the site and persist when you click Save.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ThemePaletteEditor
          title="Light Theme"
          mode="light"
          palette={personalDetails.themeSettings.light}
          onChange={(updates) =>
            updatePersonalDetails({
              themeSettings: {
                ...personalDetails.themeSettings,
                light: {
                  ...personalDetails.themeSettings.light,
                  ...updates,
                },
              },
            })
          }
        />
        <ThemePaletteEditor
          title="Dark Theme"
          mode="dark"
          palette={personalDetails.themeSettings.dark}
          onChange={(updates) =>
            updatePersonalDetails({
              themeSettings: {
                ...personalDetails.themeSettings,
                dark: {
                  ...personalDetails.themeSettings.dark,
                  ...updates,
                },
              },
            })
          }
        />
      </div>
    </div>
  );
};

export default ThemeSection;
