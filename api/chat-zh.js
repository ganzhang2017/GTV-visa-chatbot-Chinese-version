// api/chat-zh.js - Comprehensive Fix
import { OpenAI } from 'openai';
import { getNotionPageContent } from './guide_content.js';

// Initialize OpenRouter client only when we have the API key
let openai = null;

function getOpenAIClient() {
    if (!openai && process.env.OPENROUTER_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://localhost:3000",
                "X-Title": "UK Global Talent Visa Assistant - Chinese",
            }
        });
    }
    return openai;
}

// Enhanced semantic search
function findRelevantSections(content, query, maxSections = 4) {
    if (!content || content.trim().length === 0) {
        console.warn('No content provided for search');
        return '';
    }

    const paragraphs = content.split('\n\n')
        .filter(p => p.trim().length > 30)
        .map(p => p.trim());
    
    if (paragraphs.length === 0) {
        return content.substring(0, 2000);
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        // Exact query match gets high score
        if (paraLower.includes(queryLower)) {
            score += 25;
        }
        
        // Individual word matching
        queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = (paraLower.match(regex) || []).length;
            const wordWeight = word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
            score += matches * wordWeight;
        });
        
        // Tech Nation specific terms
        const techTerms = [
            'tech nation', 'digital technology', 'exceptional talent', 'exceptional promise', 
            'endorsement', 'criteria', 'evidence', 'recommendation letter', 'application process',
            'global talent visa', 'home office', 'mandatory criteria', 'optional criteria',
            'documents', 'application', 'cost', 'fee', 'timeline', 'processing'
        ];
        techTerms.forEach(term => {
            if (paraLower.includes(term)) {
                score += 8;
            }
        });
        
        return { paragraph, score };
    });
    
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    if (relevantSections.length === 0) {
        return paragraphs.slice(0, 3).join('\n\n');
    }
    
    console.log(`Found ${relevantSections.length} relevant sections for query: ${query.substring(0, 50)}...`);
    return relevantSections.join('\n\n---\n\n');
}

// Generate response using OpenRouter with working free models
async function generateAIResponse(context, userMessage, resumeContent = null) {
    try {
        // Check API key first
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('OPENROUTER_API_KEY environment variable is missing');
        }

        const client = getOpenAIClient();
        if (!client) {
            throw new Error('Failed to initialize OpenAI client');
        }

        let systemPrompt = `你是英国全球人才签证专家，专门从事通过Tech Nation的数字技术路径申请。请用中文回答所有问题。

回复格式要求：
- 使用清晰的 • 符号作为项目符号
- 将信息格式化为易读的部分
- 使用 **粗体** 标记重要标题
- 将复杂信息分解为易消化的步骤
- 对顺序步骤使用编号列表
- 保持段落简短而专注

指导原则：
1. 只提供申请人获得签证需要采取的具体行动步骤
2. 不要评估成功机会或可能性
3. 专注于他们需要做什么，而不是他们是否会成功
4. 鼓励但实用
5. 始终参考官方标准和要求
6. 提供具体的下一步行动

请仔细使用以下官方Tech Nation指南作为您的知识库，并根据用户的具体问题提供相关的回答：

${context}`;

        if (resumeContent) {
            systemPrompt += `\n\n用户提供了他们的简历/背景信息：
${resumeContent}

根据他们的背景，提供个性化的指导，告诉他们应该采取哪些具体步骤来加强他们的申请。`;
        }

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        console.log('发送请求到OpenRouter（中文）...');
        
        // Try the primary free model
        let completion;
        try {
            completion = await client.chat.completions.create({
                model: "meta-llama/llama-4-maverick:free", // Free Llama 4 model
                messages: messages,
                max_tokens: 1500,
                temperature: 0.7,
            });
        } catch (primaryError) {
            console.log('主要模型失败，尝试备用模型...');
            // Try backup free models
            const backupModels = [
                "meta-llama/llama-3.1-8b-instruct:free",
                "microsoft/phi-3-medium-128k-instruct:free",
                "google/gemma-7b-it:free"
            ];
            
            for (const model of backupModels) {
                try {
                    completion = await client.chat.completions.create({
                        model: model,
                        messages: messages,
                        max_tokens: 1500,
                        temperature: 0.7,
                    });
                    console.log(`备用模型 ${model} 成功`);
                    break;
                } catch (backupError) {
                    console.log(`备用模型 ${model} 失败:`, backupError.message);
                    continue;
                }
            }
        }

        const response = completion?.choices[0]?.message?.content;
        
        if (!response) {
            throw new Error('No response from any OpenRouter model');
        }

        console.log('收到OpenRouter中文回复，长度:', response.length);
        return response;

    } catch (error) {
        console.error('OpenRouter API错误（中文）:', error);
        
        if (error.status === 402 || error.message.includes('credits') || error.message.includes('insufficient_quota')) {
            return '很抱歉，由于API限制，我目前无法访问我的AI功能。请稍后再试。以下是基于您问题的基本指导：\n\n' + getIntelligentFallback(userMessage, context);
        }
        
        if (error.status === 429 || error.code === 'rate_limit_exceeded') {
            return '我目前正在经历高需求。请稍等片刻再试。以下是基于您问题的指导：\n\n' + getIntelligentFallback(userMessage, context);
        }
        
        if (error.status === 401 || error.status === 403) {
            return '我正在经历身份验证问题。请稍后再试。以下是基于您问题的指导：\n\n' + getIntelligentFallback(userMessage, context);
        }
        
        return getIntelligentFallback(userMessage, context);
    }
}

