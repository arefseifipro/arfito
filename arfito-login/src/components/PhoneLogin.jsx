import { useState } from "react";
import { auth, db } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const PhoneLogin = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
    });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmation;
      setStep(2);
    } catch (err) {
      setError("ارسال پیامک ناموفق بود. شماره معتبر وارد کنید.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const confirmation = window.confirmationResult;
      const result = await confirmation.confirm(code);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("کد وارد شده اشتباه است یا منقضی شده.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-md dark:bg-gray-800">
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              ورود با شماره موبایل
            </h2>
            <input
              type="tel"
              placeholder="شماره موبایل با +98"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div id="recaptcha-container"></div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              کد تأیید را وارد کنید
            </h2>
            <input
              type="text"
              placeholder="کد تأیید"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhoneLogin;
