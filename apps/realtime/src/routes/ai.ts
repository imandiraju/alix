import { Router, Request, Response } from 'express';
import { SystemConfig } from '../models/SystemConfig.js';

const router = Router();

// Model failover priority list
// 1. Grok (x-ai) -> 2. Gemini (Google) -> 3. Llama / OpenRouter Free
const GROK_MODELS = ['x-ai/grok-2-vision-1212', 'x-ai/grok-beta'];
const GEMINI_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash-001',
  'google/gemini-flash-1.5',
  'google/gemini-flash-1.5-8b',
];
const FALLBACK_MODELS = ['meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free'];

// Heuristic fallback generator when no external network or API key is available
function generateHeuristicQuiz(topic: string, subject: string, materialText?: string, count: number = 4) {
  const cleanTopic = topic || (materialText ? 'Uploaded Study Material' : 'Active Learning Concept');
  const cleanSubject = subject || 'General Education';

  // Extract key terms from material if provided
  const terms: string[] = [];
  if (materialText && materialText.trim().length > 0) {
    const words = materialText
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 5 && !['should', 'between', 'through', 'because', 'without'].includes(w.toLowerCase()));
    const unique = Array.from(new Set(words));
    terms.push(...unique.slice(0, 10));
  }

  const defaultQuestions = [
    {
      id: `q-ai-1`,
      type: 'multiple_choice',
      text: terms[0]
        ? `What is the primary architectural purpose of ${terms[0]} in ${cleanTopic}?`
        : `What is the fundamental definition and core objective of ${cleanTopic}?`,
      timeLimit: 30,
      points: 1000,
      options: [
        terms[0] ? `To guarantee efficiency and establish boundary conditions for ${terms[0]}` : `To establish fundamental operational axioms and minimize overhead`,
        `To bypass data synchronization and discard state consistency`,
        `To enforce linear sequential blocking across all sub-components`,
        `To maximize memory fragmentation without indexing`,
      ],
      correctIndex: 0,
      explanation: `Option A encapsulates the foundational definition while avoiding invalid optimization traps.`,
    },
    {
      id: `q-ai-2`,
      type: 'true_false',
      text: terms[1]
        ? `True or False: In ${cleanTopic}, ${terms[1]} can be implemented without violating invariants.`
        : `True or False: The principles governing ${cleanTopic} strictly require invariant preservation under concurrent execution.`,
      timeLimit: 20,
      points: 1000,
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: `System invariants must be maintained under operational constraints.`,
    },
    {
      id: `q-ai-3`,
      type: 'multi_select',
      text: `Which of the following are valid design considerations or best practices when implementing ${cleanTopic}?`,
      timeLimit: 30,
      points: 1000,
      options: [
        `Strict adherence to boundary validation rules`,
        `Predictable computational complexity and error recovery`,
        `Unconditional resource leakage`,
        `Auditability and diagnostic telemetry`,
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: `Boundary validation, predictable complexity, and auditability are core tenets; resource leakage is an anti-pattern.`,
    },
    {
      id: `q-ai-4`,
      type: 'multiple_choice',
      text: terms[2]
        ? `When evaluating tradeoffs in ${terms[2]}, what is the most critical failure mode to mitigate?`
        : `When optimizing ${cleanTopic}, what is the primary risk of premature synchronization?`,
      timeLimit: 30,
      points: 1000,
      options: [
        `Unbounded latency degradation and deadlock vulnerability`,
        `Excessive cache hits and zero runtime overhead`,
        `Instantaneous convergence without state divergence`,
        `Over-simplified data schema representations`,
      ],
      correctIndex: 0,
      explanation: `Latency degradation and deadlock are classic failure modes in complex systems.`,
    },
    {
      id: `q-ai-5`,
      type: 'poll',
      text: `Classroom Opinion Check: How confident are you in applying the core tenets of ${cleanTopic} to real-world scenarios?`,
      timeLimit: 20,
      points: 0,
      options: [
        `100% Confident — Ready for advanced problems`,
        `75% Confident — Need one more practice exercise`,
        `50% Confident — Concept is clear but implementation is tricky`,
        `Need a quick refresher on foundational definitions`,
      ],
      correctIndex: 0,
      explanation: `Diagnostic pulse check to adapt lecture pacing.`,
    },
  ];

  return {
    title: `${cleanTopic} • AI Assessment`,
    subject: cleanSubject,
    description: `AI-generated active learning quiz focusing on core conceptual understanding and cognitive traps.`,
    questions: defaultQuestions.slice(0, Math.max(1, count)),
  };
}

