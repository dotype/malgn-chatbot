/**
 * Contents 모듈
 *
 * 콘텐츠 업로드 및 관리 기능을 제공합니다.
 * 지원 형식: 텍스트, 파일 첨부, 링크
 */

const Contents = {
  selectedFile: null,
  selectedContentIds: new Set(), // 선택된 콘텐츠 ID 목록

  /**
   * 초기화
   */
  init() {
    // 로컬 스토리지에서 선택된 콘텐츠 복원
    this.loadSelectedContents();
    // Content type tabs
    this.contentTypeTabs = document.querySelectorAll('.content-type-tab');
    this.contentForms = document.querySelectorAll('.content-form');

    // Text form elements
    this.textTitle = document.getElementById('textTitle');
    this.textContent = document.getElementById('textContent');
    this.addTextBtn = document.getElementById('addTextBtn');

    // File form elements
    this.fileTitle = document.getElementById('fileTitle');
    this.fileInput = document.getElementById('fileInput');
    this.uploadBtn = document.getElementById('uploadBtn');
    this.selectedFileEl = document.getElementById('selectedFile');
    this.selectedFileName = document.getElementById('selectedFileName');
    this.clearFileBtn = document.getElementById('clearFileBtn');
    this.addFileBtn = document.getElementById('addFileBtn');

    // Link form elements
    this.linkTitle = document.getElementById('linkTitle');
    this.linkUrl = document.getElementById('linkUrl');
    this.addLinkBtn = document.getElementById('addLinkBtn');

    // Common elements
    this.uploadProgress = document.getElementById('uploadProgress');
    this.contentList = document.getElementById('documentList');
    this.contentCount = document.getElementById('documentCount');

    if (!this.contentList) {
      console.warn('Contents: 콘텐츠 목록 영역을 찾을 수 없습니다');
      return;
    }

    this.bindEvents();
    this.loadContents();
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // Content type tab switching
    this.contentTypeTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchContentType(tab.dataset.type));
    });

    // Text form
    if (this.addTextBtn) {
      this.addTextBtn.addEventListener('click', () => this.addTextContent());
    }

    // File form
    if (this.uploadBtn) {
      this.uploadBtn.addEventListener('click', () => this.fileInput.click());

      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.selectFile(file);
        }
      });

      // Drag and drop
      this.uploadBtn.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.uploadBtn.classList.add('dragover');
      });

      this.uploadBtn.addEventListener('dragleave', () => {
        this.uploadBtn.classList.remove('dragover');
      });

      this.uploadBtn.addEventListener('drop', (e) => {
        e.preventDefault();
        this.uploadBtn.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
          this.selectFile(file);
        }
      });
    }

    if (this.clearFileBtn) {
      this.clearFileBtn.addEventListener('click', () => this.clearSelectedFile());
    }

    if (this.addFileBtn) {
      this.addFileBtn.addEventListener('click', () => this.addFileContent());
    }

    // Link form
    if (this.addLinkBtn) {
      this.addLinkBtn.addEventListener('click', () => this.addLinkContent());
    }
  },

  /**
   * 콘텐츠 타입 전환
   */
  switchContentType(type) {
    // Update tabs
    this.contentTypeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.type === type);
    });

    // Update forms
    this.contentForms.forEach(form => {
      form.classList.toggle('active', form.id === `form-${type}`);
    });
  },

  /**
   * 파일 선택
   */
  selectFile(file) {
    // Validate file type
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'md'].includes(ext)) {
      alert('지원하지 않는 파일 형식입니다.\n지원 형식: PDF, TXT, MD');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다.\n최대 크기: 10MB');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName.textContent = file.name;
    this.selectedFileEl.hidden = false;
    this.uploadBtn.hidden = true;
  },

  /**
   * 선택된 파일 초기화
   */
  clearSelectedFile() {
    this.selectedFile = null;
    this.fileInput.value = '';
    this.selectedFileEl.hidden = true;
    this.uploadBtn.hidden = false;
  },

  /**
   * 텍스트 콘텐츠 추가
   */
  async addTextContent() {
    const title = this.textTitle.value.trim();
    const content = this.textContent.value.trim();

    if (!title) {
      alert('제목을 입력해주세요.');
      this.textTitle.focus();
      return;
    }

    if (!content) {
      alert('내용을 입력해주세요.');
      this.textContent.focus();
      return;
    }

    this.showProgress();

    try {
      const result = await API.uploadText(title, content);

      if (result.success) {
        this.hideProgress();
        this.textTitle.value = '';
        this.textContent.value = '';
        this.loadContents();
        this.notifyChat(`"${title}" 텍스트가 추가되었습니다.`);
      }
    } catch (error) {
      console.error('텍스트 추가 실패:', error);
      this.hideProgress();
      alert('텍스트 추가 실패: ' + error.message);
    }
  },

  /**
   * 파일 콘텐츠 추가
   */
  async addFileContent() {
    const title = this.fileTitle.value.trim();

    if (!title) {
      alert('제목을 입력해주세요.');
      this.fileTitle.focus();
      return;
    }

    if (!this.selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    this.showProgress();

    try {
      const result = await API.uploadFile(this.selectedFile, title);

      if (result.success) {
        this.hideProgress();
        this.fileTitle.value = '';
        this.clearSelectedFile();
        this.loadContents();
        this.notifyChat(`"${title}" 파일이 업로드되었습니다.`);
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      this.hideProgress();
      alert('파일 업로드 실패: ' + error.message);
    }
  },

  /**
   * 링크 콘텐츠 추가
   */
  async addLinkContent() {
    const title = this.linkTitle.value.trim();
    const url = this.linkUrl.value.trim();

    if (!title) {
      alert('제목을 입력해주세요.');
      this.linkTitle.focus();
      return;
    }

    if (!url) {
      alert('링크를 입력해주세요.');
      this.linkUrl.focus();
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      alert('올바른 URL 형식이 아닙니다.');
      this.linkUrl.focus();
      return;
    }

    this.showProgress();

    try {
      const result = await API.uploadLink(title, url);

      if (result.success) {
        this.hideProgress();
        this.linkTitle.value = '';
        this.linkUrl.value = '';
        this.loadContents();
        this.notifyChat(`"${title}" 링크가 추가되었습니다.`);
      }
    } catch (error) {
      console.error('링크 추가 실패:', error);
      this.hideProgress();
      alert('링크 추가 실패: ' + error.message);
    }
  },

  /**
   * 콘텐츠 목록 로드
   */
  async loadContents() {
    try {
      const result = await API.getContents();

      if (result.success) {
        this.renderContents(result.data.contents);
      }
    } catch (error) {
      console.error('콘텐츠 목록 로드 실패:', error);
      this.renderEmpty('콘텐츠 목록을 불러올 수 없습니다');
    }
  },

  /**
   * 콘텐츠 목록 렌더링
   */
  renderContents(contents) {
    // Update content count
    if (this.contentCount) {
      this.contentCount.textContent = `${contents?.length || 0}개`;
    }

    if (!contents || contents.length === 0) {
      this.renderEmpty('등록된 자료가 없습니다');
      return;
    }

    this.contentList.innerHTML = contents.map(item => `
      <div class="document-item" data-id="${item.id}">
        <div class="document-item__checkbox">
          <input type="checkbox" class="form-check-input" id="content-${item.id}" data-id="${item.id}" ${this.isContentSelected(item.id) ? 'checked' : ''}>
        </div>
        <div class="document-item__icon">
          <i class="bi ${this.getTypeIcon(item.type || item.file_type)}"></i>
        </div>
        <div class="document-item__info">
          <label class="document-item__title" for="content-${item.id}">${item.content_nm}</label>
          <div class="document-item__meta">
            ${this.getTypeBadge(item.type || item.file_type)} | ${this.formatFileSize(item.file_size)}
          </div>
        </div>
        <div class="document-item__actions">
          <button class="document-item__edit" data-id="${item.id}" title="수정">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="document-item__delete" data-id="${item.id}" title="삭제">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Bind checkbox events
    this.contentList.querySelectorAll('.document-item__checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = Number(checkbox.dataset.id);
        this.toggleContentSelection(id, checkbox.checked);
      });
    });

    // Bind edit button events
    this.contentList.querySelectorAll('.document-item__edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.startEditContent(id);
      });
    });

    // Bind delete button events
    this.contentList.querySelectorAll('.document-item__delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.deleteContent(id);
      });
    });
  },

  /**
   * 빈 상태 렌더링
   */
  renderEmpty(message) {
    if (this.contentCount) {
      this.contentCount.textContent = '0개';
    }
    this.contentList.innerHTML = `
      <p class="document-list__empty">${message}</p>
    `;
  },

  /**
   * 콘텐츠 삭제
   */
  async deleteContent(id) {
    if (!confirm('이 자료를 삭제하시겠습니까?\n삭제된 자료는 복구할 수 없습니다.')) {
      return;
    }

    // ID를 숫자로 변환
    const numericId = Number(id);

    try {
      const result = await API.deleteContent(numericId);

      if (result.success) {
        this.loadContents();
        this.notifyChat('자료가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 실패: ' + error.message);
    }
  },

  /**
   * 파일 타입 여부 확인
   */
  isFileType(type) {
    const fileTypes = ['pdf', 'txt', 'md', 'file'];
    return fileTypes.includes(type?.toLowerCase());
  },

  /**
   * 콘텐츠 수정 모달 열기
   */
  async startEditContent(id) {
    const numericId = Number(id);

    try {
      // 콘텐츠 상세 정보 조회
      const result = await API.getContent(numericId);

      if (!result.success) {
        alert('콘텐츠를 불러올 수 없습니다.');
        return;
      }

      const content = result.data;
      const contentType = content.type || content.file_type;
      const isFile = this.isFileType(contentType);

      // 모달 요소
      const modal = document.getElementById('editContentModal');
      const idInput = document.getElementById('editContentId');
      const typeInput = document.getElementById('editContentType');
      const titleInput = document.getElementById('editContentTitle');
      const textContainer = document.getElementById('editContentTextContainer');
      const textArea = document.getElementById('editContentText');
      const fileNotice = document.getElementById('editContentFileNotice');
      const saveBtn = document.getElementById('saveEditContentBtn');

      // 모달에 데이터 설정
      idInput.value = content.id;
      typeInput.value = contentType;
      titleInput.value = content.content_nm || '';

      // 타입에 따라 내용 영역 표시/숨김 및 편집 가능 여부 설정
      const isLink = contentType === 'link';

      if (isFile) {
        // 파일: 내용 숨김
        textContainer.hidden = true;
        fileNotice.hidden = false;
        textArea.value = '';
        textArea.readOnly = false;
      } else if (isLink) {
        // 링크(자막): 내용 표시하되 읽기 전용
        textContainer.hidden = false;
        fileNotice.hidden = true;
        textArea.value = content.content || '';
        textArea.readOnly = true;
        textArea.style.backgroundColor = '#f5f5f5';
      } else {
        // 텍스트: 내용 표시 및 편집 가능
        textContainer.hidden = false;
        fileNotice.hidden = true;
        textArea.value = content.content || '';
        textArea.readOnly = false;
        textArea.style.backgroundColor = '';
      }

      // 저장 버튼 이벤트 (기존 이벤트 제거 후 새로 등록)
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      newSaveBtn.addEventListener('click', () => this.saveEditContent());

      // 모달 열기
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();

    } catch (error) {
      console.error('콘텐츠 조회 실패:', error);
      alert('콘텐츠를 불러올 수 없습니다: ' + error.message);
    }
  },

  /**
   * 콘텐츠 수정 저장
   */
  async saveEditContent() {
    const idInput = document.getElementById('editContentId');
    const typeInput = document.getElementById('editContentType');
    const titleInput = document.getElementById('editContentTitle');
    const textArea = document.getElementById('editContentText');
    const saveBtn = document.getElementById('saveEditContentBtn');

    const id = Number(idInput.value);
    const contentType = typeInput.value;
    const title = titleInput.value.trim();
    const isFile = this.isFileType(contentType);
    const isLink = contentType === 'link';

    // 파일/링크 타입이 아닌 경우에만 내용 가져오기 (텍스트만 내용 수정 가능)
    const content = (isFile || isLink) ? null : textArea.value.trim();

    if (!title) {
      alert('제목을 입력해주세요.');
      titleInput.focus();
      return;
    }

    // 버튼 상태 변경
    saveBtn.disabled = true;
    saveBtn.querySelector('.save-text').classList.add('d-none');
    saveBtn.querySelector('.saving-text').classList.remove('d-none');

    try {
      // 파일/링크 타입은 제목만 수정, 텍스트 타입은 내용도 함께 수정
      const result = await API.updateContent(id, title, content || null);

      if (result.success) {
        // 모달 닫기
        const modal = bootstrap.Modal.getInstance(document.getElementById('editContentModal'));
        modal.hide();

        // 목록 새로고침
        this.loadContents();
        this.notifyChat('자료가 수정되었습니다.');
      }
    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 실패: ' + error.message);
    } finally {
      // 버튼 상태 복원
      saveBtn.disabled = false;
      saveBtn.querySelector('.save-text').classList.remove('d-none');
      saveBtn.querySelector('.saving-text').classList.add('d-none');
    }
  },

  /**
   * 진행 상태 표시
   */
  showProgress() {
    if (this.uploadProgress) {
      this.uploadProgress.hidden = false;
    }
  },

  /**
   * 진행 상태 숨김
   */
  hideProgress() {
    if (this.uploadProgress) {
      this.uploadProgress.hidden = true;
    }
  },

  /**
   * 채팅에 알림
   */
  notifyChat(message) {
    if (typeof Chat !== 'undefined' && Chat.addSystemMessage) {
      Chat.addSystemMessage(message);
    }
  },

  /**
   * 타입에 따른 아이콘 반환
   */
  getTypeIcon(type) {
    const icons = {
      'text': 'bi-file-earmark-text-fill',
      'pdf': 'bi-file-earmark-pdf-fill',
      'txt': 'bi-file-earmark-text-fill',
      'md': 'bi-markdown-fill',
      'file': 'bi-file-earmark-arrow-up-fill',
      'link': 'bi-link-45deg'
    };
    return icons[type] || 'bi-file-earmark-fill';
  },

  /**
   * 타입 뱃지 텍스트
   */
  getTypeBadge(type) {
    const badges = {
      'text': '텍스트',
      'pdf': 'PDF',
      'txt': 'TXT',
      'md': 'MD',
      'file': '파일',
      'link': '링크'
    };
    return badges[type] || type?.toUpperCase() || '기타';
  },

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
  },

  /**
   * 콘텐츠 선택 여부 확인
   */
  isContentSelected(id) {
    return this.selectedContentIds.has(Number(id));
  },

  /**
   * 콘텐츠 선택 토글
   */
  toggleContentSelection(id, selected) {
    const numericId = Number(id);
    if (selected) {
      this.selectedContentIds.add(numericId);
    } else {
      this.selectedContentIds.delete(numericId);
    }
    this.saveSelectedContents();
    this.updateSelectionCount();
  },

  /**
   * 선택된 콘텐츠 ID 목록 반환
   */
  getSelectedContentIds() {
    return Array.from(this.selectedContentIds);
  },

  /**
   * 선택된 콘텐츠 로컬 스토리지에 저장
   */
  saveSelectedContents() {
    localStorage.setItem('selectedContents', JSON.stringify(this.getSelectedContentIds()));
  },

  /**
   * 선택된 콘텐츠 로컬 스토리지에서 복원
   */
  loadSelectedContents() {
    try {
      const saved = localStorage.getItem('selectedContents');
      if (saved) {
        const ids = JSON.parse(saved);
        this.selectedContentIds = new Set(ids);
      }
    } catch (e) {
      console.warn('선택된 콘텐츠 복원 실패:', e);
      this.selectedContentIds = new Set();
    }
  },

  /**
   * 선택 개수 업데이트
   */
  updateSelectionCount() {
    const count = this.selectedContentIds.size;
    // 선택 개수를 표시하는 요소가 있으면 업데이트
    const countEl = document.getElementById('selectedContentCount');
    if (countEl) {
      countEl.textContent = count > 0 ? `${count}개 선택` : '';
      countEl.hidden = count === 0;
    }
  },

  /**
   * 전체 선택/해제
   */
  toggleSelectAll(selectAll) {
    const checkboxes = this.contentList.querySelectorAll('.document-item__checkbox input');
    checkboxes.forEach(checkbox => {
      const id = Number(checkbox.dataset.id);
      checkbox.checked = selectAll;
      if (selectAll) {
        this.selectedContentIds.add(id);
      } else {
        this.selectedContentIds.delete(id);
      }
    });
    this.saveSelectedContents();
    this.updateSelectionCount();
  }
};

// 전역으로 Contents 객체 노출
window.Contents = Contents;
