import type React from "react";
import { Field, ImageUploadField } from "../FormFields";
import { uploadAdminFile } from "../../adminService";
import type { ImageSectionProps } from "./types";

const PersonalSection: React.FC<ImageSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  onImageSelected,
}) => {
  const safeX = Math.max(0, Math.min(100, personalDetails.heroImagePositionX ?? 50));
  const safeY = Math.max(0, Math.min(100, personalDetails.heroImagePositionY ?? 50));
  const safeScale = Math.max(100, Math.min(200, personalDetails.heroImageScale ?? 100));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Field
        label="Full Name"
        value={personalDetails.name}
        onChange={(value) => updatePersonalDetails({ name: value })}
      />
      <Field
        label="Title"
        value={personalDetails.title}
        onChange={(value) => updatePersonalDetails({ title: value })}
      />
      <Field
        label="Hero Subtitle"
        value={personalDetails.subtitle}
        onChange={(value) => updatePersonalDetails({ subtitle: value })}
      />
      <Field
        label="Email"
        value={personalDetails.email}
        onChange={(value) => updatePersonalDetails({ email: value })}
      />
      <Field
        label="Phone"
        value={personalDetails.phone}
        onChange={(value) => updatePersonalDetails({ phone: value })}
      />
      <Field
        label="Location"
        value={personalDetails.location}
        onChange={(value) => updatePersonalDetails({ location: value })}
      />
      <Field
        label="Resume URL"
        value={personalDetails.resumeUrl}
        onChange={(value) => updatePersonalDetails({ resumeUrl: value })}
      />
      <div>
        <label className="block text-xs theme-text-2 mb-1">
          Upload Resume (PDF/DOC/DOCX)
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const uploaded = await uploadAdminFile(file, "documents");
            updatePersonalDetails({ resumeUrl: uploaded.url });
            onImageSelected("Resume uploaded");
            e.currentTarget.value = "";
          }}
          className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 text-sm"
        />
      </div>
      <Field
        label="Hero Image URL"
        value={personalDetails.heroImage}
        onChange={(value) => updatePersonalDetails({ heroImage: value })}
      />
      <ImageUploadField
        label="Upload Hero Image"
        onFileSelected={async (file) => {
          // Store hero images via backend file storage and persist only URL in DB.
          const uploaded = await uploadAdminFile(file, "images");
          updatePersonalDetails({ heroImage: uploaded.url });
          onImageSelected("Hero image uploaded");
        }}
      />

      <div className="md:col-span-2 rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] p-4 space-y-4">
        <h3 className="text-sm font-semibold theme-text-1">Hero Image Positioning</h3>
        <p className="text-xs theme-text-2">
          Adjust these controls to set the exact hero image framing used on the home page.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs theme-text-2 mb-1">
              Horizontal Position ({safeX}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={safeX}
              onChange={(e) =>
                updatePersonalDetails({ heroImagePositionX: Number(e.target.value) })
              }
              className="w-full accent-[var(--accent-1)]"
            />
          </div>
          <div>
            <label className="block text-xs theme-text-2 mb-1">
              Vertical Position ({safeY}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={safeY}
              onChange={(e) =>
                updatePersonalDetails({ heroImagePositionY: Number(e.target.value) })
              }
              className="w-full accent-[var(--accent-1)]"
            />
          </div>
          <div>
            <label className="block text-xs theme-text-2 mb-1">Zoom ({safeScale}%)</label>
            <input
              type="range"
              min={100}
              max={200}
              value={safeScale}
              onChange={(e) =>
                updatePersonalDetails({ heroImageScale: Number(e.target.value) })
              }
              className="w-full accent-[var(--accent-1)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              updatePersonalDetails({
                heroImagePositionX: 50,
                heroImagePositionY: 50,
                heroImageScale: 100,
              })
            }
            className="rounded-lg px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-1)] hover:bg-[var(--surface-3)] transition text-sm"
          >
            Reset Framing
          </button>

          <div className="h-24 w-24 rounded-full overflow-hidden border border-[var(--border-1)] bg-[var(--surface-1)] flex-shrink-0">
            {personalDetails.heroImage.trim() ? (
              <img
                src={personalDetails.heroImage}
                alt="Hero preview"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${safeX}% ${safeY}%`,
                  transform: `scale(${safeScale / 100})`,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] theme-text-3 text-center px-1">
                Upload image
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSection;
