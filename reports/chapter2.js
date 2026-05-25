const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat, TableLayoutType
} = require('docx');
const fs = require('fs');

const borderColor = "2E75B6";
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const allBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: "1F3864" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial", color: "2E75B6" })]
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
    spacing: { before: 100, after: 60 },
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

function headerCell(text, fill) {
  return new TableCell({
    borders: allBorders,
    shading: { fill: fill || "1F3864", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    width: { size: 1326, type: WidthType.DXA },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 18, font: "Arial", color: "FFFFFF" })]
    })]
  });
}
function dataCell(text, fill) {
  return new TableCell({
    borders: allBorders,
    shading: { fill: fill || "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    width: { size: 1326, type: WidthType.DXA },
    children: [new Paragraph({
      children: [new TextRun({ text, size: 18, font: "Arial" })]
    })]
  });
}

const compareTable = new Table({
  width: { size: 7956, type: WidthType.DXA },
  columnWidths: [1326, 1326, 1326, 1326, 1326, 1326],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Tool"),
        headerCell("Doc Upload"),
        headerCell("AI Flashcards"),
        headerCell("AI Quizzes"),
        headerCell("Chat w/ Doc"),
        headerCell("Free/Open")
      ]
    }),
    new TableRow({ children: [dataCell("Quizlet"), dataCell("No"), dataCell("Manual"), dataCell("No"), dataCell("No"), dataCell("Freemium")] }),
    new TableRow({ children: [dataCell("Anki","F2F2F2"), dataCell("No","F2F2F2"), dataCell("Manual","F2F2F2"), dataCell("No","F2F2F2"), dataCell("No","F2F2F2"), dataCell("Free","F2F2F2")] }),
    new TableRow({ children: [dataCell("Khanmigo"), dataCell("No"), dataCell("No"), dataCell("No"), dataCell("Yes"), dataCell("Free (ltd)")] }),
    new TableRow({ children: [dataCell("ChatPDF","F2F2F2"), dataCell("Yes","F2F2F2"), dataCell("No","F2F2F2"), dataCell("No","F2F2F2"), dataCell("Yes","F2F2F2"), dataCell("Freemium","F2F2F2")] }),
    new TableRow({ children: [dataCell("AskYourPDF"), dataCell("Yes"), dataCell("No"), dataCell("No"), dataCell("Yes"), dataCell("Freemium")] }),
    new TableRow({ children: [dataCell("AI Study Asst.","D6E4F7"), dataCell("Yes","D6E4F7"), dataCell("Yes (AI)","D6E4F7"), dataCell("Yes (AI)","D6E4F7"), dataCell("Yes","D6E4F7"), dataCell("Free","D6E4F7")] }),
  ]
});

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
    default: { document: { run: { font: "Arial", size: 24 } } },
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
            children: [new TextRun({ text: "AI Study Assistant  |  Chapter Two: Literature Review", size: 18, font: "Arial", color: "595959" })]
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
        children: [new TextRun({ text: "CHAPTER TWO: LITERATURE REVIEW", bold: true, size: 36, font: "Arial", color: "1F3864" })]
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

      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      h1("2.0  Introduction"),
      body("This chapter reviews existing literature and prior work relevant to the AI Study Assistant. It examines research on artificial intelligence in education, existing AI-powered learning tools, the technologies employed, and identifies the research gap that this project addresses. The chapter is structured thematically, progressing from broad concepts to specific technical domains."),
      spacer(),

      h1("2.1  Artificial Intelligence in Education"),
      body("The application of Artificial Intelligence in Education (AIED) has grown substantially over the past decade. Intelligent Tutoring Systems (ITS) — first proposed in the 1970s — have evolved from rule-based systems into adaptive platforms powered by machine learning."),
      body("Bloom's 2 Sigma Problem (1984) demonstrated that one-on-one tutoring produces learning outcomes two standard deviations better than traditional classroom instruction. AI tutors attempt to replicate this personalised interaction at scale. Recent work by Nye et al. (2014) on AutoTutor and the emergence of LLM-based tutors such as Khanmigo confirm that AI can engage learners in Socratic dialogue with measurable improvements in comprehension."),
      spacer(),

      h1("2.2  Large Language Models in Educational Contexts"),
      body("Large Language Models (LLMs) — transformer-based neural networks trained on massive text corpora — represent a paradigm shift in AI capability. GPT-4 (OpenAI, 2023), LLaMA 3 (Meta AI, 2024), and Gemini (Google, 2023) demonstrate near-human performance on reading comprehension, summarisation, and question generation tasks."),
      body("For educational applications, LLMs offer: automatic question generation from text (Kurdi et al., 2020); adaptive summarisation matched to reading level; conversational tutoring; and concept explanation in accessible language. The Groq inference platform enables low-latency access to Meta's LLaMA 3.3-70B model, making LLM-powered features accessible at no cost during development."),
      spacer(),

      h1("2.3  Existing AI-Powered Learning Tools"),
      bold("Quizlet (2005-present)"),
      body("A widely-used flashcard platform employing spaced repetition algorithms. Lacks AI content generation from user-uploaded documents."),
      spacer(),
      bold("Anki (2006-present)"),
      body("Open-source spaced repetition flashcard tool. Highly configurable but requires entirely manual card creation with no AI assistance."),
      spacer(),
      bold("Khanmigo (2023)"),
      body("GPT-4-powered tutor built into Khan Academy. Provides conversational tutoring but does not process user-uploaded documents."),
      spacer(),
      bold("Socratic by Google (2019)"),
      body("Uses AI to explain homework problems via image recognition. Limited to pre-existing content; cannot process arbitrary user documents."),
      spacer(),
      bold("ChatPDF / AskYourPDF"),
      body("Allow question-and-answer interactions on uploaded PDFs. However, they lack quiz generation, flashcard creation, or study progress tracking."),
      spacer(),

      h1("2.4  Comparative Analysis of Existing Tools"),
      body("The table below compares the AI Study Assistant against leading tools across key feature dimensions:"),
      spacer(),
      compareTable,
      spacer(),
      body("Table 2.1: Feature comparison of existing AI-powered learning tools vs the AI Study Assistant."),
      spacer(),

      h1("2.5  AI in Education: Global Perspective"),
      body("Globally, AI in education is accelerating. The UNESCO (2023) report 'Guidance for Generative AI in Education' highlights both the transformative potential and ethical risks of AI tools in learning environments. The World Economic Forum (2023) predicts AI will reshape 65% of primary school curricula by 2030."),
      body("In higher education, universities including MIT, Stanford, and Oxford have deployed AI-assisted learning platforms, primarily targeting STEM disciplines."),
      spacer(),

      h1("2.6  AI in Education: African Context"),
      body("Africa faces unique educational challenges: limited access to qualified teachers, large class sizes, and insufficient learning resources. AI tools have the potential to bridge these gaps significantly."),
      body("The African Development Bank (2022) notes that digital education tools could reduce learning poverty across sub-Saharan Africa by 40% if properly deployed. Projects like Eneza Education (Kenya) and uLesson (Nigeria) demonstrate viable AI-assisted learning in low-bandwidth environments."),
      spacer(),

      h1("2.7  AI in Education: Ugandan Context"),
      body("Uganda's higher education sector, governed by the National Council for Higher Education (NCHE), has seen growing interest in e-learning, particularly post-COVID-19. Makerere University and other institutions have explored LMS platforms (Moodle), but AI-native tools remain scarce."),
      body("Students face challenges including large lecture cohorts, limited tutorial hours, and high textbook costs. The AI Study Assistant is positioned to complement existing LMS infrastructure by providing AI-powered self-study capabilities accessible to any student with a web browser."),
      spacer(),

      h1("2.8  Research Gap"),
      body("The reviewed literature reveals a clear gap: while general-purpose AI chatbots and document Q&A tools exist, no widely available free and open tool combines all of the following in a single integrated platform designed for university students:"),
      numbered("User document upload and AI processing"),
      numbered("AI flashcard generation from document content"),
      numbered("AI quiz generation with automatic scoring"),
      numbered("Conversational document chat interface"),
      numbered("Study progress analytics and dashboard"),
      spacer(),
      body("The AI Study Assistant directly addresses this gap."),
      spacer(),

      h1("2.9  Conceptual Framework"),
      body("The system is underpinned by three theoretical pillars from educational psychology:"),
      spacer(),
      bold("Active Recall Theory (Roediger & Karpicke, 2006)"),
      body("Retrieval practice significantly improves long-term memory retention compared to passive re-reading. Implemented via the quiz engine and flashcard review system, which require students to actively recall information."),
      spacer(),
      bold("Spaced Repetition (Ebbinghaus, 1885)"),
      body("Reviewing material at increasing intervals optimises memory retention by targeting items at the point of near-forgetting. Implemented via the isRead/isStarred tracking on flashcards, enabling students to identify and prioritise cards for review."),
      spacer(),
      bold("Zone of Proximal Development (Vygotsky, 1978)"),
      body("Learning is most effective when the challenge is just beyond the learner's current competence, with appropriate scaffolding. Implemented via the AI chat interface, which responds at the student's level and provides contextualised explanations."),
      spacer(),

      h1("2.10  Chapter Summary"),
      body("This chapter reviewed the theoretical and practical landscape of AI in education. It examined existing tools, identified their limitations, and demonstrated the research gap addressed by the AI Study Assistant. The comparative analysis confirmed that no existing free tool offers the complete feature set delivered by this project."),
      body("The conceptual framework grounding the system's pedagogical design — active recall, spaced repetition, and the zone of proximal development — was presented. Chapter Three will describe the methodology used to design and build the system."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:\\Users\\REALTECH\\Desktop\\AILEARNINGASSISTANT\\reports\\Chapter2.docx', buffer);
  console.log('Chapter2.docx created successfully');
}).catch(err => { console.error('Error:', err); process.exit(1); });
