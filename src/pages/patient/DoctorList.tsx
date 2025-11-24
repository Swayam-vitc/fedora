import { useState, useEffect } from "react";
import PatientSidebar from "@/components/PatientSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Star, Calendar, DollarSign, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialty?: string;
    experience?: number;
    consultationFee?: number;
    rating?: number;
    bio?: string;
    isAvailable?: boolean;
}

const DoctorList = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/users/doctors", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDoctors(data);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-background">
            <PatientSidebar />
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold">Find a Doctor</h1>
                        <p className="text-muted-foreground">
                            Browse our network of qualified healthcare professionals
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Doctors Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading doctors...</p>
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No doctors found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDoctors.map((doctor) => (
                                <Card
                                    key={doctor._id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <CardContent className="p-6">
                                        {/* Doctor Avatar */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-medical-teal flex items-center justify-center text-white text-2xl font-bold">
                                                {doctor.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                                {doctor.specialty && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {doctor.specialty}
                                                    </p>
                                                )}
                                                {doctor.isAvailable && (
                                                    <Badge className="mt-1 bg-green-500">Available</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Doctor Info */}
                                        <div className="space-y-2 mb-4">
                                            {doctor.experience && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{doctor.experience} years experience</span>
                                                </div>
                                            )}
                                            {doctor.rating && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span>{doctor.rating.toFixed(1)} rating</span>
                                                </div>
                                            )}
                                            {doctor.consultationFee && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span>${doctor.consultationFee} per consultation</span>
                                                </div>
                                            )}
                                        </div>

                                        {doctor.bio && (
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {doctor.bio}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-primary to-medical-teal"
                                                onClick={() => navigate("/patient/appointments")}
                                            >
                                                Book Appointment
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                View Profile
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DoctorList;
