import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Heart, Thermometer, Droplet, Weight, Ruler } from "lucide-react";

interface MedicalRecordFormProps {
    appointmentId?: string;
    patientId: string;
    doctor: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const MedicalRecordForm = ({ appointmentId, patientId, doctor, onSubmit, onCancel }: MedicalRecordFormProps) => {
    // Update state when props change
    useEffect(() => {
        setFormData(prev => ({ ...prev, patientId }));
    }, [patientId]);

    const [formData, setFormData] = useState({
        appointmentId: appointmentId || "",
        patientId,
        doctor,
        date: new Date().toISOString().split('T')[0],

        // Vital Signs
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        bloodGlucose: "",
        weight: "",
        height: "",
        respiratoryRate: "",

        // Symptoms and Medications
        symptoms: "",
        medications: "",

        // Medical Information
        diagnosis: "",
        treatment: "",
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert string values to numbers for vital signs
        const processedData = {
            ...formData,
            bloodPressureSystolic: formData.bloodPressureSystolic ? Number(formData.bloodPressureSystolic) : undefined,
            bloodPressureDiastolic: formData.bloodPressureDiastolic ? Number(formData.bloodPressureDiastolic) : undefined,
            heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
            temperature: formData.temperature ? Number(formData.temperature) : undefined,
            oxygenSaturation: formData.oxygenSaturation ? Number(formData.oxygenSaturation) : undefined,
            bloodGlucose: formData.bloodGlucose ? Number(formData.bloodGlucose) : undefined,
            weight: formData.weight ? Number(formData.weight) : undefined,
            height: formData.height ? Number(formData.height) : undefined,
            respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : undefined,
            symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
            medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : [],
        };

        onSubmit(processedData);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Add Medical Records
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Vital Signs Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Vital Signs
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Blood Pressure */}
                            <div className="space-y-2">
                                <Label htmlFor="bloodPressure" className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Blood Pressure (mmHg)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="bloodPressureSystolic"
                                        name="bloodPressureSystolic"
                                        type="number"
                                        placeholder="Systolic (120)"
                                        value={formData.bloodPressureSystolic}
                                        onChange={handleChange}
                                    />
                                    <span className="flex items-center">/</span>
                                    <Input
                                        id="bloodPressureDiastolic"
                                        name="bloodPressureDiastolic"
                                        type="number"
                                        placeholder="Diastolic (80)"
                                        value={formData.bloodPressureDiastolic}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Heart Rate */}
                            <div className="space-y-2">
                                <Label htmlFor="heartRate" className="flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    Heart Rate (bpm)
                                </Label>
                                <Input
                                    id="heartRate"
                                    name="heartRate"
                                    type="number"
                                    placeholder="72"
                                    value={formData.heartRate}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Temperature */}
                            <div className="space-y-2">
                                <Label htmlFor="temperature" className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4" />
                                    Temperature (°F)
                                </Label>
                                <Input
                                    id="temperature"
                                    name="temperature"
                                    type="number"
                                    step="0.1"
                                    placeholder="98.6"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Oxygen Saturation */}
                            <div className="space-y-2">
                                <Label htmlFor="oxygenSaturation" className="flex items-center gap-2">
                                    <Droplet className="h-4 w-4" />
                                    Oxygen Saturation (%)
                                </Label>
                                <Input
                                    id="oxygenSaturation"
                                    name="oxygenSaturation"
                                    type="number"
                                    placeholder="98"
                                    value={formData.oxygenSaturation}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Blood Glucose */}
                            <div className="space-y-2">
                                <Label htmlFor="bloodGlucose">
                                    Blood Glucose (mg/dL)
                                </Label>
                                <Input
                                    id="bloodGlucose"
                                    name="bloodGlucose"
                                    type="number"
                                    placeholder="100"
                                    value={formData.bloodGlucose}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="flex items-center gap-2">
                                    <Weight className="h-4 w-4" />
                                    Weight (kg)
                                </Label>
                                <Input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    placeholder="70"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <Label htmlFor="height" className="flex items-center gap-2">
                                    <Ruler className="h-4 w-4" />
                                    Height (cm)
                                </Label>
                                <Input
                                    id="height"
                                    name="height"
                                    type="number"
                                    placeholder="170"
                                    value={formData.height}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Respiratory Rate */}
                            <div className="space-y-2">
                                <Label htmlFor="respiratoryRate">
                                    Respiratory Rate (breaths/min)
                                </Label>
                                <Input
                                    id="respiratoryRate"
                                    name="respiratoryRate"
                                    type="number"
                                    placeholder="16"
                                    value={formData.respiratoryRate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Symptoms and Medications */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">
                                Symptoms (comma-separated)
                            </Label>
                            <Textarea
                                id="symptoms"
                                name="symptoms"
                                placeholder="e.g., headache, fever, fatigue"
                                value={formData.symptoms}
                                onChange={handleChange}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="medications">
                                Current Medications (comma-separated)
                            </Label>
                            <Textarea
                                id="medications"
                                name="medications"
                                placeholder="e.g., aspirin, vitamin D"
                                value={formData.medications}
                                onChange={handleChange}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="diagnosis">
                                Diagnosis
                            </Label>
                            <Input
                                id="diagnosis"
                                name="diagnosis"
                                placeholder="Enter diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="treatment">
                                Treatment Plan
                            </Label>
                            <Textarea
                                id="treatment"
                                name="treatment"
                                placeholder="Enter treatment plan"
                                value={formData.treatment}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                Additional Notes
                            </Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Any additional notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-primary to-medical-teal">
                            Save Medical Record
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default MedicalRecordForm;