// Enhanced Chinese intelligent fallback system
function getIntelligentFallback(prompt, context) {
    const query = prompt.toLowerCase();
    
    // More specific fallback responses based on question type
    if (query.includes('文件') || query.includes('证据') || query.includes('documents') || query.includes('evidence')) {
        return `**您需要准备的申请文件和证据：**

**必须文件（所有申请人）：**
1. **护照或身份证**
2. **简历（最多3页）**
   • 重点突出数字技术领域的成就
   • 包含具体的量化成果
3. **个人陈述（最多1,000字）**
   • 说明如何满足申请标准
   • 描述在数字技术领域的工作
   • 未来在英国的计划
4. **推荐信（3封）**
   • 来自数字技术领域知名领导者
   • 专门为此申请而写
   • 包含推荐人的资历信息

**证据档案（最多10项，必须满足至少2个标准）：**

**标准1：行业认可证据**
• 媒体报道和新闻文章
• 行业奖项和荣誉
• 会议演讲邀请
• 专家小组参与

**标准2：技术专长证据**
• 开源贡献统计
• 技术出版物
• 专利文件
• 同行认可

**标准3：学术贡献或商业成功**
• 学术论文和引用
• 产品发布成功指标
• 收入增长数据
• 商业合作协议

**标准4：创新证据**
• 新技术开发
• 技术方法改进
• 数字化转型领导
• 创新解决方案实施

**下一步行动：**
1. 收集最强的2个标准领域的证据
2. 确保所有证据显示外部认可
3. 准备量化的成就数据
4. 联系潜在推荐人`;
    }
    
    if (query.includes('流程') || query.includes('如何') || query.includes('步骤') || query.includes('process') || query.includes('how')) {
        return `**Tech Nation申请完整流程：**

**第一阶段：Tech Nation背书申请**
• **费用：** £561
• **处理时间：** 8-12周（标准），3-5周（加急）
• **提交方式：** Tech Nation在线门户

**第二阶段：内政部签证申请**
• **费用：** £205
• **处理时间：** 3周（英国境外），8周（英国境内）
• **额外要求：** 生物识别预约，额外文件

**详细申请步骤：**

1. **准备阶段（2-6个月）**
   • 收集4个标准的证据材料
   • 撰写个人陈述
   • 获得3封推荐信
   • 准备最多10项证据

2. **提交Tech Nation申请**
   • 在线填写申请表
   • 上传所有文件
   • 支付£561费用
   • 等待8-12周决定

3. **获得背书后**
   • 立即申请内政部签证（£205）
   • 预约生物识别
   • 支付医疗附加费（每年£1,035）
   • 等待3-8周决定

**总成本：** £766 + 医疗附加费

**成功关键：**
• 专注于外部认可的证据
• 展示数字技术领域的直接工作
• 量化您的影响和成就
• 获得高质量的推荐信`;
    }

    if (query.includes('费用') || query.includes('成本') || query.includes('cost') || query.includes('fee')) {
        return `**英国全球人才签证费用详细清单：**

**必须费用：**
1. **Tech Nation背书费用：** £561
2. **内政部签证申请费：** £205
3. **医疗附加费：** £1,035/年
   • 5年签证总计：£5,175

**主申请人总费用：** £766 + £5,175 = £5,941

**家属费用（如适用）：**
• 每位家属签证费：£205
• 每位家属医疗附加费：£1,035/年
• 家庭总额会显著增加

**可选费用：**
• **加急处理（Tech Nation）：** £500-£1,500
• **加急处理（内政部）：** £500-£800
• **生物识别预约：** 因地而异

**分期付款：**
1. **第一期：** £561（Tech Nation申请）
2. **第二期：** £205 + £5,175（签证+医疗费）

**省钱建议：**
• 使用标准处理时间
• 准备充分的材料避免重新申请
• 仔细检查所有文件避免拒签

**投资回报：**
• 5年自由工作权
• 3-5年后可申请永居
• 家属全面工作学习权利
• 无需雇主担保`;
    }

    if (query.includes('时间') || query.includes('多久') || query.includes('timeline') || query.includes('processing')) {
        return `**英国全球人才签证时间线详解：**

**准备阶段：2-6个月**
• **证据收集：** 2-4个月
• **推荐信获取：** 1-2个月  
• **文件撰写：** 2-4周
• **材料整理：** 1-2周

**申请处理阶段：**

**Tech Nation背书：**
• **标准处理：** 8-12周
• **加急处理：** 3-5周（额外£500-£1,500）

**内政部签证：**
• **英国境外：** 3周
• **英国境内：** 8周
• **加急处理：** 1周（额外费用）

**总时间估算：**
• **最快情况：** 3-4个月（含准备+加急）
• **标准情况：** 6-8个月
• **保守估算：** 8-12个月

**时间规划建议：**

**提前6个月开始：**
• 评估自身资格
• 识别最强的2个标准
• 开始联系推荐人

**提前4个月：**
• 收集具体证据材料
• 撰写个人陈述草稿
• 准备推荐信大纲

**提前2个月：**
• 完善所有材料
• 获得最终推荐信
• 准备在线申请

**关键提醒：**
• 签证有效期从决定日开始，不是入境日
• 可以在英国境内或境外申请
• 处理时间可能因个案复杂度而延长`;
    }
    
    // Default comprehensive response
    return `**基于您的问题，以下是Tech Nation申请关键指导：**

**立即行动步骤：**

1. **资格确认**
   • 确保5年以上数字技术经验
   • 验证工作在数字技术领域（非仅使用技术）

2. **路径选择**
   • **杰出人才：** 已被认可的行业领导者
   • **杰出潜力：** 有领导潜力的早期职业者

3. **证据准备**
   • 专注最强的2个标准领域
   • 收集外部认可证据
   • 准备量化成就数据

4. **推荐信策略**
   • 联系3位数字技术领域知名人士
   • 确保他们了解您的工作
   • 要求专门为此申请撰写

**下一步具体行动：**
• 详细研究4个评估标准
• 列出所有相关成就和证据
• 开始联系潜在推荐人
• 收集量化数据和指标

如需更具体的指导，请告诉我您的具体情况或问题！`;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, userId, resumeContent } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // API key check
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY environment variable is missing');
            return res.status(200).json({ 
                response: '⚠️ API配置问题，使用离线模式。\n\n' + getIntelligentFallback(message, '')
            });
        }

        if (message === 'test connection') {
            return res.status(200).json({ 
                response: '中文API连接成功！🇨🇳 使用OpenRouter AI驱动的回复。' 
            });
        }

        console.log('处理中文消息:', message.substring(0, 100));

        // Get guide content with fallback
        let guideContent;
        try {
            guideContent = await getNotionPageContent();
            if (!guideContent || guideContent.trim().length === 0) {
                guideContent = "英国全球人才签证指南 - 数字技术路线\n\n此签证适用于数字技术领域的杰出人才或有潜力的领导者。";
            }
        } catch (error) {
            console.error('加载指南内容错误:', error);
            guideContent = "英国全球人才签证指南 - 数字技术路线\n\n此签证适用于数字技术领域的杰出人才或有潜力的领导者。";
        }

        // Find relevant sections based on the specific question
        const relevantContext = findRelevantSections(guideContent, message, 4);
        console.log('相关内容长度:', relevantContext.length);

        // Generate AI response
        const response = await generateAIResponse(relevantContext, message, resumeContent);
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('中文聊天API错误:', error);
        return res.status(200).json({ 
            response: '我遇到了技术问题，但仍可以为您提供基本指导：\n\n' + getIntelligentFallback(req.body?.message || '', '')
        });
    }
}