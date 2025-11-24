import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Activity,
    Heart,
    Thermometer,
    Droplet,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    TrendingDown
} from "lucide-react";

interface VitalSign {
    value: any;
    unit?: string;
    status: "normal" | "warning" | "critical";
    message: string;
}

interface AnalysisData {
    recordId: string;
    date: string;
    vitalSigns: {
        bloodPressure?: VitalSign;
        heartRate?: VitalSign;
        temperature?: VitalSign;
        oxygenSaturation?: VitalSign;
        bloodGlucose?: VitalSign;
        respiratoryRate?: VitalSign;
    };
    overallStatus: "normal" | "warning" | "critical";
    alerts: string[];
    recommendations: string[];
}

interface MedicalAnalysisProps {
    analysis: AnalysisData;
}

const MedicalAnalysis = ({ analysis }: MedicalAnalysisProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "normal":
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "warning":
                return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
            case "critical":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "normal":
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case "critical":
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default:
                return <Activity className="h-5 w-5" />;
        }
    };

    const getOverallStatusBadge = () => {
        const statusConfig = {
            normal: { label: "Healthy", className: "bg-green-500 hover:bg-green-600" },
            warning: { label: "Attention Needed", className: "bg-yellow-500 hover:bg-yellow-600" },
            critical: { label: "Critical", className: "bg-red-500 hover:bg-red-600" },
        };

        const config = statusConfig[analysis.overallStatus];
        return (
            <Badge className={`${config.className} text-white`}>
                {config.label}
            </Badge>
        );
    };

    const renderVitalSign = (
        icon: React.ReactNode,
        label: string,
        vitalSign?: VitalSign
    ) => {
        if (!vitalSign) return null;

        return (
            <div className={`p-4 rounded-lg border ${getStatusColor(vitalSign.status)} transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-medium text-sm">{label}</span>
                    </div>
                    {getStatusIcon(vitalSign.status)}
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-bold">
                        {vitalSign.value} {vitalSign.unit && <span className="text-sm font-normal">{vitalSign.unit}</span>}
                    </p>
                    <p className="text-xs opacity-80">{vitalSign.message}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Overall Status Header */}
            <Card className="border-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary" />
                            Health Analysis
                        </CardTitle>
                        {getOverallStatusBadge()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Analysis Date: {new Date(analysis.date).toLocaleDateString()}
                    </p>
                </CardHeader>
            </Card>

            {/* Critical Alerts */}
            {analysis.alerts.length > 0 && (
                <Alert className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                        <div className="space-y-1">
                            <p className="font-semibold text-red-700 dark:text-red-400">Critical Alerts:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {analysis.alerts.map((alert, index) => (
                                    <li key={index} className="text-sm text-red-600 dark:text-red-300">
                                        {alert}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Vital Signs Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Vital Signs Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderVitalSign(
                            <Activity className="h-5 w-5 text-blue-600" />,
                            "Blood Pressure",
                            analysis.vitalSigns.bloodPressure
                        )}
                        {renderVitalSign(
                            <Heart className="h-5 w-5 text-red-600" />,
                            "Heart Rate",
                            analysis.vitalSigns.heartRate
                        )}
                        {renderVitalSign(
                            <Thermometer className="h-5 w-5 text-orange-600" />,
                            "Temperature",
                            analysis.vitalSigns.temperature
                        )}
                        {renderVitalSign(
                            <Droplet className="h-5 w-5 text-cyan-600" />,
                            "Oxygen Saturation",
                            analysis.vitalSigns.oxygenSaturation
                        )}
                        {renderVitalSign(
                            <Activity className="h-5 w-5 text-purple-600" />,
                            "Blood Glucose",
                            analysis.vitalSigns.bloodGlucose
                        )}
                        {renderVitalSign(
                            <TrendingUp className="h-5 w-5 text-green-600" />,
                            "Respiratory Rate",
                            analysis.vitalSigns.respiratoryRate
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
                <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span className="text-sm text-blue-900 dark:text-blue-100">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MedicalAnalysis;
