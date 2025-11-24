import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "@/components/DoctorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, AlertCircle, Clock } from "lucide-react";
import { useAppointments } from "@/context/AppointmentsContext";

const DoctorDashboard = () => {
  const { appointments } = useAppointments();
  const [userName, setUserName] = useState("Doctor");
  const navigate = useNavigate();

  useEffect(() => {
    // Load user name from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "patient") {
          navigate("/patient/dashboard");
          return;
        }
        setUserName(user.name || "Doctor");
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/signin");
      }
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  const stats = [
    {
      icon: Calendar,
      label: "Today's Appointments",
      value: appointments.length.toString(),
      color: "text-primary",
    },
    { icon: Users, label: "Total Patients", value: "0", color: "text-medical-teal" },
    { icon: Activity, label: "Active Monitors", value: "8", color: "text-health-green" },
    { icon: AlertCircle, label: "Pending Reports", value: "5", color: "text-destructive" },
  ];

  const latestThree = [...appointments].slice(-3).reverse();

  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-12 w-12 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {latestThree.length === 0 ? (
                  <p className="text-muted-foreground">No appointments scheduled yet.</p>
                ) : (
                  latestThree.map((apt, index) => (
                    <div
                      key={apt._id || index}
                      className="p-3 border-b flex items-center justify-between"
                    >
                      <div className="font-medium">{apt.doctor}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {apt.time}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">All systems normal.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;