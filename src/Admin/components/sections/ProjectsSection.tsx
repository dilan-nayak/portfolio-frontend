import type React from "react";
import { ArrayEditor, Field, ImageUploadField, TextAreaField } from "../FormFields";
import { uploadAdminFile } from "../../adminService";
import type { ImageSectionProps } from "./types";

const ProjectsSection: React.FC<ImageSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
  onImageSelected,
}) => {
  return (
    <div className="space-y-4">
      {personalDetails.projects.map((project, index) => (
        <div
          key={index}
          className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-1)] p-3 space-y-2"
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Field
              label="Title"
              value={project.title}
              onChange={(value) => {
                const projects = [...personalDetails.projects];
                projects[index] = { ...projects[index], title: value };
                updatePersonalDetails({ projects });
              }}
            />
            <Field
              label="Category"
              value={project.category}
              onChange={(value) => {
                const projects = [...personalDetails.projects];
                projects[index] = { ...projects[index], category: value };
                updatePersonalDetails({ projects });
              }}
            />
            <Field
              label="Image URL"
              value={project.image}
              onChange={(value) => {
                const projects = [...personalDetails.projects];
                projects[index] = { ...projects[index], image: value };
                updatePersonalDetails({ projects });
              }}
            />
            <ImageUploadField
              label="Upload Project Image"
              onFileSelected={async (file) => {
                // Project images are persisted as file URLs, not base64 blobs.
                const uploaded = await uploadAdminFile(file, "images");
                const projects = [...personalDetails.projects];
                projects[index] = { ...projects[index], image: uploaded.url };
                updatePersonalDetails({ projects });
                onImageSelected("Project image uploaded");
              }}
            />
            <Field
              label="Live URL"
              value={project.liveUrl}
              onChange={(value) => {
                const projects = [...personalDetails.projects];
                projects[index] = { ...projects[index], liveUrl: value };
                updatePersonalDetails({ projects });
              }}
            />
            <Field
              label="GitHub URL"
              value={project.githubUrl}
              onChange={(value) => {
                const projects = [...personalDetails.projects];
                projects[index] = { ...projects[index], githubUrl: value };
                updatePersonalDetails({ projects });
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={project.description}
            rows={3}
            onChange={(value) => {
              const projects = [...personalDetails.projects];
              projects[index] = { ...projects[index], description: value };
              updatePersonalDetails({ projects });
            }}
          />
          <ArrayEditor
            label="Technologies (comma separated supported)"
            items={project.technologies}
            confirmAction={confirmAction}
            onChange={(technologies) => {
              const projects = [...personalDetails.projects];
              projects[index] = { ...projects[index], technologies };
              updatePersonalDetails({ projects });
            }}
            placeholder="React"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = await confirmAction({
                  title: "Remove Project",
                  message: "Are you sure you want to remove this project?",
                  confirmText: "Remove",
                });
                if (!shouldRemove) return;
                updatePersonalDetails({
                  projects: personalDetails.projects.filter((_, i) => i !== index),
                });
              }}
              className="rounded-lg px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition"
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
            projects: [
              ...personalDetails.projects,
              {
                title: "",
                category: "Web App",
                description: "",
                image: "",
                technologies: [],
                liveUrl: "",
                githubUrl: "",
              },
            ],
          })
        }
        className="rounded-xl px-4 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white transition"
      >
        Add Project
      </button>
    </div>
  );
};

export default ProjectsSection;
