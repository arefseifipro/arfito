let currentTab = 'tab-structure';

document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  setupLogin();
  setupTabs();
  setupForms();
  populateLessonSelects();
  renderLessonsList();
  renderWeeksAdmin();
});


function setupLogin() {
  const loginBtn = document.getElementById('login-btn');
  const codeInput = document.getElementById('admin-code');
  const errorEl = document.getElementById('login-error');

  const tryLogin = () => {
    if (codeInput.value === ADMIN_CODE) {
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('admin-panel').classList.remove('hidden');
      sessionStorage.setItem('admin_logged', '1');
    } else {
      errorEl.classList.remove('hidden');
      codeInput.value = '';
    }
  };


  if (sessionStorage.getItem('admin_logged') === '1') {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
  }

  loginBtn.addEventListener('click', tryLogin);
  codeInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') tryLogin();
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged');
    location.reload();
  });

  document.getElementById('sync-btn').addEventListener('click', async () => {
    await pushToGitHub();
    alert('همگام‌سازی انجام شد!');
  });
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      currentTab = btn.dataset.tab;
    });
  });
}

function setupForms() {
  // افزودن درس
  document.getElementById('add-lesson-btn').addEventListener('click', () => {
    const name = document.getElementById('lesson-name').value.trim();
    const icon = document.getElementById('lesson-icon').value;
    const color = document.getElementById('lesson-color').value;
    if (!name) { alert('نام درس را وارد کنید'); return; }

    db.lessons.push({
      id: uid(),
      name,
      icon,
      color,
      sources: [],
      weeks: []
    });
    document.getElementById('lesson-name').value = '';
    saveDB().then(() => {
      renderLessonsList();
      populateLessonSelects();
      renderWeeksAdmin();
    });
  });

  document.getElementById('add-week-btn').addEventListener('click', () => {
    const lessonId = document.getElementById('week-lesson').value;
    const label = document.getElementById('week-label').value.trim();
    const range = document.getElementById('week-range').value.trim();
    if (!lessonId || !label) { alert('درس و نام هفته را وارد کنید'); return; }

    const lesson = getLesson(lessonId);
    lesson.weeks.push({
      id: uid(),
      label,
      dateRange: range,
      parts: []
    });
    document.getElementById('week-label').value = '';
    document.getElementById('week-range').value = '';
    saveDB().then(() => renderWeeksAdmin());
  });

  document.getElementById('log-btn').addEventListener('click', () => {
    const lessonId = document.getElementById('log-lesson').value;
    const sourceId = document.getElementById('log-source').value;
    const chapterId = document.getElementById('log-chapter').value;
    const count = parseInt(document.getElementById('log-count').value);

    if (!lessonId || !sourceId || !chapterId || !count || count < 1) {
      alert('همه فیلدها را پر کنید');
      return;
    }

    const chapter = getChapter(lessonId, sourceId, chapterId);
    if (!chapter) return;

    const remaining = chapter.total - chapter.done;
    if (count > remaining) {
      alert(`فقط ${remaining} تست نزده باقی مانده!`);
      return;
    }

    chapter.done += count;
    document.getElementById('log-count').value = '';
    saveDB().then(() => {
      renderLessonsList();
      populateLessonSelects();
    });
  });


  document.getElementById('log-lesson').addEventListener('change', populateSourceSelect);
  document.getElementById('log-source').addEventListener('change', populateChapterSelect);
}


