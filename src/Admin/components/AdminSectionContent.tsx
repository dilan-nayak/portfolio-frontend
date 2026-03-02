import type React from "react";
import type { PersonalDetails } from "../types";
import type { TabKey } from "./adminTabs";
import type { ConfirmAction } from "./sections/types";
import AboutSection from "./sections/AboutSection";
import ExperienceSection from "./sections/ExperienceSection";
import LearningSection from "./sections/LearningSection";
import NavbarSection from "./sections/NavbarSection";
import PersonalSection from "./sections/PersonalSection";
import ProjectsSection from "./sections/ProjectsSection";
import SectionsVisibilitySection from "./sections/SectionsVisibilitySection";
import SkillsSection from "./sections/SkillsSection";
import SocialSection from "./sections/SocialSection";
import ThemeSection from "./sections/ThemeSection";

interface AdminSectionContentProps {
  activeTab: TabKey;
  personalDetails: PersonalDetails;
  updatePersonalDetails: (updates: Partial<PersonalDetails>) => void;
  confirmAction: ConfirmAction;
  onImageSelected: (message: string) => void;
}

const AdminSectionContent: React.FC<AdminSectionContentProps> = ({
  activeTab,
  personalDetails,
  updatePersonalDetails,
  confirmAction,
  onImageSelected,
}) => {
  if (activeTab === "personal") {
    return (
      <PersonalSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
        onImageSelected={onImageSelected}
      />
    );
  }

  if (activeTab === "sections") {
    return (
      <SectionsVisibilitySection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
      />
    );
  }

  if (activeTab === "theme") {
    return (
      <ThemeSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
      />
    );
  }

  if (activeTab === "navbar") {
    return (
      <NavbarSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
        onImageSelected={onImageSelected}
      />
    );
  }

  if (activeTab === "about") {
    return (
      <AboutSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
        onImageSelected={onImageSelected}
      />
    );
  }

  if (activeTab === "skills") {
    return (
      <SkillsSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
      />
    );
  }

  if (activeTab === "experience") {
    return (
      <ExperienceSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
      />
    );
  }

  if (activeTab === "learning") {
    return (
      <LearningSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
      />
    );
  }

  if (activeTab === "projects") {
    return (
      <ProjectsSection
        personalDetails={personalDetails}
        updatePersonalDetails={updatePersonalDetails}
        confirmAction={confirmAction}
        onImageSelected={onImageSelected}
      />
    );
  }

  return (
    <SocialSection
      personalDetails={personalDetails}
      updatePersonalDetails={updatePersonalDetails}
      confirmAction={confirmAction}
    />
  );
};

export default AdminSectionContent;
