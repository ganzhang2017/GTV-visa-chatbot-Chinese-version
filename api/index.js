// api/index.js - GUARANTEED WORKING VERSION with resume analysis
export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>英国全球人才签证助手 - 中文版</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 10px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            max-width: 450px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            height: 600px;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            font-weight: 600;
            position: relative;
        }
        
        .chat {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .message {
            padding: 12px 16px;
            border-radius: 15px;
            max-width: 85%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
            animation: slideIn 0.3s ease;
            white-space: pre-wrap;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .bot-message {
            background: white;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .user-message {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
        }
        
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .guide-button {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border: 1px solid #667eea;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            white-space: nowrap;
        }
        
        .guide-button:hover {
            background: #667eea;
            color: white;
        }
        
        .workflow-button {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
        }
        
        .workflow-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        
        .input-area {
            padding: 20px;
            background: white;
            border-top: 1px solid #e9ecef;
        }
        
        .input-row {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        #messageInput {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            outline: none;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        
        #messageInput:focus {
            border-color: #667eea;
        }
        
        #sendBtn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 20px;
            cursor: pointer;
            font-weight: 600;
            min-width: 70px;
            transition: all 0.2s;
        }
        
        #sendBtn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        #sendBtn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .upload-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 12px;
        }
        
        #uploadBtn {
            background: #28a745;
            color: white;
            border: none;
            border-radius: 15px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
        }
        
        #uploadBtn:hover {
            background: #218838;
        }
        
        #fileInput { display: none; }
        
        .upload-status {
            color: #6c757d;
            font-size: 11px;
        }
        
        .typing {
            background: #e9ecef;
            color: #6c757d;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
        }
        
        .typing::after {
            content: '思考中●●●';
            animation: typing 1.4s infinite;
        }
        
        @keyframes typing {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
        }
        
        .progress-indicator {
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 11px;
            align-self: flex-start;
            margin-bottom: 10px;
        }

        .resume-info {
            background: #e8f4f8;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 10px;
            margin: 10px 0;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>🇨🇳 英国全球人才签证助手</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">数字技术路线 - Tech Nation</div>
        </div>
        
        <div id="chat" class="chat">
            <!-- Messages appear here -->
        </div>
        
        <div class="input-area">
            <div class="input-row">
                <input type="text" id="messageInput" placeholder="输入您的回复..." disabled>
                <button id="sendBtn" disabled>发送</button>
            </div>
            
            <div class="upload-section">
                <button id="uploadBtn">📄 上传简历 (PDF)</button>
                <input type="file" id="fileInput" accept=".pdf">
                <span class="upload-status" id="uploadStatus"></span>
            </div>
        </div>
    </div>
    
    <script>
        class ChineseGuidedBot {
            constructor() {
                this.chat = document.getElementById('chat');
                this.messageInput = document.getElementById('messageInput');
                this.sendBtn = document.getElementById('sendBtn');
                this.uploadBtn = document.getElementById('uploadBtn');
                this.fileInput = document.getElementById('fileInput');
                this.uploadStatus = document.getElementById('uploadStatus');
                
                this.currentStep = 'welcome';
                this.userProfile = {};
                this.isLoading = false;
                this.resumeContent = null;
                this.resumeAnalysis = null;
                
                this.init();
            }
            
            init() {
                console.log('🤖 启动中文指导工作流程...');
                
                this.sendBtn.addEventListener('click', () => this.handleSend());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !this.isLoading) this.handleSend();
                });
                this.uploadBtn.addEventListener('click', () => this.fileInput.click());
                this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
                
                this.startWorkflow();
            }
            
            startWorkflow() {
                this.addMessage('👋 欢迎！我将指导您完成英国全球人才签证数字技术路线的申请。', 'bot');
                
                setTimeout(() => {
                    this.addMessage('ℹ️ 关于英国全球人才签证：此签证让数字技术领域的高技能人才无需雇主担保即可在英国生活和工作，同时给予其家属完全的工作和学习权利。免责声明：这是一般性指导，非法律建议。', 'bot');
                }, 1000);
                
                setTimeout(() => {
                    this.addMessage('让我们从一些快速主题开始。您首先想了解什么？', 'bot');
                    this.showInitialOptions();
                }, 2000);
            }
            
            showInitialOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'eligibility\\')">📋 申请资格</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'process\\')">🚀 申请流程</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'documents\\')">📄 申请文件</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'timeline\\')">⏰ 时间安排</button>' +
                    '<button class="workflow-button" onclick="bot.startAssessment()">✨ 开始评估</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            async handleTopicChoice(topic) {
                const topicQuestions = {
                    'eligibility': '数字技术路线的申请资格要求是什么？',
                    'process': 'Tech Nation申请流程如何运作？请包括所有费用。',
                    'documents': '我需要准备什么文件和证据？',
                    'timeline': '整个过程需要多长时间？'
                };
                
                const question = topicQuestions[topic];
                this.addMessage(question, 'user');
                await this.sendToAPI(question);
                
                // Longer delay to let user read the response
                setTimeout(() => {
                    this.addMessage('您想要对您的个人档案进行个性化评估吗？', 'bot');
                    const buttonHtml = '<div class="button-group">' +
                        '<button class="workflow-button" onclick="bot.startAssessment()">是的，评估我的档案</button>' +
                        '<button class="guide-button" onclick="bot.showInitialOptions()">询问其他问题</button>' +
                        '</div>';
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottomSlowly();
                }, 10000); // Increased to 3 seconds
            }
            
            startAssessment() {
                this.currentStep = 'experience';
                this.addProgressIndicator('步骤 1/5: 经验');
                this.addMessage('让我们评估您的Tech Nation申请档案！🎯', 'bot');
                
                setTimeout(() => {
                    this.addMessage('您在数字技术领域有多少年经验？', 'bot');
                    this.showExperienceOptions();
                }, 1000);
            }
            
            showExperienceOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'0-2\\')">0-2年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'3-5\\')">3-5年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'6-10\\')">6-10年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'10+\\')">10年以上</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectExperience(experience) {
                this.userProfile.experience = experience;
                this.addMessage('我有' + experience + '年的经验', 'user');
                
                this.currentStep = 'role';
                this.addProgressIndicator('步骤 2/5: 角色');
                
                setTimeout(() => {
                    this.addMessage('您在数字技术领域的主要角色是什么？', 'bot');
                    this.showRoleOptions();
                }, 1000);
            }
            
            showRoleOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'technical\\')">👩‍💻 技术</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'business\\')">💼 商务</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectRole(role) {
                this.userProfile.role = role;
                this.addMessage('我的角色是：' + (role === 'technical' ? '技术' : '商务'), 'user');
                
                this.currentStep = 'resume';
                this.addProgressIndicator('步骤 3/5: 简历上传');
                
                setTimeout(() => {
                    this.addMessage('为了给您个性化指导，请上传您的简历（PDF格式）。这将帮助我了解您的背景。', 'bot');
                    this.enableResumeUpload();
                }, 1000);
            }
            
            enableResumeUpload() {
                this.uploadBtn.style.display = 'block';
                this.addMessage('准备好后点击下方的"上传简历"按钮。没有准备好简历？您可以跳过此步骤。', 'bot');
                
                const buttonHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.skipResume()">跳过简历上传</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            skipResume() {
                this.generateFeedback();
            }
            
            async handleFileUpload(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (file.type !== 'application/pdf') {
                    this.uploadStatus.textContent = '❌ 请只上传PDF文件';
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) {
                    this.uploadStatus.textContent = '❌ 文件太大（最大10MB）';
                    return;
                }
                
                this.uploadStatus.textContent = '📤 处理中...';
                this.addMessage('已上传简历：' + file.name, 'user');
                
                try {
                    // Try backend processing first
                    const backendResult = await this.uploadToBackend(file);
                    if (backendResult.success && backendResult.textExtracted) {
                        this.resumeContent = backendResult.extractedText || backendResult.preview?.replace('...', '');
                        this.uploadStatus.textContent = '✅ 简历处理完成（后端解析）';
                        this.analyzeAndShowResume();
                        return;
                    }
                    
                    // If backend fails, ask user to paste content
                    this.uploadStatus.textContent = '⚠️ 自动解析失败';
                    this.addMessage('PDF自动解析失败。请将您的简历主要内容复制粘贴到下面的消息中，我可以基于此进行分析。', 'bot');
                    this.addMessage('请包含：当前职位、公司名称、主要技术技能、工作年限等关键信息。', 'bot');
                    this.enableManualInput();
                    
                } catch (error) {
                    console.error('PDF处理错误:', error);
                    this.uploadStatus.textContent = '⚠️ 处理失败';
                    this.addMessage('PDF处理失败。您可以手动输入简历信息，或跳过此步骤继续。', 'bot');
                    this.enableManualInput();
                }
            }

            enableManualInput() {
                const buttonHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.enableTextInput()">手动输入简历信息</button>' +
                    '<button class="guide-button" onclick="bot.skipResume()">跳过简历上传</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }

            enableTextInput() {
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = '请输入您的简历关键信息...';
                this.messageInput.focus();
                this.currentStep = 'manual_input';
                this.addMessage('请在下方输入框中输入您的简历关键信息，然后点击发送。', 'bot');
            }

            async uploadToBackend(file) {
                try {
                    const formData = new FormData();
                    formData.append('resume', file);
                    formData.append('userId', this.getUserId());

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Backend upload failed: ' + response.status);
                    }

                    const result = await response.json();
                    console.log('Backend upload result:', result);
                    
                    return {
                        success: result.success,
                        textExtracted: result.textExtracted,
                        extractedText: result.extractedText,
                        preview: result.preview
                    };
                } catch (error) {
                    console.error('Backend upload error:', error);
                    return { success: false };
                }
            }

            analyzeAndShowResume() {
                if (!this.resumeContent) return;
                
                // Simple but effective resume analysis
                this.resumeAnalysis = this.analyzeResume(this.resumeContent);
                
                let analysisHtml = '<div class="resume-info">📋 简历分析结果：<br>';
                
                if (this.resumeAnalysis.currentRole) {
                    analysisHtml += '• 当前职位：' + this.resumeAnalysis.currentRole + '<br>';
                }
                if (this.resumeAnalysis.company) {
                    analysisHtml += '• 当前公司：' + this.resumeAnalysis.company + '<br>';
                }
                if (this.resumeAnalysis.skills.length > 0) {
                    analysisHtml += '• 关键技能：' + this.resumeAnalysis.skills.slice(0, 5).join('、') + '<br>';
                }
                if (this.resumeAnalysis.estimatedYears > 0) {
                    analysisHtml += '• 估计经验：' + this.resumeAnalysis.estimatedYears + '年<br>';
                }
                
                analysisHtml += '</div>';
                
                const analysisMessage = document.createElement('div');
                analysisMessage.className = 'message bot-message';
                analysisMessage.innerHTML = analysisHtml;
                this.chat.appendChild(analysisMessage);
                this.scrollToBottom();
                
                this.addMessage('✅ 简历分析完成！我现在可以基于您的具体背景提供个性化建议了。', 'bot');
                
                setTimeout(() => {
                    this.generateFeedback();
                }, 1500);
            }

            analyzeResume(text) {
                const analysis = {
                    currentRole: '',
                    company: '',
                    skills: [],
                    estimatedYears: 0
                };
                
                // Extract current role - look for common job titles
                const rolePatterns = [
                    /(?:senior|lead|principal|chief)\s+(?:software|data|ai|ml|full.?stack|backend|frontend|devops|cloud)\s+(?:engineer|developer|architect|scientist)/gi,
                    /(?:software|data|ai|ml|full.?stack|backend|frontend|devops|cloud)\s+(?:engineer|developer|architect|scientist|manager|director|lead)/gi,
                    /(?:技术|软件|数据|算法|机器学习|人工智能|全栈|后端|前端|运维|云)\s*(?:工程师|开发|架构师|科学家|经理|总监|专家)/gi
                ];
                
                for (let pattern of rolePatterns) {
                    const match = text.match(pattern);
                    if (match) {
                        analysis.currentRole = match[0];
                        break;
                    }
                }
                
                // Extract company - look for known tech companies or patterns
                const companyPatterns = [
                    /(?:Google|Microsoft|Amazon|Apple|Facebook|Meta|Netflix|Uber|Airbnb|Spotify|Salesforce|Oracle|IBM|Intel|NVIDIA|Adobe|PayPal|LinkedIn|Twitter|Dropbox|Slack|Zoom|Atlassian|Shopify|Stripe)/gi,
                    /(?:阿里巴巴|腾讯|百度|字节跳动|华为|小米|京东|美团|滴滴|网易|新浪|搜狐)/gi,
                    /at\s+([A-Z][a-zA-Z\s]{2,20})(?:\s|,|\.)/g,
                    /在\s*([^\s]{2,10})\s*(?:公司|工作)/g
                ];
                
                for (let pattern of companyPatterns) {
                    const match = text.match(pattern);
                    if (match) {
                        analysis.company = match[0].replace(/^(at\s+|在\s*)/, '').replace(/\s*(公司|工作).*$/, '');
                        break;
                    }
                }
                
                // Extract skills
                const skillKeywords = [
                    'Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C++', 'SQL', 'NoSQL',
                    'React', 'Vue', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring', 'Docker', 'Kubernetes',
                    'AWS', 'Azure', 'GCP', 'Machine Learning', 'AI', 'Data Science', 'Big Data', 'Cloud'
                ];
                
                skillKeywords.forEach(skill => {
                    if (text.toLowerCase().includes(skill.toLowerCase())) {
                        analysis.skills.push(skill);
                    }
                });
                
                // Estimate years of experience
                const currentYear = new Date().getFullYear();
                const yearMatches = text.match(/(?:19|20)\d{2}/g);
                if (yearMatches && yearMatches.length > 0) {
                    const years = yearMatches.map(y => parseInt(y)).filter(y => y > 2000 && y <= currentYear);
                    if (years.length > 0) {
                        analysis.estimatedYears = Math.max(1, currentYear - Math.min(...years));
                    }
                }
                
                return analysis;
            }
            
            generateFeedback() {
                this.currentStep = 'analysis';
                this.addProgressIndicator('步骤 4/5: 分析');
                
                setTimeout(async () => {
                    let analysisPrompt = '根据我的档案：' + this.userProfile.experience + '年经验，' + this.userProfile.role + '角色。';
                    
                    if (this.resumeAnalysis) {
                        analysisPrompt += '\\n\\n简历分析显示：';
                        if (this.resumeAnalysis.currentRole) {
                            analysisPrompt += '\\n- 当前职位：' + this.resumeAnalysis.currentRole;
                        }
                        if (this.resumeAnalysis.company) {
                            analysisPrompt += '\\n- 当前公司：' + this.resumeAnalysis.company;
                        }
                        if (this.resumeAnalysis.skills.length > 0) {
                            analysisPrompt += '\\n- 主要技能：' + this.resumeAnalysis.skills.join('、');
                        }
                        if (this.resumeAnalysis.estimatedYears > 0) {
                            analysisPrompt += '\\n- 预估经验：' + this.resumeAnalysis.estimatedYears + '年';
                        }
                    }
                    
                    analysisPrompt += '\\n\\n请提供我需要采取的具体行动步骤来加强我的Tech Nation申请。专注于我需要做什么，而不是我的成功机会。';
                    
                    await this.sendToAPI(analysisPrompt);
                    
                    setTimeout(() => {
                        this.enableFreeChat();
                    }, 2000);
                }, 1000);
            }
            
            enableFreeChat() {
                this.currentStep = 'free';
                this.addProgressIndicator('步骤 5/5: 自由聊天已启用');
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = '询问任何关于Tech Nation申请的问题...';
                this.messageInput.focus();
                
                this.addMessage('太好了！现在您可以向我询问任何关于Tech Nation申请流程的具体问题。💬', 'bot');
            }
            
            async handleSend() {
                if (this.isLoading || this.messageInput.disabled) return;
                
                const message = this.messageInput.value.trim();
                if (!message) return;
                
                this.addMessage(message, 'user');
                this.messageInput.value = '';
                
                // If in manual input mode, treat this as resume content
                if (this.currentStep === 'manual_input') {
                    this.resumeContent = message;
                    this.analyzeAndShowResume();
                    return;
                }
                
                await this.sendToAPI(message);
            }
            
            async sendToAPI(message) {
                if (this.isLoading) return;
                
                this.isLoading = true;
                const typingElement = this.addMessage('思考中...', 'typing');
                
                try {
                    const payload = {
                        message: message,
                        userId: this.getUserId(),
                        resumeContent: this.resumeContent,
                        resumeAnalysis: this.resumeAnalysis
                    };
                    
                    const response = await fetch('/api/chat-zh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    const data = await response.json();
                    this.chat.removeChild(typingElement);
                    
                    if (data.response) {
                        this.addMessage(data.response, 'bot');
                    } else {
                        this.addMessage('抱歉，我遇到了错误。请重试。', 'bot');
                    }
                    
                } catch (error) {
                    console.error('API错误:', error);
                    this.chat.removeChild(typingElement);
                    this.addMessage('很抱歉，我遇到了错误。请重试。', 'bot');
                } finally {
                    this.isLoading = false;
                    if (this.currentStep === 'free') {
                        this.messageInput.disabled = false;
                        this.sendBtn.disabled = false;
                    }
                }
            }
            
            addMessage(text, sender) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender + '-message');
                messageElement.textContent = text;
                this.chat.appendChild(messageElement);
                
                // For long bot messages (like prepared answers), scroll more gently
                if (sender === 'bot' && text.length > 500) {
                    setTimeout(() => this.scrollToBottomSlowly(), 10000);
                } else {
                    this.scrollToBottom();
                }
                
                return messageElement;
            }
            
            scrollToBottomSlowly() {
                this.chat.scrollTo({
                    top: this.chat.scrollHeight,
                    behavior: 'smooth'
                });
            }
            
            addProgressIndicator(step) {
                const progressElement = document.createElement('div');
                progressElement.classList.add('progress-indicator');
                progressElement.innerHTML = '📍 ' + step;
                this.chat.appendChild(progressElement);
                this.scrollToBottom();
            }
            
            scrollToBottom() {
                this.chat.scrollTop = this.chat.scrollHeight;
            }
            
            getUserId() {
                if (!this.userId) {
                    this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                }
                return this.userId;
            }
        }
        
        let bot;
        document.addEventListener('DOMContentLoaded', () => {
            bot = new ChineseGuidedBot();
        });
    </script>
</body>
</html>`;

    return res.send(html);
} 