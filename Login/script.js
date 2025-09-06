document.querySelector('.login-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (email && password) {
    document.querySelector('.success').style.display = 'block';
    document.querySelector('.error').style.display = 'none';
  } else {
    document.querySelector('.success').style.display = 'none';
    document.querySelector('.error').style.display = 'block';
  }
});
