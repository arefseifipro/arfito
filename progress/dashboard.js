
let currentUser = null;
let selectedIcon = null;
let currentEditId = null;
let currentEditType = null;


function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = JSON.parse(user);
}

document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');
        
        if (tab.dataset.tab === 'tab2') loadLessonSelect();
    });
});


function toggleAccordion(lessonId) {
    const body = document.getElementById('lesson-body-' + lessonId);
    const toggle = document.getElementById('toggle-' + lessonId);
    body.classList.toggle('open');
    toggle.classList.toggle('open');
}

async function loadLessons() {
    const { data, error } = await sb
        .from('lessons')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at');

    const container = document.getElementById('lessons-container');
    if (error || !data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">هنوز درسی اضافه نکردی. رو «درس جدید» کلیک کن.</div>';
        return;
    }

    container.innerHTML = '';
    for (const lesson of data) {
        container.appendChild(await createLessonCard(lesson));
    }
}

async function loadinfos() {
    const { data, error } = await sb
        .from('profiles')
        .select('first_name, last_name, grade, field')
        .eq('id', currentUser.id)
        .single();

    console.log('currentUser.id =', currentUser.id);
    console.log('data =', data);
    console.log('error =', error);

    if (error) {
        console.error(error);
        return;
    }

    if (!data) {
        console.log('No profile found');
        return;
    }

    document.getElementById('profile-info').textContent =
        `${data.first_name} ${data.last_name} | ${data.grade} | ${data.field}`;
}

