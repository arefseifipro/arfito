// auth.js

function showTab(tab) {
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
    document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
    });
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

// ====== ثبت‌ام ======
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const errorEl = document.getElementById('reg-error');
    errorEl.textContent = '';

    // اعتبارسنجی
    if (!isValidUsername(username)) {
        errorEl.textContent = '❌ نام کاربری فقط حروف انگلیسی';
        return;
    }

    if (!isValidPassword(password)) {
        errorEl.textContent = '❌ رمز عبور حداقل ۸ کاراکتر و حاوی عدد باشد';
        return;
    }

    if (password !== password2) {
        errorEl.textContent = '❌ رمزهای عبور یکسان نیستند';
        return;
    }

    try {
        const { data: existing } = await sb
            .from('profiles')
            .select('id')
            .eq('username', username);

        if (existing && existing.length > 0) {
            errorEl.textContent = '❌ این نام کاربری قبلاً ثبت شده است';
            return;
        }

        const { data, error } = await sb
            .from('profiles')
            .insert([{ username, password }])
            .select()
            .single();

        if (error) throw error;

        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = 'dashboard.html';
    } catch (err) {
        errorEl.textContent = '❌ خطا در ثبت‌نام: ' + err.message;
    }
});
