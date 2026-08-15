const API_URL = "https://arfito.ir/api/data";

const STORAGE_KEY = 'test_progress_db';
const ADMIN_CODE = '54667';

let db = {
  lessons: []
};



async function initDB() {
  const local = localStorage.getItem(STORAGE_KEY);

 

  await fetchFromGitHub(); 
  renderLessons();
}


function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}


async function saveDB() {
  saveLocal();
  await pushToGitHub();
}


async function fetchFromGitHub() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    db = await res.json();
    saveLocal();

  } catch (e) {
    console.error('API fetch error:', e);
  }
}

async function pushToGitHub() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(db)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

  } catch (e) {
    console.error('API save error:', e);
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getLesson(id) {
  return db.lessons.find(l => l.id === id);
}

function getSource(lessonId, sourceId) {
  const lesson = getLesson(lessonId);
  return lesson ? lesson.sources.find(s => s.id === sourceId) : null;
}

function getChapter(lessonId, sourceId, chapterId) {
  const source = getSource(lessonId, sourceId);
  return source ? source.chapters.find(c => c.id === chapterId) : null;
}


function sourceTotals(source) {
  let total = 0, done = 0;
  source.chapters.forEach(ch => {
    total += ch.total;
    done += ch.done;
  });
  return { total, done, remaining: total - done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}


function lessonTotals(lesson) {
  let total = 0, done = 0;
  lesson.sources.forEach(src => {
    const t = sourceTotals(src);
    total += t.total;
    done += t.done;
  });
  return { total, done, remaining: total - done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}
