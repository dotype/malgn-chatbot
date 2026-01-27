/**
 * Sessions 모듈
 *
 * 채팅 세션 관리 기능을 제공합니다.
 * - 세션 목록 조회
 * - 새 세션 생성
 * - 세션 선택/전환
 * - 세션 삭제
 */

const Sessions = {
  currentSessionId: null,
  sessions: [],

  /**
   * 초기화
   */
  init() {
    this.sessionList = document.getElementById('sessionList');
    this.newSessionBtn = document.getElementById('newSessionBtn');

    if (!this.sessionList) {
      console.warn('Sessions: 세션 목록 영역을 찾을 수 없습니다');
      return;
    }

    this.bindEvents();
    this.loadSessions();
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    if (this.newSessionBtn) {
      this.newSessionBtn.addEventListener('click', () => this.createNewSession());
    }
  },

  /**
   * 세션 목록 로드
   */
  async loadSessions() {
    try {
      const result = await API.getSessions();

      if (result.success) {
        this.sessions = result.data.sessions || [];
        this.renderSessions();

        // 현재 세션이 없으면 첫 번째 세션 선택
        if (!this.currentSessionId && this.sessions.length > 0) {
          this.selectSession(this.sessions[0].id);
        }
      }
    } catch (error) {
      console.error('세션 목록 로드 실패:', error);
      this.renderEmpty('세션 목록을 불러올 수 없습니다');
    }
  },

  /**
   * 세션 목록 렌더링
   */
  renderSessions() {
    if (!this.sessions || this.sessions.length === 0) {
      this.renderEmpty('채팅 기록이 없습니다');
      return;
    }

    this.sessionList.innerHTML = this.sessions.map(session => `
      <div class="session-item ${session.id === this.currentSessionId ? 'active' : ''}"
           data-id="${session.id}">
        <div class="session-item__icon">
          <i class="bi bi-chat-dots"></i>
        </div>
        <div class="session-item__content">
          <div class="session-item__title" title="${this.escapeHtml(session.title || '새 대화')}">${this.escapeHtml(session.title || '새 대화')}</div>
          <div class="session-item__preview">${this.escapeHtml(session.lastMessage || '메시지 없음')}</div>
          <div class="session-item__meta">
            <span><i class="bi bi-clock"></i> ${this.formatDate(session.updated_at || session.created_at)}</span>
            <span><i class="bi bi-chat-left-text"></i> ${session.messageCount || 0}개</span>
          </div>
        </div>
        <div class="session-item__actions">
          <button class="session-item__btn session-item__btn--delete" data-id="${session.id}" title="삭제">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    `).join('');

    // 이벤트 바인딩
    this.sessionList.querySelectorAll('.session-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.session-item__btn')) {
          this.selectSession(item.dataset.id);
        }
      });
    });

    this.sessionList.querySelectorAll('.session-item__btn--delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSession(btn.dataset.id);
      });
    });
  },

  /**
   * 빈 상태 렌더링
   */
  renderEmpty(message) {
    this.sessionList.innerHTML = `
      <p class="session-list__empty">${message}</p>
    `;
  },

  /**
   * 새 세션 생성
   */
  async createNewSession() {
    // 선택된 콘텐츠 ID 가져오기
    const contentIds = typeof Contents !== 'undefined'
      ? Contents.getSelectedContentIds()
      : [];

    // 최소 1개 이상의 학습 자료 필요
    if (contentIds.length === 0) {
      alert('새 채팅을 시작할 수 없습니다: 최소 하나 이상의 학습 자료를 선택해 주세요.');
      return;
    }

    // AI 설정 가져오기
    const aiSettings = typeof Settings !== 'undefined' ? Settings.getAISettings() : null;

    try {
      const result = await API.createSession(contentIds, aiSettings);

      if (result.success) {
        const newSession = result.data;
        this.sessions.unshift(newSession);
        this.renderSessions();
        this.selectSession(newSession.id);

        // 채팅창 열기
        if (typeof App !== 'undefined' && App.openChatbot) {
          App.openChatbot();
        }
      }
    } catch (error) {
      console.error('세션 생성 실패:', error);
      alert('새 채팅을 시작할 수 없습니다: ' + error.message);
    }
  },

  /**
   * 세션 선택
   */
  selectSession(sessionId) {
    // ID를 숫자로 변환하여 일관성 유지
    this.currentSessionId = Number(sessionId);

    // UI 업데이트
    this.sessionList.querySelectorAll('.session-item').forEach(item => {
      item.classList.toggle('active', Number(item.dataset.id) === this.currentSessionId);
    });

    // 채팅창 열기
    if (typeof App !== 'undefined' && App.openChatbot) {
      App.openChatbot();
    }

    // Chat 모듈에 세션 변경 알림
    if (typeof Chat !== 'undefined' && Chat.loadSession) {
      Chat.loadSession(sessionId);
    }
  },

  /**
   * 세션 삭제
   */
  async deleteSession(sessionId) {
    if (!confirm('이 대화를 삭제하시겠습니까?\n삭제된 대화는 복구할 수 없습니다.')) {
      return;
    }

    // ID를 숫자로 변환
    const numericId = Number(sessionId);

    try {
      const result = await API.deleteSession(numericId);

      if (result.success) {
        // 목록에서 제거
        this.sessions = this.sessions.filter(s => s.id !== numericId);

        // 현재 선택된 세션이 삭제되면 다른 세션 선택
        if (this.currentSessionId === numericId) {
          this.currentSessionId = null;
          if (this.sessions.length > 0) {
            this.selectSession(this.sessions[0].id);
          } else {
            // 채팅창 초기화
            if (typeof Chat !== 'undefined' && Chat.clearMessages) {
              Chat.clearMessages();
            }
          }
        }

        this.renderSessions();
      }
    } catch (error) {
      console.error('세션 삭제 실패:', error);
      alert('대화 삭제 실패: ' + error.message);
    }
  },

  /**
   * 세션 제목 업데이트
   */
  updateSessionTitle(sessionId, title) {
    const numericId = Number(sessionId);
    const session = this.sessions.find(s => s.id === numericId);
    if (session) {
      session.title = title;
      this.renderSessions();
    }
  },

  /**
   * 세션 미리보기 업데이트
   */
  updateSessionPreview(sessionId, message) {
    const numericId = Number(sessionId);
    const session = this.sessions.find(s => s.id === numericId);
    if (session) {
      session.lastMessage = message;
      session.updated_at = new Date().toISOString();
      session.messageCount = (session.messageCount || 0) + 1;

      // 최근 세션을 목록 상단으로 이동
      this.sessions = this.sessions.filter(s => s.id !== numericId);
      this.sessions.unshift(session);

      this.renderSessions();
    }
  },

  /**
   * 현재 세션 ID 반환
   */
  getCurrentSessionId() {
    return this.currentSessionId;
  },

  /**
   * 날짜 포맷
   */
  formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // 1분 미만
    if (diff < 60 * 1000) {
      return '방금 전';
    }

    // 1시간 미만
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}분 전`;
    }

    // 24시간 미만
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}시간 전`;
    }

    // 7일 미만
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}일 전`;
    }

    // 그 외
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// 전역으로 Sessions 객체 노출
window.Sessions = Sessions;
