// ====== نمایش صفحه View عمومی ======
function showPublicView() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('public-view').style.display = 'block';
    loadPublicData();
}

function goToDashboard() {
    document.getElementById('public-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
}

async function loadPublicData() {
    showSkeleton('public-lessons');
    
    const { data: lessons } = await sb
        .from('lessons')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at');
    
    if (!lessons || lessons.length === 0) {
        document.getElementById('public-lessons').innerHTML = '<div class="empty-state">هنوز درسی ثبت نشده</div>';
        return;
    }
    
    let totalLessons = lessons.length;
    let totalWeeks = 0;
    let totalTests = 0;
    
    let lessonsHTML = '';
    
    for (const lesson of lessons) {
        const { data: sources } = await sb
            .from('sources')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('lesson_id', lesson.id);
        
        let lessonTotal = 0;
        let lessonDone = 0;
        
        if (sources && sources.length > 0) {
            for (const source of sources) {
                lessonTotal += source.total_tests || 0;
                lessonDone += source.done_tests || 0;
            }
        }
        
        // هفته‌ها
        const { data: weeks } = await sb
            .from('weeks')
            .select('*')
            .eq('lesson_id', lesson.id);
        
        if (weeks) totalWeeks += weeks.length;
        
        // تست‌های پارت‌ها
        if (weeks && weeks.length > 0) {
            for (const week of weeks) {
                const { data: parts } = await sb
                    .from('parts')
                    .select('*')
                    .eq('week_id', week.id);
                
                if (parts) {
                    for (const part of parts) {
                        totalTests += part.tests_done || 0;
                    }
                }
            }
        }
        
        totalTests += lessonDone;
        
        const pct = lessonTotal > 0 ? Math.round((lessonDone / lessonTotal) * 100) : 0;
        const iconData = LESSON_ICONS.find(i => i.id === lesson.icon_id) || LESSON_ICONS[0];
        
        lessonsHTML += `
            <div class="public-lesson-card">
                <div class="public-lesson-icon">${iconData.svg}</div>
                <div class="public-lesson-info">
                    <div class="public-lesson-name">${lesson.name}</div>
                    <div class="public-lesson-progress">
                        <div class="public-lesson-bar">
                            <div class="public-lesson-fill" style="width: ${pct}%"></div>
                        </div>
                        <span class="public-lesson-pct">${pct}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('total-lessons').textContent = totalLessons;
    document.getElementById('total-weeks').textContent = totalWeeks;
    document.getElementById('total-tests').textContent = totalTests;
    
    const overallPct = totalLessons > 0 ? Math.min(100, Math.round((totalTests / (totalLessons * 100)) * 100)) : 0;
    document.getElementById('overall-progress').textContent = overallPct + '%';
    
    document.getElementById('last-update').textContent = new Date().toLocaleDateString('fa-IR');
    document.getElementById('public-lessons').innerHTML = lessonsHTML;
}
