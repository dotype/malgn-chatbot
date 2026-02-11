/**
 * Chat 모듈
 *
 * AI 튜터 맑은샘 - 채팅 기능
 */

const Chat = {
  sessionId: null,
  isLoading: false,

  /**
   * 초기화
   */
  init() {
    this.chatMessages = document.getElementById('chatMessages');
    this.chatForm = document.getElementById('chatForm');
    this.chatInput = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendBtn');

    this.bindEvents();
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 폼 제출
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    // 입력창 엔터키
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 입력창 포커스 시 최신 메시지가 보이도록 하단으로 스크롤
    this.chatInput.addEventListener('focus', () => this.scrollToBottom());
  },

  /**
   * 메시지 전송 (SSE 스트리밍)
   */
  async sendMessage() {
    const message = this.chatInput.value.trim();

    if (!message || this.isLoading) {
      return;
    }

    // 사용자 메시지 표시
    this.addUserMessage(message);

    // 입력창 초기화
    this.chatInput.value = '';

    // 로딩 상태
    this.setLoading(true);

    // 빈 AI 메시지 DOM 생성 (스트리밍으로 채워짐)
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-msg chatbot-msg--assistant chatbot-msg--typing';
    const contentEl = document.createElement('div');
    contentEl.className = 'chatbot-msg-content';
    contentEl.innerHTML = '<span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span>';
    messageEl.appendChild(contentEl);
    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();

    let fullText = '';
    let streaming = false;

    await API.sendMessageStream(
      message,
      this.sessionId,
      // onToken
      (token) => {
        if (!streaming) {
          streaming = true;
          messageEl.classList.remove('chatbot-msg--typing');
          contentEl.textContent = '';
        }
        fullText += token;
        contentEl.textContent = fullText;
        this.scrollToBottom();
      },
      // onDone
      (data) => {
        if (data.sessionId) this.sessionId = data.sessionId;
        // 최종 포맷팅 (줄바꿈 처리)
        contentEl.innerHTML = this.formatContent(fullText);
        this.scrollToBottom();
        this.setLoading(false);
      },
      // onError
      (error) => {
        console.error('스트리밍 실패:', error);
        if (!streaming) {
          contentEl.textContent = '';
        }
        contentEl.innerHTML = this.formatContent(fullText || '오류가 발생했습니다: ' + error.message);
        this.setLoading(false);
      }
    );
  },

  /**
   * 사용자 메시지 추가
   */
  addUserMessage(content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-msg chatbot-msg--user';
    messageEl.innerHTML = `
      <div class="chatbot-msg-content">${this.escapeHtml(content)}</div>
    `;

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  },

  /**
   * AI 응답 메시지 추가
   */
  addAssistantMessage(content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-msg chatbot-msg--assistant';
    messageEl.innerHTML = `
      <div class="chatbot-msg-content">${this.formatContent(content)}</div>
    `;

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  },

  /**
   * 시스템 메시지 추가
   */
  addSystemMessage(content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-msg chatbot-msg--assistant';
    messageEl.innerHTML = `
      <div class="chatbot-msg-content" style="font-style: italic; color: var(--text-secondary);">
        ${this.escapeHtml(content)}
      </div>
    `;

    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  },

  /**
   * 타이핑 인디케이터 추가
   */
  addTypingIndicator() {
    const existingIndicator = document.getElementById('typingIndicator');
    if (existingIndicator) return;

    const indicatorEl = document.createElement('div');
    indicatorEl.id = 'typingIndicator';
    indicatorEl.className = 'chatbot-msg chatbot-msg--assistant chatbot-msg--typing';
    indicatorEl.innerHTML = `
      <div class="chatbot-msg-content">
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
      </div>
    `;

    this.chatMessages.appendChild(indicatorEl);
    this.scrollToBottom();
  },

  /**
   * 타이핑 인디케이터 제거
   */
  removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  },

  /**
   * 로딩 상태 설정
   */
  setLoading(loading) {
    this.isLoading = loading;
    this.sendBtn.disabled = loading;
    this.chatInput.disabled = loading;

    if (!loading) {
      this.chatInput.focus();
    }
  },

  /**
   * 스크롤을 맨 아래로 이동
   */
  scrollToBottom() {
    // chatbot-body 래퍼를 스크롤 (탭/콘텐츠/메시지 전체가 스크롤됨)
    const chatbotBody = this.chatMessages.closest('.chatbot-body');
    if (chatbotBody) {
      chatbotBody.scrollTop = chatbotBody.scrollHeight;
    } else {
      // fallback
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  },

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 콘텐츠 포맷팅 (줄바꿈 처리)
   */
  formatContent(content) {
    return this.escapeHtml(content).replace(/\n/g, '<br>');
  },

  /**
   * 세션 로드
   */
  async loadSession(sessionId) {
    if (!sessionId) {
      this.clearMessages();
      this.clearLearningData();
      return;
    }

    this.sessionId = Number(sessionId);

    try {
      const result = await API.getSession(this.sessionId);

      if (result.success) {
        // AI 설정 적용
        if (result.data.settings && typeof Settings !== 'undefined') {
          Settings.applySessionSettings(result.data.settings);
        }

        // 학습 데이터 표시
        if (result.data.learning) {
          this.renderLearningData(result.data.learning);
        } else {
          this.clearLearningData();
        }

        // 퀴즈 로드
        this.loadQuizzes(this.sessionId);

        // 메시지 렌더링
        this.renderMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('세션 로드 실패:', error);
      this.clearMessages();
      this.clearLearningData();
    }
  },

  /**
   * 학습 데이터 렌더링 (학습목표, 요약, 추천질문)
   */
  renderLearningData(learning) {
    // 학습 목표
    const goalsText = document.getElementById('goalsText');
    if (goalsText) {
      goalsText.textContent = learning.goal || '학습 목표가 설정되지 않았습니다.';
    }

    // 요약 (배열 또는 문자열)
    const summaryText = document.getElementById('summaryText');
    if (summaryText) {
      const summary = learning.summary;
      if (Array.isArray(summary) && summary.length > 0) {
        // 배열인 경우 목록으로 표시
        summaryText.innerHTML = summary.map((s, i) =>
          `<div class="chatbot-summary-item mb-1">
            <span class="badge bg-secondary me-1">${i + 1}</span>${this.escapeHtml(s)}
          </div>`
        ).join('');
      } else if (summary) {
        // 문자열인 경우 그대로 표시
        summaryText.textContent = summary;
      } else {
        summaryText.textContent = '요약이 생성되지 않았습니다.';
      }
    }

    // 추천 질문
    const recommendText = document.getElementById('recommendText');
    if (recommendText) {
      const questions = learning.recommendedQuestions || [];
      if (questions.length > 0) {
        recommendText.innerHTML = questions.map((q, i) =>
          `<div class="chatbot-recommend-question mb-2" style="cursor: pointer;" data-question="${this.escapeHtml(q)}">
            <span class="badge bg-primary me-1">${i + 1}</span>${this.escapeHtml(q)}
          </div>`
        ).join('');

        // 추천 질문 클릭 이벤트 - 바로 질문 전송
        recommendText.querySelectorAll('.chatbot-recommend-question').forEach(el => {
          el.addEventListener('click', () => {
            const question = el.dataset.question;
            if (this.chatInput && question) {
              this.chatInput.value = question;
              this.sendMessage();
            }
          });
        });
      } else {
        recommendText.textContent = '추천 질문이 생성되지 않았습니다.';
      }
    }
  },

  /**
   * 학습 데이터 초기화
   */
  clearLearningData() {
    const goalsText = document.getElementById('goalsText');
    const summaryText = document.getElementById('summaryText');
    const recommendText = document.getElementById('recommendText');
    const quizText = document.getElementById('quizText');

    if (goalsText) goalsText.textContent = '학습 목표가 설정되지 않았습니다.';
    if (summaryText) summaryText.textContent = '요약이 생성되지 않았습니다.';
    if (recommendText) recommendText.textContent = '추천 질문이 생성되지 않았습니다.';
    if (quizText) quizText.textContent = '퀴즈가 생성되지 않았습니다.';
  },

  /**
   * 퀴즈 로드
   */
  async loadQuizzes(sessionId) {
    const quizText = document.getElementById('quizText');
    if (!quizText) return;

    try {
      const result = await API.getSessionQuizzes(sessionId);

      if (result.success && result.data.quizzes && result.data.quizzes.length > 0) {
        this.renderQuizzes(result.data.quizzes);
      } else {
        quizText.textContent = '퀴즈가 생성되지 않았습니다.';
      }
    } catch (error) {
      console.error('퀴즈 로드 실패:', error);
      quizText.textContent = '퀴즈를 불러올 수 없습니다.';
    }
  },

  /**
   * 퀴즈 렌더링
   */
  renderQuizzes(quizzes) {
    const quizText = document.getElementById('quizText');
    if (!quizText) return;

    // 현재 퀴즈 인덱스 초기화
    this.currentQuizIndex = 0;
    this.quizzes = quizzes;
    this.quizAnswers = {};

    this.showCurrentQuiz();
  },

  /**
   * 현재 퀴즈 표시
   */
  showCurrentQuiz() {
    const quizText = document.getElementById('quizText');
    if (!quizText || !this.quizzes || this.quizzes.length === 0) return;

    const quiz = this.quizzes[this.currentQuizIndex];
    const total = this.quizzes.length;
    const current = this.currentQuizIndex + 1;

    let html = `
      <div class="chatbot-quiz">
        <div class="chatbot-quiz-progress mb-2">
          <span class="badge bg-primary">${current} / ${total}</span>
          <span class="badge ${quiz.quizType === 'choice' ? 'bg-info' : 'bg-warning'} ms-1">
            ${quiz.quizType === 'choice' ? '4지선다' : 'OX퀴즈'}
          </span>
        </div>
        <div class="chatbot-quiz-question mb-2">
          <strong>Q${current}.</strong> ${this.escapeHtml(quiz.question)}
        </div>
        <div class="chatbot-quiz-options">
    `;

    if (quiz.quizType === 'choice') {
      // 4지선다
      quiz.options.forEach((option, i) => {
        const optionNum = i + 1;
        const isSelected = this.quizAnswers[quiz.id] === String(optionNum);
        html += `
          <div class="chatbot-quiz-option ${isSelected ? 'selected' : ''}" data-quiz-id="${quiz.id}" data-answer="${optionNum}">
            <span class="chatbot-option-num">${optionNum}</span> ${this.escapeHtml(option)}
          </div>
        `;
      });
    } else {
      // OX 퀴즈
      const isO = this.quizAnswers[quiz.id] === 'O';
      const isX = this.quizAnswers[quiz.id] === 'X';
      html += `
        <div class="chatbot-quiz-ox-options">
          <div class="chatbot-quiz-option chatbot-quiz-ox ${isO ? 'selected' : ''}" data-quiz-id="${quiz.id}" data-answer="O">O</div>
          <div class="chatbot-quiz-option chatbot-quiz-ox ${isX ? 'selected' : ''}" data-quiz-id="${quiz.id}" data-answer="X">X</div>
        </div>
      `;
    }

    html += `
        </div>
        <div class="chatbot-quiz-nav mt-3">
          <button class="btn btn-sm btn-outline-secondary" id="prevQuizBtn" ${current === 1 ? 'disabled' : ''}>
            <i class="bi bi-chevron-left"></i> 이전
          </button>
          <button class="btn btn-sm btn-outline-secondary ms-2" id="nextQuizBtn" ${current === total ? 'disabled' : ''}>
            다음 <i class="bi bi-chevron-right"></i>
          </button>
          <button class="btn btn-sm btn-primary ms-2" id="checkAnswerBtn">정답 확인</button>
        </div>
        <div class="chatbot-quiz-result mt-2" id="quizResult" style="display: none;"></div>
      </div>
    `;

    quizText.innerHTML = html;

    // 이벤트 바인딩
    quizText.querySelectorAll('.chatbot-quiz-option').forEach(el => {
      el.addEventListener('click', () => {
        const quizId = el.dataset.quizId;
        const answer = el.dataset.answer;
        this.selectQuizAnswer(quizId, answer);
      });
    });

    const prevBtn = document.getElementById('prevQuizBtn');
    const nextBtn = document.getElementById('nextQuizBtn');
    const checkBtn = document.getElementById('checkAnswerBtn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuiz());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuiz());
    if (checkBtn) checkBtn.addEventListener('click', () => this.checkAnswer());
  },

  /**
   * 퀴즈 답변 선택
   */
  selectQuizAnswer(quizId, answer) {
    this.quizAnswers[quizId] = answer;
    this.showCurrentQuiz();
  },

  /**
   * 이전 퀴즈
   */
  prevQuiz() {
    if (this.currentQuizIndex > 0) {
      this.currentQuizIndex--;
      this.showCurrentQuiz();
    }
  },

  /**
   * 다음 퀴즈
   */
  nextQuiz() {
    if (this.currentQuizIndex < this.quizzes.length - 1) {
      this.currentQuizIndex++;
      this.showCurrentQuiz();
    }
  },

  /**
   * 정답 확인
   */
  checkAnswer() {
    const quiz = this.quizzes[this.currentQuizIndex];
    const userAnswer = this.quizAnswers[quiz.id];
    const resultEl = document.getElementById('quizResult');

    if (!userAnswer) {
      resultEl.innerHTML = '<span class="text-warning">답을 선택해 주세요.</span>';
      resultEl.style.display = 'block';
      return;
    }

    const isCorrect = userAnswer === quiz.answer;
    const resultClass = isCorrect ? 'text-success' : 'text-danger';
    const resultIcon = isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    const resultText = isCorrect ? '정답입니다!' : '오답입니다.';

    let html = `
      <div class="${resultClass}">
        <i class="bi ${resultIcon} me-1"></i>${resultText}
      </div>
    `;

    if (!isCorrect) {
      html += `<div class="text-muted small">정답: ${quiz.answer}</div>`;
    }

    if (quiz.explanation) {
      html += `<div class="text-muted small mt-1"><strong>해설:</strong> ${this.escapeHtml(quiz.explanation)}</div>`;
    }

    resultEl.innerHTML = html;
    resultEl.style.display = 'block';
  },

  /**
   * 메시지 목록 렌더링
   */
  renderMessages(messages) {
    this.chatMessages.innerHTML = '';

    if (messages.length === 0) {
      this.addAssistantMessage('안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!');
      return;
    }

    for (const msg of messages) {
      if (msg.role === 'user') {
        this.addUserMessage(msg.content);
      } else {
        this.addAssistantMessage(msg.content);
      }
    }
  },

  /**
   * 메시지 초기화 (세션 삭제 시)
   */
  clearMessages() {
    this.chatMessages.innerHTML = '';
    this.sessionId = null;
    this.addAssistantMessage('안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!');
  },

  /**
   * 채팅 기록 초기화
   */
  clearChat() {
    this.chatMessages.innerHTML = '';
    this.sessionId = null;
    this.addAssistantMessage('안녕하세요! AI 튜터입니다. 궁금한 점이 있으면 언제든 물어보세요!');
  }
};

// 전역으로 Chat 객체 노출
window.Chat = Chat;
