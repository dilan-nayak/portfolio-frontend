import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DateField, Field, NumberField, SelectField } from "../FormFields";
import type { BaseSectionProps } from "./types";

const LearningSection: React.FC<BaseSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

  const moveLearningItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...personalDetails.learningItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    updatePersonalDetails({ learningItems: reordered });
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const createEmptyLearningItem = () => ({
    title: "",
    issuer: "",
    courseUrl: "",
    startDate: "",
    endDate: "",
    progress: 0,
    status: "IN_PROGRESS" as const,
  });

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 px-1 py-1 bg-[var(--surface-1)]">
        <button
          type="button"
          onClick={() =>
            updatePersonalDetails({
              // Insert new course at top so newest entries are easiest to edit.
              learningItems: [
                createEmptyLearningItem(),
                ...personalDetails.learningItems,
              ],
            })
          }
          className="rounded-xl px-4 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition"
        >
          Add Learning Item
        </button>
      </div>

      {personalDetails.learningItems.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => setDraggedIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggedIndex === null) return;
            moveLearningItem(draggedIndex, index);
            setDraggedIndex(null);
          }}
          onDragEnd={() => setDraggedIndex(null)}
          className={`rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3 space-y-2 transition ${
            draggedIndex === index ? "opacity-70" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold theme-text-1 truncate">
                {item.title.trim() || "Untitled course"}
              </p>
              <p className="text-xs theme-text-2 truncate">
                {item.issuer.trim() || "No provider set"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] theme-text-3 cursor-move">
                Expand
              </span>
              <button
                type="button"
                onClick={() => toggleExpanded(index)}
                className="rounded-lg px-2 py-1 bg-[var(--surface-1)] border border-[var(--border-1)] hover:bg-[var(--surface-3)] transition"
              >
                {expandedIndexes.includes(index) ? (
                  <ChevronUp size={14} className="theme-text-2" />
                ) : (
                  <ChevronDown size={14} className="theme-text-2" />
                )}
              </button>
            </div>
          </div>

          {expandedIndexes.includes(index) && (
            <div className="space-y-2">
              <div className="grid md:grid-cols-2 gap-3">
                <Field
                  label="Course Title"
                  value={item.title}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      title: value,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
                <Field
                  label="Provider / Issuer"
                  value={item.issuer}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      issuer: value,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
                <Field
                  label="Course Link URL"
                  value={item.courseUrl}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      courseUrl: value,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
                <DateField
                  label="Start Date"
                  value={item.startDate}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      startDate: value,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
                <DateField
                  label="End Date"
                  value={item.endDate}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      endDate: value,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
                <NumberField
                  label="Progress (%)"
                  value={item.progress}
                  min={0}
                  max={100}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      progress: value,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
                <SelectField
                  label="Status"
                  value={item.status}
                  options={[
                    { label: "In Progress", value: "IN_PROGRESS" },
                    { label: "Completed", value: "COMPLETED" },
                  ]}
                  onChange={(value) => {
                    const learningItems = [...personalDetails.learningItems];
                    learningItems[index] = {
                      ...learningItems[index],
                      status: value as "IN_PROGRESS" | "COMPLETED",
                      progress: value === "COMPLETED" ? 100 : item.progress,
                    };
                    updatePersonalDetails({ learningItems });
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    const shouldRemove = await confirmAction({
                      title: "Remove Learning Item",
                      message: "Are you sure you want to remove this learning item?",
                      confirmText: "Remove",
                    });
                    if (!shouldRemove) return;
                    updatePersonalDetails({
                      learningItems: personalDetails.learningItems.filter(
                        (_, i) => i !== index,
                      ),
                    });
                  }}
                  className="rounded-lg px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          {!expandedIndexes.includes(index) && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  const shouldRemove = await confirmAction({
                    title: "Remove Learning Item",
                    message: "Are you sure you want to remove this learning item?",
                    confirmText: "Remove",
                  });
                  if (!shouldRemove) return;
                  updatePersonalDetails({
                    learningItems: personalDetails.learningItems.filter(
                      (_, i) => i !== index,
                    ),
                  });
                }}
                className="rounded-lg px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LearningSection;
