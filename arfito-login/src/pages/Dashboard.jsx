import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        navigate("/");
        return;
      }
      setLoadingUser(true);
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setName(data.name || "");
          setFamily(data.family || "");
        } else {
          navigate("/complete-profile");
        }
      } catch (error) {
        console.error(error);
      }
      setLoadingUser(false);
    };

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const ordersRef = collection(db, "users", auth.currentUser.uid, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error(error);
      }
      setLoadingOrders(false);
    };

    fetchUserData();
    fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut().then(() => navigate("/"));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmNewPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("لطفا همه فیلدها را پر کنید.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("رمز جدید با تکرار آن مطابقت ندارد.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("رمز جدید باید حداقل 6 کاراکتر باشد.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user.email) {
        setPasswordError("تغییر رمز فقط برای کاربران ایمیل/پسورد فعال است.");
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      setChangingPassword(true);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess("رمز عبور با موفقیت تغییر کرد.");
      setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      setPasswordError("خطا در تغییر رمز: " + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNameSave = async () => {
    setNameError("");
    setNameSuccess("");
    if (!name.trim() || !family.trim()) {
      setNameError("نام و نام خانوادگی نمی‌توانند خالی باشند.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { name: name.trim(), family: family.trim() });
      setUserData((prev) => ({ ...prev, name: name.trim(), family: family.trim() }));
      setNameSuccess("اطلاعات با موفقیت ذخیره شد.");
      setEditingName(false);
    } catch (error) {
      setNameError("خطا در ذخیره اطلاعات: " + error.message);
    }
  };

  if (loadingUser)
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-lg font-semibold">
        در حال بارگذاری اطلاعات کاربر...
      </div>
    );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white p-6 md:p-12 transition-colors duration-500 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* اطلاعات کاربر */}
        <section className="md:col-span-1 bg-gray-900 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
            اطلاعات کاربری
          </h2>

          {/* ویرایش نام و نام خانوادگی */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-lg">نام و نام خانوادگی</label>
              {!editingName && (
                <button
                  onClick={() => {
                    setEditingName(true);
                    setNameError("");
                    setNameSuccess("");
                  }}
                  className="text-sm text-blue-400 hover:underline"
                >
                  ویرایش
                </button>
              )}
            </div>

            {editingName ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نام"
                />
                <input
                  type="text"
                  value={family}
                  onChange={(e) => setFamily(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نام خانوادگی"
                />

                {nameError && (
                  <p className="text-red-500 mt-1 font-semibold">{nameError}</p>
                )}
                {nameSuccess && (
                  <p className="text-green-400 mt-1 font-semibold">{nameSuccess}</p>
                )}

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={handleNameSave}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition"
                  >
                    ذخیره
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold transition"
                  >
                    انصراف
                  </button>
                </div>
              </>
            ) : (
              <p>
                {userData.name || "-"} {userData.family || "-"}
              </p>
            )}
          </div>

          <p>
            <span className="font-semibold">ایمیل: </span>
            {userData.email || "ثبت نشده"}
          </p>
          <p>
            <span className="font-semibold">شماره موبایل: </span>
            {userData.phone || "ثبت نشده"}
          </p>
          <p>
            <span className="font-semibold">تاریخ ثبت‌نام: </span>
            {userData.createdAt
              ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString("fa-IR")
              : "ثبت نشده"}
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-2 rounded bg-red-600 hover:bg-red-700 font-semibold transition"
          >
            خروج از حساب
          </button>
        </section>

        {/* تغییر رمز عبور */}
        <section className="md:col-span-2 bg-gray-900 rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
            تغییر رمز عبور
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block mb-1">رمز فعلی</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1">رمز جدید</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block mb-1">تکرار رمز جدید</label>
              <input
                type="password"
                value={passwords.confirmNewPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmNewPassword: e.target.value })
                }
                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                minLength={6}
              />
            </div>

            {passwordError && (
              <p className="text-red-500 font-semibold">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 font-semibold">{passwordSuccess}</p>
            )}

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-2 bg-teal-500 hover:bg-teal-600 rounded font-semibold transition"
            >
              {changingPassword ? "در حال تغییر رمز..." : "تغییر رمز عبور"}
            </button>
          </form>
        </section>

        {/* نمایش خریدها */}
        <section className="md:col-span-3 bg-gray-900 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
            خریدهای شما
          </h2>
          {loadingOrders ? (
            <p>در حال بارگذاری خریدها...</p>
          ) : orders.length === 0 ? (
            <p>شما هنوز خریدی انجام نداده‌اید.</p>
          ) : (
            <ul className="space-y-4 max-h-80 overflow-auto">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="bg-gray-800 p-4 rounded-lg shadow flex flex-col md:flex-row justify-between"
                >
                  <div>
                    <p>
                      <span className="font-semibold">شماره سفارش:</span> {order.id}
                    </p>
                    <p>
                      <span className="font-semibold">تاریخ:</span>{" "}
                      {order.createdAt
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(
                            "fa-IR"
                          )
                        : "-"}
                    </p>
                    <p>
                      <span className="font-semibold">وضعیت:</span>{" "}
                      {order.status || "در انتظار پرداخت"}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 md:text-right">
                    <p>
                      <span className="font-semibold">مبلغ کل:</span>{" "}
                      {order.totalPrice
                        ? order.totalPrice.toLocaleString("fa-IR") + " تومان"
                        : "-"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
