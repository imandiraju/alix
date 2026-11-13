import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Roster, IRosterStudent } from '../models/Roster.js';
import { GameSessionModel } from '../models/GameSession.js';

const router = Router();

// Helper: Parse CSV / Tab-separated / Multiline student text
export function parseStudentRosterText(rawText: string, defaultSection = ''): IRosterStudent[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const students: IRosterStudent[] = [];

  for (const line of lines) {
    // Skip header line if present
    if (/roll\s*(no|number)?/i.test(line) && /name/i.test(line)) {
      continue;
    }

    // Split by comma, tab, or semicolon
    const parts = line.split(/[,;\t]+/).map((p) => p.trim());
    if (parts.length >= 2) {
      const rollNo = parts[0].toUpperCase();
      const name = parts[1];
      const email = parts[2] || `${rollNo.toLowerCase()}@srmap.edu.in`;
      const section = parts[3] || defaultSection;

      if (rollNo && name) {
        students.push({ rollNo, name, email, section });
      }
    }
  }

  return students;
}

// ─── List Rosters for Teacher ────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.query;
    const filter: Record<string, any> = {};

    if (teacherId && mongoose.isValidObjectId(teacherId as string)) {
      filter.teacherId = teacherId;
    }

    const rosters = await Roster.find(filter).sort({ createdAt: -1 });

    const summary = rosters.map((r) => ({
      _id: r._id,
      courseCode: r.courseCode,
      courseName: r.courseName,
      section: r.section,
      academicYear: r.academicYear,
      studentCount: r.students.length,
      createdAt: r.createdAt,
    }));

    return res.json({ success: true, count: rosters.length, rosters: summary });
  } catch (err: any) {
    console.error('[Roster List Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch rosters' });
  }
});

// ─── Create Roster with Bulk Students ────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  try {
    const { teacherId, courseCode, courseName, section, academicYear, rawCsv, studentsList } = req.body;

    if (!courseCode || !courseName || !section) {
      return res.status(400).json({ error: 'Course Code, Course Name, and Section are required.' });
    }

    let students: IRosterStudent[] = [];

    if (Array.isArray(studentsList) && studentsList.length > 0) {
      students = studentsList.map((s: any) => ({
        rollNo: String(s.rollNo || '').trim().toUpperCase(),
        name: String(s.name || '').trim(),
        email: String(s.email || '').trim().toLowerCase(),
        section: String(s.section || section).trim(),
      })).filter((s: IRosterStudent) => s.rollNo && s.name);
    } else if (typeof rawCsv === 'string' && rawCsv.trim()) {
      students = parseStudentRosterText(rawCsv, section);
    }

    if (students.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid student record (Roll No and Name).' });
    }

    const roster = new Roster({
      teacherId: teacherId || new mongoose.Types.ObjectId(),
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      section: section.trim(),
      academicYear: academicYear || '2025-2026',
      students,
    });

    await roster.save();

    return res.status(201).json({
      success: true,
      message: `Roster saved with ${students.length} verified students.`,
      roster: {
        _id: roster._id,
        courseCode: roster.courseCode,
        courseName: roster.courseName,
        section: roster.section,
        studentCount: roster.students.length,
      },
    });
  } catch (err: any) {
    console.error('[Roster Create Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to save roster' });
  }
});

// ─── Get Single Roster Detail ────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid roster identifier' });
    }

    const roster = await Roster.findById(req.params.id);
    if (!roster) {
      return res.status(404).json({ error: 'Roster not found' });
    }

    return res.json({ success: true, roster });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load roster' });
  }
});

// ─── Delete Roster ────────────────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid roster identifier' });
    }

    await Roster.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Roster deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete roster' });
  }
});

// ─── Verify Student Roll Number Against Live Session Roster ──────────────────

router.post('/verify-student', async (req: Request, res: Response) => {
  try {
    const { pin, rollNo } = req.body;

    if (!pin) {
      return res.status(400).json({ allowed: false, message: 'Session PIN is required.' });
    }

    const cleanedPin = String(pin).trim().toUpperCase();
    const session = await GameSessionModel.findOne({ pin: cleanedPin });

    if (!session) {
      return res.status(404).json({ allowed: false, message: 'Classroom session not found.' });
    }

    // 1. Check if instructor has locked room
    if (session.isLocked) {
      return res.status(403).json({
        allowed: false,
        message: 'The instructor has locked this session. No new joiners are permitted.',
      });
    }

    // If session doesn't require roster, open entry
    if (!session.requireRoster || !session.rosterId) {
      return res.json({ allowed: true, requiresRoster: false });
    }

    // Session requires roster
    if (!rollNo || !String(rollNo).trim()) {
      return res.status(400).json({
        allowed: false,
        requiresRoster: true,
        message: 'This session requires a verified institutional Roll Number.',
      });
    }

    const cleanedRollNo = String(rollNo).trim().toUpperCase();

    // 2. Prevent duplicate logins: check if Roll Number already in session
    const isAlreadyConnected = session.participants.some(
      (p: any) => p.rollNo?.toUpperCase() === cleanedRollNo
    );

    if (isAlreadyConnected) {
      return res.status(409).json({
        allowed: false,
        requiresRoster: true,
        message: `Roll Number ${cleanedRollNo} is already active on another device in this session. Duplicate logins are blocked.`,
      });
    }

    // 3. Check enrollment in Roster
    const roster = await Roster.findById(session.rosterId);
    if (!roster) {
      return res.json({ allowed: true, requiresRoster: false });
    }

    const student = roster.students.find(
      (s: IRosterStudent) => s.rollNo.toUpperCase() === cleanedRollNo
    );

    if (!student) {
      return res.status(403).json({
        allowed: false,
        requiresRoster: true,
        message: `Roll Number ${cleanedRollNo} is not enrolled in ${roster.courseCode} (${roster.section}). Only registered students can join.`,
      });
    }

    return res.json({
      allowed: true,
      requiresRoster: true,
      student: {
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        section: student.section || roster.section,
        courseCode: roster.courseCode,
      },
    });
  } catch (err: any) {
    console.error('[Verify Student Error]:', err);
    return res.status(500).json({ allowed: false, message: 'Server validation error' });
  }
});

export default router;
