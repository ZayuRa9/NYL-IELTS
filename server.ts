import express from 'express';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_EXAMS } from './src/data/defaultExams';
import { GradedSubmissionRecord, IeltsExam } from './src/types/exam';
import { parseRawExamText } from './src/utils/examLogic';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXAMS_FILE)) {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(DEFAULT_EXAMS, null, 2), 'utf-8');
  }
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readExams(): IeltsExam[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(EXAMS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const defaultsById = new Map(DEFAULT_EXAMS.map((d) => [d.id, d]));
      let changed = false;
      const withoutLegacySample = parsed.filter((e: IeltsExam) => {
        if (e.id === 'ielts-academic-sample-01' || e.id === 'ielts-listening-practice-01') {
          changed = true;
          return false;
        }
        return true;
      });
      const existingIds = new Set(withoutLegacySample.map((e: IeltsExam) => e.id));
      const missingDefaults = DEFAULT_EXAMS.filter((def) => !existingIds.has(def.id));
      const synced = withoutLegacySample.map((e: IeltsExam) => {
        const def = defaultsById.get(e.id);
        if (def && def.updatedAt > (e.updatedAt || '')) {
          changed = true;
          return def;
        }
        return e;
      });
      if (missingDefaults.length > 0 || changed) {
        const merged = [...missingDefaults, ...synced];
        fs.writeFileSync(EXAMS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
        return merged;
      }
      return synced;
    }
    return DEFAULT_EXAMS;
  } catch {
    return DEFAULT_EXAMS;
  }
}

function writeExams(exams: IeltsExam[]): void {
  ensureStorage();
  fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2), 'utf-8');
}

function readSubmissions(): GradedSubmissionRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubmissions(records: GradedSubmissionRecord[]): void {
  ensureStorage();
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

async function startServer() {
  ensureStorage();

  const app = express();
  app.use(express.json({ limit: '60mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/exams', (_req, res) => {
    res.json(readExams());
  });

  app.post('/api/exams', (req, res) => {
    const body = req.body as Partial<IeltsExam>;
    if (!body || !body.title || typeof body.title !== 'string') {
      res.status(400).json({ error: 'Exam title is required' });
      return;
    }
    const now = new Date().toISOString();
    const newExam: IeltsExam = {
      id: body.id && body.id.trim() ? body.id.trim() : `exam-${Date.now()}`,
      title: body.title.trim(),
      category: body.category === 'General Training' ? 'General Training' : 'Academic',
      description: body.description || '',
      createdAt: body.createdAt || now,
      updatedAt: now,
      listening: body.listening,
      reading: body.reading,
      writing: body.writing,
    };

    const exams = readExams();
    exams.unshift(newExam);
    writeExams(exams);
    res.status(201).json(newExam);
  });

  app.put('/api/exams/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<IeltsExam>;
    const exams = readExams();
    const idx = exams.findIndex((e) => e.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }
    const updated: IeltsExam = {
      ...exams[idx],
      ...body,
      id: exams[idx].id,
      updatedAt: new Date().toISOString(),
    };
    exams[idx] = updated;
    writeExams(exams);
    res.json(updated);
  });

  app.delete('/api/exams/:id', (req, res) => {
    const { id } = req.params;
    const exams = readExams();
    const filtered = exams.filter((e) => e.id !== id);
    writeExams(filtered);
    res.json({ deleted: id, remaining: filtered.length });
  });

  app.post('/api/exams/restore-default', (_req, res) => {
    const exams = readExams();
    const existingIds = new Set(exams.map((e) => e.id));
    const merged = [...exams];
    DEFAULT_EXAMS.forEach((def) => {
      if (!existingIds.has(def.id)) {
        merged.push(def);
      }
    });
    writeExams(merged);
    res.json(merged);
  });

  app.get('/api/submissions', (_req, res) => {
    res.json(readSubmissions());
  });

  app.post('/api/submissions', (req, res) => {
    const incoming = Array.isArray(req.body) ? req.body : [req.body];
    const valid = incoming.filter(
      (r): r is GradedSubmissionRecord =>
        Boolean(r && typeof r === 'object' && r.id && r.examId && Array.isArray(r.byQuestionType))
    );
    if (valid.length === 0) {
      res.status(400).json({ error: 'Valid graded submission record(s) required' });
      return;
    }
    const existing = readSubmissions();
    const incomingIds = new Set(valid.map((v) => v.id));
    const merged = [...valid, ...existing.filter((e) => !incomingIds.has(e.id))];
    writeSubmissions(merged);
    res.status(201).json(merged);
  });

  app.delete('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    const filtered = readSubmissions().filter((r) => r.id !== id);
    writeSubmissions(filtered);
    res.json(filtered);
  });

  app.post('/api/upload', (req, res) => {
    const { filename, base64Data } = req.body as {
      filename?: string;
      base64Data?: string;
    };
    if (!filename || !base64Data) {
      res.status(400).json({ error: 'Missing filename or base64Data' });
      return;
    }
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedName = `${Date.now()}_${safeName}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, storedName), buffer);
    res.json({ url: `/uploads/${storedName}`, filename: storedName });
  });

  app.post('/api/parse-docx', async (req, res) => {
    try {
      const { filename, base64Data } = req.body as {
        filename?: string;
        base64Data?: string;
      };
      if (!base64Data) {
        res.status(400).json({ error: 'Missing base64Data' });
        return;
      }
      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const buffer = Buffer.from(cleanBase64, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      const titleFromFile = (filename || 'Đề thi IELTS mới')
        .replace(/\.docx?$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      const parsedExam = parseRawExamText(result.value, titleFromFile);
      res.json({ rawText: result.value, parsedExam });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to parse .docx file',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IELTS Exam Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
