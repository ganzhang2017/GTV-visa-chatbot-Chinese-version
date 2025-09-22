// api/chat-zh.js - Minimal working version
import { OpenAI } from 'openai';

// Simple OpenRouter client initialization
let openai = null;

function getClient() {
    if (!openai && process.env.OPENROUTER_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": "https://localhost:3000",
                "X-Title": "UK Global Talent Visa Assistant - Chinese",
            } else {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }
        });
    }
    return openai;
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
        const { message, resumeContent } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        if (message === 'test connection') {
            return res.status(200).json({ 
                response: '中文API连接成功！🇨🇳' 
            });
        }

        // Check if this is one of the 4 guided questions - return prepared answers immediately
        const guidedQuestions = [
            '数字技术路线的申请资格要求是什么？',
            'Tech Nation申请流程如何运作？请包括所有费用。', 
            '我需要准备什么文件和证据？',
            '整个过程需要多长时间？'
        ];

        if (guidedQuestions.includes(message)) {
            return res.status(200).json({ 
                response: getPreparedAnswer(message)
            });
        }

        // Check if this is a follow-up question about their analysis
        const analysisFollowUps = [
            '基于我的简历',
            '根据我的背景',
            '我的情况',
            '针对我的',
            '我应该',
            '建议我',
            '我需要',
            '我的申请'
        ];

        const isFollowUp = resumeContent && analysisFollowUps.some(phrase => 
            message.toLowerCase().includes(phrase)
        );

        // For follow-up questions, always try AI even if it's a guided question
        if (isFollowUp || (!guidedQuestions.includes(message) && message.length > 20)) {
        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }

        const client = getClient();
        if (!client) {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }

        // Try multiple working models with shorter timeout for better UX
        let completion;
        const workingModels = [
            "x-ai/grok-4-fast:free",
            "google/gemini-2.0-flash-exp:free", 
            "deepseek/deepseek-chat-v3.1:free"
        ];

        for (const model of workingModels) {
            try {
                let systemPrompt = `你是英国全球人才签证专家，专门协助Tech Nation数字技术路线申请。请用中文回答，提供具体可行的建议。`;
                
                if (resumeContent) {
                    systemPrompt += `\n\n用户已提供简历信息：${resumeContent.substring(0, 1500)}...\n\n请基于用户的具体背景提供个性化建议。要求：\n\n1. 必须明确提及用户的当前或最近职位和公司\n2. 根据他们的具体经验判断适合哪个路线（杰出人才vs杰出潜力）\n3. 基于他们的背景推荐最强的2个评估标准\n4. 针对他们的具体情况建议需要加强的领域\n5. 具体的下一步行动建议（限制在3个最重要的行动）\n\n回复格式要求：\n- 使用简洁清晰的格式，避免过多粗体标记\n- 用 • 作为项目符号\n- 用数字列表表示步骤\n- 保持段落简短易读\n\n如果无法从简历中提取到明确的职位信息，请说明需要更清晰的简历内容。`;
                }

                completion = await Promise.race([
                    client.chat.completions.create({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user", 
                                content: message
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7,
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 15000) // Shorter timeout
                    )
                ]);
                console.log(`成功使用模型: ${model}`);
                break;
            } catch (modelError) {
                console.log(`模型 ${model} 失败:`, modelError.message);
                if (model === workingModels[workingModels.length - 1]) {
                    throw modelError;
                }
                continue;
            }
        }

        const response = completion.choices[0]?.message?.content;
        
        if (response) {
            return res.status(200).json({ response });
        } else {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }

    } catch (error) {
        console.error('API错误:', error.message);
        return res.status(200).json({ 
            response: getSimpleFallback(req.body?.message || '')
        });
    }
}

