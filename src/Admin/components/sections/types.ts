import type { PersonalDetails } from "../../types";

export type UpdatePersonalDetails = (updates: Partial<PersonalDetails>) => void;
export type ConfirmAction = (options: {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}) => Promise<boolean>;

export interface BaseSectionProps {
  personalDetails: PersonalDetails;
  updatePersonalDetails: UpdatePersonalDetails;
  confirmAction: ConfirmAction;
}

export interface ImageSectionProps extends BaseSectionProps {
  onImageSelected: (message: string) => void;
}
