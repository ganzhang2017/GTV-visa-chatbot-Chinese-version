// api/index.js - Full-featured version with enhanced resume reading
export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // Build HTML using array join to avoid template literal issues
    const htmlParts = [
        '<!DOCTYPE html>',
        '<html lang="zh">',
        '<head>',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '    <title>英国全球人才签证助手 - 中文版</title>',
        '    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>',
        '    <style>',
        '        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 10px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }',
        '        .container { max-width: 450px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; height: 600px; display: flex; flex-direction: column; }',
        '        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; font-weight: 600; position: relative; }',
        '        .chat { flex: 1; padding: 20px; overflow-y: auto; background: #f8f9fa; display: flex; flex-direction: column; gap: 15px; }',
        '        .message { padding: 12px 16px; border-radius: 15px; max-width: 85%; word-wrap: break-word; font-size: 14px; line-height: 1.5; animation: slideIn 0.3s ease; white-space: pre-wrap; }',
        '        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }',
        '        .bot-message { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }',
        '        .user-message { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; align-self: flex-end; border-bottom-right-radius: 5px; }',
        '        .button-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }',
        '        .guide-button { background: rgba(102, 126, 234, 0.1); color: #667eea; border: 1px solid #667eea; border-radius: 20px; padding: 8px 16px; cursor: pointer; font-size: 12px; transition: all 0.2s; white-space: nowrap; }',
        '        .guide-button:hover { background: #667eea; color: white; }',
        '        .workflow-button { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 20px; padding: 8px 16px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }',
        '        .workflow-button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); }',
        '        .input-area { padding: 20px; background: white; border-top: 1px solid #e9ecef; }',
        '        .input-row { display: flex; gap: 12px; margin-bottom: 12px; }',
        '        #messageInput { flex: 1; padding: 12px 16px; border: 2px solid #e9ecef; border-radius: 25px; outline: none; font-size: 14px; transition: border-color 0.2s; }',
        '        #messageInput:focus { border-color: #667eea; }',
        '        #sendBtn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 25px; padding: 12px 20px; cursor: pointer; font-weight: 600; min-width: 70px; transition: all 0.2s; }',
        '        #sendBtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }',
        '        #sendBtn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }',
        '        .upload-section { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 12px; }',
        '        #uploadBtn { background: #28a745; color: white; border: none; border-radius: 15px; padding: 6px 12px; cursor: pointer; font-size: 11px; font-weight: 600; }',
        '        #uploadBtn:hover { background: #218838; }',
        '        #fileInput { display: none; }',
        '        .upload-status { color: #6c757d; font-size: 11px; }',
        '        .typing { background: #e9ecef; color: #6c757d; align-self: flex-start; border-bottom-left-radius: 5px; }',
        '        .typing::after { content: "思考中●●●"; animation: typing 1.4s infinite; }',
        '        @keyframes typing { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }',
        '        .progress-indicator { background: linear-gradient(90deg, #667eea, #764ba2); color: white; padding: 8px 12px; border-radius: 15px; font-size: 11px; align-self: flex-start; margin-bottom: 10px; }',
        '        .resume-preview { background: #e8f4f8; border: 1px solid #bee5eb; border-radius: 8px; padding: 10px; margin: 10px 0; font-size: 12px; max-height: 100px; overflow-y: auto; }',
        '    </style>',
        '</head>',
        '<body>',
        '    <div class="container">',
        '        <div class="header">',
        '            <div>🇨🇳 英国全球人才签证助手</div>',
        '            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">数字技术路线 - Tech Nation</div>',
        '        </div>',
        '        <div id="chat" class="chat"></div>',
        '        <div class="input-area">',
        '            <div class="input-row">',
        '                <input type="text" id="messageInput" placeholder="输入您的回复..." disabled>',
        '                <button id="sendBtn" disabled>发送</button>',
        '            </div>',
        '            <div class="upload-section">',
        '                <button id="uploadBtn">📄 上传简历 (PDF)</button>',
        '                <input type="file" id="fileInput" accept=".pdf">',
        '                <span class="upload-status" id="uploadStatus"></span>',
        '            </div>',
        '        </div>',
        '    </div>',
        '    <script>',
        '        // Configure PDF.js',
        '        if (window.pdfjsLib) {',
        '            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";',
        '        }',
        '        ',
        '        // Global bot instance',
        '        let bot = null;',
        '        ',
        '        class ChineseGuidedBot {',
        '            constructor() {',
        '                this.chat = document.getElementById("chat");',
        '                this.messageInput = document.getElementById("messageInput");',
        '                this.sendBtn = document.getElementById("sendBtn");',
        '                this.uploadBtn = document.getElementById("uploadBtn");',
        '                this.fileInput = document.getElementById("fileInput");',
        '                this.uploadStatus = document.getElementById("uploadStatus");',
        '                this.currentStep = "welcome";',
        '                this.userProfile = {};',
        '                this.isLoading = false;',
        '                this.resumeContent = null;',
        '                this.resumeAnalysis = null;',
        '                this.init();',
        '            }',
        '            ',
        '            init() {',
        '                console.log("🤖 启动中文指导工作流程...");',
        '                this.setupEventListeners();',
        '                this.startWorkflow();',
        '            }',
        '            ',
        '            setupEventListeners() {',
        '                this.sendBtn.addEventListener("click", () => this.handleSend());',
        '                this.messageInput.addEventListener("keypress", (e) => {',
        '                    if (e.key === "Enter" && !this.isLoading) this.handleSend();',
        '                });',
        '                this.uploadBtn.addEventListener("click", () => this.fileInput.click());',
        '                this.fileInput.addEventListener("change", (e) => this.handleFileUpload(e));',
        '            }',
        '            ',
        '            startWorkflow() {',
        '                this.addMessage("👋 欢迎！我将指导您完成英国全球人才签证数字技术路线的申请。", "bot");',
        '                setTimeout(() => {',
        '                    this.addMessage("ℹ️ **关于英国全球人才签证：** 此签证让数字技术领域的高技能人才无需雇主担保即可在英国生活和工作，同时给予其家属完全的工作和学习权利。**免责声明：** 这是一般性指导，非法律建议。", "bot");',
        '                }, 1000);',
        '                setTimeout(() => {',
        '                    this.addMessage("让我们从一些快速主题开始。您首先想了解什么？", "bot");',
        '                    this.showInitialOptions();',
        '                }, 2000);',
        '            }',
        '            ',
        '            showInitialOptions() {',
        '                const buttonsHtml = "<div class=\\"button-group\\">" +',
        '                    "<button class=\\"guide-button\\" onclick=\\"bot.handleTopicChoice(\'eligibility\')\\\">📋 申请资格</button>" +',
        '                    "<button class=\\"guide-button\\" onclick=\\"bot.handleTopicChoice(\'process\')\\\">🚀 申请流程</button>" +',
        '                    "<button class=\\"guide-button\\" onclick=\\"bot.handleTopicChoice(\'documents\')\\\">📄 申请文件</button>" +',
        '                    "<button class=\\"guide-button\\" onclick=\\"bot.handleTopicChoice(\'timeline\')\\\">⏰ 时间安排</button>" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.startAssessment()\\\">✨ 开始评估</button>" +',
        '                    "</div>";',
        '                const buttonMessage = document.createElement("div");',
        '                buttonMessage.className = "message bot-message";',
        '                buttonMessage.innerHTML = buttonsHtml;',
        '                this.chat.appendChild(buttonMessage);',
        '                this.scrollToBottom();',
        '            }',
        '            ',
        '            async handleTopicChoice(topic) {',
        '                const topicQuestions = {',
        '                    "eligibility": "数字技术路线的申请资格要求是什么？",',
        '                    "process": "Tech Nation申请流程如何运作？请包括所有费用。",',
        '                    "documents": "我需要准备什么文件和证据？",',
        '                    "timeline": "整个过程需要多长时间？"',
        '                };',
        '                const question = topicQuestions[topic];',
        '                this.addMessage(question, "user");',
        '                await this.sendToAPI(question);',
        '                setTimeout(() => {',
        '                    this.addMessage("您想要对您的个人档案进行个性化评估吗？", "bot");',
        '                    const buttonHtml = "<div class=\\"button-group\\">" +',
        '                        "<button class=\\"workflow-button\\" onclick=\\"bot.startAssessment()\\\">是的，评估我的档案</button>" +',
        '                        "<button class=\\"guide-button\\" onclick=\\"bot.showInitialOptions()\\\">询问其他问题</button>" +',
        '                        "</div>";',
        '                    const buttonMessage = document.createElement("div");',
        '                    buttonMessage.className = "message bot-message";',
        '                    buttonMessage.innerHTML = buttonHtml;',
        '                    this.chat.appendChild(buttonMessage);',
        '                    this.scrollToBottom();',
        '                }, 2000);',
        '            }',
        '            ',
        '            startAssessment() {',
        '                this.currentStep = "experience";',
        '                this.addProgressIndicator("步骤 1/5: 经验");',
        '                this.addMessage("让我们评估您的Tech Nation申请档案！🎯", "bot");',
        '                setTimeout(() => {',
        '                    this.addMessage("您在数字技术领域有多少年经验？", "bot");',
        '                    this.showExperienceOptions();',
        '                }, 1000);',
        '            }',
        '            ',
        '            showExperienceOptions() {',
        '                const buttonsHtml = "<div class=\\"button-group\\">" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.selectExperience(\'0-2\')\\\">0-2年</button>" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.selectExperience(\'3-5\')\\\">3-5年</button>" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.selectExperience(\'6-10\')\\\">6-10年</button>" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.selectExperience(\'10+\')\\\">10年以上</button>" +',
        '                    "</div>";',
        '                const buttonMessage = document.createElement("div");',
        '                buttonMessage.className = "message bot-message";',
        '                buttonMessage.innerHTML = buttonsHtml;',
        '                this.chat.appendChild(buttonMessage);',
        '                this.scrollToBottom();',
        '            }',
        '            ',
        '            selectExperience(experience) {',
        '                this.userProfile.experience = experience;',
        '                this.addMessage("我有" + experience + "年的经验", "user");',
        '                this.currentStep = "role";',
        '                this.addProgressIndicator("步骤 2/5: 角色");',
        '                setTimeout(() => {',
        '                    this.addMessage("您在数字技术领域的主要角色是什么？", "bot");',
        '                    this.showRoleOptions();',
        '                }, 1000);',
        '            }',
        '            ',
        '            showRoleOptions() {',
        '                const buttonsHtml = "<div class=\\"button-group\\">" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.selectRole(\'technical\')\\\">👩‍💻 技术</button>" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.selectRole(\'business\')\\\">💼 商务</button>" +',
        '                    "</div>";',
        '                const buttonMessage = document.createElement("div");',
        '                buttonMessage.className = "message bot-message";',
        '                buttonMessage.innerHTML = buttonsHtml;',
        '                this.chat.appendChild(buttonMessage);',
        '                this.scrollToBottom();',
        '            }',
        '            ',
        '            selectRole(role) {',
        '                this.userProfile.role = role;',
        '                this.addMessage("我的角色是：" + (role === "technical" ? "技术" : "商务"), "user");',
        '                this.currentStep = "resume";',
        '                this.addProgressIndicator("步骤 3/5: 简历上传");',
        '                setTimeout(() => {',
        '                    this.addMessage("为了给您个性化指导，请上传您的简历（PDF格式）。这将帮助我了解您的背景并提供针对性建议。", "bot");',
        '                    this.enableResumeUpload();',
        '                }, 1000);',
        '            }',
        '            ',
        '            enableResumeUpload() {',
        '                this.uploadBtn.style.display = "block";',
        '                this.addMessage("准备好后点击下方的"上传简历"按钮。没有准备好简历？您可以跳过此步骤。", "bot");',
        '                const buttonHtml = "<div class=\\"button-group\\">" +',
        '                    "<button class=\\"workflow-button\\" onclick=\\"bot.skipResume()\\\">跳过简历上传</button>" +',
        '                    "</div>";',
        '                const buttonMessage = document.createElement("div");',
        '                buttonMessage.className = "message bot-message";',
        '                buttonMessage.innerHTML = buttonHtml;',
        '                this.chat.appendChild(buttonMessage);',
        '                this.scrollToBottom();',
        '            }',
        '            ',
        '            skipResume() {',
        '                this.generateFeedback();',
        '            }',
        '            ',
        '            async handleFileUpload(e) {',
        '                const file = e.target.files[0];',
        '                if (!file) return;',
        '                if (file.type !== "application/pdf") {',
        '                    this.uploadStatus.textContent = "❌ 请只上传PDF文件";',
        '                    return;',
        '                }',
        '                if (file.size > 10 * 1024 * 1024) {',
        '                    this.uploadStatus.textContent = "❌ 文件太大（最大10MB）";',
        '                    return;',
        '                }',
        '                this.uploadStatus.textContent = "📤 处理中...";',
        '                this.addMessage("已上传简历：" + file.name, "user");',
        '                try {',
        '                    // Try backend processing first',
        '                    const backendResult = await this.uploadToBackend(file);',
        '                    if (backendResult.success && backendResult.textExtracted) {',
        '                        this.resumeContent = backendResult.extractedText || (backendResult.preview && backendResult.preview.replace("...", ""));',
        '                        this.uploadStatus.textContent = "✅ 简历处理完成（后端解析）";',
        '                        this.showResumePreview();',
        '                        this.addMessage("✅ 简历处理成功！我已经分析了您的简历内容。现在我可以为您提供个性化建议了。", "bot");',
        '                        setTimeout(() => this.generateFeedback(), 1500);',
        '                        return;',
        '                    }',
        '                    // Fallback to frontend parsing',
        '                    console.log("后端处理失败，尝试前端解析...");',
        '                    const frontendText = await this.extractTextFromPDF(file);',
        '                    if (frontendText && frontendText.length > 200) {',
        '                        this.resumeContent = frontendText;',
        '                        this.uploadStatus.textContent = "✅ 简历处理完成（前端解析）";',
        '                        this.showResumePreview();',
        '                        this.addMessage("✅ 简历处理成功！我已经分析了您的简历内容。现在我可以为您提供个性化建议了。", "bot");',
        '                        setTimeout(() => this.generateFeedback(), 1500);',
        '                        return;',
        '                    }',
        '                    throw new Error("无法提取有效文本内容");',
        '                } catch (error) {',
        '                    console.error("PDF处理错误:", error);',
        '                    this.uploadStatus.textContent = "⚠️ 处理失败，继续...";',
        '                    this.addMessage("我无法读取您的PDF文件，但仍可以根据您提供的信息提供一般指导。让我们继续！", "bot");',
        '                    setTimeout(() => this.generateFeedback(), 1500);',
        '                }',
        '            }',
        '            ',
        '            showResumePreview() {',
        '                if (!this.resumeContent) return;',
        '                const preview = this.resumeContent.substring(0, 300);',
        '                const analysis = this.analyzeResume(this.resumeContent);',
        '                this.resumeAnalysis = analysis;',
        '                ',
        '                const previewHtml = "<div class=\\"resume-preview\\">📄 简历摘要：" + preview + "...</div>" +',
        '                    "<div class=\\"resume-preview\\">🔍 检测到的关键信息：<br>" +',
        '                    "职位：" + (analysis.positions.join(", ") || "未检测到") + "<br>" +',
        '                    "技能：" + (analysis.skills.join(", ") || "未检测到") + "<br>" +',
        '                    "公司：" + (analysis.companies.join(", ") || "未检测到") + "</div>";',
        '                ',
        '                const previewMessage = document.createElement("div");',
        '                previewMessage.className = "message bot-message";',
        '                previewMessage.innerHTML = previewHtml;',
        '                this.chat.appendChild(previewMessage);',
        '                this.scrollToBottom();',
        '            }',
        '            ',
        '            analyzeResume(text) {',
        '                const lowerText = text.toLowerCase();',
        '                const analysis = {',
        '                    positions: [],',
        '                    skills: [],',
        '                    companies: [],',
        '                    experience_years: 0',
        '                };',
        '                ',
        '                // Extract positions',
        '                const positionPatterns = [',
        '                    /(?:senior|lead|principal|chief)\\s+(?:software|data|machine learning|ai|full stack|backend|frontend|devops|security)\\s+(?:engineer|developer|scientist|architect)/gi,',
        '                    /(?:software|data|machine learning|ai|full stack|backend|frontend|devops|security)\\s+(?:engineer|developer|scientist|architect|manager|director)/gi,',
        '                    /(?:技术|软件|数据|算法|机器学习|人工智能|全栈|后端|前端|运维|安全)(?:工程师|开发者|科学家|架构师|经理|总监)/gi',
        '                ];',
        '                positionPatterns.forEach(pattern => {',
        '                    const matches = text.match(pattern);',
        '                    if (matches) analysis.positions.push(...matches.map(m => m.trim()));',
        '                });',
        '                ',
        '                // Extract skills',
        '                const skillPatterns = [',
        '                    /(?:python|java|javascript|typescript|go|rust|c\\+\\+|scala|r|sql|nosql|mongodb|postgresql|mysql|redis|elasticsearch|kafka|spark|hadoop|aws|azure|gcp|docker|kubernetes|tensorflow|pytorch|scikit-learn|pandas|numpy|react|angular|vue|node\\.js|express|django|flask|spring|microservices|api|rest|graphql|ci\\/cd|jenkins|git|agile|scrum)/gi,',
        '                    /(?:machine learning|artificial intelligence|deep learning|natural language processing|computer vision|data science|big data|cloud computing|devops|cybersecurity|blockchain|web development|mobile development|game development)/gi',
        '                ];',
        '                skillPatterns.forEach(pattern => {',
        '                    const matches = text.match(pattern);',
        '                    if (matches) analysis.skills.push(...matches.map(m => m.trim()));',
        '                });',
        '                ',
        '                // Extract companies (common tech companies)',
        '                const companyPattern = /(?:google|microsoft|amazon|apple|facebook|meta|netflix|uber|airbnb|spotify|salesforce|oracle|ibm|intel|nvidia|adobe|paypal|linkedin|twitter|dropbox|slack|zoom|atlassian|shopify|stripe|square|robinhood|coinbase|tiktok|bytedance|alibaba|tencent|baidu|xiaomi|huawei|didi|meituan|pinduoduo|jd|netease|sina|sohu|qihoo|搜狐|新浪|奇虎|百度|腾讯|阿里巴巴|字节跳动|滴滴|美团|拼多多|京东|网易)/gi;',
        '                const companyMatches = text.match(companyPattern);',
        '                if (companyMatches) {',
        '                    analysis.companies.push(...companyMatches.map(m => m.trim()));',
        '                }',
        '                ',
        '                // Estimate experience years',
        '                const yearMatches = text.match(/(?:19|20)\\d{2}/g);',
        '                if (yearMatches && yearMatches.length >= 2) {',
        '                    const years = yearMatches.map(y => parseInt(y)).sort((a, b) => a - b);',
        '                    const currentYear = new Date().getFullYear();',
        '                    const earliestYear = years[0];',
        '                    if (earliestYear > 2000 && earliestYear < currentYear) {',
        '                        analysis.experience_years = currentYear - earliestYear;',
        '                    }',
        '                }',
        '                ',
        '                // Remove duplicates',
        '                analysis.positions = [...new Set(analysis.positions)];',
        '                analysis.skills = [...new Set(analysis.skills)];',
        '                analysis.companies = [...new Set(analysis.companies)];',
        '                ',
        '                return analysis;',
        '            }',
        '            ',
        '            async uploadToBackend(file) {',
        '                try {',
        '                    const formData = new FormData();',
        '                    formData.append("resume", file);',
        '                    formData.append("userId", this.getUserId());',
        '                    const response = await fetch("/api/upload", {',
        '                        method: "POST",',
        '                        body: formData',
        '                    });',
        '                    if (!response.ok) {',
        '                        throw new Error("Backend upload failed: " + response.status);',
        '                    }',
        '                    const result = await response.json();',
        '                    console.log("Backend upload result:", result);',
        '                    return {',
        '                        success: result.success,',
        '                        textExtracted: result.textExtracted,',
        '                        extractedText: result.extractedText,',
        '                        preview: result.preview',
        '                    };',
        '                } catch (error) {',
        '                    console.error("Backend upload error:", error);',
        '                    return { success: false };',
        '                }',
        '            }',
        '            ',
        '            async extractTextFromPDF(file) {',
        '                return new Promise((resolve, reject) => {',
        '                    const reader = new FileReader();',
        '                    reader.onload = async function(e) {',
        '                        try {',
        '                            const arrayBuffer = e.target.result;',
        '                            if (window.pdfjsLib) {',
        '                                try {',
        '                                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;',
        '                                    let fullText = "";',
        '                                    const maxPages = Math.min(pdf.numPages, 5);',
        '                                    for (let i = 1; i <= maxPages; i++) {',
        '                                        const page = await pdf.getPage(i);',
        '                                        const textContent = await page.getTextContent();',
        '                                        const pageText = textContent.items.map(item => item.str).join(" ");',
        '                                        fullText += pageText + "\\n\\n";',
        '                                    }',
        '                                    if (fullText.trim().length > 100) {',
        '                                        console.log("PDF.js extraction successful:", fullText.length, "characters");',
        '                                        resolve(fullText.trim());',
        '                                        return;
                                    }
                                } catch (pdfjsError) {
                                    console.log("PDF.js extraction failed:", pdfjsError);
                                }
                            }
                            reject(new Error("无法从PDF中提取足够的文本内容"));
                        } catch (error) {
                            console.error("Frontend PDF parsing error:", error);
                            reject(new Error("前端PDF解析失败"));
                        }
                    };
                    reader.onerror = () => reject(new Error("文件读取失败"));
                    reader.readAsArrayBuffer(file);
                });
            }
            
            generateFeedback() {
                this.currentStep = "analysis";
                this.addProgressIndicator("步骤 4/5: 分析");
                setTimeout(async () => {
                    let analysisPrompt = "根据我的档案：" + this.userProfile.experience + "年经验，" + this.userProfile.role + "角色。";
                    
                    // Add resume analysis if available
                    if (this.resumeContent && this.resumeAnalysis) {
                        analysisPrompt += "\\n\\n根据我的简历分析：";
                        if (this.resumeAnalysis.positions.length > 0) {
                            analysisPrompt += "\\n- 主要职位：" + this.resumeAnalysis.positions.slice(0, 3).join("、");
                        }
                        if (this.resumeAnalysis.skills.length > 0) {
                            analysisPrompt += "\\n- 技术技能：" + this.resumeAnalysis.skills.slice(0, 10).join("、");
                        }
                        if (this.resumeAnalysis.companies.length > 0) {
                            analysisPrompt += "\\n- 工作公司：" + this.resumeAnalysis.companies.slice(0, 3).join("、");
                        }
                        if (this.resumeAnalysis.experience_years > 0) {
                            analysisPrompt += "\\n- 估计工作年限：约" + this.resumeAnalysis.experience_years + "年";
                        }
                        analysisPrompt += "\\n\\n简历摘要：" + this.resumeContent.substring(0, 500);
                    }
                    
                    analysisPrompt += "\\n\\n请基于以上信息提供我需要采取的具体行动步骤来加强我的Tech Nation申请。请包括：1) 推荐的申请路线 2) 最适合的2个评估标准 3) 需要收集的具体证据 4) 下一步行动计划。";
                    
                    await this.sendToAPI(analysisPrompt);
                    setTimeout(() => {
                        this.enableFreeChat();
                    }, 2000);
                }, 1000);
            }
            
            enableFreeChat() {
                this.currentStep = "free";
                this.addProgressIndicator("步骤 5/5: 自由聊天已启用");
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = "询问任何关于Tech Nation申请的问题...";
                this.messageInput.focus();
                this.addMessage("太好了！现在您可以向我询问任何关于Tech Nation申请流程的具体问题。我已经了解了您的背景，可以提供更精准的建议。💬", "bot");
            }
            
            async handleSend() {
                if (this.isLoading || this.messageInput.disabled) return;
                const message = this.messageInput.value.trim();
                if (!message) return;
                this.addMessage(message, "user");
                this.messageInput.value = "";
                await this.sendToAPI(message);
            }
            
            async sendToAPI(message) {
                if (this.isLoading) return;
                this.isLoading = true;
                const typingElement = this.addMessage("思考中...", "typing");
                try {
                    const payload = {
                        message: message,
                        userId: this.getUserId()
                    };
                    
                    // Include resume content and analysis for personalized responses
                    if (this.resumeContent) {
                        payload.resumeContent = this.resumeContent;
                    }
                    if (this.resumeAnalysis) {
                        payload.resumeAnalysis = this.resumeAnalysis;
                    }
                    
                    const response = await fetch("/api/chat-zh", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    this.chat.removeChild(typingElement);
                    if (data.response) {
                        this.addMessage(data.response, "bot");
                    } else {
                        this.addMessage("抱歉，我遇到了错误。请重试。", "bot");
                    }
                } catch (error) {
                    console.error("API错误:", error);
                    this.chat.removeChild(typingElement);
                    this.addMessage("很抱歉，我遇到了错误。请重试。", "bot");
                } finally {
                    this.isLoading = false;
                    if (this.currentStep === "free") {
                        this.messageInput.disabled = false;
                        this.sendBtn.disabled = false;
                    }
                }
            }
            
            addMessage(text, sender) {
                const messageElement = document.createElement("div");
                messageElement.classList.add("message", sender + "-message");
                messageElement.textContent = text;
                this.chat.appendChild(messageElement);
                this.scrollToBottom();
                return messageElement;
            }
            
            addProgressIndicator(step) {
                const progressElement = document.createElement("div");
                progressElement.classList.add("progress-indicator");
                progressElement.innerHTML = "📍 " + step;
                this.chat.appendChild(progressElement);
                this.scrollToBottom();
            }
            
            scrollToBottom() {
                this.chat.scrollTop = this.chat.scrollHeight;
            }
            
            getUserId() {
                if (!this.userId) {
                    this.userId = "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
                }
                return this.userId;
            }
        }
        
        // Initialize when DOM is ready
        document.addEventListener("DOMContentLoaded", function() {
            console.log("DOM loaded, initializing bot...");
            bot = new ChineseGuidedBot();
        });
    </script>
</body>
</html>';
    
    return res.send(htmlParts.join(''));',
        '