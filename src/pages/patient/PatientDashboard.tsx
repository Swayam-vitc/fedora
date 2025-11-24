import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "@/components/PatientSidebar";
import { useAppointments } from "@/context/AppointmentsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Activity, Pill, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const PatientDashboard = () => {
  const { appointments } = useAppointments();
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [medicalRecordsCount, setMedicalRecordsCount] = useState(0);
  const [userName, setUserName] = useState("Patient");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let token = null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "doctor") {
          navigate("/doctor/dashboard");
          return;
        }
        setUserName(user.name || "Patient");
        token = user.token;
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/signin");
        return;
      }
    } else {
      navigate("/signin");
      return;
    }

    const fetchData = async () => {
      if (!token) return;

      try {
        // Fetch Prescriptions Count
        const resPrescriptions = await fetch(`${API_URL}/api/prescriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resPrescriptions.ok) {
          const data = await resPrescriptions.json();
          setPrescriptionsCount(data.length);
        }

        // Fetch Medical Records Count
        const resRecords = await fetch(`${API_URL}/api/medical-records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resRecords.ok) {
          const data = await resRecords.json();
          setMedicalRecordsCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, [navigate, API_URL]);

  const stats = [
    { icon: Calendar, label: "Upcoming Appointments", value: appointments.length.toString(), color: "text-primary" },
    { icon: Activity, label: "Health Score", value: "85%", color: "text-health-green" },
    { icon: Pill, label: "Active Prescriptions", value: prescriptionsCount.toString(), color: "text-medical-teal" },
    { icon: FileText, label: "Medical Records", value: medicalRecordsCount.toString(), color: "text-trust-blue" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar />
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
                <CardTitle>Next Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-semibold">{appointments[0].type}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointments[0].date} at {appointments[0].time}
                    </p>
                    <p className="text-sm text-muted-foreground">Dr. {appointments[0].doctor}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming appointments.</p>
                )}
                <Button className="bg-gradient-to-r from-primary to-medical-teal">
                  Book Appointment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your health journey starts here.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
