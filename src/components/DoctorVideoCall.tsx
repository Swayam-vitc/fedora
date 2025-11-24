import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, PhoneOff, Mic, MicOff, VideoOff, User, Clock } from "lucide-react";
import { useVideoCall } from "@/hooks/useVideoCall";
import ChatBox from "@/components/ChatBox";

interface DoctorVideoCallProps {
    callSession: any;
    onEndCall: () => void;
}

const DoctorVideoCall = ({ callSession, onEndCall }: DoctorVideoCallProps) => {
    const patient = callSession?.patientId;
    const [showChat, setShowChat] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const {
        localVideoRef,
        remoteVideoRef,
        isCameraOn,
        isMicOn,
        toggleCamera,
        toggleMic,
    } = useVideoCall({
        receiverId: patient?._id || "",
        roomId: callSession?.roomId || "",
    });

    // Call duration timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleEndCall = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:5000/api/calls/${callSession._id}/end`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            onEndCall();
        } catch (error) {
            console.error("Error ending call:", error);
            onEndCall();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex">
            {/* Main Video Area */}
            <div className="flex-1 relative">
                {/* Patient Video (Full Screen) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* No Video Placeholder */}
                {!remoteVideoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <div className="text-center text-white">
                            <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center mb-4">
                                <User className="h-16 w-16" />
                            </div>
                            <p className="text-2xl font-semibold">{patient?.name}</p>
                            <p className="text-muted-foreground mt-2">Connecting...</p>
                        </div>
                    </div>
                )}

                {/* Doctor Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-64 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-white">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <VideoOff className="h-12 w-12 text-white" />
                        </div>
                    )}
                </div>

                {/* Patient Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                    <p className="font-semibold">{patient?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(callDuration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-6 py-4 flex items-center gap-4">
                        {/* Mic Toggle */}
                        <Button
                            onClick={toggleMic}
                            size="lg"
                            variant={isMicOn ? "default" : "destructive"}
                            className="rounded-full h-14 w-14"
                        >
                            {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                        </Button>

                        {/* Camera Toggle */}
                        <Button
                            onClick={toggleCamera}
                            size="lg"
                            variant={isCameraOn ? "default" : "destructive"}
                            className="rounded-full h-14 w-14"
                        >
                            {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                        </Button>

                        {/* End Call */}
                        <Button
                            onClick={handleEndCall}
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 rounded-full h-14 px-8"
                        >
                            <PhoneOff className="mr-2 h-6 w-6" />
                            End Call
                        </Button>

                        {/* Toggle Chat */}
                        <Button
                            onClick={() => setShowChat(!showChat)}
                            size="lg"
                            variant="outline"
                            className="rounded-full h-14 w-14 bg-gray-800 border-gray-700"
                        >
                            💬
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chat Panel (Sidebar) */}
            {showChat && (
                <div className="w-96 bg-background border-l border-border">
                    <ChatBox
                        appointmentId={callSession?.appointmentId || callSession?._id}
                        receiverId={patient?._id || ""}
                        receiverName={patient?.name || "Patient"}
                    />
                </div>
            )}
        </div>
    );
};

export default DoctorVideoCall;
