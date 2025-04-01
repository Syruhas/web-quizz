import { Home, FileText, ChartColumn, Settings, Users, BookOpen } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: ("teacher" | "student")[];
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["teacher", "student"],
  },
  {
    title: "My Quizzes",
    url: "/quizzes",
    icon: FileText,
    roles: ["student"],
  },
  {
    title: "Manage Quizzes",
    url: "/quizzes/manage",
    icon: FileText,
    roles: ["teacher"],
  },
  {
    title: "Groups",
    url: "/groups",
    icon: Users,
    roles: ["teacher"],
  },
  {
    title: "My Grades",
    url: "/grades",
    icon: ChartColumn,
    roles: ["student"],
  },
  {
    title: "Grade Overview",
    url: "/grades/overview",
    icon: ChartColumn,
    roles: ["teacher"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["teacher", "student"],
  },
];
