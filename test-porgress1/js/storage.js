const GITHUB_CONFIG = {
    owner: "arefseifipro",       
    repo: "arfito",      
    token: "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",      
    path: 'data/db.json',      
    branch: 'main'
};

const STORAGE_KEY = 'test_progress_db';
const ADMIN_CODE = '54667';


let db = {
  lessons: []
};

async function initDB() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      db = JSON.parse(local);
      return;
    } catch(e) {}
  }
  await fetchFromGitHub();
}


function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}


async function saveDB() {
  saveLocal();
  await pushToGitHub();
}


async function fetchFromGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const content = atob(data.content);
      db = JSON.parse(content);
      saveLocal();
    }
  } catch(e) {
    console.error('GitHub fetch error:', e);
  }
}

async function pushToGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
  try {

    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    let sha = null;
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(db, null, 2))));
    const body = {
      message: 'update db',
      content: content,
      branch: GITHUB_CONFIG.branch
    };
    if (sha) body.sha = sha;
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch(e) {
    console.error('GitHub push error:', e);
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
