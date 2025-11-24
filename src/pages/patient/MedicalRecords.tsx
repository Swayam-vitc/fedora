import PatientSidebar from "@/components/PatientSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Shield } from "lucide-react";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface MedicalRecord {
  _id: string;
  type: string; // mapped from diagnosis or treatment for display if needed, or just use diagnosis
  doctor: string;
  diagnosis: string;
  treatment: string;
  date: string;
  category: string; // derived or added to model? Model has diagnosis, treatment. I'll map diagnosis to type/category for now.
}

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchRecords = async () => {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : null;
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/medical-records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Map backend data to frontend structure if needed
          const mappedData = data.map((item: any) => ({
            ...item,
            type: item.diagnosis, // Using diagnosis as type for display
            category: "General", // Default category
          }));
          setRecords(mappedData);
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Medical Records</h1>
            <p className="text-muted-foreground">Access your complete medical history</p>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-medical-teal/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Blockchain Secured</h4>
                  <p className="text-sm text-muted-foreground">
                    Your medical records are encrypted and stored on blockchain technology,
                    ensuring maximum security and privacy. Only you and authorized healthcare
                    providers can access this information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{record.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground">
                          {record.treatment} • {record.doctor} • {record.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-3xl font-bold text-primary">{records.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-3xl font-bold text-medical-teal">0</p>
                <p className="text-sm text-muted-foreground">Lab Reports</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-3xl font-bold text-health-green">0</p>
                <p className="text-sm text-muted-foreground">Consultations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientMedicalRecords;
