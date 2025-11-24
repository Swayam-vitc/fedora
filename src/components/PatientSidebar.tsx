import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Pill,
  FileText,
  Activity,
  Bell,
  Video,
  MessageSquare,
  Settings,
  Heart,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PatientSidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/patient/dashboard" },
    { icon: Calendar, label: "Appointments", path: "/patient/appointments" },
    { icon: MapPin, label: "Emergency Locator", path: "/patient/emergency" },
    { icon: Pill, label: "My Prescriptions", path: "/patient/prescriptions" },
    { icon: FileText, label: "Medical Records", path: "/patient/records" },
    { icon: Activity, label: "Health Monitoring", path: "/patient/monitoring" },
    { icon: Bell, label: "Reminders", path: "/patient/reminders" },
    { icon: Video, label: "Telemedicine", path: "/patient/telemedicine" },
    { icon: MessageSquare, label: "Chatbot", path: "/patient/chatbot" },
    { icon: Settings, label: "Settings", path: "/patient/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg">Medora Healthcare</h1>
            <p className="text-xs text-muted-foreground">Patient Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default PatientSidebar;
