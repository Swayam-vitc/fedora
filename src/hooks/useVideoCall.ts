import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

interface UseVideoCallProps {
    receiverId: string;
    roomId: string;
}

export const useVideoCall = ({ receiverId, roomId }: UseVideoCallProps) => {
    const { socket } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [callStatus, setCallStatus] = useState<string>("idle");

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // ICE servers configuration
    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
        ],
    };

    // Initialize local media stream
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            throw error;
        }
    };

    // Create peer connection
    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(iceServers);

        // Add local stream tracks to peer connection
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
        }

        // Handle incoming remote stream
        pc.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("webrtc:ice-candidate", {
                    receiverId,
                    candidate: event.candidate,
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            if (pc.connectionState === "connected") {
                setCallStatus("connected");
            } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
                endCall();
            }
        };

        peerConnection.current = pc;
        return pc;
    };

    // Initiate call
    const initiateCall = async () => {
        try {
            setCallStatus("calling");
            const stream = await startLocalStream();
            const pc = createPeerConnection();

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket?.emit("call:initiate", { receiverId, roomId });
            socket?.emit("webrtc:offer", { receiverId, offer });

            setIsCallActive(true);
        } catch (error) {
            console.error("Error initiating call:", error);
            setCallStatus("error");
        }
    };

    // Accept call
    const acceptCall = async (offer: RTCSessionDescriptionInit) => {
        try {
            setCallStatus("connecting");
            const stream = await startLocalStream();
            const pc = createPeerConnection();

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket?.emit("call:accept", { callerId: receiverId, roomId });
            socket?.emit("webrtc:answer", { receiverId, answer });

            setIsCallActive(true);
            setCallStatus("connected");
        } catch (error) {
            console.error("Error accepting call:", error);
            setCallStatus("error");
        }
    };

    // End call
    const endCall = () => {
        // Stop all tracks
        localStream?.getTracks().forEach((track) => track.stop());
        remoteStream?.getTracks().forEach((track) => track.stop());

        // Close peer connection
        peerConnection.current?.close();
        peerConnection.current = null;

        // Reset states
        setLocalStream(null);
        setRemoteStream(null);
        setIsCallActive(false);
        setCallStatus("idle");

        // Notify other peer
        socket?.emit("call:end", { roomId, receiverId });
    };

    // Toggle camera
    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    // Toggle microphone
    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on("webrtc:offer", async ({ senderId, offer }) => {
            if (senderId === receiverId) {
                await acceptCall(offer);
            }
        });

        socket.on("webrtc:answer", async ({ senderId, answer }) => {
            if (senderId === receiverId && peerConnection.current) {
                await peerConnection.current.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
            }
        });

        socket.on("webrtc:ice-candidate", ({ senderId, candidate }) => {
            if (senderId === receiverId && peerConnection.current) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on("call:ended", () => {
            endCall();
        });

        return () => {
            socket.off("webrtc:offer");
            socket.off("webrtc:answer");
            socket.off("webrtc:ice-candidate");
            socket.off("call:ended");
        };
    }, [socket, receiverId]);

    return {
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
    };
};
