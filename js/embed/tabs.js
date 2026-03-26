/**
 * TabManager - 탭 전환 + 학습 데이터 렌더링
 *
 * Shadow DOM root를 통해 DOM 쿼리를 수행합니다.
 */
import { escapeHtml, renderMath } from './utils.js';

export class TabManager {
  constructor(root) {
    this.root = root; // Shadow root
    this.onQuestionClick = null; // 추천질문 클릭 콜백
  }

  /**
   * 초기화 - 탭 전환 이벤트 바인딩
   */
  init() {
    const tabs = this.root.querySelectorAll('#malgn-chatbot .chatbot-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
  }

  /**
   * 탭 전환
   */
  switchTab(tabName) {
    // 모든 탭 비활성화
    const tabs = this.root.querySelectorAll('#malgn-chatbot .chatbot-tab');
    const contents = this.root.querySelectorAll('#malgn-chatbot .malgn-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // 선택된 탭 활성화
    const activeTab = this.root.querySelector(`#malgn-chatbot .chatbot-tab[data-tab="${tabName}"]`);
    const activeContent = this.root.querySelector(`#malgn-tab-${tabName}`);

    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    // 퀴즈 탭: 채팅 영역(메시지 + 입력창) 숨김
    const messagesEl = this.root.querySelector('#malgn-messages');
    const footerEl = this.root.querySelector('.chatbot-footer');
    if (tabName === 'quiz') {
      if (messagesEl) messagesEl.style.display = 'none';
      if (footerEl) footerEl.style.display = 'none';
    } else {
      if (messagesEl) messagesEl.style.display = '';
      if (footerEl) footerEl.style.display = '';
    }

    // 탭 콘텐츠가 보이도록 상단으로 스크롤
    const body = this.root.querySelector('#malgn-body');
    if (body) body.scrollTop = 0;
  }

  /**
   * 학습 데이터 렌더링
   */
  renderLearningData(learning) {
    // 학습 목표
    const goalsEl = this.root.querySelector('#malgn-goals-text');
    if (goalsEl) {
      goalsEl.textContent = learning.goal || '학습 목표가 설정되지 않았습니다.';
    }

    // 요약 (배열 또는 문자열)
    const summaryEl = this.root.querySelector('#malgn-summary-text');
    if (summaryEl) {
      const summary = learning.summary;
      if (Array.isArray(summary) && summary.length > 0) {
        summaryEl.innerHTML = summary.map((s, i) =>
          `<div class="chatbot-summary-item">
            <span class="chatbot-badge">${i + 1}</span>${escapeHtml(s)}
          </div>`
        ).join('');
      } else if (summary) {
        summaryEl.textContent = summary;
      } else {
        summaryEl.textContent = '요약이 생성되지 않았습니다.';
      }
    }

    // 추천 질문 (Q&A 형식)
    const recommendEl = this.root.querySelector('#malgn-recommend-text');
    if (recommendEl) {
      const questions = learning.recommendedQuestions || [];
      if (questions.length > 0) {
        recommendEl.innerHTML = questions.map((item, i) => {
          // 하위 호환: 문자열이면 질문만 표시
          const q = typeof item === 'string' ? item : (item.question || '');
          const a = typeof item === 'object' ? (item.answer || '') : '';
          return `<div class="chatbot-recommend-item">
            <div class="chatbot-recommend-question" data-question="${escapeHtml(q)}">
              <span class="chatbot-badge chatbot-badge-primary">${i + 1}</span>
              <span class="chatbot-recommend-q-text">${escapeHtml(q)}</span>
              ${a ? '<span class="chatbot-recommend-toggle">▲</span>' : ''}
            </div>
            ${a ? `<div class="chatbot-recommend-answer" style="display:block;">
              <span class="chatbot-recommend-a-label">A.</span> ${escapeHtml(a)}
            </div>` : ''}
          </div>`;
        }).join('');

        // 질문 클릭 → 답변 토글
        recommendEl.querySelectorAll('.chatbot-recommend-question').forEach(el => {
          el.addEventListener('click', () => {
            const item = el.closest('.chatbot-recommend-item');
            const answerEl = item?.querySelector('.chatbot-recommend-answer');
            const toggleEl = el.querySelector('.chatbot-recommend-toggle');
            if (answerEl) {
              const isOpen = answerEl.style.display !== 'none';
              answerEl.style.display = isOpen ? 'none' : 'block';
              if (toggleEl) toggleEl.textContent = isOpen ? '▼' : '▲';
            } else if (this.onQuestionClick) {
              // 답변 없으면 채팅으로 전송
              const question = el.dataset.question;
              if (question) this.onQuestionClick(question);
            }
          });
        });
        // 수식 렌더링
        renderMath(recommendEl);
      } else {
        recommendEl.textContent = '추천 질문이 생성되지 않았습니다.';
      }
    }

    // 학습 목표/요약에도 수식 렌더링
    if (goalsEl) renderMath(goalsEl);
    if (summaryEl) renderMath(summaryEl);
  }

  /**
   * 학습 데이터 초기화
   */
  clearLearningData() {
    const goalsEl = this.root.querySelector('#malgn-goals-text');
    const summaryEl = this.root.querySelector('#malgn-summary-text');
    const recommendEl = this.root.querySelector('#malgn-recommend-text');
    const quizEl = this.root.querySelector('#malgn-quiz-text');

    if (goalsEl) goalsEl.textContent = '학습 목표가 설정되지 않았습니다.';
    if (summaryEl) summaryEl.textContent = '요약이 생성되지 않았습니다.';
    if (recommendEl) recommendEl.textContent = '추천 질문이 생성되지 않았습니다.';
    if (quizEl) quizEl.textContent = '퀴즈가 생성되지 않았습니다.';
  }
}
