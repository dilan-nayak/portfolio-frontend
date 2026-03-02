import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Field, TextAreaField } from "../FormFields";
import type { BaseSectionProps } from "./types";

const ExperienceSection: React.FC<BaseSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
}) => {
  const [draggedCompanyIndex, setDraggedCompanyIndex] = useState<number | null>(null);
  const [draggedRole, setDraggedRole] = useState<{
    companyIndex: number;
    roleIndex: number;
  } | null>(null);
  const [expandedCompanyIndexes, setExpandedCompanyIndexes] = useState<number[]>([]);
  const [expandedRoleIndexes, setExpandedRoleIndexes] = useState<Record<number, number[]>>(
    {},
  );

  const moveCompany = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...personalDetails.experience];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    updatePersonalDetails({ experience: reordered });
  };

  const toggleCompanyExpanded = (index: number) => {
    setExpandedCompanyIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const toggleRoleExpanded = (companyIndex: number, roleIndex: number) => {
    setExpandedRoleIndexes((prev) => {
      const companyRoles = prev[companyIndex] ?? [];
      const nextCompanyRoles = companyRoles.includes(roleIndex)
        ? companyRoles.filter((item) => item !== roleIndex)
        : [...companyRoles, roleIndex];
      return { ...prev, [companyIndex]: nextCompanyRoles };
    });
  };

  const isRoleExpanded = (companyIndex: number, roleIndex: number) =>
    (expandedRoleIndexes[companyIndex] ?? []).includes(roleIndex);

  const moveRole = (companyIndex: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const experience = [...personalDetails.experience];
    const roles = [...experience[companyIndex].roles];
    const [moved] = roles.splice(fromIndex, 1);
    roles.splice(toIndex, 0, moved);
    experience[companyIndex] = { ...experience[companyIndex], roles };
    updatePersonalDetails({ experience });

    setExpandedRoleIndexes((prev) => {
      const companyRoles = prev[companyIndex] ?? [];
      const remapped = companyRoles
        .map((index) => {
          if (index === fromIndex) return toIndex;
          if (fromIndex < toIndex && index > fromIndex && index <= toIndex) return index - 1;
          if (fromIndex > toIndex && index >= toIndex && index < fromIndex) return index + 1;
          return index;
        })
        .filter((value, idx, arr) => arr.indexOf(value) === idx);
      return { ...prev, [companyIndex]: remapped };
    });
  };

  const createEmptyRole = () => ({ title: "", period: "", description: "" });
  const createEmptyCompany = () => ({
    company: "",
    companyDisplayName: "",
    companyUrl: "",
    roles: [createEmptyRole()],
  });

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 px-1 py-1 bg-[var(--surface-1)]">
        <button
          type="button"
          onClick={() =>
            updatePersonalDetails({
              // Insert at top so newest company is immediately accessible.
              experience: [createEmptyCompany(), ...personalDetails.experience],
            })
          }
          className="rounded-xl px-4 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition"
        >
          Add Company
        </button>
      </div>

      {personalDetails.experience.map((exp, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => setDraggedCompanyIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggedCompanyIndex === null) return;
            moveCompany(draggedCompanyIndex, index);
            setDraggedCompanyIndex(null);
          }}
          onDragEnd={() => setDraggedCompanyIndex(null)}
          className={`rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3 space-y-2 transition ${
            draggedCompanyIndex === index ? "opacity-70" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold theme-text-1 truncate">
                {exp.company.trim() || "Untitled company"}
              </p>
              <p className="text-xs theme-text-2 truncate">
                {(exp.companyDisplayName || exp.roles[0]?.title || "No role added").trim()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] theme-text-3 cursor-move">
                Expand
              </span>
              <button
                type="button"
                onClick={() => toggleCompanyExpanded(index)}
                className="rounded-lg px-2 py-1 bg-[var(--surface-1)] border border-[var(--border-1)] hover:bg-[var(--surface-3)] transition"
              >
                {expandedCompanyIndexes.includes(index) ? (
                  <ChevronUp size={14} className="theme-text-2" />
                ) : (
                  <ChevronDown size={14} className="theme-text-2" />
                )}
              </button>
            </div>
          </div>
          {expandedCompanyIndexes.includes(index) && (
            <>
              <div className="grid md:grid-cols-1 gap-3">
                <Field
                  label="Company"
                  value={exp.company}
                  onChange={(value) => {
                    const experience = [...personalDetails.experience];
                    experience[index] = { ...experience[index], company: value };
                    updatePersonalDetails({ experience });
                  }}
                />
                <Field
                  label="Company Name To Show (Left Tab)"
                  value={exp.companyDisplayName}
                  onChange={(value) => {
                    const experience = [...personalDetails.experience];
                    experience[index] = { ...experience[index], companyDisplayName: value };
                    updatePersonalDetails({ experience });
                  }}
                />
                <Field
                  label="Company Link (LinkedIn URL)"
                  value={exp.companyUrl}
                  onChange={(value) => {
                    const experience = [...personalDetails.experience];
                    experience[index] = { ...experience[index], companyUrl: value };
                    updatePersonalDetails({ experience });
                  }}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold theme-text-1">Positions</p>
                  <button
                    type="button"
                    onClick={() => {
                      const experience = [...personalDetails.experience];
                      // Insert at top so newest role is first.
                      const roles = [createEmptyRole(), ...experience[index].roles];
                      experience[index] = { ...experience[index], roles };
                      updatePersonalDetails({ experience });
                      setExpandedRoleIndexes((prev) => {
                        const companyRoles = prev[index] ?? [];
                        return {
                          ...prev,
                          [index]: [0, ...companyRoles.map((roleIndex) => roleIndex + 1)],
                        };
                      });
                    }}
                    className="rounded-lg px-3 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition text-sm"
                  >
                    Add Position
                  </button>
                </div>
                {exp.roles.map((role, roleIndex) => (
                  <div
                    key={roleIndex}
                    draggable
                    onDragStart={() => setDraggedRole({ companyIndex: index, roleIndex })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!draggedRole || draggedRole.companyIndex !== index) return;
                      moveRole(index, draggedRole.roleIndex, roleIndex);
                      setDraggedRole(null);
                    }}
                    onDragEnd={() => setDraggedRole(null)}
                    className="rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold theme-text-1 truncate">
                          {role.title.trim() || "Untitled position"}
                        </p>
                        <p className="text-xs theme-text-2 truncate">
                          {role.period.trim() || "No period set"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] theme-text-3 cursor-move">Expand</span>
                        <button
                          type="button"
                          onClick={() => toggleRoleExpanded(index, roleIndex)}
                          className="rounded-lg px-2 py-1 bg-[var(--surface-2)] border border-[var(--border-1)] hover:bg-[var(--surface-3)] transition"
                        >
                          {isRoleExpanded(index, roleIndex) ? (
                            <ChevronUp size={14} className="theme-text-2" />
                          ) : (
                            <ChevronDown size={14} className="theme-text-2" />
                          )}
                        </button>
                      </div>
                    </div>
                    {isRoleExpanded(index, roleIndex) && (
                      <>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Field
                            label="Title"
                            value={role.title}
                            onChange={(value) => {
                              const experience = [...personalDetails.experience];
                              const roles = [...experience[index].roles];
                              roles[roleIndex] = { ...roles[roleIndex], title: value };
                              experience[index] = { ...experience[index], roles };
                              updatePersonalDetails({ experience });
                            }}
                          />
                          <Field
                            label="Period"
                            value={role.period}
                            onChange={(value) => {
                              const experience = [...personalDetails.experience];
                              const roles = [...experience[index].roles];
                              roles[roleIndex] = { ...roles[roleIndex], period: value };
                              experience[index] = { ...experience[index], roles };
                              updatePersonalDetails({ experience });
                            }}
                          />
                        </div>
                        <TextAreaField
                          label="Description"
                          value={role.description}
                          rows={3}
                          onChange={(value) => {
                            const experience = [...personalDetails.experience];
                            const roles = [...experience[index].roles];
                            roles[roleIndex] = { ...roles[roleIndex], description: value };
                            experience[index] = { ...experience[index], roles };
                            updatePersonalDetails({ experience });
                          }}
                        />
                      </>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={async () => {
                          const shouldRemove = await confirmAction({
                            title: "Remove Position",
                            message: "Are you sure you want to remove this position?",
                            confirmText: "Remove",
                          });
                          if (!shouldRemove) return;
                          const experience = [...personalDetails.experience];
                          const roles = experience[index].roles.filter((_, i) => i !== roleIndex);
                          experience[index] = { ...experience[index], roles };
                          updatePersonalDetails({ experience });
                          setExpandedRoleIndexes((prev) => {
                            const companyRoles = prev[index] ?? [];
                            const remapped = companyRoles
                              .filter((item) => item !== roleIndex)
                              .map((item) => (item > roleIndex ? item - 1 : item));
                            return { ...prev, [index]: remapped };
                          });
                        }}
                        className="rounded-xl px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
                      >
                        Remove Position
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {!expandedCompanyIndexes.includes(index) && (
            <div className="text-[11px] theme-text-3">
              Drag company block to reorder
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = await confirmAction({
                  title: "Remove Company",
                  message: "Are you sure you want to remove this company?",
                  confirmText: "Remove",
                });
                if (!shouldRemove) return;
                updatePersonalDetails({
                  experience: personalDetails.experience.filter((_, i) => i !== index),
                });
              }}
              className="rounded-xl px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceSection;
