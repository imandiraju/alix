import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Teacher } from '../models/Teacher.js';
import { SystemConfig } from '../models/SystemConfig.js';
import { Quiz } from '../models/Quiz.js';
import { GameSessionModel } from '../models/GameSession.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'alix-edtech-secret-jwt-key-2026';

function maskSecretKey(key: string): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (trimmed.length <= 10) return '••••••••';
  const prefix = trimmed.slice(0, 8);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}

// ─── Middleware: Strict Platform Admin Guard ──────────────────────────────────
// Only users with role === 'admin' (such as alixadmin@gmail.com) can access

async function requireAdminUser(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in as Platform Admin.' });
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    const teacher = await Teacher.findById(decoded.id);
    if (!teacher || teacher.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden: Access restricted to Platform Administrators (alixadmin@gmail.com). Teachers do not have administrative privileges.',
      });
      return null;
    }
    return teacher;
  } catch {
    res.status(401).json({ error: 'Invalid or expired administrator session.' });
    return null;
  }
}

// ─── GET /api/admin/config ────────────────────────────────────────────────────
// Return current AI model settings & masked API key (Admin only)

router.get('/config', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

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
// Save or update OpenRouter API key and preferred AI models (Admin only)

router.post('/config', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

    const { openrouterKey, primaryModel, fallbackModel } = req.body;
    const editorName = `${admin.name} (${admin.email})`;

    // 1. Update OpenRouter API Key if provided
    if (typeof openrouterKey === 'string') {
      const trimmed = openrouterKey.trim();
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
// Live verification against OpenRouter Auth endpoint (Admin only)

router.post('/test-openrouter', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

    const { keyToTest } = req.body;
    let testKey = (keyToTest || '').trim();

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

    const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testKey}`,
      },
    });

    const authData = (await authRes.json().catch(() => ({}))) as any;

    if (!authRes.ok) {
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

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
// Platform diagnostics and database health (Admin only)

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

    const [quizCount, teacherCount, adminCount, sessionCount] = await Promise.all([
      Quiz.countDocuments().catch(() => 0),
      Teacher.countDocuments({ role: 'teacher' }).catch(() => 0),
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

// ─── GET /api/admin/teachers ──────────────────────────────────────────────────
// List all registered teachers with their AI entitlement status (Admin only)

router.get('/teachers', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

    const teachers = await Teacher.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const list = teachers.map((t) => ({
      id: t._id,
      name: t.name,
      email: t.email,
      institution: t.institution,
      department: t.department,
      role: t.role,
      aiEnabled: t.role === 'admin' ? true : Boolean(t.aiEnabled),
      createdAt: t.createdAt,
    }));

    return res.json({ success: true, teachers: list });
  } catch (err: any) {
    console.error('[Admin Get Teachers Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve teachers list.' });
  }
});

// ─── POST /api/admin/teachers/:id/toggle-ai ───────────────────────────────────
// Toggle or set AI access for a specific teacher (Admin only)

router.post('/teachers/:id/toggle-ai', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

    const { id } = req.params;
    const { enabled } = req.body;

    const target = await Teacher.findById(id);
    if (!target) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }

    if (typeof enabled === 'boolean') {
      target.aiEnabled = enabled;
    } else {
      target.aiEnabled = !target.aiEnabled;
    }

    await target.save();

    return res.json({
      success: true,
      message: `AI access for ${target.name} is now ${target.aiEnabled ? 'ENABLED (Premium)' : 'DISABLED'}.`,
      teacher: {
        id: target._id,
        name: target.name,
        email: target.email,
        aiEnabled: target.aiEnabled,
      },
    });
  } catch (err: any) {
    console.error('[Admin Toggle AI Error]:', err);
    return res.status(500).json({ error: 'Failed to update teacher AI access.' });
  }
});

// ─── POST /api/admin/teachers/bulk-ai ─────────────────────────────────────────
// Bulk enable or disable AI for all teachers (Admin only)

router.post('/teachers/bulk-ai', async (req: Request, res: Response) => {
  try {
    const admin = await requireAdminUser(req, res);
    if (!admin) return;

    const { enabled } = req.body;
    const targetState = Boolean(enabled);

    await Teacher.updateMany(
      { role: { $ne: 'admin' } },
      { $set: { aiEnabled: targetState } }
    );

    return res.json({
      success: true,
      message: `All educators have been ${targetState ? 'granted' : 'revoked'} AI Quiz Studio access.`,
    });
  } catch (err: any) {
    console.error('[Admin Bulk AI Error]:', err);
    return res.status(500).json({ error: 'Failed to bulk update AI permissions.' });
  }
});

export default router;