// Fallback for non-guided questions
function getSimpleFallback(message) {
    const query = message.toLowerCase();
    
    // 申请资格 - eligibility
    if (query.includes('申请资格') || query.includes('资格') || query.includes('eligibility')) {
        return `**英国全球人才签证申请资格：**

**基本要求：**
• **经验要求：** 数字技术领域至少5年工作经验
• **工作性质：** 必须是在数字技术领域工作，不仅仅是使用技术
• **年龄要求：** 无年龄限制
• **教育要求：** 无特定学历要求

**两个申请路线：**

**1. 杰出人才路线（Exceptional Talent）**
• 适合已被认可的行业领导者
• 在过去5年内获得行业认可
• 处于职业成熟阶段

**2. 杰出潜力路线（Exceptional Promise）**
• 适合有领导潜力的早期职业者
• 在过去5年内展现出潜力
• 处于职业早期阶段

**评估标准：**
• 必须满足所有强制性标准
• 必须满足4个可选标准中的至少2个

**下一步评估：** 确认您的工作确实在数字技术领域，计算您的相关经验年限。`;
    }
    
    // 时间安排 - timeline
    if (query.includes('时间安排') || query.includes('时间') || query.includes('多久') || query.includes('timeline')) {
        return `**英国全球人才签证时间安排：**

**准备阶段：3-6个月**
• **材料收集：** 2-4个月
  - 整理工作成就和证据
  - 收集媒体报道、奖项等
• **推荐信：** 1-2个月
  - 联系推荐人
  - 等待推荐信撰写
• **文档撰写：** 2-4周
  - 个人陈述
  - 简历整理

**官方处理时间：**

**第一阶段 - Tech Nation背书：**
• **标准处理：** 8-12周
• **加急处理：** 3-5周（额外£500-1500）

**第二阶段 - 内政部签证：**
• **英国境外：** 3周
• **英国境内：** 8周

**总体时间规划：**
• **最快情况：** 4-5个月（准备3个月 + 加急处理）
• **标准情况：** 7-9个月
• **保守估计：** 10-12个月

**建议提前规划：** 如果有具体的英国入境时间需求，建议提前12个月开始准备。`;
    }
    
    // 文件证据 - documents
    if (query.includes('文件') || query.includes('证据') || query.includes('documents') || query.includes('evidence')) {
        return `**申请文件和证据清单：**

**强制性文件（所有人必须提供）：**
1. **护照或身份证**
2. **简历（最多3页）**
   • 重点突出数字技术成就
3. **个人陈述（最多1000字）**
   • 解释如何满足标准
   • 在英国的计划
4. **推荐信3封**
   • 来自数字技术领域知名人士
   • 专门为此申请撰写

**证据组合（最多10项，需满足至少2个标准）：**

**标准1 - 行业认可：**
• 主流媒体报道
• 行业会议演讲邀请
• 专业奖项和荣誉
• 专家委员会职位

**标准2 - 技术专长：**
• 开源项目贡献统计
• 技术论文发表
• 专利申请
• 同行技术认可

**标准3 - 学术/商业成功：**
• 学术研究和引用
• 产品成功发布数据
• 收入增长证明
• 重要商业合作

**标准4 - 技术创新：**
• 新技术开发
• 创新解决方案
• 行业变革领导
• 技术突破成果

**证据质量要求：** 外部认可 > 内部认可，量化数据 > 定性描述`;
    }
    
    // 申请流程 - process
    if (query.includes('流程') || query.includes('步骤') || query.includes('process') || query.includes('如何')) {
        return `**Tech Nation申请流程详解：**

**两阶段申请流程：**

**第一阶段：Tech Nation背书申请**
• **申请对象：** Tech Nation（独立机构）
• **费用：** £561
• **处理时间：** 8-12周
• **申请方式：** 在线门户提交
• **材料：** 全部证据和文件

**第二阶段：内政部签证申请**
• **申请对象：** 英国内政部
• **费用：** £205 + 医疗附加费
• **处理时间：** 3-8周
• **申请时机：** 获得背书后立即申请
• **额外要求：** 生物识别预约

**具体操作步骤：**

1. **准备材料（2-6个月）**
   • 收集所有证据文件
   • 撰写个人陈述
   • 获得推荐信

2. **在线申请Tech Nation**
   • 填写申请表格
   • 上传所有文件
   • 支付£561费用

3. **等待背书决定（8-12周）**

4. **申请内政部签证**
   • 在线申请
   • 支付费用和医疗附加费
   • 预约生物识别

5. **获得签证（3-8周）**

**重要提醒：** 必须先获得Tech Nation背书才能申请签证，两个步骤不能同时进行。`;
    }
    
    // 费用 - costs
    if (query.includes('费用') || query.includes('成本') || query.includes('cost') || query.includes('fee')) {
        return `**英国全球人才签证费用详细清单：**

**主申请人费用：**
• **Tech Nation背书：** £561
• **内政部签证申请：** £205
• **医疗附加费（5年）：** £5,175（£1,035/年）
• **主申请人总计：** £5,941

**家属费用（每人）：**
• **签证申请费：** £205
• **医疗附加费（5年）：** £5,175
• **每位家属：** £5,380

**可选加急费用：**
• **Tech Nation加急：** £500-£1,500
• **内政部加急：** £500-£800
• **生物识别费：** 因地区而异

**分期付款时间点：**
1. **申请Tech Nation时：** £561
2. **申请签证时：** £205 + £5,175医疗费
3. **如有家属：** 每人额外£5,380

**费用节省建议：**
• 选择标准处理时间
• 确保材料完整避免重申
• 合理规划避免加急费用

**5年总投资：** 单人£5,941，夫妻约£11,321，三口之家约£16,701`;
    }
    
    // Default response
    return `**英国全球人才签证核心信息：**

**申请概要：**
• 数字技术领域专业签证
• 无需雇主担保
• 5年有效期，可延期
• 3-5年后可申请永居

**基本要求：**
• 5年以上相关经验
• 证明杰出才能或潜力
• 满足评估标准

**申请流程：**
1. Tech Nation背书（£561，8-12周）
2. 内政部签证（£205，3-8周）

**总费用：** £766 + £5,175医疗附加费

**关键成功因素：**
• 外部认可的证据
• 量化的成就数据
• 高质量推荐信
• 清晰的个人陈述

请告诉我您想了解的具体方面，我可以提供更详细的指导！`;
}