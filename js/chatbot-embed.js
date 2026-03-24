(()=>{var m=(h,t)=>()=>(h&&(t=h(h=0)),t);var F=(h,t)=>()=>(t||h((t={exports:{}}).exports,t),t.exports);var y,E=m(()=>{y=class{constructor(t,e){this.baseUrl=t,this.apiKey=e}getHeaders(t=!0){let e={};return this.apiKey&&(e.Authorization=`Bearer ${this.apiKey}`),t&&(e["Content-Type"]="application/json"),e}async handleResponse(t){if(t.status===401)throw new Error("API Key\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");if(!t.ok){let e=await t.json().catch(()=>({}));throw new Error(e.error?.message||"\uC694\uCCAD \uC2E4\uD328")}return t.json()}async createSession(t,e={}){let o={content_ids:t};e.courseId&&(o.course_id=e.courseId),e.courseUserId&&(o.course_user_id=e.courseUserId),e.lessonId&&(o.lesson_id=e.lessonId),e.userId&&(o.user_id=e.userId),e.settings&&(o.settings=e.settings),e.parentSessionId&&(o.parent_id=e.parentSessionId);let r=await fetch(`${this.baseUrl}/sessions`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(o)});return this.handleResponse(r)}async getSession(t){let e=await fetch(`${this.baseUrl}/sessions/${t}`,{headers:this.getHeaders(!1)});return this.handleResponse(e)}async sendMessage(t,e,o={}){let r=await fetch(`${this.baseUrl}/chat`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify({message:t,sessionId:e,settings:o})});return this.handleResponse(r)}async sendMessageStream(t,e,o={},r,i,s){try{let n=await fetch(`${this.baseUrl}/chat/stream`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify({message:t,sessionId:e,settings:o})});if(!n.ok){let d=await n.json().catch(()=>({}));s&&s(new Error(d.error?.message||"\uC2A4\uD2B8\uB9AC\uBC0D \uC694\uCCAD \uC2E4\uD328"));return}let c=n.body.pipeThrough(new TextDecoderStream).getReader(),l="",a="";for(;;){let{done:d,value:p}=await c.read();if(d)break;l+=p;let g=l.split(`
`);l=g.pop()||"";for(let C of g){let f=C.trim();if(f){if(f.startsWith("event: "))a=f.slice(7);else if(f.startsWith("data: "))try{let x=JSON.parse(f.slice(6));a==="token"&&x.response&&r?r(x.response):a==="done"&&i?i(x):a==="error"&&s&&s(new Error(x.message))}catch{}}}}}catch(n){s&&s(n)}}async getQuizzes(t){let e=await fetch(`${this.baseUrl}/sessions/${t}/quizzes`,{headers:this.getHeaders(!1)});return this.handleResponse(e)}}});var M,I=m(()=>{M=`/* ============================================
   Chatbot Widget - Standalone CSS
   Purple Theme (AI \uD29C\uD130 \uB9D1\uC740\uC0D8)

   \uB3C5\uB9BD\uC801\uC73C\uB85C \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uCC57\uBD07 \uC704\uC82F \uC2A4\uD0C0\uC77C
   \uB2E4\uB978 \uD504\uB85C\uC81D\uD2B8\uC5D0\uC11C \uC774 \uD30C\uC77C\uB9CC import\uD558\uC5EC \uC0AC\uC6A9 \uAC00\uB2A5
   ============================================ */

/* ============================================
   CSS Variables (\uB3C5\uB9BD \uC0AC\uC6A9\uC744 \uC704\uD55C \uBCC0\uC218)
   ============================================ */

:host {
  /* Purple Palette (Chat) */
  --chatbot-primary: #7C3AED;
  --chatbot-primary-light: #A78BFA;
  --chatbot-secondary: #6D28D9;
  --chatbot-bg: #FFFFFF;
  --chatbot-bg-alt: #F9FAFB;
  --chatbot-accent: #8B5CF6;
  --chatbot-text: #1F2937;
  --chatbot-text-secondary: #6B7280;
  --chatbot-border: #E5E7EB;
  --chatbot-user-bg: #1F2937;

  /* \uD638\uC2A4\uD2B8 \uD398\uC774\uC9C0 \uC0C1\uC18D \uC18D\uC131 \uCC28\uB2E8 */
  color: var(--chatbot-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  text-align: left;
  font-style: normal;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Fallback for non-Shadow DOM usage (admin dashboard) */
:root {
  --chatbot-primary: #7C3AED;
  --chatbot-primary-light: #A78BFA;
  --chatbot-secondary: #6D28D9;
  --chatbot-bg: #FFFFFF;
  --chatbot-bg-alt: #F9FAFB;
  --chatbot-accent: #8B5CF6;
  --chatbot-text: #1F2937;
  --chatbot-text-secondary: #6B7280;
  --chatbot-border: #E5E7EB;
  --chatbot-user-bg: #1F2937;
}

/* ============================================
   Chat Window - Cool Blue Style
   ============================================ */

/* CSS Reset - Shadow DOM \uB0B4\uBD80 \uAE30\uBCF8 \uC2A4\uD0C0\uC77C \uCD08\uAE30\uD654 */
.chatbot *, .chatbot *::before, .chatbot *::after,
.chat-fab, .chat-fab *, .chat-fab::before, .chat-fab::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.chatbot {
  position: fixed;
  bottom: 100px;
  right: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2);
  background-color: var(--chatbot-bg);
  color: var(--chatbot-text);
  font-size: 14px;
  line-height: 1.5;
  z-index: 999;
}

.chatbot:hover {
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.25);
}

/* Purple Chat Header */
.chatbot .chatbot-header {
  background: var(--chatbot-primary);
  border: none;
  border-radius: 20px 20px 0 0;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chatbot .chatbot-header h5,
.chatbot .chatbot-header .chatbot-title {
  color: white;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chatbot .chatbot-header .chatbot-title-icon {
  font-size: 1.1rem;
}

/* Header Actions */
.chatbot .chatbot-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chatbot .chatbot-header-btn {
  background-color: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
}

.chatbot .chatbot-header-btn i {
  pointer-events: none;
}

.chatbot .chatbot-header-btn:hover {
  background-color: rgba(255, 255, 255, 0.35);
}

/* Close Button */
.chatbot .chatbot-close {
  background-color: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  z-index: 10;
}

.chatbot .chatbot-close i {
  pointer-events: none;
}

.chatbot .chatbot-close:hover {
  background-color: rgba(255, 255, 255, 0.35);
}

/* Tab Navigation */
.chatbot .chatbot-tabs {
  border-bottom: none;
  background-color: var(--chatbot-bg);
  display: flex;
  padding: 0;
  margin: 0 16px;
  border-bottom: 1px solid var(--chatbot-border);
}

.chatbot .chatbot-tab {
  flex: 1;
  color: var(--chatbot-text-secondary);
  border: none;
  background: none;
  border-radius: 0;
  padding: 14px 8px 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.chatbot .chatbot-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--chatbot-text);
  transition: width 0.2s ease;
}

.chatbot .chatbot-tab:hover {
  color: var(--chatbot-text);
}

.chatbot .chatbot-tab.active {
  color: var(--chatbot-text);
  font-weight: 600;
}

.chatbot .chatbot-tab.active::after {
  width: calc(100% - 16px);
}

/* Fixed Tabs */
.chatbot .nav-tabs {
  flex: 0 0 auto;
}

/* Scrollable Body Wrapper (Tab Content + Messages) */
.chatbot-body {
  flex: 1 1 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Tab Content */
.chatbot-content {
  flex: 0 0 auto;
  background-color: var(--chatbot-bg);
  border-bottom: 1px solid var(--chatbot-border);
  padding: 16px;
  margin: 0 16px;
}

.chatbot-content h6 {
  color: var(--chatbot-text);
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chatbot-content h6 i {
  color: var(--chatbot-text);
}

.chatbot-content .text-muted {
  color: var(--chatbot-text-secondary);
}

.chatbot-content p {
  margin: 0;
  line-height: 1.6;
  color: var(--chatbot-text);
  font-size: 0.9rem;
}

.chatbot .tab-content {
  display: none;
}

.chatbot .tab-content.active {
  display: block;
}

/* Blue Chat Messages */
.chatbot-messages {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 150px;
  background-color: var(--chatbot-bg);
  padding: 16px;
}

.chatbot-msg {
  display: flex;
  max-width: 85%;
}

.chatbot-msg--user {
  align-self: flex-end;
}

.chatbot-msg--assistant {
  align-self: flex-start;
}

.chatbot-msg--system {
  align-self: center;
  max-width: 100%;
}

.chatbot-msg-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}

/* User Message - Dark */
.chatbot-msg--user .chatbot-msg-content {
  background: var(--chatbot-user-bg);
  color: white;
  border-bottom-right-radius: 4px;
}

/* Assistant Message - Light */
.chatbot-msg--assistant .chatbot-msg-content {
  background: var(--chatbot-bg-alt);
  color: var(--chatbot-text);
  border: 1px solid var(--chatbot-border);
  border-bottom-left-radius: 4px;
}

/* System Message */
.chatbot-msg--system .chatbot-msg-content {
  background: var(--chatbot-bg-alt);
  color: var(--chatbot-text);
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 12px;
  opacity: 0.9;
}

/* Typing Indicator */
.chatbot-msg--typing .chatbot-msg-content {
  display: flex;
  gap: 4px;
  padding: 14px 20px;
}

.chatbot-typing-dot {
  width: 8px;
  height: 8px;
  background: var(--chatbot-primary-light);
  border-radius: 50%;
  animation: chatbot-typing 1.4s ease-in-out infinite;
}

.chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes chatbot-typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Chat Input */
.chatbot-footer {
  background-color: var(--chatbot-bg);
  border-top: 1px solid var(--chatbot-border);
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chatbot-footer .chatbot-input {
  flex: 1;
  border: none;
  background-color: var(--chatbot-bg-alt);
  border-radius: 18px;
  padding: 10px 18px;
  font-size: 14px;
  outline: none;
  transition: box-shadow 0.2s ease;
  resize: none;
  overflow-y: auto;
  line-height: 1.5;
  max-height: calc(1.5em * 5 + 20px);
  font-family: inherit;
}

.chatbot-footer .chatbot-input::placeholder {
  color: var(--chatbot-text-secondary);
}

.chatbot-footer .chatbot-input:focus {
  box-shadow: 0 0 0 2px var(--chatbot-primary-light);
}

/* Purple Send Button */
.chatbot-footer .chatbot-send {
  background: var(--chatbot-primary);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chatbot-footer .chatbot-send svg {
  margin-left: 2px;
}

.chatbot-footer .chatbot-send:hover {
  background: var(--chatbot-secondary);
  transform: scale(1.05);
}

.chatbot-footer .chatbot-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Custom Scrollbar */
.chatbot-body::-webkit-scrollbar {
  width: 6px;
}

.chatbot-body::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-body::-webkit-scrollbar-thumb {
  background: var(--chatbot-border);
  border-radius: 3px;
}

.chatbot-body::-webkit-scrollbar-thumb:hover {
  background: var(--chatbot-primary-light);
}

/* ============================================
   Floating Action Button (FAB)
   ============================================ */

.chat-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: var(--chatbot-primary);
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
}

.chat-fab:active {
  transform: scale(0.95);
}

.chat-fab-icon,
.chat-fab-close {
  position: absolute;
  transition: all 0.3s ease;
}

.chat-fab-icon {
  opacity: 1;
  transform: rotate(0deg);
}

.chat-fab-close {
  opacity: 0;
  transform: rotate(-90deg);
}

.chat-fab.active .chat-fab-icon {
  opacity: 0;
  transform: rotate(90deg);
}

.chat-fab.active .chat-fab-close {
  opacity: 1;
  transform: rotate(0deg);
}

.chat-fab.active {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
}

/* FAB Loading State */
.chat-fab.loading {
  pointer-events: none;
}

.chat-fab.loading .chat-fab-icon {
  opacity: 0;
}

.chat-fab.loading::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: fab-spin 0.8s linear infinite;
}

@keyframes fab-spin {
  to { transform: rotate(360deg); }
}

/* Pulse Animation */
.chat-fab::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: chatbot-pulse 2s ease-out infinite;
  z-index: -1;
}

.chat-fab.active::before {
  animation: none;
}

@keyframes chatbot-pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* ============================================
   Utilities
   ============================================ */

.chatbot[hidden] {
  display: none !important;
}

.chatbot [hidden] {
  display: none !important;
}

/* ============================================
   Inline Mode - \uCEE8\uD14C\uC774\uB108 \uC548\uC5D0 \uBC30\uCE58
   ============================================ */

.chatbot--inline {
  position: relative !important;
  bottom: auto !important;
  right: auto !important;
  left: auto !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  z-index: auto;
  border: 1px solid var(--chatbot-border);
  box-shadow: none !important;
}

.chatbot--inline .chatbot-header {
  display: none;
}

.chatbot--inline .chatbot-close {
  display: none;
}

/* ============================================
   Responsive
   ============================================ */

@media (max-width: 991.98px) {
  .chatbot {
    width: 100%;
    max-width: 450px;
  }
}

@media (max-width: 575.98px) {
  .chatbot {
    right: 12px;
    bottom: 80px;
    left: 12px;
    width: auto;
    max-width: none;
  }

  .chat-fab {
    right: 16px;
    bottom: 16px;
    width: 52px;
    height: 52px;
    font-size: 20px;
  }
}

/* ============================================
   Bootstrap \uD638\uD658 \uC2A4\uD0C0\uC77C (\uAE30\uC874 \uB9C8\uD06C\uC5C5 \uC9C0\uC6D0)
   ============================================ */

/* Bootstrap card \uAD6C\uC870 \uD638\uD658 */
.chatbot.card {
  border-radius: 20px !important;
  border: none !important;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2) !important;
}

.chatbot .card-header {
  background: var(--chatbot-primary) !important;
  border: none !important;
  border-radius: 20px 20px 0 0 !important;
  padding: 14px 20px !important;
}

.chatbot .card-header h5 {
  color: white !important;
}

.chatbot .btn-light {
  background-color: rgba(255, 255, 255, 0.25) !important;
  border: none !important;
  color: white !important;
  border-radius: 8px !important;
}

.chatbot .btn-light:hover {
  background-color: rgba(255, 255, 255, 0.35) !important;
}

/* Bootstrap nav-tabs \uD638\uD658 */
.chatbot .nav-tabs {
  border-bottom: 1px solid var(--chatbot-border) !important;
  background-color: var(--chatbot-bg);
  padding: 0 8px;
}

.chatbot .nav-link {
  color: var(--chatbot-text-secondary);
  border: none;
  border-radius: 0;
  padding: 14px 8px 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.chatbot .nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--chatbot-primary);
  transition: width 0.2s ease;
}

.chatbot .nav-link:hover {
  color: var(--chatbot-primary);
  background-color: transparent;
}

.chatbot .nav-link.active {
  color: var(--chatbot-primary);
  background-color: transparent;
  font-weight: 600;
}

.chatbot .nav-link.active::after {
  width: 100%;
}

/* Bootstrap card-footer \uD638\uD658 */
.chatbot .card-footer {
  background-color: var(--chatbot-bg) !important;
  border-top: 1px solid var(--chatbot-border) !important;
  padding: 12px 16px !important;
}

.chatbot .card-footer .form-control {
  border: none !important;
  background-color: var(--chatbot-bg-alt) !important;
  border-radius: 24px !important;
  padding: 12px 18px !important;
}

.chatbot .card-footer .form-control:focus {
  box-shadow: 0 0 0 2px var(--chatbot-primary-light) !important;
}

.chatbot .card-footer .btn-primary {
  background: var(--chatbot-primary) !important;
  border: none !important;
  border-radius: 50% !important;
  width: 44px !important;
  height: 44px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.chatbot .card-footer .btn-primary:hover {
  background: var(--chatbot-secondary) !important;
  transform: scale(1.05);
}

/* ============================================
   Quiz Styles
   ============================================ */

.chatbot-quiz {
  font-size: 0.9rem;
}

.chatbot-quiz-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.chatbot-quiz-progress .chatbot-quiz-count {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  background: var(--chatbot-text);
  border: none;
  color: white;
}

.chatbot-quiz-progress .chatbot-quiz-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
}

.chatbot-quiz-progress .chatbot-quiz-type-badge.choice {
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #6EE7B7;
}

.chatbot-quiz-progress .chatbot-quiz-type-badge.ox {
  background: #FEF3C7;
  color: #D97706;
  border: 1px solid #FCD34D;
}

.chatbot-quiz-question {
  padding: 0;
  background: transparent;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.chatbot-quiz-question strong {
  color: var(--chatbot-text);
}

.chatbot-quiz-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chatbot-quiz-option {
  padding: 14px 16px;
  background: white;
  border: 1px solid var(--chatbot-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.chatbot-quiz-option:hover {
  border-color: var(--chatbot-primary-light);
}

.chatbot-quiz-option.selected {
  background: rgba(124, 58, 237, 0.05);
  border-color: var(--chatbot-primary);
  border-width: 2px;
}

.chatbot-quiz-option .chatbot-option-num {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  background: #ECFDF5;
  color: #059669;
  border: 1.5px solid #6EE7B7;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-right: 12px;
  flex-shrink: 0;
}

.chatbot-quiz-option.selected .chatbot-option-num {
  background: var(--chatbot-primary);
  color: white;
  border-color: var(--chatbot-primary);
}

.chatbot-quiz-ox-options {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 8px 0;
}

.chatbot-quiz-option.chatbot-quiz-ox {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 12px;
  padding: 0;
}

.chatbot-quiz-option.chatbot-quiz-ox.selected {
  border-width: 3px;
}

.chatbot-quiz-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.chatbot-quiz-nav-buttons {
  display: flex;
  gap: 8px;
}

.chatbot-quiz-result {
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 12px;
}

.chatbot-quiz-result.correct {
  background: #ECFDF5;
}

.chatbot-quiz-result.wrong {
  background: #FEF2F2;
}

.chatbot-quiz-result .chatbot-result-icon {
  font-size: 1rem;
  margin-right: 4px;
}

.chatbot-quiz-result .chatbot-result-correct {
  color: #059669;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.chatbot-quiz-result .chatbot-result-wrong {
  color: #DC2626;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.chatbot-quiz-result .chatbot-result-explanation {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--chatbot-text-secondary);
  line-height: 1.5;
}

/* ============================================
   Embed Widget - Standalone Components
   Bootstrap \uC5C6\uC774 \uB3D9\uC791\uD558\uB294 \uC790\uCCB4 \uC2A4\uD0C0\uC77C
   ============================================ */

/* Tab content (embed\uC6A9 malgn- \uC811\uB450\uC5B4) */
.malgn-tab-content {
  display: none;
}

.malgn-tab-content.active {
  display: block;
}

/* Buttons */
.chatbot-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 10px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chatbot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chatbot-btn-primary {
  background: var(--chatbot-primary);
  color: white;
  border-color: var(--chatbot-primary);
}

.chatbot-btn-primary:hover:not(:disabled) {
  background: var(--chatbot-secondary);
  border-color: var(--chatbot-secondary);
}

.chatbot-btn-outline {
  background: white;
  color: var(--chatbot-text);
  border-color: var(--chatbot-border);
}

.chatbot-btn-outline:hover:not(:disabled) {
  background: var(--chatbot-bg-alt);
  border-color: var(--chatbot-text);
  color: var(--chatbot-text);
}

/* Badges */
.chatbot-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 11px;
  background: var(--chatbot-text-secondary);
  color: white;
  margin-right: 8px;
  flex-shrink: 0;
}

.chatbot-badge-primary {
  background: var(--chatbot-primary);
}

.chatbot-badge-info {
  background: #0dcaf0;
}

.chatbot-badge-warning {
  background: #ffc107;
  color: #212529;
}

.chatbot-badge-choice {
  background: #FEF3C7;
  color: #92400E;
}

.chatbot-badge-ox {
  background: #FCE7F3;
  color: #9D174D;
}

/* Text colors (Bootstrap \uB300\uCCB4) */
.chatbot .text-success { color: #198754; }
.chatbot .text-danger { color: #dc3545; }
.chatbot .text-warning { color: #ffc107; }
.chatbot .text-muted { color: #6c757d; }
.chatbot .small { font-size: 0.85em; }

/* Summary item (embed\uC6A9) */
.chatbot .chatbot-summary-item {
  margin-bottom: 6px;
  padding: 8px 0;
  background: transparent;
  border: none;
  border-radius: 0;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
}

.chatbot .chatbot-summary-item:last-child {
  margin-bottom: 0;
}

.chatbot .chatbot-summary-item .chatbot-badge {
  min-width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 6px;
  font-size: 0.75rem;
  margin-top: 2px;
}

/* Recommend question (embed\uC6A9) */
.chatbot .chatbot-recommend-item {
  margin-bottom: 10px;
  border: 1.5px solid var(--chatbot-primary-light);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.chatbot .chatbot-recommend-item:last-child {
  margin-bottom: 0;
}

.chatbot .chatbot-recommend-item:hover {
  border-color: var(--chatbot-primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
}

.chatbot .chatbot-recommend-question {
  padding: 14px 16px;
  background: rgba(124, 58, 237, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.chatbot .chatbot-recommend-question:hover {
  background: rgba(124, 58, 237, 0.08);
}

.chatbot .chatbot-recommend-q-text {
  flex: 1;
}

.chatbot .chatbot-recommend-toggle {
  font-size: 0.7rem;
  color: var(--chatbot-text-secondary);
  margin-left: 8px;
}

.chatbot .chatbot-recommend-answer {
  padding: 12px 16px 14px;
  background: rgba(124, 58, 237, 0.02);
  border-top: 1px solid var(--chatbot-border);
  color: var(--chatbot-text-secondary);
  font-size: 0.9em;
  line-height: 1.6;
}

.chatbot .chatbot-recommend-a-label {
  font-weight: 600;
  color: var(--chatbot-primary);
  margin-right: 4px;
}

.chatbot .chatbot-recommend-question .chatbot-badge {
  min-width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 8px;
  background: var(--chatbot-primary);
  color: white;
  font-size: 0.8rem;
}

#malgn-tab-recommend h6,
#malgn-tab-recommend h6 i,
#tab-recommend h6,
#tab-recommend h6 i {
  color: var(--chatbot-primary);
}

/* Quiz spacing (embed\uC6A9) */
.chatbot .chatbot-quiz-progress { margin-bottom: 12px; }
.chatbot .chatbot-quiz-question { margin-bottom: 16px; }
.chatbot .chatbot-quiz-nav { margin-top: 16px; }
.chatbot .chatbot-quiz-result { margin-top: 12px; }

/* Markdown Styles */
.chatbot-msg-content .chatbot-h {
  display: block;
  margin: 8px 0 4px;
}

.chatbot-msg-content .chatbot-h1 { font-size: 1.1em; }
.chatbot-msg-content .chatbot-h2 { font-size: 1.05em; }
.chatbot-msg-content .chatbot-h3 { font-size: 1em; }
.chatbot-msg-content .chatbot-h4 { font-size: 0.95em; }

.chatbot-msg-content .chatbot-list {
  margin: 6px 0;
  padding-left: 20px;
}

.chatbot-msg-content .chatbot-list li {
  margin-bottom: 4px;
  line-height: 1.6;
}

.chatbot-msg-content .chatbot-inline-code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "SF Mono", "Consolas", "Menlo", monospace;
  font-size: 0.9em;
}

.chatbot-msg-content .chatbot-code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  font-family: "SF Mono", "Consolas", "Menlo", monospace;
  font-size: 0.85em;
  line-height: 1.5;
}

.chatbot-msg-content .chatbot-code-block code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

.chatbot-msg-content .chatbot-hr {
  border: none;
  border-top: 1px solid var(--chatbot-border);
  margin: 8px 0;
}

/* Text colors */
.chatbot .text-success { color: #059669 !important; }
.chatbot .text-danger { color: #DC2626 !important; }
`});var u,L=m(()=>{I();u={chatbot:null,fab:null,root:null,isInline:!1,inject(h){let t=h.width||380,e=h.height||650;this.isInline=h.mode==="inline";let o=document.createElement("div");o.id="malgn-tutor-host",this.isInline&&(o.style.cssText="display:block;width:100%;height:100%;");let r=o.attachShadow({mode:"open"});this.root=r;let i=document.createElement("style");i.textContent=M,r.appendChild(i);let s=document.createElement("link");if(s.rel="stylesheet",s.href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",r.appendChild(s),!this.isInline){let c=document.createElement("button");c.id="malgn-fab",c.className="chat-fab",c.title="\uCC44\uD305 \uC5F4\uAE30",c.innerHTML=`
        <i class="bi bi-chat-dots-fill chat-fab-icon"></i>
        <i class="bi bi-x-lg chat-fab-close"></i>
      `,r.appendChild(c),this.fab=c}let n=document.createElement("div");if(n.id="malgn-chatbot",this.isInline?n.className="chatbot chatbot--inline":(n.className="chatbot",n.hidden=!0,n.style.width=t+"px",n.style.height=e+"px"),n.innerHTML=`
      <!-- Header -->
      <div class="chatbot-header">
        <span class="chatbot-title">
          <i class="bi bi-mortarboard-fill chatbot-title-icon"></i>
          ${h.title||"AI \uD29C\uD130 \uB9D1\uC740\uC0D8"}
        </span>
        <div class="chatbot-header-actions">
          <button class="chatbot-header-btn" id="malgn-reset" title="\uB300\uD654 \uCD08\uAE30\uD654">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="chatbot-close" id="malgn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="chatbot-tabs">
        <button class="chatbot-tab active" data-tab="goals">\uD559\uC2B5 \uBAA9\uD45C</button>
        <button class="chatbot-tab" data-tab="summary">\uD559\uC2B5 \uC694\uC57D</button>
        <button class="chatbot-tab" data-tab="recommend">\uCD94\uCC9C \uC9C8\uBB38</button>
        <button class="chatbot-tab" data-tab="quiz">\uD034\uC988</button>
      </div>

      <!-- Scrollable Body -->
      <div class="chatbot-body" id="malgn-body">
        <!-- Tab Content -->
        <div class="chatbot-content">
          <div class="malgn-tab-content active" id="malgn-tab-goals">
            <h6>
              <i class="bi bi-stars"></i> \uD559\uC2B5\uBAA9\uD45C
            </h6>
            <div id="malgn-goals-text">\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</div>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-summary">
            <h6>
              <i class="bi bi-journal-text"></i> \uC694\uC57D
            </h6>
            <div id="malgn-summary-text">\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</div>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-recommend">
            <h6>
              <i class="bi bi-chat-left-quote"></i> \uCD94\uCC9C\uC9C8\uBB38
            </h6>
            <div id="malgn-recommend-text">\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</div>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-quiz">
            <h6>
              <i class="bi bi-patch-question"></i> \uD034\uC988
            </h6>
            <div id="malgn-quiz-text">\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chatbot-messages" id="malgn-messages">
          <div class="chatbot-msg chatbot-msg--assistant">
            <div class="chatbot-msg-content">
              \uC548\uB155\uD558\uC138\uC694! AI \uD29C\uD130\uC785\uB2C8\uB2E4. \uAD81\uAE08\uD55C \uC810\uC774 \uC788\uC73C\uBA74 \uC5B8\uC81C\uB4E0 \uBB3C\uC5B4\uBCF4\uC138\uC694!
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chatbot-footer">
        <textarea class="chatbot-input" id="malgn-input" placeholder="\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694" rows="1"></textarea>
        <button class="chatbot-send" id="malgn-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    `,r.appendChild(n),this.isInline&&h.container){let c=typeof h.container=="string"?document.querySelector(h.container):h.container;c?c.appendChild(o):(console.error("[MalgnTutor] Container not found:",h.container),document.body.appendChild(o))}else document.body.appendChild(o);this.chatbot=n},open(){this.isInline||(this.chatbot&&(this.chatbot.hidden=!1),this.fab&&this.fab.classList.add("active"))},setFabLoading(h){this.fab&&(h?this.fab.classList.add("loading"):this.fab.classList.remove("loading"))},close(){this.isInline||(this.chatbot&&(this.chatbot.hidden=!0),this.fab&&this.fab.classList.remove("active"))},toggle(){this.isInline||(this.chatbot&&this.chatbot.hidden?this.open():this.close())}}});function b(h){let t=document.createElement("div");return t.textContent=h,t.innerHTML}function w(h){if(!h)return"";let t=[],e=h.replace(/```(\w*)\n?([\s\S]*?)```/g,(l,a,d)=>{let p=t.length;return t.push(`<pre class="chatbot-code-block"><code>${b(d.trim())}</code></pre>`),`\0CODEBLOCK${p}\0`}),o=[];e=e.replace(/`([^`]+)`/g,(l,a)=>{let d=o.length;return o.push(`<code class="chatbot-inline-code">${b(a)}</code>`),`\0INLINE${d}\0`});let r=e.split(`
`),i=[],s=!1,n=null;for(let l=0;l<r.length;l++){let a=r[l];if(a.includes("\0CODEBLOCK")){s&&(i.push(n==="ol"?"</ol>":"</ul>"),s=!1),i.push(a);continue}if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(a.trim())){s&&(i.push(n==="ol"?"</ol>":"</ul>"),s=!1),i.push('<hr class="chatbot-hr">');continue}let d=a.match(/^(#{1,4})\s+(.+)$/);if(d){s&&(i.push(n==="ol"?"</ol>":"</ul>"),s=!1);let C=d[1].length;i.push(`<strong class="chatbot-h chatbot-h${C}">${v(b(d[2]))}</strong>`);continue}let p=a.match(/^(\d+)[.)]\s+(.+)$/);if(p){(!s||n!=="ol")&&(s&&i.push(n==="ol"?"</ol>":"</ul>"),i.push('<ol class="chatbot-list">'),s=!0,n="ol"),i.push(`<li>${v(b(p[2]))}</li>`);continue}let g=a.match(/^[\-\*•]\s+(.+)$/);if(g){(!s||n!=="ul")&&(s&&i.push(n==="ol"?"</ol>":"</ul>"),i.push('<ul class="chatbot-list">'),s=!0,n="ul"),i.push(`<li>${v(b(g[1]))}</li>`);continue}if(s&&(i.push(n==="ol"?"</ol>":"</ul>"),s=!1),a.trim()===""){i.push("<br>");continue}i.push(`<span>${v(b(a))}</span>`)}s&&i.push(n==="ol"?"</ol>":"</ul>");let c=i.join(`
`);return t.forEach((l,a)=>{c=c.replace(`\0CODEBLOCK${a}\0`,l)}),o.forEach((l,a)=>{c=c.replace(`\0INLINE${a}\0`,l)}),c}function v(h){return h.replace(/\*{3}(.+?)\*{3}/g,"<strong><em>$1</em></strong>").replace(/\*{2}(.+?)\*{2}/g,"<strong>$1</strong>").replace(/__(.+?)__/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/(?<!\w)_(.+?)_(?!\w)/g,"<em>$1</em>")}var z=m(()=>{});var q,$=m(()=>{z();q=class{constructor(t,e,o){this.api=t,this.config=e,this.root=o,this.sessionId=null,this.isLoading=!1,this.onSessionCreating=null,this.onSessionCreated=null}init(){this.messagesEl=this.root.querySelector("#malgn-messages"),this.inputEl=this.root.querySelector("#malgn-input"),this.sendBtn=this.root.querySelector("#malgn-send"),this.sendBtn.addEventListener("click",()=>this.sendMessage()),this.inputEl.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),this.sendMessage())}),this.inputEl.addEventListener("input",()=>this.autoResize()),this.inputEl.addEventListener("focus",()=>this.scrollToBottom())}autoResize(){this.inputEl.style.height="auto";let t=parseInt(getComputedStyle(this.inputEl).lineHeight)*5;this.inputEl.style.height=Math.min(this.inputEl.scrollHeight,t)+"px"}async loadSession(t){this.sessionId=t;try{let e=await this.api.getSession(t);e.success&&(this.clearMessages(),(e.data.messages||[]).forEach(r=>{r.role==="user"?this.addUserMessage(r.content):this.addAssistantMessage(r.content)}),this.onSessionLoaded&&this.onSessionLoaded(e.data))}catch(e){console.error("\uC138\uC158 \uB85C\uB4DC \uC2E4\uD328:",e)}}clearMessages(){this.messagesEl.innerHTML=""}async ensureSession(){if(this.sessionId)return this.sessionId;this.onSessionCreating&&this.onSessionCreating();let t=await this.api.createSession(this.config.contentIds||[],{courseId:this.config.courseId,courseUserId:this.config.courseUserId,lessonId:this.config.lessonId,userId:this.config.userId,settings:this.config.settings,parentSessionId:this.config.parentSessionId});return t.success&&(this.sessionId=t.data.session.id,this.onSessionCreated&&this.onSessionCreated(t.data)),this.sessionId}async sendMessage(t){let e=t||this.inputEl.value.trim();if(!(!e||this.isLoading)){this.inputEl.value="",this.inputEl.style.height="auto",this.addUserMessage(e),this.setLoading(!0);try{await this.ensureSession();let o=document.createElement("div");o.className="chatbot-msg chatbot-msg--assistant chatbot-msg--typing";let r=document.createElement("div");r.className="chatbot-msg-content",r.innerHTML='<span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span>',o.appendChild(r),this.messagesEl.appendChild(o),this.scrollToBottom();let i="",s=!1;await this.api.sendMessageStream(e,this.sessionId,this.config.settings||{},n=>{s||(s=!0,o.classList.remove("chatbot-msg--typing"),r.textContent=""),i+=n,r.textContent=i,this.scrollToBottom()},n=>{let c=n?.sanitizedResponse||i;r.innerHTML=w(c),this.scrollToBottom(),this.setLoading(!1)},n=>{console.error("\uC2A4\uD2B8\uB9AC\uBC0D \uC2E4\uD328:",n),s||(r.textContent=""),r.innerHTML=w(i||"\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: "+n.message),this.setLoading(!1)})}catch(o){console.error("\uBA54\uC2DC\uC9C0 \uC804\uC1A1 \uC2E4\uD328:",o),this.addAssistantMessage("\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: "+o.message),this.setLoading(!1)}}}addUserMessage(t){let e=document.createElement("div");e.className="chatbot-msg chatbot-msg--user",e.innerHTML=`<div class="chatbot-msg-content">${b(t).replace(/\n/g,"<br>")}</div>`,this.messagesEl.appendChild(e),this.scrollToBottom()}addAssistantMessage(t){let e=document.createElement("div");e.className="chatbot-msg chatbot-msg--assistant",e.innerHTML=`<div class="chatbot-msg-content">${w(t)}</div>`,this.messagesEl.appendChild(e),this.scrollToBottom()}addTypingIndicator(){if(this.root.querySelector("#malgn-typing"))return;let t=document.createElement("div");t.id="malgn-typing",t.className="chatbot-msg chatbot-msg--assistant chatbot-msg--typing",t.innerHTML=`
      <div class="chatbot-msg-content">
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
      </div>
    `,this.messagesEl.appendChild(t),this.scrollToBottom()}removeTypingIndicator(){let t=this.root.querySelector("#malgn-typing");t&&t.remove()}setLoading(t){this.isLoading=t,this.sendBtn.disabled=t,this.inputEl.disabled=t,t||this.inputEl.focus()}scrollToBottom(){requestAnimationFrame(()=>{let t=this.root.querySelector("#malgn-body");t&&(t.scrollTop=t.scrollHeight)})}}});var k,T=m(()=>{z();k=class{constructor(t){this.root=t,this.onQuestionClick=null}init(){this.root.querySelectorAll("#malgn-chatbot .chatbot-tab").forEach(e=>{e.addEventListener("click",()=>this.switchTab(e.dataset.tab))})}switchTab(t){let e=this.root.querySelectorAll("#malgn-chatbot .chatbot-tab"),o=this.root.querySelectorAll("#malgn-chatbot .malgn-tab-content");e.forEach(l=>l.classList.remove("active")),o.forEach(l=>l.classList.remove("active"));let r=this.root.querySelector(`#malgn-chatbot .chatbot-tab[data-tab="${t}"]`),i=this.root.querySelector(`#malgn-tab-${t}`);r&&r.classList.add("active"),i&&i.classList.add("active");let s=this.root.querySelector("#malgn-messages"),n=this.root.querySelector(".chatbot-footer");t==="quiz"?(s&&(s.style.display="none"),n&&(n.style.display="none")):(s&&(s.style.display=""),n&&(n.style.display=""));let c=this.root.querySelector("#malgn-body");c&&(c.scrollTop=0)}renderLearningData(t){let e=this.root.querySelector("#malgn-goals-text");e&&(e.textContent=t.goal||"\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");let o=this.root.querySelector("#malgn-summary-text");if(o){let i=t.summary;Array.isArray(i)&&i.length>0?o.innerHTML=i.map((s,n)=>`<div class="chatbot-summary-item">
            <span class="chatbot-badge">${n+1}</span>${b(s)}
          </div>`).join(""):i?o.textContent=i:o.textContent="\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}let r=this.root.querySelector("#malgn-recommend-text");if(r){let i=t.recommendedQuestions||[];i.length>0?(r.innerHTML=i.map((s,n)=>{let c=typeof s=="string"?s:s.question||"",l=typeof s=="object"&&s.answer||"";return`<div class="chatbot-recommend-item">
            <div class="chatbot-recommend-question" data-question="${b(c)}">
              <span class="chatbot-badge chatbot-badge-primary">${n+1}</span>
              <span class="chatbot-recommend-q-text">${b(c)}</span>
              ${l?'<span class="chatbot-recommend-toggle">\u25BC</span>':""}
            </div>
            ${l?`<div class="chatbot-recommend-answer" style="display:none;">
              <span class="chatbot-recommend-a-label">A.</span> ${b(l)}
            </div>`:""}
          </div>`}).join(""),r.querySelectorAll(".chatbot-recommend-question").forEach(s=>{s.addEventListener("click",()=>{let c=s.closest(".chatbot-recommend-item")?.querySelector(".chatbot-recommend-answer"),l=s.querySelector(".chatbot-recommend-toggle");if(c){let a=c.style.display!=="none";c.style.display=a?"none":"block",l&&(l.textContent=a?"\u25BC":"\u25B2")}else if(this.onQuestionClick){let a=s.dataset.question;a&&this.onQuestionClick(a)}})})):r.textContent="\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}}clearLearningData(){let t=this.root.querySelector("#malgn-goals-text"),e=this.root.querySelector("#malgn-summary-text"),o=this.root.querySelector("#malgn-recommend-text"),r=this.root.querySelector("#malgn-quiz-text");t&&(t.textContent="\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),e&&(e.textContent="\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),o&&(o.textContent="\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),r&&(r.textContent="\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.")}}});var S,B=m(()=>{z();S=class{constructor(t,e){this.api=t,this.root=e,this.quizzes=[],this.currentIndex=0,this.answers={},this.checked={},this.attempts={}}async loadQuizzes(t){let e=this.root.querySelector("#malgn-quiz-text");if(e)try{let o=await this.api.getQuizzes(t);o.success&&o.data.quizzes&&o.data.quizzes.length>0?(this.quizzes=o.data.quizzes,this.currentIndex=0,this.answers={},this.checked={},this.attempts={},this.renderCurrentQuiz()):e.textContent="\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}catch(o){console.error("\uD034\uC988 \uB85C\uB4DC \uC2E4\uD328:",o),e.textContent="\uD034\uC988\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."}}renderCurrentQuiz(){let t=this.root.querySelector("#malgn-quiz-text");if(!t||this.quizzes.length===0)return;let e=this.quizzes[this.currentIndex],o=this.quizzes.length,r=this.currentIndex+1,i=e.quizType==="choice",s=`
      <div class="chatbot-quiz">
        <div class="chatbot-quiz-progress">
          <span class="chatbot-quiz-count">${r} / ${o}</span>
          <span class="chatbot-quiz-type-badge ${i?"choice":"ox"}">
            ${i?"4\uC9C0\uC120\uB2E4":"OX\uD034\uC988"}
          </span>
        </div>
        <div class="chatbot-quiz-question">
          <strong>Q${r}.</strong> ${b(e.question)}
        </div>
        <div class="chatbot-quiz-options">
    `;if(i)e.options.forEach((a,d)=>{let p=d+1,g=this.answers[e.id]===String(p);s+=`
          <div class="chatbot-quiz-option ${g?"selected":""}" data-quiz-id="${e.id}" data-answer="${p}">
            <span class="chatbot-option-num">${p}</span>
            <span>${b(a)}</span>
          </div>
        `});else{let a=this.answers[e.id]==="O",d=this.answers[e.id]==="X";s+=`
        <div class="chatbot-quiz-ox-options">
          <div class="chatbot-quiz-option chatbot-quiz-ox ${a?"selected":""}" data-quiz-id="${e.id}" data-answer="O">O</div>
          <div class="chatbot-quiz-option chatbot-quiz-ox ${d?"selected":""}" data-quiz-id="${e.id}" data-answer="X">X</div>
        </div>
      `}s+=`
        </div>
        <div class="chatbot-quiz-nav">
          <div class="chatbot-quiz-nav-buttons">
            <button class="chatbot-btn chatbot-btn-outline" id="malgn-prev-quiz" ${r===1?"disabled":""}>
              <i class="bi bi-chevron-left"></i> \uC774\uC804
            </button>
            <button class="chatbot-btn chatbot-btn-outline" id="malgn-next-quiz" ${r===o?"disabled":""} ${this.checked[e.id]?"":'style="display:none"'}>
              \uB2E4\uC74C <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <button class="chatbot-btn chatbot-btn-primary" id="malgn-check-answer" ${this.checked[e.id]?'style="display:none"':""}>\uC815\uB2F5 \uD655\uC778</button>
        </div>
        <div class="chatbot-quiz-result" id="malgn-quiz-result" style="display: none;"></div>
      </div>
    `,t.innerHTML=s,t.querySelectorAll(".chatbot-quiz-option").forEach(a=>{a.addEventListener("click",()=>{this.answers[a.dataset.quizId]=a.dataset.answer,this.renderCurrentQuiz()})});let n=this.root.querySelector("#malgn-prev-quiz"),c=this.root.querySelector("#malgn-next-quiz"),l=this.root.querySelector("#malgn-check-answer");n&&n.addEventListener("click",()=>this.prev()),c&&c.addEventListener("click",()=>this.next()),l&&l.addEventListener("click",()=>this.checkAnswer())}prev(){this.currentIndex>0&&(this.currentIndex--,this.renderCurrentQuiz())}next(){this.currentIndex<this.quizzes.length-1&&(this.currentIndex++,this.renderCurrentQuiz())}checkAnswer(){let t=this.quizzes[this.currentIndex],e=this.answers[t.id],o=this.root.querySelector("#malgn-quiz-result");if(!o)return;if(!e){o.className="chatbot-quiz-result",o.innerHTML='<span class="text-warning">\uB2F5\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.</span>',o.style.display="block";return}this.attempts[t.id]=(this.attempts[t.id]||0)+1;let r=this.attempts[t.id],i=e===t.answer,s=i?"chatbot-result-correct":"chatbot-result-wrong",n=i?"bi-check-circle-fill":"bi-x-circle-fill",c=i?"\uC815\uB2F5\uC785\uB2C8\uB2E4.":"\uC624\uB2F5\uC785\uB2C8\uB2E4.";o.className=`chatbot-quiz-result ${i?"correct":"wrong"}`;let l=`
      <div class="${s}">
        <i class="bi ${n} chatbot-result-icon"></i>${c}
      </div>
    `;if(!i&&r===1&&(l+='<div class="chatbot-result-explanation">\uB2E4\uC2DC \uD55C \uBC88 \uB3C4\uC804\uD574 \uBCF4\uC138\uC694!</div>'),(i||r>=2)&&t.explanation&&(l+=`<div class="chatbot-result-explanation"><strong>\uD574\uC124:</strong> ${b(t.explanation)}</div>`),o.innerHTML=l,o.style.display="block",i||r>=2){this.checked[t.id]=!0;let a=this.root.querySelector("#malgn-next-quiz"),d=this.root.querySelector("#malgn-check-answer");a&&this.currentIndex<this.quizzes.length-1&&(a.style.display=""),d&&(d.style.display="none")}}}});var H=F(()=>{E();L();$();T();B();if(window.__malgnTutorLoaded)console.warn("[MalgnTutor] Already loaded, skipping.");else{let h=function(){let t=window.MalgnTutor;if(!t||!t.apiUrl){console.error("[MalgnTutor] window.MalgnTutor.apiUrl is required.");return}let e=t.mode==="inline";if(!document.querySelector('link[href*="bootstrap-icons"]')){let a=document.createElement("link");a.rel="stylesheet",a.href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",document.head.appendChild(a)}let o=new y(t.apiUrl,t.apiKey);u.inject({mode:t.mode||"layer",container:t.container||null,title:t.title||"",videoIframeId:t.videoIframeId||"",width:t.width||380,height:t.height||650});let r=u.root,i=new k(r);i.init();let s=new S(o,r),n=t.welcomeMessage||"",c=new q(o,{contentIds:t.contentIds||[],courseId:t.courseId||0,courseUserId:t.courseUserId||0,lessonId:t.lessonId||0,userId:t.userId||0,settings:t.settings||{},parentSessionId:t.parentSessionId||0},r);if(c.init(),c.onSessionCreating=()=>{u.setFabLoading(!0)},c.onSessionCreated=a=>{u.setFabLoading(!1),a.learning&&i.renderLearningData(a.learning),a.session&&a.session.id&&s.loadQuizzes(a.session.id),a.messages&&a.messages.length>0?(c.clearMessages(),a.messages.forEach(d=>{d.role==="user"?c.addUserMessage(d.content):c.addAssistantMessage(d.content)})):n&&c.addAssistantMessage(n)},c.onSessionLoaded=a=>{a.learning&&i.renderLearningData(a.learning),a.id&&s.loadQuizzes(a.id),n&&(!a.messages||a.messages.length===0)&&c.addAssistantMessage(n)},i.onQuestionClick=a=>{c.sendMessage(a)},t.sessionId?c.loadSession(t.sessionId):t.parentSessionId&&c.ensureSession(),!e){r.querySelector("#malgn-fab").addEventListener("click",()=>u.toggle());let a=r.querySelector("#malgn-close");a&&a.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation(),u.close()})}let l=r.querySelector("#malgn-reset");l&&l.addEventListener("click",()=>{confirm("\uB300\uD654 \uB0B4\uC6A9\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")&&(c.clearMessages(),n&&c.addAssistantMessage(n))}),console.log(`[MalgnTutor] Initialized (${e?"inline":"layer"} mode, Shadow DOM).`)};window.__malgnTutorLoaded=!0,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",h):h()}});H();})();
