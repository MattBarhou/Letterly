import JSZip from "jszip";
import PDFDocument from "pdfkit";

const OUTPUT_FILES = {
  coverLetterBasic: { filename: "cover_letter_basic.pdf", type: "pdf" },
  coverLetterDetailed: { filename: "cover_letter_detailed.pdf", type: "pdf" },
  recruiterEmail: { filename: "recruiter_email.txt", type: "txt" },
  linkedinMessage: { filename: "linkedin_message.txt", type: "txt" },
  atsVersion: { filename: "ats_version.txt", type: "txt" },
};

export function sanitizeFilename(name) {
  if (!name || typeof name !== "string") {
    return "Application";
  }

  const sanitized = name
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);

  return sanitized || "Application";
}

function createCoverLetterPdf(text) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica").fontSize(11).text(text || "", {
      align: "left",
      lineGap: 4,
    });
    doc.end();
  });
}

export async function buildApplicationZip({ company, jobTitle, outputs }) {
  const folderName = `${sanitizeFilename(company)}_${sanitizeFilename(jobTitle)}`;
  const zip = new JSZip();
  const folder = zip.folder(folderName);

  for (const [key, config] of Object.entries(OUTPUT_FILES)) {
    const content = outputs[key];
    if (content == null) {
      continue;
    }

    if (config.type === "pdf") {
      const pdfBuffer = await createCoverLetterPdf(content);
      folder.file(config.filename, pdfBuffer);
    } else {
      folder.file(config.filename, content);
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  const zipFilename = `Letterly_${folderName}.zip`;

  return { zipBuffer, zipFilename, folderName };
}
