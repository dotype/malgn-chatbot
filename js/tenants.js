/**
 * 테넌트 관리 모듈
 *
 * 멀티테넌트 환경에서 테넌트 선택 및 전환을 관리합니다.
 */

const Tenants = {
  // 테넌트 목록 설정
  // 새 테넌트 추가 시 여기에 추가하세요
  list: [
    {
      id: 'user1',
      name: 'User1 (기본)',
      apiUrl: 'https://malgn-chatbot-api-user1.dotype.workers.dev',
      apiKey: '5Ot1la9ausoT0QUT4KsZlFwoW4TGIjb7NcIr1bKj'
    },
    {
      id: 'user2',
      name: 'User2',
      apiUrl: 'https://malgn-chatbot-api-user2.dotype.workers.dev',
      apiKey: 'aO8XJ82M5TVNYBbA65qdOAI4mDQmp8g8V59uKm7J'
    }
    // 새 테넌트 추가 예시:
    // {
    //   id: 'user3',
    //   name: 'User3',
    //   apiUrl: 'https://malgn-chatbot-api-user3.dotype.workers.dev',
    //   apiKey: 'YOUR_API_KEY'
    // }
  ],

  // 현재 선택된 테넌트 ID
  currentTenantId: null,

  /**
   * 초기화
   */
  init() {
    // localStorage에서 마지막 선택된 테넌트 복원
    const savedTenantId = localStorage.getItem('selected_tenant');
    if (savedTenantId && this.getTenant(savedTenantId)) {
      this.currentTenantId = savedTenantId;
    } else {
      // 기본값: 첫 번째 테넌트
      this.currentTenantId = this.list[0]?.id || null;
    }

    // 드롭다운 렌더링
    this.renderDropdown();

    // 현재 테넌트로 API 설정
    this.applyCurrentTenant();
  },

  /**
   * 테넌트 목록 반환
   */
  getList() {
    return this.list;
  },

  /**
   * 특정 테넌트 조회
   */
  getTenant(id) {
    return this.list.find(t => t.id === id);
  },

  /**
   * 현재 테넌트 반환
   */
  getCurrentTenant() {
    return this.getTenant(this.currentTenantId);
  },

  /**
   * 테넌트 변경
   */
  setCurrentTenant(id) {
    const tenant = this.getTenant(id);
    if (!tenant) {
      console.error(`Tenant not found: ${id}`);
      return false;
    }

    this.currentTenantId = id;
    localStorage.setItem('selected_tenant', id);

    // API 설정 적용
    this.applyCurrentTenant();

    // 드롭다운 UI 업데이트
    this.updateDropdownUI();

    // 데이터 리로드 이벤트 발생
    window.dispatchEvent(new CustomEvent('tenant:changed', { detail: tenant }));

    return true;
  },

  /**
   * 현재 테넌트 설정을 API에 적용
   */
  applyCurrentTenant() {
    const tenant = this.getCurrentTenant();
    if (!tenant) return;

    // API 기본 URL 설정
    if (typeof API !== 'undefined') {
      API.setBaseUrl(tenant.apiUrl);
      API.setApiKey(tenant.apiKey);
    }
  },

  /**
   * 드롭다운 렌더링
   */
  renderDropdown() {
    const container = document.getElementById('tenantSelector');
    if (!container) return;

    const currentTenant = this.getCurrentTenant();

    container.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                id="tenantDropdownBtn"
                data-bs-toggle="dropdown"
                aria-expanded="false">
          <i class="bi bi-building"></i>
          <span id="currentTenantName">${currentTenant?.name || '테넌트 선택'}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="tenantDropdownBtn">
          ${this.list.map(tenant => `
            <li>
              <a class="dropdown-item ${tenant.id === this.currentTenantId ? 'active' : ''}"
                 href="#"
                 data-tenant-id="${tenant.id}">
                <i class="bi bi-${tenant.id === this.currentTenantId ? 'check-circle-fill' : 'circle'} me-2"></i>
                ${tenant.name}
              </a>
            </li>
          `).join('')}
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-muted" href="#" id="tenantSettingsBtn">
              <i class="bi bi-gear me-2"></i>테넌트 관리
            </a>
          </li>
        </ul>
      </div>
    `;

    // 이벤트 바인딩
    container.querySelectorAll('[data-tenant-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tenantId = e.currentTarget.dataset.tenantId;
        this.setCurrentTenant(tenantId);
      });
    });
  },

  /**
   * 드롭다운 UI 업데이트
   */
  updateDropdownUI() {
    const currentTenant = this.getCurrentTenant();
    const nameEl = document.getElementById('currentTenantName');
    if (nameEl) {
      nameEl.textContent = currentTenant?.name || '테넌트 선택';
    }

    // 드롭다운 아이템 active 상태 업데이트
    const container = document.getElementById('tenantSelector');
    if (container) {
      container.querySelectorAll('[data-tenant-id]').forEach(item => {
        const isActive = item.dataset.tenantId === this.currentTenantId;
        item.classList.toggle('active', isActive);
        const icon = item.querySelector('i');
        if (icon) {
          icon.className = `bi bi-${isActive ? 'check-circle-fill' : 'circle'} me-2`;
        }
      });
    }
  },

  /**
   * 테넌트 추가 (런타임)
   */
  addTenant(tenant) {
    if (this.getTenant(tenant.id)) {
      console.warn(`Tenant already exists: ${tenant.id}`);
      return false;
    }
    this.list.push(tenant);
    this.renderDropdown();
    return true;
  },

  /**
   * 테넌트 제거 (런타임)
   */
  removeTenant(id) {
    const index = this.list.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.list.splice(index, 1);

    // 현재 테넌트가 삭제되면 첫 번째로 전환
    if (this.currentTenantId === id) {
      this.setCurrentTenant(this.list[0]?.id);
    }

    this.renderDropdown();
    return true;
  }
};

// 전역으로 노출
window.Tenants = Tenants;
