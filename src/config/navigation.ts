import {
    Home,
    FileText,
    ChartColumn,
    Settings,
    Users,
    Plus,
} from "lucide-react";

interface BaseNavItem {
    title: string;
    icon: any; // You might want to use a more specific type for icons
    roles: ("teacher" | "student")[];
}

interface NavItemWithUrl extends BaseNavItem {
    url: string;
    children?: never;
}

interface NavItemWithChildren extends BaseNavItem {
    url?: never;
    children: NavItemWithUrl[];
}

export type NavItem = NavItemWithUrl | NavItemWithChildren;

export const navigationItems: NavItem[] = [
{
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["teacher", "student"],
},
{
    title: "Quizzes",
    url: "/quiz/manage",
    icon: FileText,
    roles: ["teacher"],
},
{
    title: "My Quizzes",
    url: "/quiz",
    icon: FileText,
    roles: ["student"],
},
{
    title: "Groups",
    url: "/groups",
    icon: Users,
    roles: ["teacher","student"],
},
{
    title: "My Grades",
    url: "/grades",
    icon: ChartColumn,
    roles: ["student"],
},
{
    title: "Grade Overview",
    url: "/grades",
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