function renderLessonsList() {
  const list = document.getElementById('lessons-list');
  if (!db.lessons.length) {
    list.innerHTML = '<p class="muted">درسی وجود ندارد.</p>';
    return;
  }

  list.innerHTML = db.lessons.map(lesson => `
    <div class="admin-lesson-item">
      <div class="admin-lesson-head">
        <span class="lesson-icon-sm" style="color: ${lesson.color}">${ICONS[lesson.icon] || ICONS.book}</span>
        <span class="lesson-name-sm">${lesson.name}</span>
        <div class="lesson-actions">
          <button class="icon-btn" onclick="addSource('${lesson.id}')" title="افزودن منبع">${ICONS.plus}</button>
          <button class="icon-btn danger" onclick="deleteLesson('${lesson.id}')" title="حذف درس">${ICONS.trash}</button>
        </div>
      </div>
      <div class="admin-sources">
        ${lesson.sources.map(src => `
          <div class="admin-source-item">
            <div class="admin-source-head">
              <span>${ICONS.book} ${src.title}</span>
              <div class="source-actions">
                <button class="icon-btn" onclick="addChapter('${lesson.id}','${src.id}')" title="افزودن فصل">${ICONS.plus}</button>
                <button class="icon-btn danger" onclick="deleteSource('${lesson.id}','${src.id}')" title="حذف منبع">${ICONS.trash}</button>
              </div>
            </div>
            <div class="admin-chapters">
              ${src.chapters.map(ch => `
                <div class="admin-chapter-item">
                  <span>${ch.name}</span>
                  <span class="chapter-counts">${ch.done}/${ch.total}</span>
                  <button class="icon-btn danger" onclick="deleteChapter('${lesson.id}','${src.id}','${ch.id}')" title="حذف فصل">${ICONS.trash}</button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderWeeksAdmin() {
  const container = document.getElementById('weeks-container');
  const lessonId = document.getElementById('week-lesson').value;
  if (!lessonId) { container.innerHTML = ''; return; }

  const lesson = getLesson(lessonId);
  if (!lesson.weeks.length) {
    container.innerHTML = '<p class="muted">هفته‌ای ثبت نشده.</p>';
    return;
  }

  container.innerHTML = lesson.weeks.map(week => `
    <div class="admin-week">
      <div class="admin-week-head">
        <span>${week.label} — ${week.dateRange}</span>
        <div>
          <button class="btn btn-sm btn-outline" onclick="addPart('${lesson.id}','${week.id}')">+ پارت</button>
          <button class="icon-btn danger" onclick="deleteWeek('${lesson.id}','${week.id}')">${ICONS.trash}</button>
        </div>
      </div>
      <div class="admin-parts">
        ${week.parts.map(part => `
          <div class="admin-part-item">
            <span class="part-status ${part.done ? 'done' : 'pending'}">${part.done ? ICONS.check : ICONS.clock}</span>
            <span>${part.label} — ${part.day}</span>
            <button class="icon-btn" onclick="togglePart('${lesson.id}','${week.id}','${part.id}')" title="تغییر وضعیت">${ICONS.edit}</button>
            <button class="icon-btn danger" onclick="deletePart('${lesson.id}','${week.id}','${part.id}')">${ICONS.trash}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}


window.addSource = async function(lessonId) {
  const title = prompt('نام منبع:');
  if (!title) return;
  const lesson = getLesson(lessonId);
  lesson.sources.push({ id: uid(), title, chapters: [] });
  await saveDB();
  renderLessonsList();
  populateLessonSelects();
};

window.addChapter = async function(lessonId, sourceId) {
  const name = prompt('نام فصل:');
  const total = parseInt(prompt('تعداد کل تست فصل:'));
  if (!name || !total) return;
  const source = getSource(lessonId, sourceId);
  source.chapters.push({ id: uid(), name, total, done: 0 });
  await saveDB();
  renderLessonsList();
  populateLessonSelects();
};

window.deleteLesson = async function(lessonId) {
  if (!confirm('درس حذف شود؟')) return;
  db.lessons = db.lessons.filter(l => l.id !== lessonId);
  await saveDB();
  renderLessonsList();
  populateLessonSelects();
  renderWeeksAdmin();
};

window.deleteSource = async function(lessonId, sourceId) {
  if (!confirm('منبع حذف شود؟')) return;
  const lesson = getLesson(lessonId);
  lesson.sources = lesson.sources.filter(s => s.id !== sourceId);
  await saveDB();
  renderLessonsList();
  populateLessonSelects();
};

window.deleteChapter = async function(lessonId, sourceId, chapterId) {
  if (!confirm('فصل حذف شود؟')) return;
  const source = getSource(lessonId, sourceId);
  source.chapters = source.chapters.filter(c => c.id !== chapterId);
  await saveDB();
  renderLessonsList();
  populateLessonSelects();
};

window.addPart = async function(lessonId, weekId) {
  const label = prompt('نام پارت (مثلاً پارت اول):');
  const day = prompt('روز (مثلاً شنبه ۲۴ مرداد):');
  if (!label || !day) return;
  const lesson = getLesson(lessonId);
  const week = lesson.weeks.find(w => w.id === weekId);
  week.parts.push({ id: uid(), label, day, done: false });
  await saveDB();
  renderWeeksAdmin();
};

window.togglePart = async function(lessonId, weekId, partId) {
  const lesson = getLesson(lessonId);
  const week = lesson.weeks.find(w => w.id === weekId);
  const part = week.parts.find(p => p.id === partId);
  part.done = !part.done;
  await saveDB();
  renderWeeksAdmin();
};

window.deletePart = async function(lessonId, weekId, partId) {
  if (!confirm('پارت حذف شود؟')) return;
  const lesson = getLesson(lessonId);
  const week = lesson.weeks.find(w => w.id === weekId);
  week.parts = week.parts.filter(p => p.id !== partId);
  await saveDB();
  renderWeeksAdmin();
};

window.deleteWeek = async function(lessonId, weekId) {
  if (!confirm('هفته حذف شود؟')) return;
  const lesson = getLesson(lessonId);
  lesson.weeks = lesson.weeks.filter(w => w.id !== weekId);
  await saveDB();
  renderWeeksAdmin();
};


function populateLessonSelects() {
  const options = db.lessons.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
  document.getElementById('week-lesson').innerHTML = options;
  document.getElementById('log-lesson').innerHTML = options;
  populateSourceSelect();
  renderWeeksAdmin();
}

function populateSourceSelect() {
  const lessonId = document.getElementById('log-lesson').value;
  const lesson = getLesson(lessonId);
  const options = lesson ? lesson.sources.map(s => `<option value="${s.id}">${s.title}</option>`).join('') : '';
  document.getElementById('log-source').innerHTML = options;
  populateChapterSelect();
}

function populateChapterSelect() {
  const lessonId = document.getElementById('log-lesson').value;
  const sourceId = document.getElementById('log-source').value;
  const source = getSource(lessonId, sourceId);
  const options = source ? source.chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('') : '';
  document.getElementById('log-chapter').innerHTML = options;
}
