async function loadFromGithub() {
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` }
        });
        if (!response.ok) throw new Error('خطا در خواندن');
        const data = await response.json();
        return JSON.parse(atob(data.content));
    } catch (error) {
        console.error('خطا:', error);
        return { lessons: [] };
    }
}

async function saveToGithub(data) {
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
        

        const getRes = await fetch(url, {
            headers: { 'Authorization': `token ${GITHUB_CONFIG.token}` }
        });
        const fileData = await getRes.json();
        

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'آپدیت داده‌ها',
                content: content,
                sha: fileData.sha
            })
        });
        
        return putRes.ok;
    } catch (error) {
        console.error('خطا در ذخیره:', error);
        return false;
    }
}
