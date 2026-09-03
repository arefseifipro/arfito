// view.js - صفحه عمومی (بدون لاگین)
let viewUserId = null;
let viewLinkId = null;

// ====== گرفتن لینک آیدی از URL ======
function getLinkIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('link');
}

// ====== پیدا کردن کاربر از روی لینک ======
async function findUserByLink() {
    viewLinkId = getLinkIdFromUrl();
    
    if (!viewLinkId) {
        showError('لینک معتبر نیست');
        return;
    }
    
    const { data, error } = await sb
        .from('public_links')
        .select('user_id')
        .eq('link_id', viewLinkId)
        .single();
    
    if (error || !data) {
        showError('لینک پیدا نشد');
        return;
    }
    
    viewUserId = data.user_id;
    await loadProfile();
    await loadLessons();
    await loadLessonSelect();
}

// ====== بارگذاری پروفایل ======
async function loadProfile() {
    const { data, error } = await sb
        .from('profiles')
        .select('first_name, last_name, grade, field')
        .eq('id', viewUserId)
        .single();
    
    if (error || !data) {
        document.getElementById('profile-info').textContent = 'کاربر ناشناس';
        return;
    }
    
    document.getElementById('profile-info').textContent =
        `${data.first_name} ${data.last_name} | ${data.grade} | ${data.field}`;
}

// ====== TAB SWITCH ======
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');
        
        if (tab.dataset.tab === 'tab2') loadLessonSelect();
    });
});

// ====== TOGGLE ACCORDION ======
function toggleAccordion(lessonId) {
    const body = document.getElementById('lesson-body-' + lessonId);
    const toggle = document.getElementById('toggle-' + lessonId);
    body.classList.toggle('open');
    toggle.classList.toggle('open');
}

// ====== LOAD LESSONS (فقط نمایشی) ======
async function loadLessons() {
    const { data, error } = await sb
        .from('lessons')
        .select('*')
        .eq('user_id', viewUserId)
        .order('created_at');

    const container = document.getElementById('lessons-container');
    if (error || !data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">هنوز درسی اضافه نشده</div>';
        return;
    }

    container.innerHTML = '';
    for (const lesson of data) {
        container.appendChild(await createLessonCard(lesson));
    }
}

async function createLessonCard(lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    
    const iconData = LESSON_ICONS.find(i => i.id === lesson.icon_id) || LESSON_ICONS[0];
    
    // بارگذاری منابع
    const { data: sources } = await sb
        .from('sources')
        .select('*')
        .eq('user_id', viewUserId)
        .eq('lesson_id', lesson.id)
        .order('created_at');
    
    let sourcesHTML = '';
    let totalTests = 0;
    let doneTests = 0;
    
    if (sources && sources.length > 0) {
        sourcesHTML = `<div class="sources-section"><div class="sources-header"><h4>${UI_ICONS.book} منابع (${sources.length})</h4></div>`;
        
        for (const source of sources) {
            totalTests += source.total_tests || 0;
            doneTests += source.done_tests || 0;
            
            // بارگذاری فصل‌ها
            const { data: chapters } = await sb
                .from('chapters')
                .select('*')
                .eq('source_id', source.id)
                .order('created_at');
            
            let chaptersHTML = '';
            if (chapters && chapters.length > 0) {
                chaptersHTML = '<div class="chapters-list">';
                chaptersHTML += chapters.map(ch => {
                    const total = ch.total_tests || 0;
                    const done = ch.done_tests || 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return `
                        <div class="chapter-item">
                            <span class="chapter-title">${UI_ICONS.chapter} ${ch.title}</span>
                            <div class="chapter-stats">
                                <span class="stat-done">${UI_ICONS.done} ${done}</span>
                                <span class="stat-remaining">${UI_ICONS.remaining} ${total - done}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${pct}%"></div>
                                </div>
                                <span>${pct}%</span>
                            </div>
                        </div>
                    `;
                }).join('');
                chaptersHTML += '</div>';
            }
            
            const remaining = (source.total_tests || 0) - (source.done_tests || 0);
            sourcesHTML += `
                <div class="source-item">
                    <div class="source-header">
                        <div>
                            <div class="source-title">${UI_ICONS.book} ${source.title}</div>
                            <div class="source-stats-row">
                                <span class="stat">${UI_ICONS.total} کل: ${source.total_tests || 0}</span>
                                <span class="stat stat-done">${UI_ICONS.done} زده: ${source.done_tests || 0}</span>
                                <span class="stat stat-remaining">${UI_ICONS.remaining} مانده: ${remaining}</span>
                            </div>
                        </div>
                    </div>
                    ${chaptersHTML}
                </div>
            `;
        }
        sourcesHTML += '</div>';
    } else {
        sourcesHTML = `<div class="sources-section"><div class="sources-header"><h4>${UI_ICONS.book} منابع</h4></div><div class="empty-state" style="padding: 16px;">هنوز منبعی اضافه نشده</div></div>`;
    }
    
    const progress = totalTests > 0 ? Math.round((doneTests / totalTests) * 100) : 0;
    
    card.innerHTML = `
        <div class="lesson-card-header" onclick="toggleAccordion(${lesson.id})">
            <div class="lesson-info">
                <div class="lesson-icon">${iconData.svg}</div>
                <div>
                    <div class="lesson-name">${lesson.name}</div>
                    <div class="lesson-summary">
                        ${UI_ICONS.total} ${totalTests} تست | ${UI_ICONS.done} ${doneTests} زده | ${UI_ICONS.progress} ${progress}%
                    </div>
                </div>
            </div>
            <button class="accordion-toggle" id="toggle-${lesson.id}" onclick="toggleAccordion(${lesson.id})">▼</button>
        </div>
        <div class="lesson-body" id="lesson-body-${lesson.id}">
            <div class="lesson-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    <span>${UI_ICONS.progress} پیشرفت کل</span>
                    <span>${progress}%</span>
                </div>
            </div>
            ${sourcesHTML}
        </div>
    `;
    
    return card;
}

