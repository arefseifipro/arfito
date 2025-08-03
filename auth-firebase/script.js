const supabase = window.supabase.createClient(
  'https://nhimvojqusfsqauhrkoa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaW12b2pxdXNmc3FhdWhya29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDI0MzMsImV4cCI6MjA2OTYxODQzM30.SAdp9xlzaTyAyp7shOuOFwW5K4jNkpfl7xWZeIR8FXw'
);

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const emailForm = document.getElementById('email-form');
  const mobileForm = document.getElementById('mobile-form');
  const emailVerifyForm = document.getElementById('email-verify-form');
  const completeProfileForm = document.querySelector('.complete-profile-form');
  const statusBoxes = document.querySelectorAll('.status-message');

  const emailInput = emailForm.querySelector("input[type='email']");
  const emailPasswordInput = emailForm.querySelector("input[type='password']");
  const emailSubmitBtn = emailForm.querySelector("button[type='submit']");
  const emailRules = {
    length: document.getElementById('rule-length'),
    uppercase: document.getElementById('rule-uppercase'),
    lowercase: document.getElementById('rule-lowercase'),
    number: document.getElementById('rule-number'),
    symbol: document.getElementById('rule-symbol'),
  };
  const emailGenerateBtn = document.getElementById('generate-password');

  const mobileInput = mobileForm.querySelector("input[name='mobile']");
  const mobilePasswordInput = mobileForm.querySelector("input[type='password']");
  const mobileSubmitBtn = mobileForm.querySelector("button[type='submit']");
  const mobileRules = {
    length: document.getElementById('mobile-rule-length'),
    uppercase: document.getElementById('mobile-rule-uppercase'),
    lowercase: document.getElementById('mobile-rule-lowercase'),
    number: document.getElementById('mobile-rule-number'),
    symbol: document.getElementById('mobile-rule-symbol'),
  };
  const mobileGenerateBtn = document.getElementById('mobile-generate-password');

  const otpInputs = emailVerifyForm.querySelectorAll('.otp-input');
  const verifyCodeBtn = document.getElementById('verify-code-btn');
  const resendCodeBtn = document.getElementById('resend-code-btn');
  const resendTimerSpan = document.getElementById('resend-timer');
  const emailVerifyStatus = emailVerifyForm.querySelector('.status-message');

  const fullNameInput = completeProfileForm.querySelector('#full_name');
  const profileEmailInput = completeProfileForm.querySelector('#email');
  const profileMobileInput = completeProfileForm.querySelector('#mobile');
  const profilePasswordInput = completeProfileForm.querySelector('#password');
  const profileConfirmPasswordInput = completeProfileForm.querySelector('#confirm_password');

  const profilePasswordRules = {
    length: document.getElementById('len'),
    lowercase: document.getElementById('lower'),
    uppercase: document.getElementById('upper'),
    digit: document.getElementById('digit'),
    special: document.getElementById('special'),
  };

  const mainStatus = statusBoxes[0];

  function showStatus(msg, type = 'success', target = mainStatus) {
    if (!target) return;
    target.textContent = msg;
    target.className = 'status-message ' + type;
    target.style.opacity = '1';
    setTimeout(() => {
      target.style.opacity = '0';
      setTimeout(() => {
        target.textContent = '';
        target.className = 'status-message';
      }, 300);
    }, 3500);
  }

  function clearStatus(target = mainStatus) {
    if (!target) return;
    target.textContent = '';
    target.className = 'status-message';
    target.style.opacity = '0';
  }

  function hideAllForms() {
    [emailForm, mobileForm, emailVerifyForm, completeProfileForm].forEach(f => f.style.display = 'none');
  }

  function showForm(form) {
    hideAllForms();
    form.style.display = 'block';
    clearStatus();
  }

  function validatePasswordSimple(pw) {
    return {
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[_\/%\-.&]/.test(pw),
    };
  }

  function updateValidation(input, rules, submitBtn) {
    const pw = input.value;
    const valid = validatePasswordSimple(pw);
    let allValid = true;
    for (const key in rules) {
      if (valid[key]) {
        rules[key].classList.remove('invalid');
        rules[key].classList.add('valid');
      } else {
        rules[key].classList.remove('valid');
        rules[key].classList.add('invalid');
        allValid = false;
      }
    }
    submitBtn.disabled = !allValid || !input.closest('form').checkValidity();
  }

  function validateProfilePassword(pw) {
    return {
      length: pw.length >= 8,
      lowercase: /[a-z]/.test(pw),
      uppercase: /[A-Z]/.test(pw),
      digit: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
  }

  function updateProfileValidation() {
    const pw = profilePasswordInput.value;
    const valid = validateProfilePassword(pw);
    let allValid = true;
    for (const key in profilePasswordRules) {
      if (valid[key]) {
        profilePasswordRules[key].style.color = 'green';
      } else {
        profilePasswordRules[key].style.color = 'red';
        allValid = false;
      }
    }
    const confirmMatch =
      profilePasswordInput.value === profileConfirmPasswordInput.value &&
      profileConfirmPasswordInput.value.length > 0;

    completeProfileForm.querySelector('button[type="submit"]').disabled =
      !(allValid && confirmMatch && profileEmailInput.checkValidity() && profileMobileInput.checkValidity() && fullNameInput.checkValidity());
  }

  function generatePassword(length = 12) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    const all = upper + lower + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  function setupTogglePassword(form) {
    const toggle = form.querySelector('.toggle-password');
    const input = form.querySelector("input[type='password']");
    if (!toggle || !input) return;
    toggle.style.cursor = 'pointer';
    toggle.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
      } else {
        input.type = 'password';
        toggle.textContent = '👁️';
      }
    });
  }

  mobileInput.addEventListener('input', () => {
    mobileInput.value = mobileInput.value.replace(/[^\d]/g, '').slice(0, 11);
  });

  emailPasswordInput.addEventListener('input', () => {
    updateValidation(emailPasswordInput, emailRules, emailSubmitBtn);
  });

  emailGenerateBtn.addEventListener('click', () => {
    const pass = generatePassword();
    emailPasswordInput.value = pass;
    updateValidation(emailPasswordInput, emailRules, emailSubmitBtn);
    showStatus('رمز عبور قوی تولید شد.', 'success');
  });

  mobilePasswordInput.addEventListener('input', () => {
    updateValidation(mobilePasswordInput, mobileRules, mobileSubmitBtn);
  });

  mobileGenerateBtn.addEventListener('click', () => {
    const pass = generatePassword();
    mobilePasswordInput.value = pass;
    updateValidation(mobilePasswordInput, mobileRules, mobileSubmitBtn);
    showStatus('رمز عبور قوی تولید شد.', 'success');
  });

  [profilePasswordInput, profileConfirmPasswordInput, fullNameInput, profileEmailInput, profileMobileInput].forEach(el => {
    el.addEventListener('input', updateProfileValidation);
  });

  updateValidation(emailPasswordInput, emailRules, emailSubmitBtn);
  updateValidation(mobilePasswordInput, mobileRules, mobileSubmitBtn);
  updateProfileValidation();

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      hideAllForms();
      if (target === 'email') {
        emailForm.style.display = 'block';
      } else if (target === 'mobile') {
        mobileForm.style.display = 'block';
      }
      clearStatus();
    });
  });

  function showCompleteProfileForm(email = '', mobile = '') {
    hideAllForms();
    if (email) {
      profileEmailInput.value = email;
      profileEmailInput.readOnly = true;
      profileMobileInput.readOnly = false;
      profileMobileInput.value = '';
    } else if (mobile) {
      profileMobileInput.value = mobile;
      profileMobileInput.readOnly = true;
      profileEmailInput.readOnly = false;
      profileEmailInput.value = '';
    } else {
      profileEmailInput.value = '';
      profileMobileInput.value = '';
      profileEmailInput.readOnly = false;
      profileMobileInput.readOnly = false;
    }
    fullNameInput.value = '';
    profilePasswordInput.value = '';
    profileConfirmPasswordInput.value = '';
    completeProfileForm.style.display = 'block';
    clearStatus();
    updateProfileValidation();
  }

  otpInputs.forEach((input, i) => {
    input.addEventListener('input', e => {
      const val = input.value;
      if (!/^\d$/.test(val)) {
        input.value = '';
        return;
      }
      if (i < otpInputs.length - 1) otpInputs[i + 1].focus();
      checkOtpFilled();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && input.value === '' && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
  });

  function checkOtpFilled() {
    const filled = Array.from(otpInputs).every(input => input.value !== '');
    verifyCodeBtn.disabled = !filled;
  }

  let resendCountdown = 30;
  let resendInterval;

  function startResendCountdown() {
    resendCountdown = 30;
    resendCodeBtn.disabled = true;
    resendTimerSpan.textContent = resendCountdown;
    resendInterval = setInterval(() => {
      resendCountdown--;
      resendTimerSpan.textContent = resendCountdown;
      if (resendCountdown <= 0) {
        clearInterval(resendInterval);
        resendCodeBtn.disabled = false;
        resendTimerSpan.textContent = '';
      }
    }, 1000);
  }

  let currentEmailForVerification = '';
  let verificationOtp = '';

  async function sendOtpEmail(email) {
    try {
      // ساخت کد 6 رقمی
      verificationOtp = '';
      for (let i = 0; i < 6; i++) {
        verificationOtp += Math.floor(Math.random() * 10);
      }
      currentEmailForVerification = email;

      // ارسال ایمیل OTP (توضیح: برای تست فقط alert می‌کنیم؛ شما باید از سرویس ایمیل استفاده کنید)
      alert('کد تایید برای ' + email + ' ارسال شد: ' + verificationOtp);

      startResendCountdown();
      showStatus('کد تایید ارسال شد.', 'success', emailVerifyStatus);
      return true;
    } catch (error) {
      showStatus('خطا در ارسال کد تایید.', 'error', emailVerifyStatus);
      return false;
    }
  }

  emailVerifyForm.addEventListener('submit', async e => {
    e.preventDefault();
    const codeEntered = Array.from(otpInputs).map(input => input.value).join('');
    if (codeEntered === verificationOtp) {
      showStatus('کد تایید درست است.', 'success', emailVerifyStatus);
      emailVerifyForm.style.display = 'none';
      showCompleteProfileForm(currentEmailForVerification, '');
    } else {
      showStatus('کد تایید اشتباه است.', 'error', emailVerifyStatus);
    }
  });

  resendCodeBtn.addEventListener('click', async () => {
    if (currentEmailForVerification) {
      await sendOtpEmail(currentEmailForVerification);
      otpInputs.forEach(input => (input.value = ''));
      verifyCodeBtn.disabled = true;
    }
  });

  emailForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearStatus();

    const email = emailInput.value.trim();
    const password = emailPasswordInput.value;

    if (!validateEmail(email)) {
      showStatus('ایمیل معتبر نیست.', 'error');
      return;
    }

    try {
      showStatus('در حال بررسی حساب کاربری...', 'info');

      const { data: userData, error: fetchError } = await supabase.auth.admin.getUserByEmail(email);

      if (fetchError && fetchError.message !== 'User not found') {
        showStatus('خطا در بررسی کاربر: ' + fetchError.message, 'error');
        return;
      }

      if (userData) {
        // کاربر وجود دارد، تلاش برای ورود
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          showStatus('ورود ناموفق: ' + error.message, 'error');
          return;
        }
        showStatus('ورود موفق! به داشبورد منتقل می‌شوید...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html'; // مسیر داشبورد
        }, 1500);
      } else {
        // کاربر وجود ندارد، ارسال کد تایید ایمیل برای ثبت‌نام
        showForm(emailVerifyForm);
        await sendOtpEmail(email);
      }
    } catch (error) {
      showStatus('خطا: ' + error.message, 'error');
    }
  });

  mobileForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearStatus();

    const mobile = mobileInput.value.trim();
    const password = mobilePasswordInput.value;

    if (!/^09\d{9}$/.test(mobile)) {
      showStatus('شماره موبایل معتبر نیست.', 'error');
      return;
    }

    try {
      showStatus('در حال بررسی حساب کاربری...', 'info');

      // بررسی وجود شماره موبایل در پروفایل
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile', mobile)
        .limit(1);

      if (fetchError) {
        showStatus('خطا در بررسی شماره موبایل: ' + fetchError.message, 'error');
        return;
      }

      if (profiles.length === 0) {
        showStatus('ثبت‌نام با شماره موبایل مجاز نیست، فقط ورود امکان‌پذیر است.', 'error');
        return;
      }

      // شماره موبایل وجود دارد، تلاش برای ورود (لاگین ایمیل ساختگی با موبایل + رمز)
      const fakeEmail = mobile + '@mobile.fake';

      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (error) {
        showStatus('ورود ناموفق: ' + error.message, 'error');
        return;
      }
      showStatus('ورود موفق! به داشبورد منتقل می‌شوید...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    } catch (error) {
      showStatus('خطا: ' + error.message, 'error');
    }
  });

  completeProfileForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearStatus();

    const fullName = fullNameInput.value.trim();
    const email = profileEmailInput.value.trim();
    const mobile = profileMobileInput.value.trim();
    const password = profilePasswordInput.value;
    const confirmPassword = profileConfirmPasswordInput.value;

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      showStatus('لطفا همه فیلدها را پر کنید.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showStatus('رمز عبور و تکرار آن مطابقت ندارند.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showStatus('ایمیل معتبر نیست.', 'error');
      return;
    }

    if (!/^09\d{9}$/.test(mobile)) {
      showStatus('شماره موبایل معتبر نیست.', 'error');
      return;
    }

    try {
      // ساخت حساب کاربری
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        showStatus('خطا در ساخت حساب: ' + signUpError.message, 'error');
        return;
      }

      // افزودن پروفایل به جدول
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          full_name: fullName,
          email: email,
          mobile: mobile,
        });

      if (profileError) {
        showStatus('خطا در ذخیره پروفایل: ' + profileError.message, 'error');
        return;
      }

      showStatus('ثبت‌نام و تکمیل پروفایل با موفقیت انجام شد!', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    } catch (error) {
      showStatus('خطا: ' + error.message, 'error');
    }
  });

  // شروع با فرم ایمیل به صورت پیش‌فرض
  showForm(emailForm);

  setupTogglePassword(emailForm);
  setupTogglePassword(mobileForm);
});
