// اتصال به Supabase 
const supabase = window.supabase.createClient(
  'https://nhimvojqusfsqauhrkoa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaW12b2pxdXNmc3FhdWhya29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDI0MzMsImV4cCI6MjA2OTYxODQzM30.SAdp9xlzaTyAyp7shOuOFwW5K4jNkpfl7xWZeIR8FXw'
);

// سوییچ بین فرم‌های ایمیل و موبایل با انیمیشن
const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.form');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    forms.forEach(f => f.classList.remove('active'));
    const target = tab.dataset.tab;
    document.getElementById(`${target}-form`).classList.add('active');
  });
});

// نمایش/مخفی کردن رمز با آیکون
const toggleIcons = document.querySelectorAll('.toggle-password');
toggleIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    const input = icon.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  });
});

// چک‌لیست رمز عبور فرم ایمیل
const emailForm = document.getElementById('email-form');
const emailInput = emailForm.querySelector('input[type="email"]');
const passwordInput = emailForm.querySelector('input[type="password"]');
const submitBtn = emailForm.querySelector('button[type="submit"]');
const checklist = {
  length: document.getElementById('rule-length'),
  uppercase: document.getElementById('rule-uppercase'),
  lowercase: document.getElementById('rule-lowercase'),
  number: document.getElementById('rule-number'),
  symbol: document.getElementById('rule-symbol')
};

function validatePassword(value) {
  const rules = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[\/_%\-\&\.]/.test(value)
  };

  Object.entries(rules).forEach(([key, valid]) => {
    checklist[key].className = valid ? 'valid' : 'invalid';
  });
  return Object.values(rules).every(v => v);
}

function validateEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
}

function checkFormValidity() {
  const isEmailValid = validateEmail(emailInput.value);
  const isPasswordValid = validatePassword(passwordInput.value);
  submitBtn.disabled = !(isEmailValid && isPasswordValid);
}

passwordInput.addEventListener('input', checkFormValidity);
emailInput.addEventListener('input', checkFormValidity);
checkFormValidity();

const generateBtn = document.getElementById('generate-password');
generateBtn.addEventListener('click', () => {
  const chars = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '/_%-.&'
  };
  let password = '';
  password += chars.upper[Math.floor(Math.random() * chars.upper.length)];
  password += chars.lower[Math.floor(Math.random() * chars.lower.length)];
  password += chars.number[Math.floor(Math.random() * chars.number.length)];
  password += chars.symbol[Math.floor(Math.random() * chars.symbol.length)];
  while (password.length < 10) {
    const all = chars.upper + chars.lower + chars.number + chars.symbol;
    password += all[Math.floor(Math.random() * all.length)];
  }
  passwordInput.value = password;
  checkFormValidity();
});

// ورود یا ثبت‌نام با ایمیل
emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const statusBox = document.querySelector('.status-message');
  statusBox.textContent = 'در حال بررسی...';

  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      if (signInError.status === 400) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: ''
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          statusBox.textContent = 'خطا در ثبت‌نام: ' + signUpError.message;
        } else {
          statusBox.textContent = 'ثبت‌نام موفق. کد تأیید به ایمیل ارسال شد.';
          emailForm.style.display = 'none';
          document.getElementById('email-verify-form').style.display = 'block';
        }
      } else {
        console.error('Login error:', signInError);
        statusBox.textContent = 'خطا در ورود: ' + signInError.message;
      }
    } else {
      statusBox.textContent = 'ورود موفق. انتقال به داشبورد...';
      setTimeout(() => window.location.href = '/dashboard.html', 1500);
    }
  } catch (err) {
    console.error('Unhandled error:', err);
    statusBox.textContent = 'یک خطای غیرمنتظره رخ داد. لطفاً بعداً تلاش کنید.';
  }
});

// OTP
const otpInputs = document.querySelectorAll('.otp-input');
const verifyCodeBtn = document.getElementById('verify-code-btn');
const resendBtn = document.getElementById('resend-code-btn');
const resendTimer = document.getElementById('resend-timer');
const emailVerifyStatus = document.querySelector('#email-verify-form .status-message');

otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
    verifyCodeBtn.disabled = ![...otpInputs].every(i => i.value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && input.value === '' && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

let timer = 30;
let interval = setInterval(() => {
  timer--;
  resendTimer.textContent = timer;
  if (timer <= 0) {
    clearInterval(interval);
    resendBtn.disabled = false;
    resendTimer.textContent = '0';
  }
}, 1000);

verifyCodeBtn.addEventListener('click', async () => {
  const otpCode = [...otpInputs].map(i => i.value).join('');
  emailVerifyStatus.textContent = 'در حال بررسی کد...';

  const { data, error } = await supabase.auth.verifyOtp({
    email: emailInput.value,
    token: otpCode,
    type: 'email'
  });

  if (error) {
    emailVerifyStatus.textContent = 'کد وارد شده اشتباه است یا منقضی شده';
  } else {
    emailVerifyStatus.textContent = 'تأیید موفق. انتقال به داشبورد...';
    setTimeout(() => window.location.href = '/dashboard.html', 1500);
  }
});

// ورود با موبایل
const mobileForm = document.getElementById('mobile-form');
const mobileInput = mobileForm.querySelector('input[name="mobile"]');
const mobilePasswordInput = mobileForm.querySelector('input[name="password"]');
const mobileSubmitBtn = mobileForm.querySelector('button[type="submit"]');

mobileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mobile = mobileInput.value.trim();
  const password = mobilePasswordInput.value;
  const statusBox = document.querySelector('.status-message');

  statusBox.textContent = 'در حال بررسی شماره موبایل...';

  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('phone', mobile)
    .single();

  if (error || !user) {
    showErrorMessage('ثبت‌نام با موبایل مقدور نیست. لطفا از روش ایمیل استفاده کنید.');
    statusBox.textContent = '';
    return;
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password
  });

  if (loginError) {
    statusBox.textContent = 'ورود ناموفق است. رمز عبور اشتباه است.';
  } else {
    statusBox.textContent = 'ورود موفق. انتقال به داشبورد...';
    setTimeout(() => window.location.href = '/dashboard.html', 1500);
  }
});

function showErrorMessage(msg) {
  let msgBox = document.createElement('div');
  msgBox.textContent = msg;
  msgBox.style.position = 'fixed';
  msgBox.style.top = '20%';
  msgBox.style.left = '50%';
  msgBox.style.transform = 'translate(-50%, -50%) scale(0.8)';
  msgBox.style.background = 'rgba(255, 70, 70, 0.9)';
  msgBox.style.color = 'white';
  msgBox.style.padding = '1rem 2rem';
  msgBox.style.borderRadius = '12px';
  msgBox.style.fontSize = '1.2rem';
  msgBox.style.fontWeight = '600';
  msgBox.style.boxShadow = '0 4px 10px rgba(255, 70, 70, 0.5)';
  msgBox.style.opacity = '0';
  msgBox.style.zIndex = '9999';
  msgBox.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  document.body.appendChild(msgBox);

  requestAnimationFrame(() => {
    msgBox.style.opacity = '1';
    msgBox.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  setTimeout(() => {
    msgBox.style.opacity = '0';
    msgBox.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }, 3000);

  msgBox.addEventListener('transitionend', () => {
    if (msgBox.style.opacity === '0') {
      msgBox.remove();
    }
  });
}