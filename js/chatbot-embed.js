(()=>{var g=(c,t)=>()=>(c&&(t=c(c=0)),t);var B=(c,t)=>()=>(t||c((t={exports:{}}).exports,t),t.exports);var y,E=g(()=>{y=class{constructor(t,e){this.baseUrl=t,this.apiKey=e}getHeaders(t=!0){let e={};return this.apiKey&&(e.Authorization=`Bearer ${this.apiKey}`),t&&(e["Content-Type"]="application/json"),e}async handleResponse(t){if(t.status===401)throw new Error("API Key\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");if(!t.ok){let e=await t.json().catch(()=>({}));throw new Error(e.error?.message||"\uC694\uCCAD \uC2E4\uD328")}return t.json()}async createSession(t,e={}){let o={content_ids:t};e.courseId&&(o.course_id=e.courseId),e.courseUserId&&(o.course_user_id=e.courseUserId),e.lessonId&&(o.lesson_id=e.lessonId),e.userId&&(o.user_id=e.userId),e.settings&&(o.settings=e.settings),e.parentSessionId&&(o.parent_id=e.parentSessionId);let s=await fetch(`${this.baseUrl}/sessions`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(o)});return this.handleResponse(s)}async getSession(t){let e=await fetch(`${this.baseUrl}/sessions/${t}`,{headers:this.getHeaders(!1)});return this.handleResponse(e)}async sendMessage(t,e,o={}){let s=await fetch(`${this.baseUrl}/chat`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify({message:t,sessionId:e,settings:o})});return this.handleResponse(s)}async sendMessageStream(t,e,o={},s,i,n){try{let a=await fetch(`${this.baseUrl}/chat/stream`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify({message:t,sessionId:e,settings:o})});if(!a.ok){let d=await a.json().catch(()=>({}));n&&n(new Error(d.error?.message||"\uC2A4\uD2B8\uB9AC\uBC0D \uC694\uCCAD \uC2E4\uD328"));return}let r=a.body.pipeThrough(new TextDecoderStream).getReader(),l="",h="";for(;;){let{done:d,value:p}=await r.read();if(d)break;l+=p;let u=l.split(`
`);l=u.pop()||"";for(let C of u){let f=C.trim();if(f){if(f.startsWith("event: "))h=f.slice(7);else if(f.startsWith("data: "))try{let x=JSON.parse(f.slice(6));h==="token"&&x.response&&s?s(x.response):h==="done"&&i?i(x):h==="error"&&n&&n(new Error(x.message))}catch{}}}}}catch(a){n&&n(a)}}async getQuizzes(t){let e=await fetch(`${this.baseUrl}/sessions/${t}/quizzes`,{headers:this.getHeaders(!1)});return this.handleResponse(e)}}});var L,I=g(()=>{L=`/* ============================================
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
.chatbot .chatbot-recommend-question {
  margin-bottom: 10px;
  padding: 14px 16px;
  background: rgba(124, 58, 237, 0.04);
  border: 1.5px solid var(--chatbot-primary-light);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.chatbot .chatbot-recommend-question:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: var(--chatbot-primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
}

.chatbot .chatbot-recommend-question:last-child {
  margin-bottom: 0;
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
#malgn-tab-recommend h6 i {
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
`});var m,M=g(()=>{I();m={chatbot:null,fab:null,root:null,isInline:!1,inject(c){let t=c.width||380,e=c.height||650;this.isInline=c.mode==="inline";let o=document.createElement("div");o.id="malgn-tutor-host",this.isInline&&(o.style.cssText="display:block;width:100%;height:100%;");let s=o.attachShadow({mode:"open"});this.root=s;let i=document.createElement("style");i.textContent=L,s.appendChild(i);let n=document.createElement("link");if(n.rel="stylesheet",n.href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",s.appendChild(n),!this.isInline){let r=document.createElement("button");r.id="malgn-fab",r.className="chat-fab",r.title="\uCC44\uD305 \uC5F4\uAE30",r.innerHTML=`
        <i class="bi bi-chat-dots-fill chat-fab-icon"></i>
        <i class="bi bi-x-lg chat-fab-close"></i>
      `,s.appendChild(r),this.fab=r}let a=document.createElement("div");if(a.id="malgn-chatbot",this.isInline?a.className="chatbot chatbot--inline":(a.className="chatbot",a.hidden=!0,a.style.width=t+"px",a.style.height=e+"px"),a.innerHTML=`
      <!-- Header -->
      <div class="chatbot-header">
        <span class="chatbot-title">
          <i class="bi bi-mortarboard-fill chatbot-title-icon"></i>
          ${c.title||"AI \uD29C\uD130 \uB9D1\uC740\uC0D8"}
        </span>
        <button class="chatbot-close" id="malgn-close">
          <i class="bi bi-x-lg"></i>
        </button>
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
    `,s.appendChild(a),this.isInline&&c.container){let r=typeof c.container=="string"?document.querySelector(c.container):c.container;r?r.appendChild(o):(console.error("[MalgnTutor] Container not found:",c.container),document.body.appendChild(o))}else document.body.appendChild(o);this.chatbot=a},open(){this.isInline||(this.chatbot&&(this.chatbot.hidden=!1),this.fab&&this.fab.classList.add("active"))},setFabLoading(c){this.fab&&(c?this.fab.classList.add("loading"):this.fab.classList.remove("loading"))},close(){this.isInline||(this.chatbot&&(this.chatbot.hidden=!0),this.fab&&this.fab.classList.remove("active"))},toggle(){this.isInline||(this.chatbot&&this.chatbot.hidden?this.open():this.close())}}});function b(c){let t=document.createElement("div");return t.textContent=c,t.innerHTML}function w(c){if(!c)return"";let t=[],e=c.replace(/```(\w*)\n?([\s\S]*?)```/g,(l,h,d)=>{let p=t.length;return t.push(`<pre class="chatbot-code-block"><code>${b(d.trim())}</code></pre>`),`\0CODEBLOCK${p}\0`}),o=[];e=e.replace(/`([^`]+)`/g,(l,h)=>{let d=o.length;return o.push(`<code class="chatbot-inline-code">${b(h)}</code>`),`\0INLINE${d}\0`});let s=e.split(`
`),i=[],n=!1,a=null;for(let l=0;l<s.length;l++){let h=s[l];if(h.includes("\0CODEBLOCK")){n&&(i.push(a==="ol"?"</ol>":"</ul>"),n=!1),i.push(h);continue}if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(h.trim())){n&&(i.push(a==="ol"?"</ol>":"</ul>"),n=!1),i.push('<hr class="chatbot-hr">');continue}let d=h.match(/^(#{1,4})\s+(.+)$/);if(d){n&&(i.push(a==="ol"?"</ol>":"</ul>"),n=!1);let C=d[1].length;i.push(`<strong class="chatbot-h chatbot-h${C}">${v(b(d[2]))}</strong>`);continue}let p=h.match(/^(\d+)[.)]\s+(.+)$/);if(p){(!n||a!=="ol")&&(n&&i.push(a==="ol"?"</ol>":"</ul>"),i.push('<ol class="chatbot-list">'),n=!0,a="ol"),i.push(`<li>${v(b(p[2]))}</li>`);continue}let u=h.match(/^[\-\*•]\s+(.+)$/);if(u){(!n||a!=="ul")&&(n&&i.push(a==="ol"?"</ol>":"</ul>"),i.push('<ul class="chatbot-list">'),n=!0,a="ul"),i.push(`<li>${v(b(u[1]))}</li>`);continue}if(n&&(i.push(a==="ol"?"</ol>":"</ul>"),n=!1),h.trim()===""){i.push("<br>");continue}i.push(`<span>${v(b(h))}</span>`)}n&&i.push(a==="ol"?"</ol>":"</ul>");let r=i.join(`
`);return t.forEach((l,h)=>{r=r.replace(`\0CODEBLOCK${h}\0`,l)}),o.forEach((l,h)=>{r=r.replace(`\0INLINE${h}\0`,l)}),r}function v(c){return c.replace(/\*{3}(.+?)\*{3}/g,"<strong><em>$1</em></strong>").replace(/\*{2}(.+?)\*{2}/g,"<strong>$1</strong>").replace(/__(.+?)__/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/(?<!\w)_(.+?)_(?!\w)/g,"<em>$1</em>")}var z=g(()=>{});var q,$=g(()=>{z();q=class{constructor(t,e,o){this.api=t,this.config=e,this.root=o,this.sessionId=null,this.isLoading=!1,this.onSessionCreating=null,this.onSessionCreated=null}init(){this.messagesEl=this.root.querySelector("#malgn-messages"),this.inputEl=this.root.querySelector("#malgn-input"),this.sendBtn=this.root.querySelector("#malgn-send"),this.sendBtn.addEventListener("click",()=>this.sendMessage()),this.inputEl.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),this.sendMessage())}),this.inputEl.addEventListener("input",()=>this.autoResize()),this.inputEl.addEventListener("focus",()=>this.scrollToBottom())}autoResize(){this.inputEl.style.height="auto";let t=parseInt(getComputedStyle(this.inputEl).lineHeight)*5;this.inputEl.style.height=Math.min(this.inputEl.scrollHeight,t)+"px"}async loadSession(t){this.sessionId=t;try{let e=await this.api.getSession(t);e.success&&(this.clearMessages(),(e.data.messages||[]).forEach(s=>{s.role==="user"?this.addUserMessage(s.content):this.addAssistantMessage(s.content)}),this.onSessionLoaded&&this.onSessionLoaded(e.data))}catch(e){console.error("\uC138\uC158 \uB85C\uB4DC \uC2E4\uD328:",e)}}clearMessages(){this.messagesEl.innerHTML=""}async ensureSession(){if(this.sessionId)return this.sessionId;this.onSessionCreating&&this.onSessionCreating();let t=await this.api.createSession(this.config.contentIds||[],{courseId:this.config.courseId,courseUserId:this.config.courseUserId,lessonId:this.config.lessonId,userId:this.config.userId,settings:this.config.settings,parentSessionId:this.config.parentSessionId});return t.success&&(this.sessionId=t.data.session.id,this.onSessionCreated&&this.onSessionCreated(t.data)),this.sessionId}async sendMessage(t){let e=t||this.inputEl.value.trim();if(!(!e||this.isLoading)){this.inputEl.value="",this.inputEl.style.height="auto",this.addUserMessage(e),this.setLoading(!0);try{await this.ensureSession();let o=document.createElement("div");o.className="chatbot-msg chatbot-msg--assistant chatbot-msg--typing";let s=document.createElement("div");s.className="chatbot-msg-content",s.innerHTML='<span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span><span class="chatbot-typing-dot"></span>',o.appendChild(s),this.messagesEl.appendChild(o),this.scrollToBottom();let i="",n=!1;await this.api.sendMessageStream(e,this.sessionId,this.config.settings||{},a=>{n||(n=!0,o.classList.remove("chatbot-msg--typing"),s.textContent=""),i+=a,s.textContent=i,this.scrollToBottom()},a=>{s.innerHTML=w(i),this.scrollToBottom(),this.setLoading(!1)},a=>{console.error("\uC2A4\uD2B8\uB9AC\uBC0D \uC2E4\uD328:",a),n||(s.textContent=""),s.innerHTML=w(i||"\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: "+a.message),this.setLoading(!1)})}catch(o){console.error("\uBA54\uC2DC\uC9C0 \uC804\uC1A1 \uC2E4\uD328:",o),this.addAssistantMessage("\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: "+o.message),this.setLoading(!1)}}}addUserMessage(t){let e=document.createElement("div");e.className="chatbot-msg chatbot-msg--user",e.innerHTML=`<div class="chatbot-msg-content">${b(t).replace(/\n/g,"<br>")}</div>`,this.messagesEl.appendChild(e),this.scrollToBottom()}addAssistantMessage(t){let e=document.createElement("div");e.className="chatbot-msg chatbot-msg--assistant",e.innerHTML=`<div class="chatbot-msg-content">${w(t)}</div>`,this.messagesEl.appendChild(e),this.scrollToBottom()}addTypingIndicator(){if(this.root.querySelector("#malgn-typing"))return;let t=document.createElement("div");t.id="malgn-typing",t.className="chatbot-msg chatbot-msg--assistant chatbot-msg--typing",t.innerHTML=`
      <div class="chatbot-msg-content">
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
        <span class="chatbot-typing-dot"></span>
      </div>
    `,this.messagesEl.appendChild(t),this.scrollToBottom()}removeTypingIndicator(){let t=this.root.querySelector("#malgn-typing");t&&t.remove()}setLoading(t){this.isLoading=t,this.sendBtn.disabled=t,this.inputEl.disabled=t,t||this.inputEl.focus()}scrollToBottom(){requestAnimationFrame(()=>{let t=this.root.querySelector("#malgn-body");t&&(t.scrollTop=t.scrollHeight)})}}});var k,T=g(()=>{z();k=class{constructor(t){this.root=t,this.onQuestionClick=null}init(){this.root.querySelectorAll("#malgn-chatbot .chatbot-tab").forEach(e=>{e.addEventListener("click",()=>this.switchTab(e.dataset.tab))})}switchTab(t){let e=this.root.querySelectorAll("#malgn-chatbot .chatbot-tab"),o=this.root.querySelectorAll("#malgn-chatbot .malgn-tab-content");e.forEach(l=>l.classList.remove("active")),o.forEach(l=>l.classList.remove("active"));let s=this.root.querySelector(`#malgn-chatbot .chatbot-tab[data-tab="${t}"]`),i=this.root.querySelector(`#malgn-tab-${t}`);s&&s.classList.add("active"),i&&i.classList.add("active");let n=this.root.querySelector("#malgn-messages"),a=this.root.querySelector(".chatbot-footer");t==="quiz"?(n&&(n.style.display="none"),a&&(a.style.display="none")):(n&&(n.style.display=""),a&&(a.style.display=""));let r=this.root.querySelector("#malgn-body");r&&(r.scrollTop=0)}renderLearningData(t){let e=this.root.querySelector("#malgn-goals-text");e&&(e.textContent=t.goal||"\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");let o=this.root.querySelector("#malgn-summary-text");if(o){let i=t.summary;Array.isArray(i)&&i.length>0?o.innerHTML=i.map((n,a)=>`<div class="chatbot-summary-item">
            <span class="chatbot-badge">${a+1}</span>${b(n)}
          </div>`).join(""):i?o.textContent=i:o.textContent="\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}let s=this.root.querySelector("#malgn-recommend-text");if(s){let i=t.recommendedQuestions||[];i.length>0?(s.innerHTML=i.map((n,a)=>`<div class="chatbot-recommend-question" data-question="${b(n)}">
            <span class="chatbot-badge chatbot-badge-primary">${a+1}</span>${b(n)}
          </div>`).join(""),s.querySelectorAll(".chatbot-recommend-question").forEach(n=>{n.addEventListener("click",()=>{let a=n.dataset.question;a&&this.onQuestionClick&&this.onQuestionClick(a)})})):s.textContent="\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}}clearLearningData(){let t=this.root.querySelector("#malgn-goals-text"),e=this.root.querySelector("#malgn-summary-text"),o=this.root.querySelector("#malgn-recommend-text"),s=this.root.querySelector("#malgn-quiz-text");t&&(t.textContent="\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),e&&(e.textContent="\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),o&&(o.textContent="\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),s&&(s.textContent="\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.")}}});var S,F=g(()=>{z();S=class{constructor(t,e){this.api=t,this.root=e,this.quizzes=[],this.currentIndex=0,this.answers={},this.checked={},this.attempts={}}async loadQuizzes(t){let e=this.root.querySelector("#malgn-quiz-text");if(e)try{let o=await this.api.getQuizzes(t);o.success&&o.data.quizzes&&o.data.quizzes.length>0?(this.quizzes=o.data.quizzes,this.currentIndex=0,this.answers={},this.checked={},this.attempts={},this.renderCurrentQuiz()):e.textContent="\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}catch(o){console.error("\uD034\uC988 \uB85C\uB4DC \uC2E4\uD328:",o),e.textContent="\uD034\uC988\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."}}renderCurrentQuiz(){let t=this.root.querySelector("#malgn-quiz-text");if(!t||this.quizzes.length===0)return;let e=this.quizzes[this.currentIndex],o=this.quizzes.length,s=this.currentIndex+1,i=e.quizType==="choice",n=`
      <div class="chatbot-quiz">
        <div class="chatbot-quiz-progress">
          <span class="chatbot-quiz-count">${s} / ${o}</span>
          <span class="chatbot-quiz-type-badge ${i?"choice":"ox"}">
            ${i?"4\uC9C0\uC120\uB2E4":"OX\uD034\uC988"}
          </span>
        </div>
        <div class="chatbot-quiz-question">
          <strong>Q${s}.</strong> ${b(e.question)}
        </div>
        <div class="chatbot-quiz-options">
    `;if(i)e.options.forEach((h,d)=>{let p=d+1,u=this.answers[e.id]===String(p);n+=`
          <div class="chatbot-quiz-option ${u?"selected":""}" data-quiz-id="${e.id}" data-answer="${p}">
            <span class="chatbot-option-num">${p}</span>
            <span>${b(h)}</span>
          </div>
        `});else{let h=this.answers[e.id]==="O",d=this.answers[e.id]==="X";n+=`
        <div class="chatbot-quiz-ox-options">
          <div class="chatbot-quiz-option chatbot-quiz-ox ${h?"selected":""}" data-quiz-id="${e.id}" data-answer="O">O</div>
          <div class="chatbot-quiz-option chatbot-quiz-ox ${d?"selected":""}" data-quiz-id="${e.id}" data-answer="X">X</div>
        </div>
      `}n+=`
        </div>
        <div class="chatbot-quiz-nav">
          <div class="chatbot-quiz-nav-buttons">
            <button class="chatbot-btn chatbot-btn-outline" id="malgn-prev-quiz" ${s===1?"disabled":""}>
              <i class="bi bi-chevron-left"></i> \uC774\uC804
            </button>
            <button class="chatbot-btn chatbot-btn-outline" id="malgn-next-quiz" ${s===o?"disabled":""} ${this.checked[e.id]?"":'style="display:none"'}>
              \uB2E4\uC74C <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <button class="chatbot-btn chatbot-btn-primary" id="malgn-check-answer" ${this.checked[e.id]?'style="display:none"':""}>\uC815\uB2F5 \uD655\uC778</button>
        </div>
        <div class="chatbot-quiz-result" id="malgn-quiz-result" style="display: none;"></div>
      </div>
    `,t.innerHTML=n,t.querySelectorAll(".chatbot-quiz-option").forEach(h=>{h.addEventListener("click",()=>{this.answers[h.dataset.quizId]=h.dataset.answer,this.renderCurrentQuiz()})});let a=this.root.querySelector("#malgn-prev-quiz"),r=this.root.querySelector("#malgn-next-quiz"),l=this.root.querySelector("#malgn-check-answer");a&&a.addEventListener("click",()=>this.prev()),r&&r.addEventListener("click",()=>this.next()),l&&l.addEventListener("click",()=>this.checkAnswer())}prev(){this.currentIndex>0&&(this.currentIndex--,this.renderCurrentQuiz())}next(){this.currentIndex<this.quizzes.length-1&&(this.currentIndex++,this.renderCurrentQuiz())}checkAnswer(){let t=this.quizzes[this.currentIndex],e=this.answers[t.id],o=this.root.querySelector("#malgn-quiz-result");if(!o)return;if(!e){o.className="chatbot-quiz-result",o.innerHTML='<span class="text-warning">\uB2F5\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.</span>',o.style.display="block";return}this.attempts[t.id]=(this.attempts[t.id]||0)+1;let s=this.attempts[t.id],i=e===t.answer,n=i?"chatbot-result-correct":"chatbot-result-wrong",a=i?"bi-check-circle-fill":"bi-x-circle-fill",r=i?"\uC815\uB2F5\uC785\uB2C8\uB2E4.":"\uC624\uB2F5\uC785\uB2C8\uB2E4.";o.className=`chatbot-quiz-result ${i?"correct":"wrong"}`;let l=`
      <div class="${n}">
        <i class="bi ${a} chatbot-result-icon"></i>${r}
      </div>
    `;if(!i&&s===1&&(l+='<div class="chatbot-result-explanation">\uB2E4\uC2DC \uD55C \uBC88 \uB3C4\uC804\uD574 \uBCF4\uC138\uC694!</div>'),(i||s>=2)&&t.explanation&&(l+=`<div class="chatbot-result-explanation"><strong>\uD574\uC124:</strong> ${b(t.explanation)}</div>`),o.innerHTML=l,o.style.display="block",i||s>=2){this.checked[t.id]=!0;let h=this.root.querySelector("#malgn-next-quiz"),d=this.root.querySelector("#malgn-check-answer");h&&this.currentIndex<this.quizzes.length-1&&(h.style.display=""),d&&(d.style.display="none")}}}});var H=B(()=>{E();M();$();T();F();if(window.__malgnTutorLoaded)console.warn("[MalgnTutor] Already loaded, skipping.");else{let c=function(){let t=window.MalgnTutor;if(!t||!t.apiUrl){console.error("[MalgnTutor] window.MalgnTutor.apiUrl is required.");return}let e=t.mode==="inline";if(!document.querySelector('link[href*="bootstrap-icons"]')){let r=document.createElement("link");r.rel="stylesheet",r.href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",document.head.appendChild(r)}let o=new y(t.apiUrl,t.apiKey);m.inject({mode:t.mode||"layer",container:t.container||null,title:t.title||"",videoIframeId:t.videoIframeId||"",width:t.width||380,height:t.height||650});let s=m.root,i=new k(s);i.init();let n=new S(o,s),a=new q(o,{contentIds:t.contentIds||[],courseId:t.courseId||0,courseUserId:t.courseUserId||0,lessonId:t.lessonId||0,userId:t.userId||0,settings:t.settings||{},parentSessionId:t.parentSessionId||0},s);if(a.init(),a.onSessionCreating=()=>{m.setFabLoading(!0)},a.onSessionCreated=r=>{m.setFabLoading(!1),r.learning&&i.renderLearningData(r.learning),r.session&&r.session.id&&n.loadQuizzes(r.session.id),r.messages&&r.messages.length>0&&(a.clearMessages(),r.messages.forEach(l=>{l.role==="user"?a.addUserMessage(l.content):a.addAssistantMessage(l.content)}))},a.onSessionLoaded=r=>{r.learning&&i.renderLearningData(r.learning),r.id&&n.loadQuizzes(r.id)},i.onQuestionClick=r=>{a.sendMessage(r)},t.sessionId&&a.loadSession(t.sessionId),!e){s.querySelector("#malgn-fab").addEventListener("click",()=>m.toggle());let r=s.querySelector("#malgn-close");r&&r.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),m.close()})}console.log(`[MalgnTutor] Initialized (${e?"inline":"layer"} mode, Shadow DOM).`)};window.__malgnTutorLoaded=!0,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",c):c()}});H();})();
