import type React from "react";
import { Field } from "../FormFields";
import type { BaseSectionProps } from "./types";

const SocialSection: React.FC<BaseSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3 space-y-3">
        <h3 className="text-sm font-semibold theme-text-1">Job Availability Indicator</h3>
        <label className="flex items-center justify-between rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-3 py-2 cursor-pointer">
          <span className="text-sm theme-text-1">Actively looking for opportunities</span>
          <input
            type="checkbox"
            checked={personalDetails.jobSearchActive}
            onChange={(e) => updatePersonalDetails({ jobSearchActive: e.target.checked })}
            className="h-4 w-4 accent-[var(--accent-1)]"
          />
        </label>
        <Field
          label="Text when active (green)"
          value={personalDetails.jobSearchTextActive}
          onChange={(value) => updatePersonalDetails({ jobSearchTextActive: value })}
        />
        <Field
          label="Text when inactive (red)"
          value={personalDetails.jobSearchTextInactive}
          onChange={(value) => updatePersonalDetails({ jobSearchTextInactive: value })}
        />
      </div>

      {personalDetails.socialLinks.map((link, index) => (
        <div
          key={index}
          className="grid md:grid-cols-2 gap-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3"
        >
          <Field
            label="Platform"
            value={link.platform}
            onChange={(value) => {
              const socialLinks = [...personalDetails.socialLinks];
              socialLinks[index] = { ...socialLinks[index], platform: value };
              updatePersonalDetails({ socialLinks });
            }}
          />
          <Field
            label="URL"
            value={link.url}
            onChange={(value) => {
              const socialLinks = [...personalDetails.socialLinks];
              socialLinks[index] = { ...socialLinks[index], url: value };
              updatePersonalDetails({ socialLinks });
            }}
          />
          <div className="md:col-span-2">
            <Field
              label="Custom Icon URL (optional)"
              value={link.customIconUrl}
              onChange={(value) => {
                const socialLinks = [...personalDetails.socialLinks];
                socialLinks[index] = { ...socialLinks[index], customIconUrl: value };
                updatePersonalDetails({ socialLinks });
              }}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = await confirmAction({
                  title: "Remove Social Link",
                  message: "Are you sure you want to remove this social link?",
                  confirmText: "Remove",
                });
                if (!shouldRemove) return;
                updatePersonalDetails({
                  socialLinks: personalDetails.socialLinks.filter((_, i) => i !== index),
                });
              }}
              className="w-fit rounded-lg px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          updatePersonalDetails({
            socialLinks: [
              ...personalDetails.socialLinks,
              { platform: "", url: "", customIconUrl: "" },
            ],
          })
        }
        className="rounded-xl px-4 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition"
      >
        Add Social Link
      </button>
    </div>
  );
};

export default SocialSection;