async function createLessonCard(lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    
    const iconData = LESSON_ICONS.find(i => i.id === lesson.icon_id) || LESSON_ICONS[0];
    
   
    const { data: sources } = await sb
        .from('sources')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('lesson_id', lesson.id)
        .order('created_at');
    
    let sourcesHTML = '';
    let totalTests = 0;
    let doneTests = 0;
    
    if (sources && sources.length > 0) {
        sourcesHTML = `<div class="sources-section"><div class="sources-header"><h4>${UI_ICONS.book} منابع (${sources.length})</h4><button class="btn-sm" onclick="openSourceModal(${lesson.id})">${UI_ICONS.add} منبع</button></div>`;
        
        for (const source of sources) {
            totalTests += source.total_tests || 0;
            doneTests += source.done_tests || 0;
            
           
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
                                <button class="btn-sm" onclick="editChapter(${ch.id})">${UI_ICONS.edit}</button>
                                <button class="btn-sm danger" onclick="deleteChapter(${ch.id})">${UI_ICONS.trash}</button>
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
                        <div class="source-actions">
                            <button class="btn-sm success" onclick="addTestsToSource(${source.id})">${UI_ICONS.plus} افزودن تست</button>
                            <button class="btn-sm" onclick="openChapterModal(${source.id})">${UI_ICONS.chapter} فصل</button>
                            <button class="btn-sm" onclick="editSource(${source.id})">${UI_ICONS.edit}</button>
                            <button class="btn-sm danger" onclick="deleteSource(${source.id})">${UI_ICONS.trash}</button>
                        </div>
                    </div>
                    ${chaptersHTML}
                </div>
            `;
        }
        sourcesHTML += '</div>';
    } else {
        sourcesHTML = `<div class="sources-section"><div class="sources-header"><h4>${UI_ICONS.book} منابع</h4><button class="btn-sm" onclick="openSourceModal(${lesson.id})">${UI_ICONS.add} منبع</button></div><div class="empty-state" style="padding: 16px;">هنوز منبعی اضافه نشده</div></div>`;
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
            <div class="lesson-card-actions" onclick="event.stopPropagation()">
                <button class="btn-sm" onclick="editLesson(${lesson.id})">${UI_ICONS.edit}</button>
                <button class="btn-sm danger" onclick="deleteLesson(${lesson.id})">${UI_ICONS.trash}</button>
                <button class="accordion-toggle" id="toggle-${lesson.id}" onclick="toggleAccordion(${lesson.id})">▼</button>
            </div>
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



function openLessonModal(lesson = null) {
    currentEditType = 'lesson';
    currentEditId = lesson ? lesson.id : null;
    selectedIcon = lesson ? lesson.icon_id : null;
    
    document.getElementById('modal-title').textContent = lesson ? 'ویرایش درس' : 'درس جدید';
    
    document.getElementById('modal-fields').innerHTML = `
        <div class="form-group">
            <label>نام درس</label>
            <input type="text" id="lesson-name" placeholder="مثلاً: ریاضی" value="${lesson ? lesson.name : ''}" required>
        </div>
        <div class="form-group">
            <label>آیکون درس</label>
            <div class="icon-picker" id="icon-picker"></div>
        </div>
    `;
    
    const picker = document.getElementById('icon-picker');
    picker.innerHTML = LESSON_ICONS.map(icon => `
        <div class="icon-option ${selectedIcon === icon.id ? 'selected' : ''}" 
             data-icon-id="${icon.id}" onclick="selectIcon('${icon.id}')">
            ${icon.svg}
            <span>${icon.label}</span>
        </div>
    `).join('');
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function editLesson(id) {
    sb.from('lessons').select('*').eq('id', id).single().then(({ data }) => {
        openLessonModal(data);
    });
}


function openSourceModal(lessonId, source = null) {
    currentEditType = 'source';
    currentEditId = source ? source.id : null;
    
    document.getElementById('modal-title').textContent = source ? 'ویرایش منبع' : 'منبع جدید';
    
    document.getElementById('modal-fields').innerHTML = `
        <input type="hidden" id="source-lesson-id" value="${lessonId}">
        <div class="form-group">
            <label>عنوان منبع</label>
            <input type="text" id="source-title" placeholder="مثلاً: کتاب تست ریاضی" value="${source ? source.title : ''}" required>
        </div>
        <div class="form-group">
            <label>تعداد کل تست‌ها</label>
            <input type="number" id="source-total" placeholder="مثلاً: 100" value="${source ? source.total_tests : 0}" min="0">
        </div>
    `;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function editSource(id) {
    sb.from('sources').select('*').eq('id', id).single().then(({ data }) => {
        openSourceModal(data.lesson_id, data);
    });
}


function addTestsToSource(sourceId) {
    currentEditType = 'add-tests';
    currentEditId = sourceId;
    
    document.getElementById('modal-title').textContent = 'افزودن تست زده شده';
    
    document.getElementById('modal-fields').innerHTML = `
        <input type="hidden" id="add-source-id" value="${sourceId}">
        <div class="form-group">
            <label>تعداد تست جدیدی که زدی</label>
            <input type="number" id="add-tests-count" placeholder="مثلاً: 20" min="1" required>
        </div>
        <div class="form-group">
            <label>انتخاب فصل (اختیاری)</label>
            <select id="add-chapter-select">
                <option value="">بدون فصل خاص</option>
            </select>
        </div>
    `;
    

    sb.from('chapters').select('id, title').eq('source_id', sourceId).then(({ data }) => {
        const select = document.getElementById('add-chapter-select');
        if (data) {
            data.forEach(ch => {
                select.innerHTML += `<option value="${ch.id}">${ch.title}</option>`;
            });
        }
    });
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}


function openChapterModal(sourceId, chapter = null) {
    currentEditType = 'chapter';
    currentEditId = chapter ? chapter.id : null;
    
    document.getElementById('modal-title').textContent = chapter ? 'ویرایش فصل' : 'فصل جدید';
    
    document.getElementById('modal-fields').innerHTML = `
        <input type="hidden" id="chapter-source-id" value="${sourceId}">
        <div class="form-group">
            <label>عنوان فصل</label>
            <input type="text" id="chapter-title" placeholder="مثلاً: فصل ۱ - تابع" value="${chapter ? chapter.title : ''}" required>
        </div>
        <div class="form-group">
            <label>تعداد کل تست‌ها</label>
            <input type="number" id="chapter-total" placeholder="مثلاً: 50" value="${chapter ? chapter.total_tests : 0}" min="0">
        </div>
        <div class="form-group">
            <label>تست‌های زده شده</label>
            <input type="number" id="chapter-done" placeholder="مثلاً: 10" value="${chapter ? chapter.done_tests : 0}" min="0">
        </div>
    `;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function editChapter(id) {
    sb.from('chapters').select('*').eq('id', id).single().then(({ data }) => {
        openChapterModal(data.source_id, data);
    });
}


function openWeekModal(lessonId, week = null) {
    currentEditType = 'week';
    currentEditId = week ? week.id : null;
    
    document.getElementById('modal-title').textContent = week ? 'ویرایش هفته' : 'هفته جدید';
    
    document.getElementById('modal-fields').innerHTML = `
        <input type="hidden" id="week-lesson-id" value="${lessonId}">
        <div class="form-group">
            <label>شماره هفته</label>
            <input type="number" id="week-number" placeholder="مثلاً: 1" value="${week ? week.week_number : ''}" required>
        </div>
        <div class="form-group">
            <label>تاریخ شروع</label>
            <input type="text" id="week-start" placeholder="مثلاً: 1404/01/01" value="${week ? week.start_date : ''}" required>
        </div>
        <div class="form-group">
            <label>تاریخ پایان</label>
            <input type="text" id="week-end" placeholder="مثلاً: 1404/01/07" value="${week ? week.end_date : ''}" required>
        </div>
    `;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}


function openPartModal(weekId, part = null) {
    currentEditType = 'part';
    currentEditId = part ? part.id : null;
    
    document.getElementById('modal-title').textContent = part ? 'ویرایش پارت' : 'پارت جدید';
    
    document.getElementById('modal-fields').innerHTML = `
        <input type="hidden" id="part-week-id" value="${weekId}">
        <div class="form-group">
            <label>شماره پارت</label>
            <input type="number" id="part-number" placeholder="مثلاً: 1" value="${part ? part.part_number : ''}" required>
        </div>
        <div class="form-group">
            <label>نام روز</label>
            <input type="text" id="part-day" placeholder="مثلاً: شنبه" value="${part ? part.day_name : ''}" required>
        </div>
        <div class="form-group">
            <label>تاریخ روز</label>
            <input type="text" id="part-date" placeholder="مثلاً: 1404/01/01" value="${part ? part.day_date : ''}" required>
        </div>
        <div class="form-group">
            <label>تعداد تست‌های زده شده</label>
            <input type="number" id="part-tests" placeholder="مثلاً: 20" value="${part ? part.tests_done : 0}" min="0">
        </div>
    `;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function selectIcon(iconId) {
    selectedIcon = iconId;
    document.querySelectorAll('.icon-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.iconId === iconId);
    });
}


function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    currentEditId = null;
    currentEditType = null;
}


document.getElementById('modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        switch (currentEditType) {
            case 'lesson': {
                const name = document.getElementById('lesson-name').value;
                if (!selectedIcon) {
                    alert('لطفاً یک آیکون انتخاب کن');
                    return;
                }
                
                if (currentEditId) {
                    await sb.from('lessons').update({ name, icon_id: selectedIcon }).eq('id', currentEditId);
                } else {
                    await sb.from('lessons').insert([{
                        user_id: currentUser.id,
                        name,
                        icon_id: selectedIcon
                    }]);
                }
                break;
            }
            case 'source': {
                const lessonId = document.getElementById('source-lesson-id').value;
                const title = document.getElementById('source-title').value;
                const total = parseInt(document.getElementById('source-total').value) || 0;
                
                if (currentEditId) {
                    await sb.from('sources').update({ title, total_tests: total }).eq('id', currentEditId);
                } else {
                    await sb.from('sources').insert([{
                        user_id: currentUser.id,
                        lesson_id: lessonId,
                        title,
                        total_tests: total
                    }]);
                }
                break;
            }
            case 'add-tests': {
                const sourceId = parseInt(document.getElementById('add-source-id').value);
                const addCount = parseInt(document.getElementById('add-tests-count').value) || 0;
                const chapterId = document.getElementById('add-chapter-select').value;
                
                if (addCount <= 0) {
                    alert('تعداد معتبر وارد کن');
                    return;
                }
                
               
                const { data: source } = await sb.from('sources').select('*').eq('id', sourceId).single();
                if (source) {
                    const newDone = (source.done_tests || 0) + addCount;
                    await sb.from('sources').update({ done_tests: newDone }).eq('id', sourceId);
                }
                
    
                if (chapterId) {
                    const { data: chapter } = await sb.from('chapters').select('*').eq('id', chapterId).single();
                    if (chapter) {
                        const newDone = (chapter.done_tests || 0) + addCount;
                        await sb.from('chapters').update({ done_tests: newDone }).eq('id', chapterId);
                    }
                }
                break;
            }
            case 'chapter': {
                const sourceId = document.getElementById('chapter-source-id').value;
                const title = document.getElementById('chapter-title').value;
                const total = parseInt(document.getElementById('chapter-total').value) || 0;
                const done = parseInt(document.getElementById('chapter-done').value) || 0;
                
                if (currentEditId) {
                    await sb.from('chapters').update({ title, total_tests: total, done_tests: done }).eq('id', currentEditId);
                } else {
                    await sb.from('chapters').insert([{
                        user_id: currentUser.id,
                        source_id: sourceId,
                        title,
                        total_tests: total,
                        done_tests: done
                    }]);
                }
                break;
            }
            case 'week': {
                const lessonId = document.getElementById('week-lesson-id').value;
                const number = parseInt(document.getElementById('week-number').value);
                const start = document.getElementById('week-start').value;
                const end = document.getElementById('week-end').value;
                
                if (currentEditId) {
                    await sb.from('weeks').update({ week_number: number, start_date: start, end_date: end }).eq('id', currentEditId);
                } else {
                    await sb.from('weeks').insert([{
                        user_id: currentUser.id,
                        lesson_id: lessonId,
                        week_number: number,
                        start_date: start,
                        end_date: end
                    }]);
                }
                break;
            }
            case 'part': {
                const weekId = document.getElementById('part-week-id').value;
                const number = parseInt(document.getElementById('part-number').value);
                const day = document.getElementById('part-day').value;
                const date = document.getElementById('part-date').value;
                const tests = parseInt(document.getElementById('part-tests').value) || 0;
                
                if (currentEditId) {
                    await sb.from('parts').update({ 
                        part_number: number, 
                        day_name: day, 
                        day_date: date,
                        tests_done: tests
                    }).eq('id', currentEditId);
                } else {
                    await sb.from('parts').insert([{
                        user_id: currentUser.id,
                        week_id: weekId,
                        part_number: number,
                        day_name: day,
                        day_date: date,
                        tests_done: tests
                    }]);
                }
                break;
            }
        }
        
        closeModal();
        await loadLessons();
        await loadLessonSelect();
    } catch (err) {
        alert('خطا: ' + err.message);
    }
});


async function deleteLesson(id) {
    if (!confirm('آیا از حذف این درس مطمئن هستی؟ همه منابع و فصل‌ها هم حذف می‌شوند.')) return;
    await sb.from('lessons').delete().eq('id', id);
    await loadLessons();
    await loadLessonSelect();
}

async function deleteSource(id) {
    if (!confirm('آیا از حذف این منبع مطمئن هستی؟')) return;
    await sb.from('sources').delete().eq('id', id);
    await loadLessons();
}

async function deleteChapter(id) {
    if (!confirm('آیا از حذف این فصل مطمئن هستی؟')) return;
    await sb.from('chapters').delete().eq('id', id);
    await loadLessons();
}

async function deleteWeek(id) {
    if (!confirm('آیا از حذف این هفته مطمئن هستی؟')) return;
    await sb.from('weeks').delete().eq('id', id);
    const select = document.getElementById('week-lesson-select');
    await loadWeeksForLesson(select.value);
}

async function deletePart(id) {
    if (!confirm('آیا از حذف این پارت مطمئن هستی؟')) return;
    await sb.from('parts').delete().eq('id', id);
    const select = document.getElementById('week-lesson-select');
    await loadWeeksForLesson(select.value);
}


async function loadLessonSelect() {
    const { data } = await sb
        .from('lessons')
        .select('id, name')
        .eq('user_id', currentUser.id)
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
    showLoading()
    if (!lessonId) {
        container.innerHTML = '<div class="empty-state">یک درس را انتخاب کن</div>';
        return;
    }
    showLoading()
    const { data: weeks } = await sb
        .from('weeks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('week_number');
    hideLoading();
    if (!weeks || weeks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                ${UI_ICONS.week} هنوز هفته‌ای برای این درس تعریف نشده
                <br><br>
                <button class="btn-primary" onclick="openWeekModal(${lessonId})">${UI_ICONS.add} هفته جدید</button>
            </div>
        `;
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
                        <button class="btn-sm" onclick="togglePart(${part.id}, ${!part.is_done})">
                            ${part.is_done ? UI_ICONS.check : UI_ICONS.uncheck}
                        </button>
                    </div>
                    <div class="part-day">${UI_ICONS.calendar} ${part.day_name} - ${part.day_date}</div>
                    <div class="part-tests">
                        <span>${UI_ICONS.test} تست زده:</span>
                        <input type="number" value="${part.tests_done || 0}" min="0" 
                               onchange="updatePartTests(${part.id}, this.value)">
                    </div>
                    <div class="part-actions">
                        <button class="btn-sm" onclick="editPart(${part.id})">${UI_ICONS.edit}</button>
                        <button class="btn-sm danger" onclick="deletePart(${part.id})">${UI_ICONS.trash}</button>
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
                <div class="lesson-actions">
                    <button class="btn-sm" onclick="openPartModal(${week.id})">${UI_ICONS.add} پارت</button>
                    <button class="btn-sm" onclick="editWeek(${week.id})">${UI_ICONS.edit}</button>
                    <button class="btn-sm danger" onclick="deleteWeek(${week.id})">${UI_ICONS.trash}</button>
                </div>
            </div>
            ${partsHTML || '<div class="empty-state" style="padding: 16px;">${UI_ICONS.part} هنوز پارتی اضافه نشده</div>'}
        `;
        
        container.appendChild(weekCard);
    }
}

function editWeek(id) {
    sb.from('weeks').select('*').eq('id', id).single().then(({ data }) => {
        openWeekModal(data.lesson_id, data);
    });
}

function editPart(id) {
    sb.from('parts').select('*').eq('id', id).single().then(({ data }) => {
        openPartModal(data.week_id, data);
    });
}

async function togglePart(id, isDone) {
    await sb.from('parts').update({ is_done: isDone }).eq('id', id);
    const select = document.getElementById('week-lesson-select');
    await loadWeeksForLesson(select.value);
}

async function updatePartTests(id, tests) {
    await sb.from('parts').update({ tests_done: parseInt(tests) || 0 }).eq('id', id);
    await loadLessons();
}



document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

function toggleHelpSlide() {
    const slide = document.getElementById('help-slide');
    const overlay = document.getElementById('help-overlay');
    slide.classList.toggle('open');
    overlay.classList.toggle('open');
    
   
    document.body.style.overflow = slide.classList.contains('open') ? 'hidden' : '';
}

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
});

function showLoading() {
    const existing = document.querySelector('.loading-overlay');
    if (existing) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner">
            <div class="ring"></div>
            <div class="ring"></div>
            <div class="ring"></div>
            <div class="ring"></div>
        </div>
        <div class="loading-text">در حال بارگذاری...</div>
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay && overlay.id !== 'initial-loading') {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

function showSkeleton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-item">
                <div class="skeleton-line wide"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-line wide"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
            </div>
            <div class="skeleton-item">
                <div class="skeleton-line wide"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
            </div>
        </div>
    `;
}

function openHelp() {
    toggleHelpSlide();
}

function showAbout() {
    alert('داشبورد پروگرس \nنسخه ۱.۰\nساخته شده با ❤️');
}

function generateLinkId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
document.getElementById('copy-view-link').addEventListener('click', async function() {
    const { data: { user } } = await sb.auth.getUser();
    const userId = currentUser.id;
    let publicLink = localStorage.getItem(`public_link_${userId}`);

    if (!publicLink) {
        const linkId = generateLinkId();

        const { error } = await sb
            .from('public_links')
            .upsert({ 
                user_id: userId, 
                link_id: linkId,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error saving public link:', error);
            showToast('خطا در ایجاد لینک. دوباره تلاش کنید.', 'error');
            return;
        }

   
      publicLink = `${window.location.origin}/progress/view.html?link=${linkId}`;
        localStorage.setItem(`public_link_${userId}`, publicLink);
    }

    openShareModal(publicLink);
});

function openShareModal(link) {
    const modal = document.getElementById('share-modal');
    if (!modal) {
        console.error('مودال وجود نداره!');
        return;
    }
    

    document.getElementById('share-link').value = link;
    

    modal.style.display = 'flex';
}

function closeShareModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('share-modal').style.display = 'none';
}

async function copyShareLink() {
    const link = document.getElementById('share-link');
    try {
        await navigator.clipboard.writeText(link.value);
        const btn = document.querySelector('.copy-btn span');
        btn.textContent = '✓ کپی شد';
        setTimeout(() => btn.textContent = 'کپی', 2000);
    } catch (err) {
        link.select();
        document.execCommand('copy');
        showToast('✅ لینک کپی شد!', 'success');
    }
}

function shareVia(platform) {
    const link = document.getElementById('share-link').value;
    const text = encodeURIComponent('پیشرفت درس‌هات رو ببین!');
    
    let url = '';
    if (platform === 'telegram') {
        url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    } else if (platform === 'whatsapp') {
        url = `https://wa.me/?text=${text}%20${encodeURIComponent(link)}`;
    }
    
    if (url) window.open(url, '_blank');
}





checkAuth();
loadinfos();
loadLessons();
loadLessonSelect();
