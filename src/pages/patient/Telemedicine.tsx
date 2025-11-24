import { useState, useEffect } from "react";
import PatientSidebar from "@/components/PatientSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, Calendar, User, MessageSquare } from "lucide-react";
import VideoCall from "@/components/VideoCall";
import ChatBox from "@/components/ChatBox";
import { useNavigate } from "react-router-dom";

const PatientTelemedicine = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showVideoCall, setShowVideoCall] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`http://localhost:5000/api/appointments?patientId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleStartCall = (appointment: any) => {
    setSelectedDoctor({
      id: appointment.patientId || "doctor-id",
      name: appointment.doctor,
    });
    setShowVideoCall(appointment._id || appointment.id);
  };

  const handleOpenChat = (appointment: any) => {
    setSelectedDoctor({
      id: appointment.patientId || "doctor-id",
      name: appointment.doctor,
    });
    setShowChat(appointment._id || appointment.id);
  };

  // Filter upcoming appointments (today and future)
  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Telemedicine</h1>
            <p className="text-muted-foreground">Connect with healthcare providers remotely</p>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-medical-teal/10 border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center">
                <Video className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Start Instant Consultation</h3>
                <p className="text-muted-foreground mt-2">Connect with available doctors right now</p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-medical-teal"
                onClick={() => navigate("/patient/doctors")}
              >
                <User className="mr-2 h-5 w-5" />
                Find a Doctor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Appointments - Video Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id || appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center">
                          <User className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{appointment.doctor}</h4>
                          <p className="text-sm text-muted-foreground">{appointment.type || "Consultation"}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {appointment.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-gradient-to-r from-primary to-medical-teal"
                          onClick={() => handleStartCall(appointment)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Call
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenChat(appointment)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <Button onClick={() => navigate("/patient/appointments")}>
                    Schedule an Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Past Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  {appointments.length > upcomingAppointments.length
                    ? `${appointments.length - upcomingAppointments.length} past consultations`
                    : "No past consultations"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</div>
                    <p>Book or start an instant consultation</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</div>
                    <p>Connect via secure video call</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</div>
                    <p>Chat with your doctor anytime</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">4</div>
                    <p>Receive diagnosis and e-prescription</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Video Call Modal */}
      {showVideoCall && selectedDoctor && (
        <VideoCall
          receiverId={selectedDoctor.id}
          receiverName={selectedDoctor.name}
          roomId={showVideoCall}
          onClose={() => {
            setShowVideoCall(null);
            setSelectedDoctor(null);
          }}
        />
      )}

      {/* Chat Modal */}
      {showChat && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <ChatBox
              appointmentId={showChat}
              receiverId={selectedDoctor.id}
              receiverName={selectedDoctor.name}
              onClose={() => {
                setShowChat(null);
                setSelectedDoctor(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTelemedicine;
