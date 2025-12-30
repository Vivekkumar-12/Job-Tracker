import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Search,
  File,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Plus,
  LogOut,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Applications", path: "/applications" },
  { icon: Search, label: "Job Search", path: "/search" },
  { icon: File, label: "Resumes", path: "/resumes" },
  { icon: FileEdit, label: "Resume Builder", path: "/resume-builder" },
  { icon: Bell, label: "Reminders", path: "/reminders" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center justify-center gap-3 p-6 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
        <span className="text-xl font-semibold gradient-text">
          {collapsed ? "JT" : "JobTracker"}
        </span>
      </Link>

      {/* Add New Button */}
      <div className="p-4">
        <Link to="/applications">
          <Button
            variant="gradient"
            className={cn("w-full", collapsed ? "px-0" : "")}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>Add Application</span>}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent group",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )}
              />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-sidebar" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">
                john@example.com
              </p>
            </div>
          )}
          {!collapsed && (
            <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
