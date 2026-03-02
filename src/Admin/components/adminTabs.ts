import type React from "react";
import {
  BookOpen,
  Briefcase,
  Eye,
  FolderKanban,
  Hammer,
  Link as LinkIcon,
  Palette,
  PanelLeft,
  Sparkles,
  User,
} from "lucide-react";

export type TabKey =
  | "personal"
  | "theme"
  | "sections"
  | "navbar"
  | "about"
  | "skills"
  | "learning"
  | "experience"
  | "projects"
  | "social";

export const tabItems: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "personal", label: "Personal", icon: User },
  { key: "theme", label: "Theme", icon: Palette },
  { key: "sections", label: "Sections", icon: Eye },
  { key: "navbar", label: "Navbar", icon: PanelLeft },
  { key: "about", label: "About", icon: Sparkles },
  { key: "skills", label: "Skills", icon: Hammer },
  { key: "learning", label: "Learning", icon: BookOpen },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "social", label: "Social & Contact", icon: LinkIcon },
];
