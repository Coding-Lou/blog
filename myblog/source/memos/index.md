---
title: Memos
aside: false
type: "memos"
---

<div id="memos-list" class="memos-list">
  <div class="memos-loading">loading...</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
  (function () {
    // 通过 Hexo 模板语法注入配置
    const ENDPOINT = "https://myblog.fly.dev/api/v1/memos?pageSize=10";
    const TOKEN = "memos_pat_raKk0wWnPttgawfmxVWwIPVQLjkpbkgE";
    const memosList = document.getElementById("memos-list");

    if (!memosList || ENDPOINT.includes('<%-')) {
      memosList.innerHTML = '<div class="memos-error">配置未就绪，请检查 Hexo 配置文件。</div>';
      return;
    }

    // 辅助函数：防止 HTML 注入
    const escapeHtml = (v = "") => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 解析 Markdown 并处理图片九宫格
    const renderMemo = (memo) => {
      const content = memo.content || "";
      // 提取 Markdown 中的图片链接并剔除，防止重复显示
      const imgRegex = /!\[.*?\]\((.*?)\)/g;
      let match;
      const images = [];
      while ((match = imgRegex.exec(content)) !== null) { images.push(match[1]); }
      
      const cleanContent = content.replace(imgRegex, '').trim();
      const htmlContent = window.marked ? window.marked.parse(cleanContent) : cleanContent;
      
      const time = new Date(memo.createTime || memo.updateTime).toLocaleString('zh-CN', {hour12:false});
      
      return `
        <div class="memo-card">
          <img class="memo-avatar" src="https://cravatar.cn/avatar/?d=mp" />
          <div class="memo-main">
            <div class="memo-name">Jay</div>
            <div class="memo-content">${htmlContent}</div>
            ${images.length ? `<div class="memo-gallery">${images.map(url => `
              <a class="memo-gallery-item" href="${url}" data-fancybox="gallery">
                <img src="${url}" loading="lazy" />
              </a>`).join('')}</div>` : ''}
            <div class="memo-time">${time}</div>
          </div>
        </div>`;
    };

    // 发起请求
    fetch(`${ENDPOINT}${ENDPOINT.includes('?') ? '&' : '?'}limit=20`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
    .then(res => res.json())
    .then(data => {
      const memos = data.memos || (Array.isArray(data) ? data : []);
      if (memos.length === 0) {
        memosList.innerHTML = '<div class="memos-error">这里空空如也。</div>';
        return;
      }
      memosList.innerHTML = memos.map(renderMemo).join('');
      // 触发 Butterfly 的 Fancybox 绑定
      if (window.fancybox) window.fancybox.bind('[data-fancybox="gallery"]');
    })
    .catch(err => {
      memosList.innerHTML = `<div class="memos-error">加载失败: ${err.message}</div>`;
    });
  })();
</script>

<style>
  /* 基础布局 */
  .memos-list { max-width: 700px; margin: 0 auto; }
  .memo-card { display: flex; gap: 12px; padding: 20px; border-bottom: 1px solid #eee; transition: 0.3s; }
  .memo-avatar { width: 45px; height: 45px; border-radius: 8px; }
  .memo-main { flex: 1; }
  .memo-name { color: #576b95; font-weight: bold; margin-bottom: 5px; }
  .memo-content { line-height: 1.6; font-size: 15px; }
  /* 九宫格图片 */
  .memo-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 10px; max-width: 400px; }
  .memo-gallery-item { aspect-ratio: 1; overflow: hidden; border-radius: 4px; }
  .memo-gallery-item img { width: 100%; height: 100%; object-fit: cover; }
  .memo-time { font-size: 12px; color: #999; margin-top: 10px; }
</style>