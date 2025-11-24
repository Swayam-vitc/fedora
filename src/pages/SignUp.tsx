import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Heart, UserRound, Stethoscope, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "patient" | "doctor" | null;

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "",
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------------------
  // Submit → Send to Backend
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast({
        title: "Select a Role",
        description: "Please choose doctor or patient",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone,
          role: selectedRole,
          specialization: selectedRole === "doctor" ? formData.specialization : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Signup Failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Save token + user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast({
        title: "Success!",
        description: "Account created successfully",
      });

      // Redirect based on role
      if (selectedRole === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => selectedRole ? setSelectedRole(null) : navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Medora</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            {!selectedRole
              ? "Choose your role to get started"
              : `Sign up as a ${selectedRole}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!selectedRole ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handleRoleSelect("patient")}
              >
                <UserRound className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold">I'm a Patient</span>
                <span className="text-sm text-muted-foreground">Book appointments & manage health</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handleRoleSelect("doctor")}
              >
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold">I'm a Doctor</span>
                <span className="text-sm text-muted-foreground">Manage patients & consultations</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Specialization for doctors */}
              {selectedRole === "doctor" && (
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    placeholder="Cardiologist, General Physician, etc."
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-medical-teal"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;