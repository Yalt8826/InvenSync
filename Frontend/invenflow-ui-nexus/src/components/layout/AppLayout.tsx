import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart,
  Calendar,
  Database,
  Settings,
  ShoppingCart,
  User,
  LogOut,
  PersonStanding,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo section */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              InvenFlow
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto h-8 w-8 text-sidebar-foreground",
              collapsed && "mx-auto"
            )}
            onClick={toggleSidebar}
          >
            <ArrowLeft className={cn("h-4 w-4", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1">
          <ul className="space-y-1 px-2">
            {[
              { name: "Dashboard", icon: BarChart, href: "/" },
              { name: "Inventory", icon: Database, href: "/inventory" },
              { name: "Suppliers", icon: ShoppingCart, href: "/suppliers" },
              { name: "Customers", icon: PersonStanding, href: "/customers" },
              { name: "Orders", icon: Calendar, href: "/orders" },
              { name: "Settings", icon: Settings, href: "/settings" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sidebar-foreground rounded-md hover:bg-sidebar-accent group",
                    window.location.pathname === item.href &&
                      "bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5 text-sidebar-foreground" />
                  {!collapsed && (
                    <span className="ml-3 text-sm">{item.name}</span>
                  )}
                  {collapsed && (
                    <span className="fixed left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left bg-sidebar-accent text-sidebar-foreground px-2 py-1 rounded text-xs">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile with Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-sidebar-accent rounded-full h-8 w-8 flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-foreground" />
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    Admin User
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
