// api/index.js - Simple text input version (reliable)
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
        
        #backgroundTextarea {
            width: 100%;
            height: 120px;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            resize: vertical;
            font-family: inherit;
            font-size: 14px;
            outline: none;
            margin: 10px 0;
        }
        
        #backgroundTextarea:focus {
            border-color: #667eea;
        }
        
        .background-input-section {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>🇨🇳 英国全球人才签证助手</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">数字技术路线 - Tech Nation</div>
        </div>
        
        <div id="chat" class="chat"></div>
        
        <div class="input-area">
            <div class="input-row">
                <input type="text" id="messageInput" placeholder="输入您的回复..." disabled>
                <button id="sendBtn" disabled>发送</button>
            </div>
        </div>
    </div>
    
    <script>
        class ChineseGuidedBot {
            constructor() {
                this.chat = document.getElementById('chat');
                this.messageInput = document.getElementById('messageInput');
                this.sendBtn = document.getElementById('sendBtn');
                
                this.currentStep = 'welcome';
                this.userProfile = {};
                this.isLoading = false;
                this.backgroundInfo = null;
                
                this.init();
            }
            
            init() {
                console.log('🤖 启动中文指导工作流程...');
                
                this.sendBtn.addEventListener('click', () => this.handleSend());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !this.isLoading) this.handleSend();
                });
                
                this.startWorkflow();
            }
            
            startWorkflow() {
                this.addMessage('👋 欢迎！我将指导您完成英国全球人才签证数字技术路线的申请。', 'bot');
                
                setTimeout(() => {
                    this.addMessage('ℹ️ **关于英国全球人才签证：** 此签证让数字技术领域的高技能人才无需雇主担保即可在英国生活和工作，同时给予其家属完全的工作和学习权利。**免责声明：** 这是一般性指导，非法律建议。', 'bot');
                }, 1000);
                
                setTimeout(() => {
                    this.addMessage('让我们从一些快速主题开始。您首先想了解什么？', 'bot');
                    this.showInitialOptions();
                }, 2000);
            }
            
            showInitialOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\'eligibility\')">📋 申请资格</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\'process\')">🚀 申请流程</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\'documents\')">📄 申请文件</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\'timeline\')">⏰ 时间安排</button>' +
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
                    this.scrollToBottom();
                }, 2000);
            }
            
            startAssessment() {
                this.currentStep = 'experience';
                this.addProgressIndicator('步骤 1/4: 经验');
                this.addMessage('让我们评估您的Tech Nation申请档案！🎯', 'bot');
                
                setTimeout(() => {
                    this.addMessage('您在数字技术领域有多少年经验？', 'bot');
                    this.showExperienceOptions();
                }, 1000);
            }
            
            showExperienceOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\'0-2\')">0-2年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\'3-5\')">3-5年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\'6-10\')">6-10年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\'10+\')">10年以上</button>' +
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
                this.addProgressIndicator('步骤 2/4: 角色');
                
                setTimeout(() => {
                    this.addMessage('您在数字技术领域的主要角色是什么？', 'bot');
                    this.showRoleOptions();
                }, 1000);
            }
            
            showRoleOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectRole(\'technical\')">👩‍💻 技术</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\'business\')">💼 商务</button>' +
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
                
                this.currentStep = 'background';
                this.addProgressIndicator('步骤 3/4: 背景信息');
                
                setTimeout(() => {
                    this.askForBackground();
                }, 1000);
            }
            
            askForBackground() {
                this.addMessage('为了给您个性化指导，请简单描述您的背景信息。您可以：\\n\\n📋 复制粘贴您的简历内容\\n✍️ 手动输入关键信息\\n\\n请包括：职位、公司、主要技能、项目经验等', 'bot');
                
                const backgroundSection = document.createElement('div');
                backgroundSection.className = 'message bot-message';
                backgroundSection.innerHTML = '<div class="background-input-section">' +
                    '<textarea id="backgroundTextarea" placeholder="例如：\\n\\n高级软件工程师，在谷歌工作5年\\n技能：Python, React, AWS, 机器学习\\n项目：负责推荐系统，处理百万级用户数据\\n成就：获得技术创新奖，发表2篇论文\\n\\n请描述您的具体情况..."></textarea>' +
                    '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.submitBackground()">提交背景信息</button>' +
                    '<button class="guide-button" onclick="bot.skipBackground()">跳过此步骤</button>' +
                    '</div>' +
                    '</div>';
                
                this.chat.appendChild(backgroundSection);
                this.scrollToBottom();
            }
            
            submitBackground() {
                const textarea = document.getElementById('backgroundTextarea');
                const background = textarea.value.trim();
                
                if (background.length < 20) {
                    alert('请提供更详细的背景信息（至少20个字符）');
                    return;
                }
                
                this.backgroundInfo = background;
                this.addMessage('已提交背景信息：\\n' + background.substring(0, 200) + (background.length > 200 ? '...' : ''), 'user');
                this.addMessage('✅ 背景信息收集完成！现在我可以根据您的具体情况提供个性化建议了。', 'bot');
                
                setTimeout(() => {
                    this.generateFeedback();
                }, 1500);
            }
            
            skipBackground() {
                this.addMessage('已跳过背景信息收集', 'user');
                this.generateFeedback();
            }
            
            generateFeedback() {
                this.currentStep = 'analysis';
                this.addProgressIndicator('步骤 4/4: 个性化分析');
                
                setTimeout(async () => {
                    let analysisPrompt = '根据我的档案：' + this.userProfile.experience + '年经验，' + this.userProfile.role + '角色。';
                    
                    if (this.backgroundInfo) {
                        analysisPrompt += '\\n\\n我的详细背景：\\n' + this.backgroundInfo;
                        analysisPrompt += '\\n\\n请基于以上具体信息分析我的情况，并提供：\\n1) 推荐申请路线（杰出人才 vs 杰出潜力）\\n2) 最适合我的2个评估标准\\n3) 基于我背景的具体证据建议\\n4) 针对性的下一步行动计划';
                    } else {
                        analysisPrompt += '\\n\\n请提供我需要采取的具体行动步骤来加强我的Tech Nation申请。专注于我需要做什么，而不是我的成功机会。';
                    }
                    
                    await this.sendToAPI(analysisPrompt);
                    
                    setTimeout(() => {
                        this.enableFreeChat();
                    }, 2000);
                }, 1000);
            }
            
            enableFreeChat() {
                this.addProgressIndicator('✅ 评估完成 - 自由聊天已启用');
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = '询问任何关于Tech Nation申请的问题...';
                this.messageInput.focus();
                
                this.addMessage('太好了！现在您可以向我询问任何关于Tech Nation申请流程的具体问题。我已经了解了您的背景，可以提供更精准的建议。💬', 'bot');
            }
            
            async handleSend() {
                if (this.isLoading || this.messageInput.disabled) return;
                
                const message = this.messageInput.value.trim();
                if (!message) return;
                
                this.addMessage(message, 'user');
                this.messageInput.value = '';
                
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
                        resumeContent: this.backgroundInfo
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
                    if (this.messageInput.disabled === false) {
                        this.sendBtn.disabled = false;
                    }
                }
            }
            
            addMessage(text, sender) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender + '-message');
                messageElement.textContent = text;
                this.chat.appendChild(messageElement);
                this.scrollToBottom();
                
                return messageElement;
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