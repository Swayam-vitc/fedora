import { useState, useEffect } from "react";
import DoctorSidebar from "@/components/DoctorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Phone, Calendar, Clock, User } from "lucide-react";
import IncomingCallNotification from "@/components/IncomingCallNotification";
import DoctorVideoCall from "@/components/DoctorVideoCall";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";

const Telemedicine = () => {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callHistory, setCallHistory] = useState<any[]>([]);

  useEffect(() => {
    // Listen for incoming calls
    if (socket) {
      socket.on("call:incoming", (data) => {
        console.log("Incoming call:", data);
        setIncomingCall(data.callSession);

        // Play notification sound (optional)
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => { });
      });

      socket.on("call:ended", () => {
        setActiveCall(null);
        toast({
          title: "Call Ended",
          description: "The consultation has ended",
        });
      });
    }

    // Fetch call history
    fetchCallHistory();

    return () => {
      if (socket) {
        socket.off("call:incoming");
        socket.off("call:ended");
      }
    };
  }, [socket]);

  const fetchCallHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/calls/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCallHistory(data);
      }
    } catch (error) {
      console.error("Error fetching call history:", error);
    }
  };

  const handleAcceptCall = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/calls/${incomingCall._id}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActiveCall(data);
        setIncomingCall(null);

        // Notify patient via socket
        socket?.emit("call:accepted", {
          callId: data._id,
          roomId: data.roomId,
        });
      }
    } catch (error) {
      console.error("Error accepting call:", error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive",
      });
    }
  };

  const handleDeclineCall = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/calls/${incomingCall._id}/decline`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: "Doctor is currently busy",
        }),
      });

      // Notify patient via socket
      socket?.emit("call:declined", {
        callId: incomingCall._id,
        reason: "Doctor is currently busy",
      });

      setIncomingCall(null);
      toast({
        title: "Call Declined",
        description: "The call has been declined",
      });
    } catch (error) {
      console.error("Error declining call:", error);
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    fetchCallHistory();
  };

  const toggleOnlineStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !isOnline;

      await fetch("http://localhost:5000/api/users/doctor/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      setIsOnline(newStatus);
      toast({
        title: newStatus ? "You're Online" : "You're Offline",
        description: newStatus
          ? "Patients can now call you"
          : "Patients cannot call you",
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // If there's an active call, show the video call interface
  if (activeCall) {
    return <DoctorVideoCall callSession={activeCall} onEndCall={handleEndCall} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with Online Status */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Telemedicine</h1>
              <p className="text-muted-foreground">Virtual consultations and video calls</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {isOnline ? "Available for calls" : "Offline"}
              </span>
              <Button
                onClick={toggleOnlineStatus}
                variant={isOnline ? "default" : "outline"}
                className={isOnline ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isOnline ? "🟢 Online" : "⚫ Offline"}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Ready for Calls</h3>
                <Badge variant={isOnline ? "default" : "secondary"}>
                  {isOnline ? "Available" : "Offline"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-health-green/10 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-health-green" />
                </div>
                <h3 className="font-semibold text-lg">Total Calls Today</h3>
                <p className="text-3xl font-bold">{callHistory.filter(c => {
                  const today = new Date().toDateString();
                  return new Date(c.createdAt).toDateString() === today;
                }).length}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-trust-blue/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-trust-blue" />
                </div>
                <h3 className="font-semibold text-lg">Call History</h3>
                <p className="text-3xl font-bold">{callHistory.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Call History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              {callHistory.length > 0 ? (
                <div className="space-y-3">
                  {callHistory.slice(0, 10).map((call) => (
                    <div
                      key={call._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{call.patientId?.name || "Patient"}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(call.createdAt).toLocaleString()}
                            {call.duration && ` • ${Math.floor(call.duration / 60)}m ${call.duration % 60}s`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          call.status === "ended"
                            ? "default"
                            : call.status === "declined"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {call.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No call history yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Incoming Call Notification */}
      {incomingCall && (
        <IncomingCallNotification
          callSession={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </div>
  );
};

export default Telemedicine;
