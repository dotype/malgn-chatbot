(()=>{var u=(o,t)=>()=>(o&&(t=o(o=0)),t);var T=(o,t)=>()=>(t||o((t={exports:{}}).exports,t),t.exports);var m,z=u(()=>{m=class{constructor(t,e){this.baseUrl=t,this.apiKey=e}getHeaders(t=!0){let e={};return this.apiKey&&(e.Authorization=`Bearer ${this.apiKey}`),t&&(e["Content-Type"]="application/json"),e}async handleResponse(t){if(t.status===401)throw new Error("API Key\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");if(!t.ok){let e=await t.json().catch(()=>({}));throw new Error(e.error?.message||"\uC694\uCCAD \uC2E4\uD328")}return t.json()}async createSession(t,e={}){let s={content_ids:t};e.courseId&&(s.course_id=e.courseId),e.courseUserId&&(s.course_user_id=e.courseUserId),e.lessonId&&(s.lesson_id=e.lessonId),e.settings&&(s.settings=e.settings);let n=await fetch(`${this.baseUrl}/sessions`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(s)});return this.handleResponse(n)}async getSession(t){let e=await fetch(`${this.baseUrl}/sessions/${t}`,{headers:this.getHeaders(!1)});return this.handleResponse(e)}async sendMessage(t,e,s={}){let n=await fetch(`${this.baseUrl}/chat`,{method:"POST",headers:this.getHeaders(),body:JSON.stringify({message:t,sessionId:e,settings:s})});return this.handleResponse(n)}async getQuizzes(t){let e=await fetch(`${this.baseUrl}/sessions/${t}/quizzes`,{headers:this.getHeaders(!1)});return this.handleResponse(e)}}});var h,I=u(()=>{h={chatbot:null,fab:null,inject(o){let t=o.width||380,e=o.height||650,s=document.createElement("button");s.id="malgn-fab",s.className="chat-fab",s.title="\uCC44\uD305 \uC5F4\uAE30",s.innerHTML=`
      <i class="bi bi-chat-dots-fill chat-fab-icon"></i>
      <i class="bi bi-x-lg chat-fab-close"></i>
    `,document.body.appendChild(s),this.fab=s;let n=document.createElement("div");n.id="malgn-chatbot",n.className="chatbot",n.hidden=!0,n.style.width=t+"px",n.style.height=e+"px",n.innerHTML=`
      <!-- Header -->
      <div class="chatbot-header">
        <span class="chatbot-title">AI \uD29C\uD130 \uB9D1\uC740\uC0D8</span>
        <button class="chatbot-close" id="malgn-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div class="chatbot-tabs">
        <button class="chatbot-tab active" data-tab="goals">\uBAA9\uD45C</button>
        <button class="chatbot-tab" data-tab="summary">\uC694\uC57D</button>
        <button class="chatbot-tab" data-tab="recommend">\uCD94\uCC9C</button>
        <button class="chatbot-tab" data-tab="quiz">\uD034\uC988</button>
      </div>

      <!-- Scrollable Body -->
      <div class="chatbot-body" id="malgn-body">
        <!-- Tab Content -->
        <div class="chatbot-content">
          <div class="malgn-tab-content active" id="malgn-tab-goals">
            <h6>
              <i class="bi bi-bullseye"></i> \uD559\uC2B5\uBAA9\uD45C
            </h6>
            <p id="malgn-goals-text">\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</p>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-summary">
            <h6>
              <i class="bi bi-card-text"></i> \uC694\uC57D
            </h6>
            <p id="malgn-summary-text">\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</p>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-recommend">
            <h6>
              <i class="bi bi-lightbulb"></i> \uCD94\uCC9C \uC9C8\uBB38
            </h6>
            <p id="malgn-recommend-text">\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</p>
          </div>
          <div class="malgn-tab-content" id="malgn-tab-quiz">
            <h6>
              <i class="bi bi-question-circle"></i> \uD034\uC988
            </h6>
            <p id="malgn-quiz-text">\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chatbot-messages" id="malgn-messages">
          <div class="message message--assistant">
            <div class="message-content">
              \uC548\uB155\uD558\uC138\uC694! AI \uD29C\uD130\uC785\uB2C8\uB2E4. \uAD81\uAE08\uD55C \uC810\uC774 \uC788\uC73C\uBA74 \uC5B8\uC81C\uB4E0 \uBB3C\uC5B4\uBCF4\uC138\uC694!
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chatbot-footer">
        <input type="text" class="chatbot-input" id="malgn-input" placeholder="\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694...">
        <button class="chatbot-send" id="malgn-send">
          <i class="bi bi-send"></i>
        </button>
      </div>
    `,document.body.appendChild(n),this.chatbot=n},open(){this.chatbot&&(this.chatbot.hidden=!1),this.fab&&this.fab.classList.add("active")},setFabLoading(o){this.fab&&(o?this.fab.classList.add("loading"):this.fab.classList.remove("loading"))},close(){console.log("[MalgnTutor] UI.close() called",this.chatbot,this.fab),this.chatbot&&(this.chatbot.hidden=!0,console.log("[MalgnTutor] chatbot.hidden set to true")),this.fab&&this.fab.classList.remove("active")},toggle(){this.chatbot&&this.chatbot.hidden?this.open():this.close()}}});function d(o){let t=document.createElement("div");return t.textContent=o,t.innerHTML}function E(o){return d(o).replace(/\n/g,"<br>")}var g=u(()=>{});var b,q=u(()=>{g();b=class{constructor(t,e){this.api=t,this.config=e,this.sessionId=null,this.isLoading=!1,this.onSessionCreating=null,this.onSessionCreated=null}init(){this.messagesEl=document.getElementById("malgn-messages"),this.inputEl=document.getElementById("malgn-input"),this.sendBtn=document.getElementById("malgn-send"),this.sendBtn.addEventListener("click",()=>this.sendMessage()),this.inputEl.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),this.sendMessage())}),this.inputEl.addEventListener("focus",()=>this.scrollToBottom())}async loadSession(t){this.sessionId=t;try{let e=await this.api.getSession(t);e.success&&(this.clearMessages(),(e.data.messages||[]).forEach(n=>{n.role==="user"?this.addUserMessage(n.content):this.addAssistantMessage(n.content)}),this.onSessionLoaded&&this.onSessionLoaded(e.data))}catch(e){console.error("\uC138\uC158 \uB85C\uB4DC \uC2E4\uD328:",e)}}clearMessages(){this.messagesEl.innerHTML=""}async ensureSession(){if(this.sessionId)return this.sessionId;this.onSessionCreating&&this.onSessionCreating();let t=await this.api.createSession(this.config.contentIds||[],{courseId:this.config.courseId,courseUserId:this.config.courseUserId,lessonId:this.config.lessonId,settings:this.config.settings});return t.success&&(this.sessionId=t.data.session.id,this.onSessionCreated&&this.onSessionCreated(t.data)),this.sessionId}async sendMessage(t){let e=t||this.inputEl.value.trim();if(!(!e||this.isLoading)){this.inputEl.value="",this.addUserMessage(e),this.setLoading(!0),this.addTypingIndicator();try{await this.ensureSession();let s=await this.api.sendMessage(e,this.sessionId,this.config.settings||{});this.removeTypingIndicator(),s.success?this.addAssistantMessage(s.data.response):this.addAssistantMessage("\uC8C4\uC1A1\uD569\uB2C8\uB2E4. \uC751\uB2F5\uC744 \uC0DD\uC131\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.")}catch(s){console.error("\uBA54\uC2DC\uC9C0 \uC804\uC1A1 \uC2E4\uD328:",s),this.removeTypingIndicator(),this.addAssistantMessage("\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: "+s.message)}this.setLoading(!1)}}addUserMessage(t){let e=document.createElement("div");e.className="message message--user",e.innerHTML=`<div class="message-content">${d(t)}</div>`,this.messagesEl.appendChild(e),this.scrollToBottom()}addAssistantMessage(t){let e=document.createElement("div");e.className="message message--assistant",e.innerHTML=`<div class="message-content">${E(t)}</div>`,this.messagesEl.appendChild(e),this.scrollToBottom()}addTypingIndicator(){if(document.getElementById("malgn-typing"))return;let t=document.createElement("div");t.id="malgn-typing",t.className="message message--assistant message--typing",t.innerHTML=`
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `,this.messagesEl.appendChild(t),this.scrollToBottom()}removeTypingIndicator(){let t=document.getElementById("malgn-typing");t&&t.remove()}setLoading(t){this.isLoading=t,this.sendBtn.disabled=t,this.inputEl.disabled=t,t||this.inputEl.focus()}scrollToBottom(){requestAnimationFrame(()=>{let t=document.getElementById("malgn-body");t&&(t.scrollTop=t.scrollHeight)})}}});var p,x=u(()=>{g();p=class{constructor(){this.onQuestionClick=null}init(){document.querySelectorAll("#malgn-chatbot .chatbot-tab").forEach(e=>{e.addEventListener("click",()=>this.switchTab(e.dataset.tab))})}switchTab(t){let e=document.querySelectorAll("#malgn-chatbot .chatbot-tab"),s=document.querySelectorAll("#malgn-chatbot .malgn-tab-content");e.forEach(i=>i.classList.remove("active")),s.forEach(i=>i.classList.remove("active"));let n=document.querySelector(`#malgn-chatbot .chatbot-tab[data-tab="${t}"]`),a=document.getElementById(`malgn-tab-${t}`);n&&n.classList.add("active"),a&&a.classList.add("active");let c=document.getElementById("malgn-body");c&&(c.scrollTop=0)}renderLearningData(t){let e=document.getElementById("malgn-goals-text");e&&(e.textContent=t.goal||"\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");let s=document.getElementById("malgn-summary-text");if(s){let a=t.summary;Array.isArray(a)&&a.length>0?s.innerHTML=a.map((c,i)=>`<div class="summary-item">
            <span class="chatbot-badge">${i+1}</span>${d(c)}
          </div>`).join(""):a?s.textContent=a:s.textContent="\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}let n=document.getElementById("malgn-recommend-text");if(n){let a=t.recommendedQuestions||[];a.length>0?(n.innerHTML=a.map((c,i)=>`<div class="recommend-question" data-question="${d(c)}">
            <span class="chatbot-badge chatbot-badge-primary">${i+1}</span>${d(c)}
          </div>`).join(""),n.querySelectorAll(".recommend-question").forEach(c=>{c.addEventListener("click",()=>{let i=c.dataset.question;i&&this.onQuestionClick&&this.onQuestionClick(i)})})):n.textContent="\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}}clearLearningData(){let t=document.getElementById("malgn-goals-text"),e=document.getElementById("malgn-summary-text"),s=document.getElementById("malgn-recommend-text"),n=document.getElementById("malgn-quiz-text");t&&(t.textContent="\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),e&&(e.textContent="\uC694\uC57D\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),s&&(s.textContent="\uCD94\uCC9C \uC9C8\uBB38\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."),n&&(n.textContent="\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.")}}});var f,w=u(()=>{g();f=class{constructor(t){this.api=t,this.quizzes=[],this.currentIndex=0,this.answers={}}async loadQuizzes(t){let e=document.getElementById("malgn-quiz-text");if(e)try{let s=await this.api.getQuizzes(t);s.success&&s.data.quizzes&&s.data.quizzes.length>0?(this.quizzes=s.data.quizzes,this.currentIndex=0,this.answers={},this.renderCurrentQuiz()):e.textContent="\uD034\uC988\uAC00 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."}catch(s){console.error("\uD034\uC988 \uB85C\uB4DC \uC2E4\uD328:",s),e.textContent="\uD034\uC988\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."}}renderCurrentQuiz(){let t=document.getElementById("malgn-quiz-text");if(!t||this.quizzes.length===0)return;let e=this.quizzes[this.currentIndex],s=this.quizzes.length,n=this.currentIndex+1,a=`
      <div class="quiz-container">
        <div class="quiz-progress">
          <span class="chatbot-badge chatbot-badge-primary">${n} / ${s}</span>
          <span class="chatbot-badge ${e.quizType==="choice"?"chatbot-badge-info":"chatbot-badge-warning"}">
            ${e.quizType==="choice"?"4\uC9C0\uC120\uB2E4":"OX\uD034\uC988"}
          </span>
        </div>
        <div class="quiz-question">
          <strong>Q${n}.</strong> ${d(e.question)}
        </div>
        <div class="quiz-options">
    `;if(e.quizType==="choice")e.options.forEach((l,v)=>{let y=v+1,L=this.answers[e.id]===String(y);a+=`
          <div class="quiz-option ${L?"selected":""}" data-quiz-id="${e.id}" data-answer="${y}">
            <span class="option-num">${y}</span> ${d(l)}
          </div>
        `});else{let l=this.answers[e.id]==="O",v=this.answers[e.id]==="X";a+=`
        <div class="quiz-ox-options">
          <div class="quiz-option quiz-ox ${l?"selected":""}" data-quiz-id="${e.id}" data-answer="O">O</div>
          <div class="quiz-option quiz-ox ${v?"selected":""}" data-quiz-id="${e.id}" data-answer="X">X</div>
        </div>
      `}a+=`
        </div>
        <div class="quiz-nav">
          <button class="chatbot-btn chatbot-btn-outline" id="malgn-prev-quiz" ${n===1?"disabled":""}>
            <i class="bi bi-chevron-left"></i> \uC774\uC804
          </button>
          <button class="chatbot-btn chatbot-btn-outline" id="malgn-next-quiz" ${n===s?"disabled":""}>
            \uB2E4\uC74C <i class="bi bi-chevron-right"></i>
          </button>
          <button class="chatbot-btn chatbot-btn-primary" id="malgn-check-answer">\uC815\uB2F5 \uD655\uC778</button>
        </div>
        <div class="quiz-result" id="malgn-quiz-result" style="display: none;"></div>
      </div>
    `,t.innerHTML=a,t.querySelectorAll(".quiz-option").forEach(l=>{l.addEventListener("click",()=>{this.answers[l.dataset.quizId]=l.dataset.answer,this.renderCurrentQuiz()})});let c=document.getElementById("malgn-prev-quiz"),i=document.getElementById("malgn-next-quiz"),r=document.getElementById("malgn-check-answer");c&&c.addEventListener("click",()=>this.prev()),i&&i.addEventListener("click",()=>this.next()),r&&r.addEventListener("click",()=>this.checkAnswer())}prev(){this.currentIndex>0&&(this.currentIndex--,this.renderCurrentQuiz())}next(){this.currentIndex<this.quizzes.length-1&&(this.currentIndex++,this.renderCurrentQuiz())}checkAnswer(){let t=this.quizzes[this.currentIndex],e=this.answers[t.id],s=document.getElementById("malgn-quiz-result");if(!s)return;if(!e){s.innerHTML='<span class="text-warning">\uB2F5\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.</span>',s.style.display="block";return}let n=e===t.answer,r=`
      <div class="${n?"text-success":"text-danger"}">
        <i class="bi ${n?"bi-check-circle-fill":"bi-x-circle-fill"}"></i> ${n?"\uC815\uB2F5\uC785\uB2C8\uB2E4!":"\uC624\uB2F5\uC785\uB2C8\uB2E4."}
      </div>
    `;n||(r+=`<div class="text-muted small">\uC815\uB2F5: ${t.answer}</div>`),t.explanation&&(r+=`<div class="text-muted small"><strong>\uD574\uC124:</strong> ${d(t.explanation)}</div>`),s.innerHTML=r,s.style.display="block"}}});var C=T(()=>{z();I();q();x();w();if(window.__malgnTutorLoaded)console.warn("[MalgnTutor] Already loaded, skipping.");else{let o=function(){let t=window.MalgnTutor;if(!t||!t.apiUrl){console.error("[MalgnTutor] window.MalgnTutor.apiUrl is required.");return}if(!document.querySelector('link[href*="bootstrap-icons"]')){let i=document.createElement("link");i.rel="stylesheet",i.href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",document.head.appendChild(i)}let e=new m(t.apiUrl,t.apiKey);h.inject({width:t.width||380,height:t.height||650});let s=new p;s.init();let n=new f(e),a=new b(e,{contentIds:t.contentIds||[],courseId:t.courseId||0,courseUserId:t.courseUserId||0,lessonId:t.lessonId||0,settings:t.settings||{}});a.init(),a.onSessionCreating=()=>{h.setFabLoading(!0)},a.onSessionCreated=i=>{h.setFabLoading(!1),i.learning&&s.renderLearningData(i.learning),i.session&&i.session.id&&n.loadQuizzes(i.session.id)},a.onSessionLoaded=i=>{i.learning&&s.renderLearningData(i.learning),i.id&&n.loadQuizzes(i.id)},s.onQuestionClick=i=>{a.sendMessage(i)},t.sessionId&&a.loadSession(t.sessionId),document.getElementById("malgn-fab").addEventListener("click",()=>h.toggle());let c=document.getElementById("malgn-close");console.log("[MalgnTutor] Close button found:",c),c?c.addEventListener("click",i=>{console.log("[MalgnTutor] Close button clicked"),i.preventDefault(),i.stopPropagation(),h.close()}):console.error("[MalgnTutor] Close button not found!"),console.log("[MalgnTutor] Initialized successfully.")};window.__malgnTutorLoaded=!0,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o):o()}});C();})();
