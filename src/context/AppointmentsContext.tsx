import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Appointment {
  _id?: string;
  id?: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (apt: Appointment) => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => {
  // API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch from DB on page load
  useEffect(() => {
    const fetchAppointments = async () => {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : null;

      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      }
    };
    fetchAppointments();
  }, []);

  // Add new appointment to DB
  const addAppointment = async (apt: Appointment) => {
    const userStr = localStorage.getItem("user");
    const token = userStr ? JSON.parse(userStr).token : null;

    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apt),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Failed to add appointment", error);
    }
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments must be used within AppointmentsProvider");
  }
  return context;
};