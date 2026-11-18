import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { SubmissionExportPayload } from '../types/exam';
import { countWords, getViolationReasonLabel } from './examLogic';

function makeCell(text: string, bold = false, widthPct?: number): TableCell {
  return new TableCell({
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size: 20,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

function buildQuestionTable(
  items: { number: number; prompt: string; answer: string }[]
): Table {
  const headerRow = new TableRow({
    children: [
      makeCell('Câu', true, 10),
      makeCell('Nội dung câu hỏi', true, 55),
      makeCell('Bài làm thí sinh', true, 35),
    ],
  });

  const dataRows = items.map(
    (item) =>
      new TableRow({
        children: [
          makeCell(String(item.number), true, 10),
          makeCell(item.prompt, false, 55),
          makeCell(item.answer || '(Bỏ trống)', false, 35),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
    },
    rows: [headerRow, ...dataRows],
  });
}

export function buildHiddenAuditText(payload: SubmissionExportPayload): string {
  const { violationCount, restartCount, violationHistory } = payload.antiCheat;
  if (violationCount === 0) {
    return `[NHAT KY GIAM SAT THI]: Thi sinh chap hanh dung quy che toan man hinh. So lan vi pham: 0 lan | So lan lam lai tu dau: 0 lan.`;
  }

  const details = violationHistory
    .map((v, i) => {
      const timeStr = new Date(v.timestamp).toLocaleString('vi-VN');
      return `Lan ${i + 1} (${timeStr}): ${getViolationReasonLabel(v.reason)} -> ${
        v.actionTaken === 'forced_restart' ? 'Bat buoc thi lai tu dau' : 'Canh bao lan dau'
      }`;
    })
    .join(' ; ');

  return `[NHAT KY GIAM SAT THI - PHAT HIEN VI PHAM]: Thi sinh da vi pham ${violationCount} lan | So lan bi bat thi lai tu dau: ${restartCount} lan. Chi tiet: ${details}`;
}

export function createSubmissionDocument(payload: SubmissionExportPayload): Document {
  const { exam, candidate, answers, completedModules, submittedAt } = payload;

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'BÀI THI IELTS TRÊN MÁY TÍNH — PHIẾU NỘP BÀI THÍ SINH',
          bold: true,
          size: 28,
          color: '1E293B',
          font: 'Calibri',
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: exam.title,
          bold: true,
          size: 24,
          color: 'C8102E',
          font: 'Calibri',
        }),
      ],
    })
  );

  // Candidate Metadata
  const formattedDate = new Date(submittedAt).toLocaleString('vi-VN');
  const durationMinutes = Math.round(
    completedModules.reduce((acc, m) => acc + m.durationUsedSeconds, 0) / 60
  );

  const infoLines = [
    `Họ và tên thí sinh: ${candidate.fullName}`,
    `Số báo danh (Candidate ID): ${candidate.candidateId}`,
    `Hình thức đề thi: IELTS ${exam.category}`,
    `Thời điểm nộp bài: ${formattedDate}`,
    `Tổng thời gian làm bài ghi nhận: ${durationMinutes} phút`,
  ];

  infoLines.forEach((line) => {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: line,
            size: 22,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      })
    );
  });

  const completedSet = new Set(completedModules.map((m) => m.module));
  const includeListening =
    completedSet.has('listening') || Object.values(answers.listening).some((v) => v.trim().length > 0);
  const includeReading =
    completedSet.has('reading') || Object.values(answers.reading).some((v) => v.trim().length > 0);
  const includeWriting =
    completedSet.has('writing') || Object.values(answers.writing).some((v) => v.trim().length > 0);

  // LISTENING SECTION
  if (includeListening && exam.listening && exam.listening.parts.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 160 },
        children: [
          new TextRun({
            text: 'I. LISTENING RESPONSES',
            bold: true,
            size: 26,
            color: '1E293B',
            font: 'Calibri',
          }),
        ],
      })
    );

    const listeningRows: { number: number; prompt: string; answer: string }[] = [];
    exam.listening.parts.forEach((part) => {
      part.questionGroups.forEach((group) => {
        group.questions.forEach((q) => {
          listeningRows.push({
            number: q.number,
            prompt: q.prompt,
            answer: answers.listening[q.number] ?? '',
          });
        });
      });
    });

    if (listeningRows.length > 0) {
      children.push(buildQuestionTable(listeningRows));
    }
  }

  // READING SECTION
  if (includeReading && exam.reading && exam.reading.passages.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 160 },
        children: [
          new TextRun({
            text: 'II. READING RESPONSES',
            bold: true,
            size: 26,
            color: '1E293B',
            font: 'Calibri',
          }),
        ],
      })
    );

    const readingRows: { number: number; prompt: string; answer: string }[] = [];
    exam.reading.passages.forEach((passage) => {
      passage.questionGroups.forEach((group) => {
        group.questions.forEach((q) => {
          readingRows.push({
            number: q.number,
            prompt: q.prompt,
            answer: answers.reading[q.number] ?? '',
          });
        });
      });
    });

    if (readingRows.length > 0) {
      children.push(buildQuestionTable(readingRows));
    }
  }

  // WRITING SECTION
  if (includeWriting && exam.writing && exam.writing.tasks.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 160 },
        children: [
          new TextRun({
            text: 'III. WRITING RESPONSES',
            bold: true,
            size: 26,
            color: '1E293B',
            font: 'Calibri',
          }),
        ],
      })
    );

    exam.writing.tasks.forEach((task) => {
      const essay = answers.writing[task.taskNumber] ?? '';
      const words = countWords(essay);

      children.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: `${task.title} (${words} từ)`,
              bold: true,
              size: 24,
              color: '1E293B',
              font: 'Calibri',
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Đề bài: ${task.prompt}`,
              italics: true,
              size: 20,
              color: '4B5563',
              font: 'Calibri',
            }),
          ],
        })
      );

      const essayParagraphs = (essay.trim() || '(Thí sinh không viết nội dung)').split(/\n+/);
      essayParagraphs.forEach((para) => {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: para,
                size: 22,
                color: '111827',
                font: 'Calibri',
              }),
            ],
          })
        );
      });
    });
  }

  // HIDDEN WHITE-TEXT ANTI-CHEAT AUDIT LINE
  // Pure white (#FFFFFF) on white Word page: invisible on screen/print, immediately visible when teacher presses Ctrl+A in Word.
  const hiddenAuditText = buildHiddenAuditText(payload);
  children.push(
    new Paragraph({
      spacing: { before: 400, after: 40 },
      children: [
        new TextRun({
          text: hiddenAuditText,
          color: 'FFFFFF',
          size: 20,
          font: 'Calibri',
        }),
      ],
    })
  );

  return new Document({
    creator: 'IELTS Computer-Delivered Exam Studio',
    title: `${exam.title} - ${candidate.fullName}`,
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

export async function generateSubmissionDocxBlob(
  payload: SubmissionExportPayload
): Promise<Blob> {
  const doc = createSubmissionDocument(payload);
  return Packer.toBlob(doc);
}

export async function generateSubmissionDocxBuffer(
  payload: SubmissionExportPayload
): Promise<Uint8Array> {
  const doc = createSubmissionDocument(payload);
  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}

export async function downloadSubmissionDocx(payload: SubmissionExportPayload): Promise<void> {
  const blob = await generateSubmissionDocxBlob(payload);
  const safeName = payload.candidate.fullName
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF_-]+/g, '_') || 'Thi_sinh';
  const safeId = payload.candidate.candidateId.trim().replace(/[^a-zA-Z0-9_-]+/g, '_') || 'ID';
  const fileName = `IELTS_${safeId}_${safeName}.docx`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
