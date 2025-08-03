// src/pages/CompleteProfile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function CompleteProfile() {
  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !family) {
      alert("لطفاً نام و نام خانوادگی را وارد کنید.");
      return;
    }
    if (!auth.currentUser) {
      alert("کاربری وارد نشده است!");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || null,
        phone: auth.currentUser.phoneNumber || null,
        name,
        family,
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (err) {
      alert("خطا در ذخیره اطلاعات: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">تکمیل پروفایل</h2>

        <div>
          <label className="block mb-1">نام</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">نام خانوادگی</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 transition py-2 rounded font-semibold"
        >
          {loading ? "در حال ذخیره..." : "ادامه"}
        </button>
      </form>
    </div>
  );
}
