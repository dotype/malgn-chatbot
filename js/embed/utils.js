/**
 * Utility functions
 */

/**
 * HTML 이스케이프 (XSS 방지)
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 콘텐츠 포맷팅 (Markdown → HTML)
 *
 * 지원: 볼드, 이탤릭, 인라인코드, 코드블록, 리스트, 헤더, 수평선
 */
export function formatContent(content) {
  if (!content) return '';

  // LaTeX 수식을 먼저 보호 (마크다운 처리에서 제외)
  const mathBlocks = [];
  let text = content;

  // display math: $$...$$ 또는 \[...\]
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `\x00MATH${idx}\x00`;
  });
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `\x00MATH${idx}\x00`;
  });

  // inline math: \(...\)
  text = text.replace(/\\\((.+?)\\\)/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `\x00MATH${idx}\x00`;
  });

  // 코드 블록을 보호 (``` 으로 감싼 영역)
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="chatbot-code-block"><code>${escapeHtml(code.trim())}</code></pre>`);
    return `\x00CODEBLOCK${idx}\x00`;
  });

  // 인라인 코드 보호
  const inlineCodes = [];
  text = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code class="chatbot-inline-code">${escapeHtml(code)}</code>`);
    return `\x00INLINE${idx}\x00`;
  });

  // 줄 단위 처리
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 코드블록 플레이스홀더는 그대로 통과
    if (line.includes('\x00CODEBLOCK')) {
      if (inList) { result.push(listType === 'ol' ? '</ol>' : '</ul>'); inList = false; }
      result.push(line);
      continue;
    }

    // 수평선
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      if (inList) { result.push(listType === 'ol' ? '</ol>' : '</ul>'); inList = false; }
      result.push('<hr class="chatbot-hr">');
      continue;
    }

    // 헤더 (### h3, ## h2, # h1)
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      if (inList) { result.push(listType === 'ol' ? '</ol>' : '</ul>'); inList = false; }
      const level = headerMatch[1].length;
      result.push(`<strong class="chatbot-h chatbot-h${level}">${applyInline(escapeHtml(headerMatch[2]))}</strong>`);
      continue;
    }

    // 순서 있는 리스트 (1. 2. 등)
    const olMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(listType === 'ol' ? '</ol>' : '</ul>');
        result.push('<ol class="chatbot-list">');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${applyInline(escapeHtml(olMatch[2]))}</li>`);
      continue;
    }

    // 순서 없는 리스트 (- * •)
    const ulMatch = line.match(/^[\-\*•]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(listType === 'ol' ? '</ol>' : '</ul>');
        result.push('<ul class="chatbot-list">');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${applyInline(escapeHtml(ulMatch[1]))}</li>`);
      continue;
    }

    // 리스트가 아닌 줄 → 리스트 닫기
    if (inList) {
      result.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
    }

    // 빈 줄
    if (line.trim() === '') {
      result.push('<br>');
      continue;
    }

    // 일반 텍스트
    result.push(`<span>${applyInline(escapeHtml(line))}</span>`);
  }

  if (inList) {
    result.push(listType === 'ol' ? '</ol>' : '</ul>');
  }

  let html = result.join('\n');

  // 코드블록 / 인라인코드 / LaTeX 복원
  codeBlocks.forEach((block, i) => {
    html = html.replace(`\x00CODEBLOCK${i}\x00`, block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`\x00INLINE${i}\x00`, code);
  });
  mathBlocks.forEach((math, i) => {
    html = html.replace(`\x00MATH${i}\x00`, math);
  });

  return html;
}

/**
 * KaTeX 로드 및 수식 렌더링
 */
let katexLoaded = false;
let katexLoading = false;
const katexCallbacks = [];

export function loadKaTeX(shadowRoot) {
  // KaTeX CSS를 Shadow DOM에 주입
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.40/dist/katex.min.css';
  shadowRoot.appendChild(link);

  if (katexLoaded || katexLoading) return;
  katexLoading = true;

  // KaTeX core JS
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.40/dist/katex.min.js';
  script.onload = () => {
    // Auto-render extension
    const autoScript = document.createElement('script');
    autoScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.40/dist/contrib/auto-render.min.js';
    autoScript.onload = () => {
      katexLoaded = true;
      katexCallbacks.forEach(cb => cb());
      katexCallbacks.length = 0;
    };
    document.head.appendChild(autoScript);
  };
  document.head.appendChild(script);
}

export function renderMath(element) {
  if (katexLoaded && window.renderMathInElement) {
    window.renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false
    });
  } else {
    katexCallbacks.push(() => renderMath(element));
  }
}

/**
 * 인라인 마크다운 적용 (볼드, 이탤릭, 인라인코드 플레이스홀더 유지)
 */
function applyInline(escapedLine) {
  return escapedLine
    // 볼드+이탤릭 (***text*** 또는 ___text___)
    .replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>')
    // 볼드 (**text** 또는 __text__)
    .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // 이탤릭 (*text* 또는 _text_)
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');
}
