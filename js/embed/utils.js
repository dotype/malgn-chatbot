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
 * 콘텐츠 포맷팅 (줄바꿈 → <br>)
 */
export function formatContent(content) {
  return escapeHtml(content).replace(/\n/g, '<br>');
}
