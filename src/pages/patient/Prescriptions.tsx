import PatientSidebar from "@/components/PatientSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Calendar, User } from "lucide-react";

import { useState, useEffect } from "react";

interface Prescription {
  _id: string;
  medication: string;
  doctor: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: string;
}

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : null;
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/prescriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPrescriptions(data);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Prescriptions</h1>
            <p className="text-muted-foreground">View and track your medications</p>
          </div>

          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription._id} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center flex-shrink-0">
                        <Pill className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Prescribed by {prescription.doctor}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-sm"><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                          <p className="text-sm"><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                          <p className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start: {prescription.startDate} - End: {prescription.endDate}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-health-green/10 text-health-green">
                      {prescription.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Medication Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Set up reminders to never miss your medications</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientPrescriptions;
