import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, User, Clock } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface IncomingCallNotificationProps {
    callSession: any;
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingCallNotification = ({
    callSession,
    onAccept,
    onDecline,
}: IncomingCallNotificationProps) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        // Auto-decline after 30 seconds
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onDecline();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onDecline]);

    const patient = callSession?.patientId;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
            <Card className="w-full max-w-md border-primary/50 shadow-2xl">
                <CardContent className="p-8 text-center space-y-6">
                    {/* Ringing Animation */}
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping">
                            <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20" />
                        </div>
                        <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center relative z-10">
                            {patient?.profileImage ? (
                                <img
                                    src={patient.profileImage}
                                    alt={patient.name}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-12 w-12 text-white" />
                            )}
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Incoming Video Call</h2>
                        <p className="text-xl text-muted-foreground">{patient?.name || "Patient"}</p>
                        {patient?.phone && (
                            <p className="text-sm text-muted-foreground mt-1">{patient.phone}</p>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Auto-decline in {timeLeft}s</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={onDecline}
                            variant="destructive"
                            size="lg"
                            className="flex-1 rounded-full h-14"
                        >
                            <PhoneOff className="mr-2 h-5 w-5" />
                            Decline
                        </Button>
                        <Button
                            onClick={onAccept}
                            size="lg"
                            className="flex-1 bg-green-600 hover:bg-green-700 rounded-full h-14"
                        >
                            <Phone className="mr-2 h-5 w-5" />
                            Accept
                        </Button>
                    </div>

                    {/* Call Type */}
                    <p className="text-xs text-muted-foreground">
                        Video consultation • Secure connection
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default IncomingCallNotification;
