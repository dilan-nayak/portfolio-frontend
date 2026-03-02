import type React from "react";
import { ImageUploadField, Field } from "../FormFields";
import { resolveApiUrl, uploadAdminFile } from "../../adminService";
import type { ImageSectionProps } from "./types";

const previewClass =
  "w-16 h-16 rounded-full border border-[var(--border-1)] bg-[var(--surface-2)] object-cover";

const NavbarSection: React.FC<ImageSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
  onImageSelected,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-sm theme-text-2">
        Set two custom images for the left navbar toggle icon.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3 rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] p-4">
          <h3 className="text-sm font-semibold theme-text-1">Closed State Image</h3>
          <Field
            label="Closed Image URL"
            value={personalDetails.navbarToggleImageClosed}
            onChange={(value) => updatePersonalDetails({ navbarToggleImageClosed: value })}
          />
          <ImageUploadField
            label="Upload Closed Image"
            onFileSelected={async (file) => {
              const uploaded = await uploadAdminFile(file, "images");
              updatePersonalDetails({ navbarToggleImageClosed: uploaded.url });
              onImageSelected("Navbar closed image uploaded");
            }}
          />
          <div className="flex items-center justify-between">
            {personalDetails.navbarToggleImageClosed.trim() ? (
              <img
                src={resolveApiUrl(personalDetails.navbarToggleImageClosed)}
                alt="Closed icon preview"
                className={previewClass}
              />
            ) : (
              <div className={`${previewClass} flex items-center justify-center text-xs theme-text-3`}>
                Empty
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = await confirmAction({
                  title: "Remove Closed Icon",
                  message: "Are you sure you want to remove the closed state image?",
                  confirmText: "Remove",
                });
                if (!shouldRemove) return;
                updatePersonalDetails({ navbarToggleImageClosed: "" });
              }}
              className="rounded-lg px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition text-sm"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] p-4">
          <h3 className="text-sm font-semibold theme-text-1">Open State Image</h3>
          <Field
            label="Open Image URL"
            value={personalDetails.navbarToggleImageOpen}
            onChange={(value) => updatePersonalDetails({ navbarToggleImageOpen: value })}
          />
          <ImageUploadField
            label="Upload Open Image"
            onFileSelected={async (file) => {
              const uploaded = await uploadAdminFile(file, "images");
              updatePersonalDetails({ navbarToggleImageOpen: uploaded.url });
              onImageSelected("Navbar open image uploaded");
            }}
          />
          <div className="flex items-center justify-between">
            {personalDetails.navbarToggleImageOpen.trim() ? (
              <img
                src={resolveApiUrl(personalDetails.navbarToggleImageOpen)}
                alt="Open icon preview"
                className={previewClass}
              />
            ) : (
              <div className={`${previewClass} flex items-center justify-center text-xs theme-text-3`}>
                Empty
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                const shouldRemove = await confirmAction({
                  title: "Remove Open Icon",
                  message: "Are you sure you want to remove the open state image?",
                  confirmText: "Remove",
                });
                if (!shouldRemove) return;
                updatePersonalDetails({ navbarToggleImageOpen: "" });
              }}
              className="rounded-lg px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 transition text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarSection;