// ─── POST /api/ai/generate ──────────────────────────────────────────────────

router.post('/generate', async (req: Request, res: Response) => {
  const {
    mode = 'topic', // 'topic' | 'material'
    topic = '',
    subject = '',
    level = 'Undergraduate',
    questionCount = 4,
    difficulty = 'medium',
    materialText = '',
    apiKey: userApiKey,
  } = req.body;

  // 1. Resolve Effective OpenRouter API Key
  // Priority: Teacher custom override -> Admin Cloud Database Vault -> Environment Variable
  let effectiveApiKey = userApiKey;
  let keySource = 'user_custom';

  if (!effectiveApiKey) {
    try {
      const dbConfig = await SystemConfig.findOne({ key: 'openrouter_api_key' });
      if (dbConfig && dbConfig.value) {
        effectiveApiKey = dbConfig.value;
        keySource = 'platform_admin_database';
      }
    } catch (err) {
      console.warn('[ALIX AI] SystemConfig DB key lookup error:', err);
    }
  }

  if (!effectiveApiKey) {
    effectiveApiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || '';
    if (effectiveApiKey) keySource = 'server_environment';
  }

  // 2. Resolve Dynamic Model Preferences from Database
  let adminPrimaryModel = '';
  let adminFallbackModel = '';
  try {
    const pModel = await SystemConfig.findOne({ key: 'ai_primary_model' });
    if (pModel && pModel.value) adminPrimaryModel = pModel.value;
    const fModel = await SystemConfig.findOne({ key: 'ai_fallback_model' });
    if (fModel && fModel.value) adminFallbackModel = fModel.value;
  } catch {}

  const count = Math.min(10, Math.max(1, Number(questionCount) || 4));

  // Construct Pedagogical Prompt
  const systemPrompt = `You are an elite university exam architect and pedagogical expert for "ALIX by RKGlobal EdTech".
Your task is to generate high-yield, engaging classroom assessment questions designed for live interactive sessions (like Kahoot/Peer Instruction).
Requirements:
1. Focus on deep conceptual understanding, boundary conditions, and cognitive traps (why students pick wrong distractors).
2. Generate a variety of formats: multiple_choice (4 options, exactly 1 correct), true_false (options: ["True", "False"], exactly 1 correct), and multi_select (4 options, multiple correct).
3. Return ONLY a valid JSON object with the following structure (no markdown fences, no explanatory prose):
{
  "title": "Short punchy quiz title (max 50 chars)",
  "subject": "${subject || 'Computer Science'}",
  "description": "One sentence summary of learning objectives",
  "questions": [
    {
      "id": "q-1",
      "type": "multiple_choice" | "true_false" | "multi_select",
      "text": "Clear, engaging question prompt",
      "timeLimit": 20 | 30 | 45,
      "points": 1000,
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0,
      "correctIndices": [0],
      "explanation": "Why the correct answer is right and why the main distractor was a cognitive trap"
    }
  ]
}`;

  let userPrompt = '';
  if (mode === 'material' && materialText && materialText.trim().length > 0) {
    userPrompt = `Generate a ${count}-question quiz based STRICTLY on the following learning material/lecture notes.
Target Academic Level: ${level}
Difficulty: ${difficulty}
Material:
"""
${materialText.slice(0, 10000)}
"""`;
  } else {
    userPrompt = `Generate a ${count}-question quiz on the following topic.
Topic: "${topic || 'Distributed Consensus & Fault Tolerance'}"
Subject / Discipline: "${subject || 'Computer Science'}"
Target Academic Level: ${level}
Difficulty: ${difficulty}
Ensure the questions test practical problem solving and identify common student misconceptions.`;
  }

  // Dynamic Model Failover Sequence: Admin Primary -> Grok -> Admin Fallback -> Gemini -> Free Models
  const rawCandidates = [
    ...(adminPrimaryModel ? [adminPrimaryModel] : []),
    ...GROK_MODELS,
    ...(adminFallbackModel ? [adminFallbackModel] : []),
    ...GEMINI_MODELS,
    ...FALLBACK_MODELS,
  ];
  // Remove duplicates while preserving priority order
  const candidateModels = Array.from(new Set(rawCandidates));

  if (!effectiveApiKey) {
    console.log('[ALIX AI] Notice: No OPENROUTER_API_KEY set. Using heuristic pedagogical generator.');
    const heuristicQuiz = generateHeuristicQuiz(topic, subject, materialText, count);
    return res.json({
      success: true,
      modelUsed: 'heuristic-pedagogical-engine',
      quiz: heuristicQuiz,
      notice: 'Generated with ALIX Pedagogical Engine. Connect OpenRouter API key for live Grok/Gemini models.',
    });
  }

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[ALIX AI] Attempting OpenRouter generation with model: ${modelName}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000); // 22s timeout per model

      const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveApiKey}`,
          'HTTP-Referer': 'https://alix-alp.vercel.app',
          'X-Title': 'ALIX by RKGlobal EdTech',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!openRouterRes.ok) {
        const errorText = await openRouterRes.text();
        console.warn(`[ALIX AI] Model ${modelName} returned HTTP ${openRouterRes.status}: ${errorText.slice(0, 150)}`);
        lastError = new Error(`Model ${modelName} failed (${openRouterRes.status})`);
        continue; // Fall over to next model (Grok -> Gemini)
      }

      const data: any = await openRouterRes.json();
      const rawContent = data.choices?.[0]?.message?.content;

      if (!rawContent) {
        console.warn(`[ALIX AI] Model ${modelName} returned empty choices. Falling over...`);
        continue;
      }

      // Parse JSON, stripping any accidental markdown fences
      let cleanedJson = rawContent.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      }

      const parsedQuiz = JSON.parse(cleanedJson);

      // Sanitize questions
      if (Array.isArray(parsedQuiz.questions) && parsedQuiz.questions.length > 0) {
        const sanitizedQuestions = parsedQuiz.questions.map((q: any, idx: number) => {
          const rawOpts: string[] = Array.isArray(q.options)
            ? q.options.map(String)
            : ['Option A', 'Option B', 'Option C', 'Option D'];
          const type = q.type === 'true_false' ? 'true_false' : q.type === 'multi_select' ? 'multi_select' : 'multiple_choice';
          const opts = type === 'true_false' ? ['True', 'False'] : rawOpts.slice(0, 4);

          let correctIdx = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < opts.length ? q.correctIndex : 0;
          let correctIndices = Array.isArray(q.correctIndices)
            ? q.correctIndices.filter((i: any) => typeof i === 'number' && i >= 0 && i < opts.length)
            : [correctIdx];

          if (correctIndices.length === 0) correctIndices = [correctIdx];

          return {
            id: `q-${Date.now()}-${idx + 1}`,
            type,
            text: q.text || `Question ${idx + 1}`,
            timeLimit: Number(q.timeLimit) || 30,
            points: Number(q.points) || 1000,
            options: opts,
            correctIndex: correctIdx,
            correctIndices,
            explanation: q.explanation || '',
          };
        });

        console.log(`[ALIX AI] ✅ Generation successful with ${modelName} (${sanitizedQuestions.length} questions)!`);

        // Record health status in background if using platform key
        if (keySource === 'platform_admin_database') {
          SystemConfig.findOneAndUpdate(
            { key: 'openrouter_api_key' },
            { status: 'active', lastTestedAt: new Date() }
          ).catch(() => {});
        }

        return res.json({
          success: true,
          modelUsed: modelName,
          quiz: {
            title: parsedQuiz.title || topic || 'AI Generated Assessment',
            subject: parsedQuiz.subject || subject || 'General',
            description: parsedQuiz.description || 'AI curriculum-aligned interactive assessment.',
            questions: sanitizedQuestions,
          },
        });
      }
    } catch (err: any) {
      console.warn(`[ALIX AI] Error with model ${modelName}:`, err.message);
      lastError = err;
      // Continue to next model in failover chain (Grok -> Gemini -> Fallback)
    }
  }

  // If all OpenRouter candidate models failed or rate-limited, gracefully deliver heuristic quiz!
  console.log('[ALIX AI] All live model candidates exhausted. Falling back to heuristic engine.');
  const fallbackQuiz = generateHeuristicQuiz(topic, subject, materialText, count);
  return res.json({
    success: true,
    modelUsed: 'heuristic-pedagogical-engine (failover fallback)',
    quiz: fallbackQuiz,
    errorNotice: lastError ? lastError.message : undefined,
  });
});

export default router;
