// auth.js

function showTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabs = document.querySelectorAll('.tab');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}


function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 ‍5.24-5.24"/>
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                <path d="M1 1l22 22"/>
            </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>`;
}

// اعتبارسنجی نام کاربری (فقط انگلیسی)
function isValidUsername(u) {
    return /^[a-zA-Z0-9_]+$/.test(u);
}

// اعتبارسنجی رمز عبور (حداقل ۸ کاراکتر، حاوی عدد)
function isValidPassword(p) {
    return p.length >= 8 && /\d/.test(p);
}

// ====== ورود ======
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    try {
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !data) {
            errorEl.textContent = '❌ کاربری با این نام پیدا نشد';
            return;
        }

        if (data.password !== password) {
            errorEl.textContent = '❌ رمز عبور اشتباه است';
            return;
        }

        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = 'dashboard.html';
    } catch (err) {
        errorEl.textContent = '❌ خطا در اتصال به سرور';
    }
});
// رفتن به مرحله دوم
async function goToStep2() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const errorEl = document.getElementById('reg-error');
    errorEl.textContent = '';

    // اعتبارسنجی
    if (!username || !password || !password2) {
        errorEl.textContent = 'همه فیلدها رو پر کن';
        return;
    }
    
    if (password !== password2) {
        errorEl.textContent = 'رمزها یکسان نیستند';
        return;
    }
    
    if (password.length < 8) {
        errorEl.textContent = 'رمز عبور حداقل ۸ کاراکتر باشه';
        return;
    }

    // چک تکراری نبودن یوزرنیم
    try {
        const { data: existing } = await sb
            .from('profiles')
            .select('id')
            .eq('username', username);

        if (existing && existing.length > 0) {
            errorEl.textContent = '❌ این نام کاربری قبلاً ثبت شده است';
            return;
        }

        // اگه همه چی اوکی بود برو مرحله دوم
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
        errorEl.textContent = '';
    } catch (err) {
        errorEl.textContent = '❌ خطا در بررسی نام کاربری';
    }
}

// بازگشت به مرحله اول
function backToStep1() {
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('reg-error-2').textContent = '';
}

// فعال/غیرفعال کردن رشته بر اساس پایه
document.getElementById('grade').addEventListener('change', function() {
    const fieldGroup = document.getElementById('field-group');
    if (this.value === 'متوسطه اول' || this.value === '') {
        fieldGroup.style.display = 'none';
        document.getElementById('field').value = '';
    } else {
        fieldGroup.style.display = 'block';
    }
});

// توی تابع submit فرم اصلی
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // اگه مرحله اول فعاله، اجبار به رفتن به مرحله دوم
    if (document.getElementById('step-1').style.display !== 'none') {
        goToStep2();
        return;
    }
    
    // اینجا ثبت‌نام نهایی انجام بشه
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const grade = document.getElementById('grade').value;
    const field = document.getElementById('field').value || '';
    
   // ====== ثبت‌ام نهایی ======
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // اگه مرحله اول فعاله، برو مرحله دوم
    if (document.getElementById('step-1').style.display !== 'none') {
        goToStep2();
        return;
    }
    
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const grade = document.getElementById('grade').value;
    const field = document.getElementById('field').value || '';
    const errorEl = document.getElementById('reg-error-2');
    errorEl.textContent = '';

    // اعتبارسنجی
    if (!firstName || !lastName || !grade) {
        errorEl.textContent = '❌ لطفا همه فیلدها رو پر کن';
        return;
    }

    try {
        // اول چک کن کاربر قبلا ثبت نام کرده؟
        const { data: existing } = await sb
            .from('profiles')
            .select('id')
            .eq('username', username);

        if (existing && existing.length > 0) {
            errorEl.textContent = '❌ این نام کاربری قبلاً ثبت شده است';
            return;
        }

        // ثبت‌ام با اطلاعات کامل
        const { data, error } = await sb
            .from('profiles')
            .insert([{ 
                username, 
                password,
                first_name: firstName,
                last_name: lastName,
                grade: grade,
                field: field
            }])
            .select()
            .single();

        if (error) throw error;

        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = 'dashboard.html';
    } catch (err) {
        errorEl.textContent = '❌ خطا در ثبت‌ام: ' + err.message;
    }
});

});
