import type React from "react";
import type { BaseSectionProps } from "./types";

const sectionItems = [
  { key: "home", label: "Home Section" },
  { key: "about", label: "About Section" },
  { key: "skills", label: "Skills Section" },
  { key: "experience", label: "Experience Section" },
  { key: "projects", label: "Projects Section" },
  { key: "study", label: "Study Section" },
  { key: "blog", label: "Blog Section" },
  { key: "contact", label: "Contact Section" },
] as const;

const SectionsVisibilitySection: React.FC<BaseSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
}) => {
  return (
    <div className="space-y-3">
      {sectionItems.map((item) => {
        const isChecked = personalDetails.sectionVisibility[item.key];
        return (
          <label
            key={item.key}
            className="flex items-center justify-between rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 cursor-pointer"
          >
            <span className="text-sm theme-text-1">{item.label}</span>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) =>
                updatePersonalDetails({
                  sectionVisibility: {
                    ...personalDetails.sectionVisibility,
                    [item.key]: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 accent-[var(--accent-1)]"
            />
          </label>
        );
      })}
    </div>
  );
};

export default SectionsVisibilitySection;
