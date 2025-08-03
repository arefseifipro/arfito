import { useState } from "react";
import LoginForm from "./components/LoginForm";
import PhoneLogin from "./components/PhoneLogin";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // email یا phone

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        {loginMethod === "email" ? (
          <LoginForm
            onLogin={(u) => setUser(u)}
            onSwitchToPhone={() => setLoginMethod("phone")}
          />
        ) : (
          <PhoneLogin
            onLogin={(u) => setUser(u)}
            onSwitchToEmail={() => setLoginMethod("email")}
          />
        )}
      </div>
    );
  }

  if (!profileComplete) {
    return <CompleteProfile user={user} onComplete={() => setProfileComplete(true)} />;
  }

  return <Dashboard user={user} />;
}
