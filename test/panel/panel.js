// ===== Helpers =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Feather icons init after DOM
document.addEventListener("DOMContentLoaded", () => {
  feather.replace();
});

// ===== Toast (بالا سمت راست) =====
const toast = $("#toast");
function showToast(message, type = "info", timeout = 3000) {
  if (type === "success") {
    toast.style.background = "linear-gradient(135deg, #2ecc71, #1abc9c)";
    toast.style.color = "#fff";
  } else if (type === "error") {
    toast.style.background = "linear-gradient(135deg, #ff4d4f, #e03131)";
    toast.style.color = "#fff";
  } else {
    // theme-aware
    if (document.body.classList.contains("theme-dark")) {
      toast.style.background = "linear-gradient(135deg, #fca311, #ffb940)";
      toast.style.color = "#1a2238";
    } else {
      toast.style.background = "linear-gradient(135deg, #0d223d, #23486b)";
      toast.style.color = "#fff";
    }
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), timeout);
}

// ===== Theme Toggle =====
const themeToggle = $("#themeToggle");
function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
}
themeToggle.addEventListener("click", () => {
  const next = document.body.classList.contains("theme-dark") ? "theme-light" : "theme-dark";
  applyTheme(next);
  showToast(next === "theme-dark" ? "تم تیره فعال شد" : "تم روشن فعال شد");
});
applyTheme(localStorage.getItem("theme") || "theme-light");

// ===== Hamburger Menu =====
const hamburgerBtn = $("#hamburgerBtn");
const sideMenu = $("#sideMenu");
const closeMenuBtn = $("#closeMenu");
const backdrop = $("#backdrop");

function openMenu() {
  sideMenu.classList.add("open");
  sideMenu.setAttribute("aria-hidden", "false");
  hamburgerBtn.setAttribute("aria-expanded", "true");
  backdrop.classList.add("show");
}
function closeMenu() {
  sideMenu.classList.remove("open");
  sideMenu.setAttribute("aria-hidden", "true");
  hamburgerBtn.setAttribute("aria-expanded", "false");
  backdrop.classList.remove("show");
}
hamburgerBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);
backdrop.addEventListener("click", closeMenu);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

// ===== Mock Data (جایگزین با Supabase بعداً) =====
const mockProfile = {
  email: "user@example.com",
  first_name: "علی",
  last_name: "رضایی",
  phone: "09123456789",
  level: "silver", // bronze | silver | gold
  last_login_at: new Date()
};
const mockPurchases = [
  { title: "برنامه مدیریت کارها", date: "2025-07-10T12:00:00", link: "#", status: "فعال" },
  { title: "پلن طلایی Arfito", date: "2025-08-02T09:30:00", link: "#", status: "در حال بررسی" }
];
const mockTickets = [
  { subject: "مشکل در دانلود", desc: "لینک دانلود برای من کار نمی‌کند.", answer: "کش مرورگر را پاک کنید و دوباره امتحان کنید.", created_at: "2025-08-10T10:00:00" },
  { subject: "ارتقای سطح کاربری", desc: "چگونه به سطح طلایی ارتقا دهم؟", answer:"باسلام خدمت شما. سطح کاربری شما با توجه به خرید های شما توسط ادمین نظارت و به سطوح دیگر تغییر میکند. شب شما بخیر(پشتیبان آرفیتو)", created_at: "2025-08-12T16:45:00" }
];
const adminNotes = [
  { type: "info", text: "🎉 جشنواره تابستانی فعال شد. تخفیف ویژه روی برخی محصولات." },
  { type: "warning", text: "⏳ سرویس پشتیبان‌گیری امشب ساعت ۲۳:۳۰ انجام می‌شود." },
  { type: "warning", text: "⏳کاربر گرامی، سطح کاربری شما به سفارش مدیر سایت به 'طلایی' تغییر کرد. کد تخفیف 85% تمامی محصولات برای شما: FGMS747" }
];

// ===== DOM refs =====
const skeleton = $("#skeleton");
const welcomeCard = $("#welcomeCard");
const profileCard = $("#profileCard");
const purchasesCard = $("#purchasesCard");
const supportCard = $("#supportCard");
const ticketsCard = $("#ticketsCard");
const supportMessages = $("#supportMessages");

const chipName = $("#chipName");
const chipAction = $("#chipAction");
const chipActionText = $("#chipActionText");
const editProfileTop = $("#editProfileTop");

const welcomeText = $("#welcomeText");
const lastLogin = $("#lastLogin");

const userLevel = $("#userLevel");
const userLevelText = $("#userLevelText");
const pName = $("#pName");
const pFamily = $("#pFamily");
const pEmail = $("#pEmail");
const pPhone = $("#pPhone");

const purchasesList = $("#purchasesList");
const purchasesEmpty = $("#purchasesEmpty");
const ticketsList = $("#ticketsList");
const ticketsEmpty = $("#ticketsEmpty");

