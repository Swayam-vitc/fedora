import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Phone, PhoneOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallStatusProps {
    status: "connecting" | "ringing" | "declined" | "timeout" | "ended";
    doctorName?: string;
    declineReason?: string;
    onRetry?: () => void;
    onCancel?: () => void;
}

const CallStatus = ({
    status,
    doctorName,
    declineReason,
    onRetry,
    onCancel,
}: CallStatusProps) => {
    const renderContent = () => {
        switch (status) {
            case "connecting":
                return (
                    <>
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <h3 className="text-2xl font-bold mt-4">Connecting...</h3>
                        <p className="text-muted-foreground">Setting up your call</p>
                    </>
                );

            case "ringing":
                return (
                    <>
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping">
                                <div className="h-20 w-20 rounded-full bg-primary/20" />
                            </div>
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center relative z-10">
                                <Phone className="h-10 w-10 text-white animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mt-4">Calling {doctorName}...</h3>
                        <p className="text-muted-foreground">Waiting for doctor to answer</p>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                variant="outline"
                                className="mt-4"
                            >
                                <PhoneOff className="mr-2 h-4 w-4" />
                                Cancel Call
                            </Button>
                        )}
                    </>
                );

            case "declined":
                return (
                    <>
                        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <PhoneOff className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold mt-4 text-red-600">Call Declined</h3>
                        <p className="text-muted-foreground">
                            {declineReason || `Dr. ${doctorName} is currently unavailable`}
                        </p>
                        {onRetry && (
                            <Button onClick={onRetry} className="mt-4">
                                Try Again
                            </Button>
                        )}
                    </>
                );

            case "timeout":
                return (
                    <>
                        <div className="h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-yellow-600" />
                        </div>
                        <h3 className="text-2xl font-bold mt-4 text-yellow-600">No Answer</h3>
                        <p className="text-muted-foreground">
                            Dr. {doctorName} didn't answer the call
                        </p>
                        {onRetry && (
                            <Button onClick={onRetry} className="mt-4">
                                Try Again
                            </Button>
                        )}
                    </>
                );

            case "ended":
                return (
                    <>
                        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <PhoneOff className="h-10 w-10 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold mt-4">Call Ended</h3>
                        <p className="text-muted-foreground">The consultation has ended</p>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center flex flex-col items-center">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default CallStatus;
