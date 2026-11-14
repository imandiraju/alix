import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Teacher } from '../models/Teacher.js';
import { SystemConfig } from '../models/SystemConfig.js';
import { Quiz } from '../models/Quiz.js';
import { GameSessionModel } from '../models/GameSession.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'alix-edtech-secret-jwt-key-2026';
const PLATFORM_MASTER_ADMIN_KEY =
  process.env.ALIX_ADMIN_MASTER_KEY || 'alix-admin-2026';

function maskSecretKey(key: string): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return '••••••••';
  const prefix = trimmed.slice(0, 8);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}

// ─── Middleware / Auth Helper ──────────────────────────────────────────────────

async function getAdminUserFromHeader(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    const teacher = await Teacher.findById(decoded.id);
    return teacher;
  } catch {
    return null;
  }
}

// ─── GET /api/admin/config ────────────────────────────────────────────────────
// Return current AI model settings & masked API key

router.get('/config', async (req: Request, res: Response) => {
  try {
    const keyConfig = await SystemConfig.findOne({ key: 'openrouter_api_key' });
    const primaryModelConfig = await SystemConfig.findOne({ key: 'ai_primary_model' });
    const fallbackModelConfig = await SystemConfig.findOne({ key: 'ai_fallback_model' });

    const envConfigured = Boolean(process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY);
    const dbConfigured = Boolean(keyConfig && keyConfig.value);

    return res.json({
      success: true,
      config: {
        isConfigured: dbConfigured || envConfigured,
        source: dbConfigured ? 'database' : envConfigured ? 'environment' : 'unconfigured',
        maskedKey: keyConfig?.maskedValue || (envConfigured ? maskSecretKey(process.env.OPENROUTER_API_KEY || '') : ''),
        status: keyConfig?.status || (envConfigured ? 'active' : 'untested'),
        lastTestedAt: keyConfig?.lastTestedAt || null,
        testDetails: keyConfig?.testDetails || null,
        primaryModel: primaryModelConfig?.value || 'x-ai/grok-2-vision-1212',
        fallbackModel: fallbackModelConfig?.value || 'google/gemini-2.0-flash-exp:free',
        updatedBy: keyConfig?.updatedBy || 'Platform Admin',
        updatedAt: keyConfig?.updatedAt || null,
      },
    });
  } catch (err: any) {
    console.error('[Admin Config Get Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve platform configuration.' });
  }
});

// ─── POST /api/admin/config ───────────────────────────────────────────────────
// Save or update OpenRouter API key and preferred AI models

router.post('/config', async (req: Request, res: Response) => {
  try {
    const user = await getAdminUserFromHeader(req);
    const { openrouterKey, primaryModel, fallbackModel } = req.body;

    const editorName = user ? `${user.name} (${user.email})` : 'Platform Admin';

    // 1. Update OpenRouter API Key if provided
    if (typeof openrouterKey === 'string') {
      const trimmed = openrouterKey.trim();
      // If user passed a non-masked new key
      if (trimmed.length > 0 && !trimmed.includes('••••')) {
        await SystemConfig.findOneAndUpdate(
          { key: 'openrouter_api_key' },
          {
            key: 'openrouter_api_key',
            value: trimmed,
            maskedValue: maskSecretKey(trimmed),
            category: 'ai',
            description: 'Platform OpenRouter AI API Key for Grok & Gemini',
            status: 'untested',
            updatedBy: editorName,
          },
          { upsert: true, new: true }
        );
      }
    }

    // 2. Update Primary Model if provided
    if (primaryModel && typeof primaryModel === 'string') {
      await SystemConfig.findOneAndUpdate(
        { key: 'ai_primary_model' },
        {
          key: 'ai_primary_model',
          value: primaryModel.trim(),
          category: 'ai',
          description: 'Primary AI model attempted first (e.g. x-ai/grok-2-vision-1212)',
          updatedBy: editorName,
        },
        { upsert: true, new: true }
      );
    }

    // 3. Update Fallback Model if provided
    if (fallbackModel && typeof fallbackModel === 'string') {
      await SystemConfig.findOneAndUpdate(
        { key: 'ai_fallback_model' },
        {
          key: 'ai_fallback_model',
          value: fallbackModel.trim(),
          category: 'ai',
          description: 'Fallback AI model if primary fails (e.g. google/gemini-2.0-flash-exp:free)',
          updatedBy: editorName,
        },
        { upsert: true, new: true }
      );
    }

    return res.json({
      success: true,
      message: 'Platform AI settings updated successfully in cloud database.',
    });
  } catch (err: any) {
    console.error('[Admin Config Save Error]:', err);
    return res.status(500).json({ error: 'Failed to save configuration.' });
  }
});

// ─── POST /api/admin/test-openrouter ──────────────────────────────────────────
// Live verification against OpenRouter Auth endpoint

