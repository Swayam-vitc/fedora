import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Monitor,
} from "lucide-react";
import { useVideoCall } from "@/hooks/useVideoCall";

interface VideoCallProps {
    receiverId: string;
    receiverName: string;
    roomId: string;
    onClose: () => void;
}

const VideoCall = ({ receiverId, receiverName, roomId, onClose }: VideoCallProps) => {
    const {
        localVideoRef,
        remoteVideoRef,
        isCallActive,
        isCameraOn,
        isMicOn,
        callStatus,
        initiateCall,
        endCall,
        toggleCamera,
        toggleMic,
    } = useVideoCall({ receiverId, roomId });

    const handleEndCall = () => {
        endCall();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-medical-teal text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Video Call with {receiverName}</h2>
                        <p className="text-sm opacity-90">
                            {callStatus === "idle" && "Ready to call"}
                            {callStatus === "calling" && "Calling..."}
                            {callStatus === "connecting" && "Connecting..."}
                            {callStatus === "connected" && "Connected"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative">
                {/* Remote Video (Full Screen) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Local Video (Picture-in-Picture) */}
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

                {/* No Remote Stream Placeholder */}
                {!remoteVideoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <div className="text-center text-white">
                            <Video className="h-24 w-24 mx-auto mb-4 opacity-50" />
                            <p className="text-xl">Waiting for {receiverName} to join...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-gray-900">
                <div className="flex items-center justify-center gap-4">
                    {!isCallActive ? (
                        <Button
                            onClick={initiateCall}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white px-8"
                        >
                            <Video className="mr-2 h-5 w-5" />
                            Start Call
                        </Button>
                    ) : (
                        <>
                            {/* Camera Toggle */}
                            <Button
                                onClick={toggleCamera}
                                size="lg"
                                variant={isCameraOn ? "default" : "destructive"}
                                className="rounded-full h-14 w-14"
                            >
                                {isCameraOn ? (
                                    <Video className="h-6 w-6" />
                                ) : (
                                    <VideoOff className="h-6 w-6" />
                                )}
                            </Button>

                            {/* Mic Toggle */}
                            <Button
                                onClick={toggleMic}
                                size="lg"
                                variant={isMicOn ? "default" : "destructive"}
                                className="rounded-full h-14 w-14"
                            >
                                {isMicOn ? (
                                    <Mic className="h-6 w-6" />
                                ) : (
                                    <MicOff className="h-6 w-6" />
                                )}
                            </Button>

                            {/* Screen Share (Placeholder) */}
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full h-14 w-14 bg-gray-800 border-gray-700"
                            >
                                <Monitor className="h-6 w-6" />
                            </Button>

                            {/* End Call */}
                            <Button
                                onClick={handleEndCall}
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 rounded-full h-14 w-14"
                            >
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
