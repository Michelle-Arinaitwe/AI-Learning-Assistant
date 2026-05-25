const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat, NumberFormat
} = require('docx');
const fs = require('fs');

const borderColor = "2E75B6";
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const allBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial" })]
  });
}
function body(text) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 360, lineRule: "auto" },
    children: [new TextRun({ text, size: 24, font: "Arial" })]
  });
}
function bold(text) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial" })]
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 24, font: "Arial" })]
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numberedList", level: 0 },
    children: [new TextRun({ text, size: 24, font: "Arial" })]
  });
}
function spacer() {
  return new Paragraph({ children: [new TextRun("")] });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numberedList",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 24 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1800 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: borderColor, space: 1 } },
            children: [
              new TextRun({ text: "AI Study Assistant  |  Chapter One: Introduction", size: 18, font: "Arial", color: "595959" })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: borderColor, space: 1 } },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Page ", size: 18, font: "Arial", color: "595959" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "595959" }),
              new TextRun({ text: " of ", size: 18, font: "Arial", color: "595959" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Arial", color: "595959" })
            ]
          })
        ]
      })
    },
    children: [
      // TITLE PAGE
      spacer(), spacer(), spacer(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "AI STUDY ASSISTANT", bold: true, size: 56, font: "Arial", color: "1F3864" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
        children: [new TextRun({ text: "An AI-Powered Learning Assistant for University Students", size: 28, font: "Arial", color: "2E75B6" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 8, color: borderColor, space: 1 },
          top: { style: BorderStyle.SINGLE, size: 8, color: borderColor, space: 1 }
        },
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "CHAPTER ONE: INTRODUCTION", bold: true, size: 36, font: "Arial", color: "1F3864" })]
      }),
      spacer(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 80 },
        children: [new TextRun({ text: "A Final Year Project Report", size: 24, font: "Arial", color: "595959" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: "Department of Computer Science / Information Technology", size: 24, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: "Academic Year 2025/2026", size: 24, font: "Arial" })]
      }),
      spacer(), spacer(), spacer(),

      // PAGE BREAK before chapter content
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      h1("1.0  Introduction"),
      body("The rapid advancement of artificial intelligence (AI) has opened unprecedented opportunities in the field of education. This project presents the AI Study Assistant — a full-stack web application designed to help university students learn more effectively through intelligent document processing, automated quiz generation, flashcard creation, and AI-powered conversation."),
      spacer(),

      h1("1.1  Background to the Study"),
      body("Traditional learning methods often fail to keep pace with the volume and complexity of academic content that modern university students must process. Students face challenges such as information overload, difficulty in self-assessment, and limited access to personalised academic support outside classroom hours."),
      body("Artificial intelligence offers transformative potential in addressing these gaps. Natural Language Processing (NLP) models — particularly Large Language Models (LLMs) — can understand, summarise, and generate educational content with remarkable accuracy. This project leverages these advances to build a practical, accessible tool for students."),
      spacer(),

      h1("1.2  Problem Statement"),
      body("University students frequently struggle with:"),
      numbered("Processing large volumes of academic documents efficiently."),
      numbered("Generating effective study materials such as flashcards and quizzes from reading content."),
      numbered("Receiving timely, personalised feedback on comprehension."),
      numbered("Engaging in active recall — a proven but underutilised learning technique."),
      spacer(),
      body("Existing tools are either too generic, too expensive, or lack integration with modern AI capabilities. There is a clear need for a purpose-built, AI-driven study companion tailored to the academic context."),
      spacer(),

      h1("1.3  Objectives of the Study"),
      bold("General Objective"),
      body("To design and implement a full-stack AI-powered learning assistant that enables students to upload academic documents and interact with AI-generated study materials."),
      spacer(),
      bold("Specific Objectives"),
      numbered("To implement a secure user authentication system with JWT-based session management."),
      numbered("To build a document management module supporting PDF and text file uploads with metadata extraction."),
      numbered("To integrate a Large Language Model (Groq/LLaMA 3.3-70B) to generate flashcards, quizzes, summaries, and concept explanations from uploaded documents."),
      numbered("To develop an interactive quiz engine supporting multiple-choice questions with automatic scoring."),
      numbered("To implement a flashcard system with review tracking, favouriting, and read/unread status management."),
      numbered("To build a conversational AI chat interface allowing students to ask questions about their documents."),
      numbered("To create a dashboard providing analytics on study progress, quiz performance, and document activity."),
      spacer(),

      h1("1.4  Significance of the Study"),
      body("This study contributes to the growing body of work on AI-enhanced learning by delivering a functional, production-ready application. It demonstrates how LLMs can be practically deployed in educational contexts at low cost using free-tier APIs (Groq)."),
      body("For students, it provides an always-available, personalised study companion. For developers and researchers, it provides a reference architecture for integrating AI into React/Node.js applications. For educational institutions, it presents a scalable model for AI-assisted learning tools."),
      spacer(),

      h1("1.5  Scope of the Study"),
      body("The system covers: user registration and authentication; document upload and storage; AI-generated flashcards, quizzes, summaries, and concept explanations; an AI chat interface per document; quiz submission and automatic scoring; and a progress dashboard."),
      body("The system is a web application accessible via modern browsers. Mobile responsiveness is considered but native mobile applications are out of scope. The AI model used is llama-3.3-70b-versatile accessed via the Groq API."),
      spacer(),

      h1("1.6  Related Work"),
      body("Several platforms have explored AI in education: Quizlet uses spaced repetition for flashcard study; Khanmigo (Khan Academy) applies GPT-4 as an AI tutor; Socratic by Google uses AI to explain academic concepts. However, these tools are either closed-source, subscription-based, or do not allow students to upload their own documents for AI processing."),
      body("The AI Study Assistant addresses this gap by providing a self-hosted, document-centric platform with full control over content and AI interaction."),
      spacer(),

      h1("1.7  Technologies Used"),
      bullet("Frontend: React.js (Vite), React Router v7, Axios, Tailwind CSS, Context API"),
      bullet("Backend: Node.js, Express.js 5.x, ES Modules"),
      bullet("Database: MongoDB with Mongoose 9.x ODM"),
      bullet("AI Integration: Groq SDK (llama-3.3-70b-versatile), replacing Google Gemini"),
      bullet("Authentication: JSON Web Tokens (JWT), bcryptjs"),
      bullet("File Handling: Multer (file upload), pdf-parse (PDF text extraction)"),
      bullet("Development Tools: Postman (API testing), Git (version control)"),
      spacer(),

      h1("1.8  Key Features"),
      bullet("Secure JWT authentication (register, login, profile management)"),
      bullet("Document upload with PDF/text parsing and metadata extraction"),
      bullet("AI flashcard generation (configurable count per document)"),
      bullet("AI quiz generation (multiple-choice, configurable question count)"),
      bullet("AI document summarisation"),
      bullet("AI concept explanation"),
      bullet("AI chat interface (conversational Q&A about document content)"),
      bullet("Flashcard review tracking (read/unread, starred/favourited)"),
      bullet("Quiz submission with automatic scoring and result storage"),
      bullet("Dashboard analytics (overview, stats, progress)"),
      spacer(),

      h1("1.9  Chapter Summary"),
      body("This chapter introduced the AI Study Assistant project, establishing the motivation behind its development, the academic problem it addresses, and the objectives it seeks to achieve. The technologies underpinning the system were outlined, and the scope of the study was defined."),
      body("Subsequent chapters will examine related literature, the development methodology, system design, implementation, testing, and conclusions."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:\\Users\\REALTECH\\Desktop\\AILEARNINGASSISTANT\\reports\\Chapter1.docx', buffer);
  console.log('Chapter1.docx created successfully');
}).catch(err => { console.error('Error:', err); process.exit(1); });
