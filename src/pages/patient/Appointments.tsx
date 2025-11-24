import { useState, useEffect } from "react";
import PatientSidebar from "@/components/PatientSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, Activity, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useAppointments } from "@/context/AppointmentsContext";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MedicalRecordForm from "@/components/MedicalRecordForm";
import MedicalAnalysis from "@/components/MedicalAnalysis";
import { useToast } from "@/hooks/use-toast";

const Appointments = () => {
  const { appointments, addAppointment } = useAppointments();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [showMedicalForm, setShowMedicalForm] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<any>({});
  const [analyses, setAnalyses] = useState<any>({});

  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  // Get user ID from localStorage
  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user._id || user.id;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    return null;
  };

  const userId = getUserId();

  const handleSubmit = () => {
    if (!doctor || !date || !time) return;

    addAppointment({
      id: uuidv4(),
      doctor,
      date,
      time,
      location,
      type,
    });

    setOpen(false);
    setDoctor("");
    setDate("");
    setTime("");
    setLocation("");
    setType("");

    toast({
      title: "Appointment Created",
      description: "Your appointment has been scheduled successfully.",
    });
  };

  const handleMedicalRecordSubmit = async (appointmentId: string, data: any) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.message || "Failed to create medical record");
      }

      const record = await response.json();

      // Store the record
      setMedicalRecords((prev: any) => ({
        ...prev,
        [appointmentId]: [...(prev[appointmentId] || []), record],
      }));

      // Get analysis
      const analysisResponse = await fetch(
        `http://localhost:5000/api/medical-records/${record._id}/analyze`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        setAnalyses((prev: any) => ({
          ...prev,
          [record._id]: analysis,
        }));
      }

      setShowMedicalForm(null);

      toast({
        title: "Medical Record Saved",
        description: "Your medical records have been saved and analyzed.",
      });
    } catch (error: any) {
      console.error("Error saving medical record:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save medical record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (appointmentId: string) => {
    setExpandedAppointment(expandedAppointment === appointmentId ? null : appointmentId);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Appointments</h1>
              <p className="text-muted-foreground">Manage your appointments and medical records</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-medical-teal">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Doctor Name</Label>
                    <Input
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="Online / Hospital"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <Input
                      placeholder="Consultation / Follow-up"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleSubmit}>
                    Schedule Appointment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {appointments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No appointments yet. Schedule your first appointment to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              appointments.map((apt) => {
                const appointmentId = apt._id || apt.id || "unknown-id";
                return (
                  <Card key={appointmentId} className="border-border/50 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      {/* Appointment Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{apt.doctor}</h3>
                            <p className="text-sm text-muted-foreground">{apt.date}</p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> {apt.time}
                              </span>
                              <span>{apt.type}</span>
                              <span>{apt.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-2" /> Join Call
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpand(appointmentId)}
                          >
                            {expandedAppointment === appointmentId ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Section - Medical Records */}
                      {expandedAppointment === appointmentId && (
                        <div className="mt-6 pt-6 border-t space-y-6 animate-in slide-in-from-top duration-300">

                          {/* Add Medical Record Button */}
                          {showMedicalForm !== appointmentId && (
                            <Button
                              onClick={() => {
                                if (!userId) {
                                  toast({
                                    title: "Authentication Error",
                                    description: "Please sign in again to add medical records.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                console.log("Opening form with User ID:", userId);
                                setShowMedicalForm(appointmentId);
                              }}
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Medical Records
                            </Button>
                          )}

                          {/* Medical Record Form */}
                          {showMedicalForm === appointmentId && (
                            <div className="animate-in fade-in duration-300">
                              <MedicalRecordForm
                                appointmentId={appointmentId}
                                patientId={userId || "temp-user-id"}
                                doctor={apt.doctor}
                                onSubmit={(data) => handleMedicalRecordSubmit(appointmentId, data)}
                                onCancel={() => setShowMedicalForm(null)}
                              />
                            </div>
                          )}

                          {/* Display Medical Records and Analysis */}
                          {medicalRecords[appointmentId] && medicalRecords[appointmentId].length > 0 && (
                            <div className="space-y-6">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Medical Records & Analysis
                              </h4>
                              {medicalRecords[appointmentId].map((record: any) => (
                                <div key={record._id} className="space-y-4">
                                  {analyses[record._id] && (
                                    <MedicalAnalysis analysis={analyses[record._id]} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Appointments;