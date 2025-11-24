import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorMedicalRecords from "./pages/doctor/MedicalRecords";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import DoctorTelemedicine from "./pages/doctor/Telemedicine";
import DoctorMonitoring from "./pages/doctor/Monitoring";
import DoctorReminders from "./pages/doctor/Reminders";
import DoctorAnalytics from "./pages/doctor/Analytics";
import DoctorAIAnalysis from "./pages/doctor/AIAnalysis";
import DoctorChatbot from "./pages/doctor/Chatbot";
import DoctorSettings from "./pages/doctor/Settings";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientEmergency from "./pages/patient/Emergency";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientMedicalRecords from "./pages/patient/MedicalRecords";
import PatientMonitoring from "./pages/patient/Monitoring";
import PatientReminders from "./pages/patient/Reminders";
import PatientTelemedicine from "./pages/patient/Telemedicine";
import PatientChatbot from "./pages/patient/Chatbot";
import PatientSettings from "./pages/patient/Settings";
import PatientDoctorList from "./pages/patient/DoctorList";

import NotFound from "./pages/NotFound";
import { AppointmentsProvider } from "@/context/AppointmentsContext";
import { SocketProvider } from "@/context/SocketContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* Wrap entire router here */}
      <SocketProvider>
        <AppointmentsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/records" element={<DoctorMedicalRecords />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/telemedicine" element={<DoctorTelemedicine />} />
              <Route path="/doctor/monitoring" element={<DoctorMonitoring />} />
              <Route path="/doctor/reminders" element={<DoctorReminders />} />
              <Route path="/doctor/analytics" element={<DoctorAnalytics />} />
              <Route path="/doctor/ai-analysis" element={<DoctorAIAnalysis />} />
              <Route path="/doctor/chatbot" element={<DoctorChatbot />} />
              <Route path="/doctor/settings" element={<DoctorSettings />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/emergency" element={<PatientEmergency />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient/records" element={<PatientMedicalRecords />} />
              <Route path="/patient/monitoring" element={<PatientMonitoring />} />
              <Route path="/patient/reminders" element={<PatientReminders />} />
              <Route path="/patient/telemedicine" element={<PatientTelemedicine />} />
              <Route path="/patient/doctors" element={<PatientDoctorList />} />
              <Route path="/patient/chatbot" element={<PatientChatbot />} />
              <Route path="/patient/settings" element={<PatientSettings />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppointmentsProvider>
      </SocketProvider>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;