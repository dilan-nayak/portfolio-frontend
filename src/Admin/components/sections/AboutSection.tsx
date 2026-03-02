import type React from "react";
import { Trash2 } from "lucide-react";
import { resolveApiUrl, uploadAdminFile } from "../../adminService";
import { TextAreaField } from "../FormFields";
import type { ImageSectionProps } from "./types";

const AboutSection: React.FC<ImageSectionProps> = ({
  personalDetails,
  updatePersonalDetails,
  confirmAction,
  onImageSelected,
}) => {
  const aboutImages = personalDetails.aboutImages ?? [];

  const removeImageAt = async (index: number) => {
    const shouldRemove = await confirmAction({
      title: "Remove About Image",
      message: "Are you sure you want to remove this about image?",
      confirmText: "Remove",
    });
    if (!shouldRemove) return;
    const next = aboutImages.filter((_, idx) => idx !== index);
    updatePersonalDetails({
      aboutImages: next,
      aboutImage: next[0] ?? "",
    });
  };

  return (
    <div className="space-y-4">
      <TextAreaField
        label="About Description"
        value={personalDetails.about}
        rows={8}
        onChange={(value) => updatePersonalDetails({ about: value })}
      />

      <div>
        <label className="block text-xs theme-text-2 mb-1">Upload About Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;

            const uploadedUrls: string[] = [];
            for (const file of files) {
              const uploaded = await uploadAdminFile(file, "images");
              uploadedUrls.push(uploaded.url);
            }

            const next = [...aboutImages, ...uploadedUrls];
            updatePersonalDetails({
              aboutImages: next,
              aboutImage: next[0] ?? "",
            });
            onImageSelected(`${uploadedUrls.length} image(s) added`);
            e.currentTarget.value = "";
          }}
          className="w-full rounded-lg bg-[var(--surface-2)] theme-text-1 border border-[var(--border-1)] px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs theme-text-3">
          Images rotate automatically on About page every 3 seconds.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {aboutImages.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] p-2"
          >
            <img
              src={resolveApiUrl(url)}
              alt={`About ${index + 1}`}
              className="w-full h-28 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => void removeImageAt(index)}
              className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-red-100 hover:bg-red-200 border border-red-300 text-red-700"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        ))}

        {aboutImages.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--border-1)] bg-[var(--surface-2)] p-4 text-sm theme-text-3">
            No about images yet. Upload one or more images.
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSection;
