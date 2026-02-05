/**
 * Settings 모듈
 *
 * AI 튜터 맑은샘 - AI 및 채팅창 설정 관리
 */

const Settings = {
  // 기본 설정값 (schema.sql과 일치)
  defaults: {
    persona: '당신은 친절하고 전문적인 AI 튜터입니다. 학생들이 이해하기 쉽게 설명하고, 질문에 정확하게 답변해 주세요.',
    temperature: 0.3,
    topP: 0.3,
    maxTokens: 1024,
    chatWidth: 380,
    chatHeight: 650,
    summaryCount: 3,
    recommendCount: 3,
    choiceQuizCount: 3,
    oxQuizCount: 2
  },

  // 설정 저장 타이머 (디바운스용)
  saveTimer: null,

  /**
   * 초기화
   */
  init() {
    this.bindElements();
    this.loadSettings();
    this.bindEvents();
  },

  /**
   * DOM 요소 바인딩
   */
  bindElements() {
    // AI 설정
    this.personaInput = document.getElementById('personaInput');
    this.temperatureSlider = document.getElementById('temperatureSlider');
    this.temperatureValue = document.getElementById('temperatureValue');
    this.topPSlider = document.getElementById('topPSlider');
    this.topPValue = document.getElementById('topPValue');
    this.maxTokensSlider = document.getElementById('maxTokensSlider');
    this.maxTokensValue = document.getElementById('maxTokensValue');

    // 채팅창 크기
    this.chatWidthSlider = document.getElementById('chatWidthSlider');
    this.chatWidthValue = document.getElementById('chatWidthValue');
    this.chatHeightSlider = document.getElementById('chatHeightSlider');
    this.chatHeightValue = document.getElementById('chatHeightValue');

    // 학습 설정
    this.summaryCountSlider = document.getElementById('summaryCountSlider');
    this.summaryCountValue = document.getElementById('summaryCountValue');
    this.recommendCountSlider = document.getElementById('recommendCountSlider');
    this.recommendCountValue = document.getElementById('recommendCountValue');

    // 퀴즈 설정 (여러 폼에 있으므로 모두 선택)
    this.choiceQuizCountInputs = document.querySelectorAll('.quiz-choice-count');
    this.oxQuizCountInputs = document.querySelectorAll('.quiz-ox-count');
    // 첫 번째 입력을 기본값으로 사용
    this.choiceQuizCountInput = this.choiceQuizCountInputs[0];
    this.oxQuizCountInput = this.oxQuizCountInputs[0];

    // 챗봇 요소
    this.chatbot = document.getElementById('chatbot');
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 페르소나 변경
    this.personaInput.addEventListener('change', () => this.saveSettings());

    // Temperature 슬라이더
    this.temperatureSlider.addEventListener('input', () => {
      this.temperatureValue.textContent = this.temperatureSlider.value;
      this.saveSettings();
    });

    // Top-p 슬라이더
    this.topPSlider.addEventListener('input', () => {
      this.topPValue.textContent = this.topPSlider.value;
      this.saveSettings();
    });

    // Max Tokens 슬라이더
    this.maxTokensSlider.addEventListener('input', () => {
      this.maxTokensValue.textContent = this.maxTokensSlider.value;
      this.saveSettings();
    });

    // 채팅창 가로 크기 슬라이더
    this.chatWidthSlider.addEventListener('input', () => {
      const value = this.chatWidthSlider.value;
      this.chatWidthValue.textContent = value + 'px';
      this.applyChatSize();
      this.saveSettings();
    });

    // 채팅창 세로 크기 슬라이더
    this.chatHeightSlider.addEventListener('input', () => {
      const value = this.chatHeightSlider.value;
      this.chatHeightValue.textContent = value + 'px';
      this.applyChatSize();
      this.saveSettings();
    });

    // 학습 요약 수 슬라이더
    this.summaryCountSlider.addEventListener('input', () => {
      this.summaryCountValue.textContent = this.summaryCountSlider.value;
      this.saveSettings();
    });

    // 추천 질문 수 슬라이더
    this.recommendCountSlider.addEventListener('input', () => {
      this.recommendCountValue.textContent = this.recommendCountSlider.value;
      this.saveSettings();
    });

    // 4지선다 퀴즈 수 (모든 입력 필드에 이벤트 바인딩)
    this.choiceQuizCountInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.syncQuizInputs('choice', e.target.value);
        this.saveSettings();
      });
    });

    // OX 퀴즈 수 (모든 입력 필드에 이벤트 바인딩)
    this.oxQuizCountInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.syncQuizInputs('ox', e.target.value);
        this.saveSettings();
      });
    });
  },

  /**
   * 퀴즈 입력 필드 동기화
   */
  syncQuizInputs(type, value) {
    const inputs = type === 'choice' ? this.choiceQuizCountInputs : this.oxQuizCountInputs;
    inputs.forEach(input => {
      input.value = value;
    });
  },

  /**
   * 설정 로드
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('ai_tutor_settings');
      const settings = saved ? JSON.parse(saved) : this.defaults;
      this.applySettings(settings);
    } catch (error) {
      console.error('설정 로드 실패:', error);
      this.applySettings(this.defaults);
    }
  },

  /**
   * 설정 적용
   */
  applySettings(settings) {
    // AI 설정
    if (settings.persona !== undefined) {
      this.personaInput.value = settings.persona;
    }
    if (settings.temperature !== undefined) {
      this.temperatureSlider.value = settings.temperature;
      this.temperatureValue.textContent = settings.temperature;
    }
    if (settings.topP !== undefined) {
      this.topPSlider.value = settings.topP;
      this.topPValue.textContent = settings.topP;
    }
    if (settings.maxTokens !== undefined) {
      this.maxTokensSlider.value = settings.maxTokens;
      this.maxTokensValue.textContent = settings.maxTokens;
    }

    // 채팅창 크기
    if (settings.chatWidth !== undefined) {
      this.chatWidthSlider.value = settings.chatWidth;
      this.chatWidthValue.textContent = settings.chatWidth + 'px';
    }
    if (settings.chatHeight !== undefined) {
      this.chatHeightSlider.value = settings.chatHeight;
      this.chatHeightValue.textContent = settings.chatHeight + 'px';
    }

    // 학습 설정
    if (settings.summaryCount !== undefined) {
      this.summaryCountSlider.value = settings.summaryCount;
      this.summaryCountValue.textContent = settings.summaryCount;
    }
    if (settings.recommendCount !== undefined) {
      this.recommendCountSlider.value = settings.recommendCount;
      this.recommendCountValue.textContent = settings.recommendCount;
    }
    if (settings.choiceQuizCount !== undefined) {
      this.syncQuizInputs('choice', settings.choiceQuizCount);
    }
    if (settings.oxQuizCount !== undefined) {
      this.syncQuizInputs('ox', settings.oxQuizCount);
    }

    // 채팅창 크기 적용
    this.applyChatSize();
  },

  /**
   * 채팅창 크기 적용
   */
  applyChatSize() {
    if (this.chatbot) {
      const width = this.chatWidthSlider.value + 'px';
      const height = this.chatHeightSlider.value + 'px';
      this.chatbot.style.setProperty('width', width, 'important');
      this.chatbot.style.setProperty('max-height', height, 'important');
      this.chatbot.style.setProperty('height', height, 'important');
    }
  },

  /**
   * 설정 저장 (로컬 + 세션)
   */
  saveSettings() {
    const settings = this.getSettings();

    // 로컬 스토리지 저장
    try {
      localStorage.setItem('ai_tutor_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }

    // 세션에 AI 설정 저장 (디바운스 적용)
    this.saveToSessionDebounced();

    // 임베드 코드 업데이트 이벤트
    window.dispatchEvent(new CustomEvent('settings:changed'));
  },

  /**
   * 세션에 AI 설정 저장 (디바운스)
   */
  saveToSessionDebounced() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveToSession();
    }, 500);
  },

  /**
   * 세션에 AI 설정 저장
   */
  async saveToSession() {
    // 현재 세션 ID 확인
    const sessionId = typeof Sessions !== 'undefined' ? Sessions.getCurrentSessionId() : null;
    if (!sessionId) return;

    const aiSettings = this.getAISettings();

    try {
      await API.updateSession(sessionId, aiSettings);
    } catch (error) {
      console.error('세션 AI 설정 저장 실패:', error);
    }
  },

  /**
   * 세션 AI 설정 로드 및 적용
   */
  applySessionSettings(settings) {
    if (!settings) return;

    // AI 설정만 적용 (채팅창 크기는 로컬에서 유지)
    if (settings.persona !== undefined) {
      this.personaInput.value = settings.persona;
    }
    if (settings.temperature !== undefined) {
      this.temperatureSlider.value = settings.temperature;
      this.temperatureValue.textContent = settings.temperature;
    }
    if (settings.topP !== undefined) {
      this.topPSlider.value = settings.topP;
      this.topPValue.textContent = settings.topP;
    }
    if (settings.maxTokens !== undefined) {
      this.maxTokensSlider.value = settings.maxTokens;
      this.maxTokensValue.textContent = settings.maxTokens;
    }

    // 학습 설정 적용
    if (settings.summaryCount !== undefined) {
      this.summaryCountSlider.value = settings.summaryCount;
      this.summaryCountValue.textContent = settings.summaryCount;
    }
    if (settings.recommendCount !== undefined) {
      this.recommendCountSlider.value = settings.recommendCount;
      this.recommendCountValue.textContent = settings.recommendCount;
    }
    if (settings.choiceQuizCount !== undefined) {
      this.syncQuizInputs('choice', settings.choiceQuizCount);
    }
    if (settings.oxQuizCount !== undefined) {
      this.syncQuizInputs('ox', settings.oxQuizCount);
    }
  },

  /**
   * 현재 설정 반환
   */
  getSettings() {
    return {
      persona: this.personaInput.value,
      temperature: parseFloat(this.temperatureSlider.value),
      topP: parseFloat(this.topPSlider.value),
      maxTokens: parseInt(this.maxTokensSlider.value),
      chatWidth: parseInt(this.chatWidthSlider.value),
      chatHeight: parseInt(this.chatHeightSlider.value),
      summaryCount: parseInt(this.summaryCountSlider.value),
      recommendCount: parseInt(this.recommendCountSlider.value),
      choiceQuizCount: parseInt(this.choiceQuizCountInput.value),
      oxQuizCount: parseInt(this.oxQuizCountInput.value)
    };
  },

  /**
   * AI 설정만 반환 (API 호출용)
   */
  getAISettings() {
    return {
      persona: this.personaInput.value,
      temperature: parseFloat(this.temperatureSlider.value),
      topP: parseFloat(this.topPSlider.value),
      maxTokens: parseInt(this.maxTokensSlider.value),
      summaryCount: parseInt(this.summaryCountSlider.value),
      recommendCount: parseInt(this.recommendCountSlider.value),
      choiceQuizCount: parseInt(this.choiceQuizCountInput.value),
      oxQuizCount: parseInt(this.oxQuizCountInput.value)
    };
  },

  /**
   * 학습 설정만 반환
   */
  getLearningSettings() {
    return {
      summaryCount: parseInt(this.summaryCountSlider.value),
      recommendCount: parseInt(this.recommendCountSlider.value),
      choiceQuizCount: parseInt(this.choiceQuizCountInput.value),
      oxQuizCount: parseInt(this.oxQuizCountInput.value)
    };
  },

  /**
   * 설정 초기화
   */
  resetSettings() {
    this.applySettings(this.defaults);
    this.saveSettings();
  }
};

// 전역으로 Settings 객체 노출
window.Settings = Settings;