router.post('/test-openrouter', async (req: Request, res: Response) => {
  try {
    const { keyToTest } = req.body;

    let testKey = (keyToTest || '').trim();

    // If keyToTest is empty or masked, fetch the stored database key
    if (!testKey || testKey.includes('••••')) {
      const dbConfig = await SystemConfig.findOne({ key: 'openrouter_api_key' });
      if (dbConfig && dbConfig.value) {
        testKey = dbConfig.value;
      } else if (process.env.OPENROUTER_API_KEY) {
        testKey = process.env.OPENROUTER_API_KEY;
      }
    }

    if (!testKey) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'No OpenRouter API key found to test. Please enter a valid key starting with sk-or-...',
      });
    }

    // Query OpenRouter Key Auth API
    const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testKey}`,
      },
    });

    const authData = (await authRes.json().catch(() => ({}))) as any;

    if (!authRes.ok) {
      // Update status in DB
      await SystemConfig.findOneAndUpdate(
        { key: 'openrouter_api_key' },
        {
          status: 'invalid',
          lastTestedAt: new Date(),
          testDetails: authData,
        }
      );

      return res.status(400).json({
        success: false,
        valid: false,
        error: authData?.error?.message || `OpenRouter returned status ${authRes.status}: Unauthorized or Invalid Key.`,
      });
    }

    const keyDetails = authData?.data || {};

    // Mark as active in DB
    await SystemConfig.findOneAndUpdate(
      { key: 'openrouter_api_key' },
      {
        status: 'active',
        lastTestedAt: new Date(),
        testDetails: keyDetails,
      }
    );

    return res.json({
      success: true,
      valid: true,
      message: 'OpenRouter connection successful and verified!',
      details: {
        label: keyDetails.label || 'Standard OpenRouter Key',
        usageUsd: keyDetails.usage != null ? `$${Number(keyDetails.usage).toFixed(4)}` : 'N/A',
        limit: keyDetails.limit != null ? `$${keyDetails.limit}` : 'Pay-as-you-go / Unlimited',
        isFreeTier: Boolean(keyDetails.is_free_tier),
        rateLimit: keyDetails.rate_limit || { requests: 'Normal', interval: '10s' },
      },
    });
  } catch (err: any) {
    console.error('[OpenRouter Key Test Error]:', err);
    return res.status(500).json({
      success: false,
      valid: false,
      error: err.message || 'Network error pinging OpenRouter API gateway.',
    });
  }
});

// ─── POST /api/admin/claim-admin ──────────────────────────────────────────────
// Elevate an authenticated teacher to Platform Admin using the Master Passcode

router.post('/claim-admin', async (req: Request, res: Response) => {
  try {
    const { passcode, userId, email } = req.body;

    if (!passcode || passcode.trim() !== PLATFORM_MASTER_ADMIN_KEY) {
      return res.status(403).json({
        error: 'Invalid Platform Master Admin Passcode. Please check with the system administrator.',
      });
    }

    const query = userId ? { _id: userId } : email ? { email: email.toLowerCase().trim() } : null;
    if (!query) {
      return res.status(400).json({ error: 'User identifier (userId or email) is required.' });
    }

    const teacher = await Teacher.findOne(query);
    if (!teacher) {
      return res.status(404).json({ error: 'Educator profile not found.' });
    }

    teacher.role = 'admin';
    await teacher.save();

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email, role: teacher.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: `Congratulations! ${teacher.name} has been promoted to Platform Admin.`,
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        institution: teacher.institution,
        department: teacher.department,
        subjects: teacher.subjects,
        role: teacher.role,
        avatarInitials: teacher.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    });
  } catch (err: any) {
    console.error('[Claim Admin Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to claim admin status.' });
  }
});

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
// Platform diagnostics and database health

router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [quizCount, teacherCount, adminCount, sessionCount] = await Promise.all([
      Quiz.countDocuments().catch(() => 0),
      Teacher.countDocuments().catch(() => 0),
      Teacher.countDocuments({ role: 'admin' }).catch(() => 0),
      GameSessionModel.countDocuments().catch(() => 0),
    ]);

    const keyConfig = await SystemConfig.findOne({ key: 'openrouter_api_key' });

    return res.json({
      success: true,
      metrics: {
        totalQuizzes: quizCount,
        totalTeachers: teacherCount,
        totalAdmins: adminCount,
        totalLiveSessions: sessionCount,
      },
      aiGateway: {
        status: keyConfig?.status || (process.env.OPENROUTER_API_KEY ? 'active' : 'unconfigured'),
        lastTested: keyConfig?.lastTestedAt || null,
        modelsConfigured: [
          'x-ai/grok-2-vision-1212 (Primary)',
          'google/gemini-2.0-flash-exp:free (Fast Failover)',
          'meta-llama/llama-3.3-70b-instruct:free (Backup)',
        ],
      },
    });
  } catch (err: any) {
    console.error('[Admin Overview Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch platform metrics.' });
  }
});

export default router;
