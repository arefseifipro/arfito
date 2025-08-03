import { useState } from "react";
import PhoneLogin from "./PhoneLogin";
import { auth, provider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [mode, setMode] = useState("email"); // 'email' | 'phone'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (!methods.includes("password")) {
        alert("اکانتی با این ایمیل یافت نشد.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        navigate("/dashboard");
      } else {
        navigate("/complete-profile");
      }
    } catch (error) {
      alert("ورود ناموفق بود: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        navigate("/dashboard");
      } else {
        navigate("/complete-profile");
      }
    } catch (error) {
      alert("ورود با گوگل ناموفق بود: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">ورود به حساب کاربری</h2>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setMode("email")}
            className={`px-4 py-2 rounded-l-lg ${
              mode === "email" ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            ایمیل
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`px-4 py-2 rounded-r-lg ${
              mode === "phone" ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            موبایل
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="ایمیل"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="رمز عبور"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
            >
              ورود
            </button>
          </form>
        ) : (
          <PhoneLogin />
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            ورود با گوگل
          </button>
        </div>
      </div>
    </div>
  );
}
