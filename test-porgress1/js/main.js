document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  renderLessons();
});

function renderLessons() {
  const container = document.getElementById('lessons-container');
  if (!db.lessons.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ICONS.folder}</div>
        <p>هنوز درسی ثبت نشده است.</p>
      </div>`;
    return;
  }

  container.innerHTML = db.lessons.map(lesson => {
    const totals = lessonTotals(lesson);
    return `
      <section class="lesson-card ${lesson.id === 'open' ? 'open' : ''}" data-id="${lesson.id}" style="--lesson-color: ${lesson.color}">
        <button class="lesson-toggle" onclick="toggleLesson('${lesson.id}')">
          <div class="lesson-header">
            <div class="lesson-icon" style="background: ${lesson.color}1a; color: ${lesson.color}">
              ${ICONS[lesson.icon] || ICONS.book}
            </div>
            <div class="lesson-info">
              <h2 class="lesson-name">${lesson.name}</h2>
              <span class="lesson-meta">
                <span class="meta-item">${ICONS.layers} ${lesson.sources.length} منبع</span>
                <span class="meta-item">${ICONS.target} ${totals.percent}٪ پیشرفت</span>
              </span>
            </div>
            <div class="lesson-progress">
              <div class="progress-ring" style="--progress: ${totals.percent}">
                <span>${totals.percent}٪</span>
              </div>
            </div>
            <span class="lesson-chevron">${ICONS.chevronDown}</span>
          </div>
        </button>

        <div class="lesson-body">
          ${renderWeeks(lesson)}
          <div class="sources-section">
            <h3 class="section-title">${ICONS.book} منابع</h3>
            ${lesson.sources.map(src => renderSource(lesson.id, src)).join('')}
          </div>
        </div>
      </section>`;
  }).join('');


  document.querySelectorAll('.source-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.source-card');
      card.classList.toggle('open');
    });
  });
}


window.toggleLesson = function(lessonId) {
  const card = document.querySelector(`.lesson-card[data-id="${lessonId}"]`);
  if (card) {
    card.classList.toggle('open');
  }
};



  document.querySelectorAll('.source-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.source-card');
      card.classList.toggle('open');
    });
  });


function renderWeeks(lesson) {
  if (!lesson.weeks || !lesson.weeks.length) return '';
  return `
    <div class="weeks-section">
      ${lesson.weeks.map(week => `
        <div class="week-block">
          <div class="week-header">
            <span class="week-label">${ICONS.calendar || ''} ${week.label}</span>
            <span class="week-range">${week.dateRange}</span>
          </div>
          <div class="parts-grid">
            ${week.parts.map(part => `
              <div class="part-item ${part.done ? 'done' : 'pending'}">
                <span class="part-status">${part.done ? ICONS.check : ICONS.clock}</span>
                <div class="part-info">
                  <span class="part-label">${part.label}</span>
                  <span class="part-day">${part.day}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderSource(lessonId, source) {
  const totals = sourceTotals(source);
  return `
    <div class="source-card">
      <button class="source-toggle">
        <span class="source-icon">${ICONS.book}</span>
        <span class="source-title">${source.title}</span>
        <span class="source-total">${totals.done}/${totals.total}</span>
        <span class="chevron">${ICONS.chevronDown}</span>
      </button>
      <div class="source-body">
        ${source.chapters.map(ch => {
          const pct = ch.total > 0 ? Math.round((ch.done / ch.total) * 100) : 0;
          return `
            <div class="chapter-row">
              <div class="chapter-info">
                <span class="chapter-name">${ch.name}</span>
                <span class="chapter-counts">${ch.done} زده / ${ch.total - ch.done} نزده</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${pct}%"></div>
              </div>
              <span class="progress-pct">${pct}٪</span>
            </div>`;
        }).join('')}
        <div class="source-summary">
          <div class="summary-row">
            <span>کل منبع</span>
            <span>${totals.done} زده / ${totals.remaining} نزده</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${totals.percent}%"></div>
          </div>
          <span class="progress-pct">${totals.percent}٪</span>
        </div>
      </div>
    </div>`;
}
