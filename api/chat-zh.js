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
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        if (message === 'test connection') {
            return res.status(200).json({ 
                response: '中文API连接成功！🇨🇳' 
            });
        }

        // Check for API key
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

        // Simple AI call with timeout protection
        const completion = await Promise.race([
            client.chat.completions.create({
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: [
                    {
                        role: "system",
                        content: "你是英国全球人才签证专家。请用中文简洁地回答问题。"
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 800,
                temperature: 0.7,
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 25000)
            )
        ]);

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

function getSimpleFallback(message) {
    const query = message.toLowerCase();
    
    if (query.includes('文件') || query.includes('证据')) {
        return `**申请文件清单：**

**必须文件：**
• 护照或身份证
• 简历（最多3页）
• 个人陈述（最多1000字）
• 推荐信3封

**证据材料（最多10项）：**
• 媒体报道
• 行业奖项
• 会议演讲
• 开源贡献
• 专利文件
• 商业成功数据

**下一步：** 选择最强的2个评估标准，收集相关证据。`;
    }
    
    if (query.includes('流程') || query.includes('步骤')) {
        return `**申请流程：**

**第1步：Tech Nation背书**
• 费用：£561
• 时间：8-12周
• 在线申请

**第2步：内政部签证**
• 费用：£205
• 时间：3-8周
• 生物识别预约

**总费用：** £766 + 医疗附加费

**下一步：** 准备证据材料，获得推荐信。`;
    }
    
    if (query.includes('费用') || query.includes('成本')) {
        return `**费用明细：**

• Tech Nation费用：£561
• 签证申请费：£205
• 医疗附加费：£1,035/年

**总计：** £766 + 医疗费

**家属：** 每人额外£205 + 医疗费

**下一步：** 准备申请预算，考虑加急费用。`;
    }
    
    return `**Tech Nation申请要点：**

**基本要求：**
• 数字技术领域5年经验
• 杰出人才或潜力证明
• 满足2个评估标准

**关键步骤：**
1. 评估资格
2. 收集证据
3. 获得推荐信
4. 提交申请

**费用：** £766 + 医疗附加费
**时间：** 6-8个月

需要具体指导请告诉我您的问题！`;
}