// ====== TAB 2: WEEKS (فقط نمایشی) ======
async function loadLessonSelect() {
    const { data } = await sb
        .from('lessons')
        .select('id, name')
        .eq('user_id', viewUserId)
        .order('created_at');
    
    const select = document.getElementById('week-lesson-select');
    select.innerHTML = '<option value="">-- انتخاب کنید --</option>';
    
    if (data) {
        data.forEach(lesson => {
            select.innerHTML += `<option value="${lesson.id}">${lesson.name}</option>`;
        });
    }
}

async function loadWeeksForLesson(lessonId) {
    const container = document.getElementById('weeks-container');
    
    if (!lessonId) {
        container.innerHTML = '<div class="empty-state">یک درس را انتخاب کن</div>';
        return;
    }
    
    const { data: weeks } = await sb
        .from('weeks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('week_number');
    
    if (!weeks || weeks.length === 0) {
        container.innerHTML = '<div class="empty-state">${UI_ICONS.week} هنوز هفته‌ای برای این درس تعریف نشده</div>';
        return;
    }
    
    container.innerHTML = '';
    
    for (const week of weeks) {
        const weekCard = document.createElement('div');
        weekCard.className = 'week-card';
        
        const { data: parts } = await sb
            .from('parts')
            .select('*')
            .eq('week_id', week.id)
            .order('part_number');
        
        let partsHTML = '';
        if (parts && parts.length > 0) {
            partsHTML = '<div class="parts-grid">';
            partsHTML += parts.map(part => `
                <div class="part-card ${part.is_done ? 'done' : ''}">
                    <div class="part-header">
                        <span class="part-number">${UI_ICONS.part} پارت ${part.part_number}</span>
                        <span class="part-done-badge">${part.is_done ? '✓ انجام شده' : ''}</span>
                    </div>
                    <div class="part-day">${UI_ICONS.calendar} ${part.day_name} - ${part.day_date}</div>
                    <div class="part-tests">
                        <span>${UI_ICONS.test} تست زده: ${part.tests_done || 0}</span>
                    </div>
                </div>
            `).join('');
            partsHTML += '</div>';
        }
        
        weekCard.innerHTML = `
            <div class="week-header">
                <div>
                    <div class="week-title">${UI_ICONS.week} هفته ${week.week_number}</div>
                    <div class="week-date">${UI_ICONS.calendar} ${week.start_date} تا ${week.end_date}</div>
                </div>
            </div>
            ${partsHTML || '<div class="empty-state" style="padding: 16px;">${UI_ICONS.part} هنوز پارتی اضافه نشده</div>'}
        `;
        
        container.appendChild(weekCard);
    }
}

// ====== نمایش خطا ======
function showError(msg) {
    document.getElementById('initial-loading').style.display = 'none';
    document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;">
            <div style="font-size:48px;margin-bottom:16px;">😕</div>
            <h2 style="color:#1e293b;margin-bottom:8px;">${msg}</h2>
            <p style="color:#64748b;">لینک معتبر نیست یا حذف شده است.</p>
        </div>
    `;
}

// ====== لودینگ اولیه ======
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loading = document.getElementById('initial-loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }
    }, 800);
    
    findUserByLink();
});
