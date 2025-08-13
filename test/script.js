// سوئیچ فرم
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginCard = document.querySelector('.login-card');
const registerCard = document.querySelector('.register-card');

showRegister.addEventListener('click',()=>{ loginCard.style.display='none'; registerCard.style.display='block'; });
showLogin.addEventListener('click',()=>{ registerCard.style.display='none'; loginCard.style.display='block'; });

// تم دارک/لایت
const container = document.querySelector('.login-container');
container.addEventListener('dblclick',()=>{ // دابل کلیک برای تست تغییر تم
    container.classList.toggle('theme-dark');
    container.classList.toggle('theme-light');
});

// اعتبارسنجی ساده فرم
document.getElementById('login-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let valid = true;

    if(email.value===''){ valid=false; email.nextElementSibling.textContent='این فیلد الزامی است'; } else email.nextElementSibling.textContent='';
    if(password.value===''){ valid=false; password.nextElementSibling.textContent='این فیلد الزامی است'; } else password.nextElementSibling.textContent='';

    if(valid){ alert('ورود موفق!'); /* بعدا JWT و LocalStorage */ }
});

document.getElementById('register-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fields=['reg-firstname','reg-lastname','reg-email','reg-phone','reg-password'];
    let valid = true;
    fields.forEach(id=>{
        let f = document.getElementById(id);
        if(f.value===''){ valid=false; f.nextElementSibling.textContent='این فیلد الزامی است'; } else f.nextElementSibling.textContent='';
    });
    if(valid){ alert('ثبت‌نام موفق!'); /* بعدا ذخیره در دیتابیس و JWT */ }
});
