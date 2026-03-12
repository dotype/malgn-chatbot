/**
 * QuizManager - 퀴즈 로딩/렌더링/네비게이션/채점
 *
 * Shadow DOM root를 통해 DOM 쿼리를 수행합니다.
 */
import { escapeHtml } from './utils.js';

export class QuizManager {
  constructor(api, root) {
    this.api = api;
    this.root = root; // Shadow root
    this.quizzes = [];
    this.currentIndex = 0;
    this.answers = {};
    this.checked = {};
    this.attempts = {};
  }

  /**
   * 퀴즈 로드
   */
  async loadQuizzes(sessionId) {
    const quizEl = this.root.querySelector('#malgn-quiz-text');
    if (!quizEl) return;

    try {
      const result = await this.api.getQuizzes(sessionId);
      if (result.success && result.data.quizzes && result.data.quizzes.length > 0) {
        this.quizzes = result.data.quizzes;
        this.currentIndex = 0;
        this.answers = {};
        this.checked = {};
        this.attempts = {};
        this.renderCurrentQuiz();
      } else {
        quizEl.textContent = '퀴즈가 생성되지 않았습니다.';
      }
    } catch (error) {
      console.error('퀴즈 로드 실패:', error);
      quizEl.textContent = '퀴즈를 불러올 수 없습니다.';
    }
  }

  /**
   * 현재 퀴즈 렌더링
   */
  renderCurrentQuiz() {
    const quizEl = this.root.querySelector('#malgn-quiz-text');
    if (!quizEl || this.quizzes.length === 0) return;

    const quiz = this.quizzes[this.currentIndex];
    const total = this.quizzes.length;
    const current = this.currentIndex + 1;
    const isChoice = quiz.quizType === 'choice';

    let html = `
      <div class="chatbot-quiz">
        <div class="chatbot-quiz-progress">
          <span class="chatbot-quiz-count">${current} / ${total}</span>
          <span class="chatbot-quiz-type-badge ${isChoice ? 'choice' : 'ox'}">
            ${isChoice ? '4지선다' : 'OX퀴즈'}
          </span>
        </div>
        <div class="chatbot-quiz-question">
          <strong>Q${current}.</strong> ${escapeHtml(quiz.question)}
        </div>
        <div class="chatbot-quiz-options">
    `;

    if (isChoice) {
      quiz.options.forEach((option, i) => {
        const optionNum = i + 1;
        const isSelected = this.answers[quiz.id] === String(optionNum);
        html += `
          <div class="chatbot-quiz-option ${isSelected ? 'selected' : ''}" data-quiz-id="${quiz.id}" data-answer="${optionNum}">
            <span class="chatbot-option-num">${optionNum}</span>
            <span>${escapeHtml(option)}</span>
          </div>
        `;
      });
    } else {
      const isO = this.answers[quiz.id] === 'O';
      const isX = this.answers[quiz.id] === 'X';
      html += `
        <div class="chatbot-quiz-ox-options">
          <div class="chatbot-quiz-option chatbot-quiz-ox ${isO ? 'selected' : ''}" data-quiz-id="${quiz.id}" data-answer="O">O</div>
          <div class="chatbot-quiz-option chatbot-quiz-ox ${isX ? 'selected' : ''}" data-quiz-id="${quiz.id}" data-answer="X">X</div>
        </div>
      `;
    }

    html += `
        </div>
        <div class="chatbot-quiz-nav">
          <div class="chatbot-quiz-nav-buttons">
            <button class="chatbot-btn chatbot-btn-outline" id="malgn-prev-quiz" ${current === 1 ? 'disabled' : ''}>
              <i class="bi bi-chevron-left"></i> 이전
            </button>
            <button class="chatbot-btn chatbot-btn-outline" id="malgn-next-quiz" ${current === total ? 'disabled' : ''} ${this.checked[quiz.id] ? '' : 'style="display:none"'}>
              다음 <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <button class="chatbot-btn chatbot-btn-primary" id="malgn-check-answer" ${this.checked[quiz.id] ? 'style="display:none"' : ''}>정답 확인</button>
        </div>
        <div class="chatbot-quiz-result" id="malgn-quiz-result" style="display: none;"></div>
      </div>
    `;

    quizEl.innerHTML = html;

    // 이벤트 바인딩
    quizEl.querySelectorAll('.chatbot-quiz-option').forEach(el => {
      el.addEventListener('click', () => {
        this.answers[el.dataset.quizId] = el.dataset.answer;
        this.renderCurrentQuiz();
      });
    });

    const prevBtn = this.root.querySelector('#malgn-prev-quiz');
    const nextBtn = this.root.querySelector('#malgn-next-quiz');
    const checkBtn = this.root.querySelector('#malgn-check-answer');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());
    if (checkBtn) checkBtn.addEventListener('click', () => this.checkAnswer());
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentQuiz();
    }
  }

  next() {
    if (this.currentIndex < this.quizzes.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuiz();
    }
  }

  /**
   * 정답 확인
   */
  checkAnswer() {
    const quiz = this.quizzes[this.currentIndex];
    const userAnswer = this.answers[quiz.id];
    const resultEl = this.root.querySelector('#malgn-quiz-result');
    if (!resultEl) return;

    if (!userAnswer) {
      resultEl.className = 'chatbot-quiz-result';
      resultEl.innerHTML = '<span class="text-warning">답을 선택해 주세요.</span>';
      resultEl.style.display = 'block';
      return;
    }

    this.attempts[quiz.id] = (this.attempts[quiz.id] || 0) + 1;
    const attempt = this.attempts[quiz.id];
    const isCorrect = userAnswer === quiz.answer;

    const resultClass = isCorrect ? 'chatbot-result-correct' : 'chatbot-result-wrong';
    const resultIcon = isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    const resultText = isCorrect ? '정답입니다.' : '오답입니다.';

    // 배경색 클래스 추가
    resultEl.className = `chatbot-quiz-result ${isCorrect ? 'correct' : 'wrong'}`;

    let html = `
      <div class="${resultClass}">
        <i class="bi ${resultIcon} chatbot-result-icon"></i>${resultText}
      </div>
    `;

    if (!isCorrect && attempt === 1) {
      html += `<div class="chatbot-result-explanation">다시 한 번 도전해 보세요!</div>`;
    }

    if (isCorrect || attempt >= 2) {
      if (quiz.explanation) {
        html += `<div class="chatbot-result-explanation"><strong>해설:</strong> ${escapeHtml(quiz.explanation)}</div>`;
      }
    }

    resultEl.innerHTML = html;
    resultEl.style.display = 'block';

    // 정답이거나 2번째 시도 → 다음 버튼 표시
    if (isCorrect || attempt >= 2) {
      this.checked[quiz.id] = true;
      const nextBtn = this.root.querySelector('#malgn-next-quiz');
      const checkBtn = this.root.querySelector('#malgn-check-answer');
      if (nextBtn && this.currentIndex < this.quizzes.length - 1) nextBtn.style.display = '';
      if (checkBtn) checkBtn.style.display = 'none';
    }
  }
}
