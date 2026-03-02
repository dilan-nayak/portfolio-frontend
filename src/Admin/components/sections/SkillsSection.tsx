import type React from "react";
import { ArrayEditor, Field } from "../FormFields";
import type { BaseSectionProps } from "./types";

const SkillsSection: React.FC<BaseSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
}) => {
  return (
    <div className="space-y-4">
      {personalDetails.skillCategories.map((category, index) => (
        <div
          key={index}
          className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3 space-y-2"
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Field
              label="Category Name"
              value={category.category}
              onChange={(value) => {
                const skillCategories = [...personalDetails.skillCategories];
                skillCategories[index] = {
                  ...skillCategories[index],
                  category: value,
                };
                updatePersonalDetails({ skillCategories });
              }}
            />
            <Field
              label="Color Gradient"
              value={category.color}
              onChange={(value) => {
                const skillCategories = [...personalDetails.skillCategories];
                skillCategories[index] = {
                  ...skillCategories[index],
                  color: value,
                };
                updatePersonalDetails({ skillCategories });
              }}
            />
          </div>
          <ArrayEditor
            label="Technologies"
            items={category.techs}
            confirmAction={confirmAction}
            onChange={(techs) => {
              const skillCategories = [...personalDetails.skillCategories];
              skillCategories[index] = {
                ...skillCategories[index],
                techs,
              };
              updatePersonalDetails({ skillCategories });
            }}
            placeholder="React"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = await confirmAction({
                  title: "Remove Skill Category",
                  message: "Are you sure you want to remove this skill category?",
                  confirmText: "Remove",
                });
                if (!shouldRemove) return;
                updatePersonalDetails({
                  skillCategories: personalDetails.skillCategories.filter((_, i) => i !== index),
                });
              }}
              className="rounded-lg px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
            >
              Remove Category
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          updatePersonalDetails({
            skillCategories: [
              ...personalDetails.skillCategories,
              {
                category: "New Category",
                techs: [],
                color: "from-[var(--accent-1)] to-[var(--accent-2)]",
              },
            ],
          })
        }
        className="rounded-xl px-4 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition"
      >
        Add Category
      </button>
    </div>
  );
};

export default SkillsSection;