// ===== Utils =====
function formatDateTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function setLevelMedal(level) {
  const medalEl = userLevel.querySelector(".medal");
  medalEl.classList.remove("medal-bronze","medal-silver","medal-gold");
  if (level === "gold") medalEl.classList.add("medal-gold");
  else if (level === "bronze") medalEl.classList.add("medal-bronze");
  else medalEl.classList.add("medal-silver");
}

// ===== Mount functions =====
function mountProfile(profile) {
  const full = (profile.first_name && profile.last_name);
  chipName.textContent = full ? `${profile.first_name} ${profile.last_name}` : "میهمان";
  chipActionText.textContent = full ? "ویرایش پروفایل" : "تکمیل پروفایل";

  welcomeText.textContent = full ? `خوش آمدید، ${profile.first_name} ${profile.last_name}!` : "خوش آمدید، عارف عزیز!";
  lastLogin.textContent = `آخرین ورود: ${formatDateTime(profile.last_login_at)}`;

  pName.textContent = profile.first_name || "-";
  pFamily.textContent = profile.last_name || "-";
  pEmail.textContent = profile.email || "-";
  pPhone.textContent = profile.phone || "-";

  setLevelMedal(profile.level);
  userLevelText.textContent =
    profile.level === "gold" ? "طلایی" :
    profile.level === "bronze" ? "برنزی" : "نقره‌ای";
}

function mountPurchases(items) {
  purchasesList.innerHTML = "";
  if (!items || !items.length) { purchasesEmpty.hidden = false; return; }
  purchasesEmpty.hidden = true;
  items.forEach(it => {
    const a = document.createElement("a");
    a.className = "purchase-card";
    a.href = it.link || "#";
    a.target = "_blank";
    a.innerHTML = `
      <div><i data-feather="shopping-bag"></i></div>
      <div class="purchase-title">${it.title}</div>
      <div class="purchase-meta">
        <span><i data-feather="calendar"></i> ${formatDateTime(it.date)}</span>
        <span><i data-feather="shield"></i> ${it.status}</span>
      </div>`;
    purchasesList.appendChild(a);
  });
  feather.replace();
}

function mountTickets(items) {
  ticketsList.innerHTML = "";
  if (!items || !items.length) { ticketsEmpty.hidden = false; return; }
  ticketsEmpty.hidden = true;

  items.forEach(t => {
    const wrap = document.createElement("div");
    wrap.className = "ticket";
    wrap.innerHTML = `
      <div class="ticket-head" role="button" aria-expanded="false">
        <h4><i data-feather="life-buoy"></i> ${t.subject}</h4>
        <span class="ticket-meta"><i data-feather="clock"></i> ${formatDateTime(t.created_at)}</span>
      </div>
      <div class="ticket-body">
        <div><strong>شرح:</strong> ${t.desc}</div>
        <div><strong>پاسخ:</strong> ${t.answer || "—"}</div>
      </div>`;
    const head = wrap.querySelector(".ticket-head");
    head.addEventListener("click", () => {
      const opened = wrap.classList.toggle("open");
      head.setAttribute("aria-expanded", opened ? "true" : "false");
    });
    ticketsList.appendChild(wrap);
  });
  feather.replace();
}

function mountAdminNotes(notes) {
  supportMessages.innerHTML = "";
  notes.forEach(n => {
    const card = document.createElement("div");
    card.className = "support-note";
    card.innerHTML = `
      <i class="note-icon" data-feather="${n.type === "warning" ? "alert-triangle" : "info"}"></i>
      <div class="note-body">${n.text}</div>
      <div class="note-actions">
        <button class="btn-close" title="بستن"><i data-feather="x"></i></button>
      </div>`;
    card.querySelector(".btn-close").addEventListener("click", () => card.remove());
    supportMessages.appendChild(card);
  });
  feather.replace();
}

// ===== Init (simulate loading) =====
setTimeout(() => {
  $("#skeleton")?.remove();
  [welcomeCard, profileCard, purchasesCard, supportCard, ticketsCard].forEach(el => el.hidden = false);

  mountAdminNotes(adminNotes);
  mountProfile(mockProfile);
  mountPurchases(mockPurchases);
  mountTickets(mockTickets);

  showToast("ورود موفق! خوش آمدید 👋", "success");
}, 600);

// ===== Header actions =====
$("#logoutBtn").addEventListener("click", () => {
  showToast("با موفقیت خارج شدید.", "info");
  // TODO: supabase.auth.signOut() + redirect
});
$("#supportBtn").addEventListener("click", () => {
  showToast("به بخش راه‌های ارتباطی هدایت شد.", "info");
  $("#supportCard").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#ticketBtn").addEventListener("click", () => {
  showToast("برای ثبت تیکت، روی «ثبت تیکت» کلیک کنید.", "info");
  $("#ticketsCard").scrollIntoView({ behavior: "smooth", block: "start" });
});

// دکمه کنار نام (تکمیل/ویرایش پروفایل)
$("#chipAction").addEventListener("click", () => {
  showToast("باز کردن فرم پروفایل…", "info");
  $("#profileCard").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#editProfileTop").addEventListener("click", () => {
  showToast("باز کردن فرم ویرایش اطلاعات…", "info");
});
