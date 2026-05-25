const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat
} = require('docx');
const fs = require('fs');

const BLUE   = "2E75B6";
const NAVY   = "1F3864";
const GREEN  = "375623";
const ORANGE = "ED7D31";
const RED    = "C00000";
const GREY   = "595959";

const thin = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const B    = { top: thin, bottom: thin, left: thin, right: thin };

// ── Typography helpers ─────────────────────────────────────────────────────────
const h1 = t => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text: t, bold: true, size: 34, font: "Arial", color: NAVY })]
});
const h2 = t => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text: t, bold: true, size: 28, font: "Arial", color: BLUE })]
});
const body = t => new Paragraph({
  spacing: { before: 100, after: 100, line: 380, lineRule: "auto" },
  children: [new TextRun({ text: t, size: 24, font: "Arial" })]
});
const boldLine = t => new Paragraph({
  spacing: { before: 160, after: 60 },
  children: [new TextRun({ text: t, bold: true, size: 24, font: "Arial", color: NAVY })]
});
// Equation block — centred, monospace, shaded
const eq = t => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 180, after: 180 },
  indent: { left: 720, right: 720 },
  border: { left: { style: BorderStyle.SINGLE, size: 14, color: BLUE, space: 6 } },
  shading: { fill: "EBF2FA", type: ShadingType.CLEAR },
  children: [new TextRun({ text: t, bold: true, size: 26, font: "Courier New", color: NAVY })]
});
// Variable definition line
const def = (v, d) => new Paragraph({
  spacing: { before: 60, after: 60 },
  indent: { left: 720 },
  children: [
    new TextRun({ text: v, bold: true, size: 24, font: "Courier New", color: BLUE }),
    new TextRun({ text: "  =  " + d, size: 24, font: "Arial" })
  ]
});
// Highlight box — key insight panel
const panel = (heading, text) => new Table({
  width: { size: 7956, type: WidthType.DXA },
  columnWidths: [7956],
  rows: [
    new TableRow({ children: [
      new TableCell({
        borders: { top:{style:BorderStyle.SINGLE,size:8,color:BLUE}, bottom:{style:BorderStyle.SINGLE,size:8,color:BLUE}, left:{style:BorderStyle.SINGLE,size:8,color:BLUE}, right:{style:BorderStyle.SINGLE,size:8,color:BLUE} },
        shading: { fill: "EBF2FA", type: ShadingType.CLEAR },
        margins: { top: 140, bottom: 140, left: 240, right: 240 },
        width: { size: 7956, type: WidthType.DXA },
        children: [
          new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text: heading, bold:true, size:24, font:"Arial", color:NAVY})] }),
          new Paragraph({ spacing:{before:0,after:0}, children:[new TextRun({text: text, size:22, font:"Arial", italics:true})] })
        ]
      })
    ]})
  ]
});
const bullet = t => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [new TextRun({ text: t, size: 24, font: "Arial" })]
});
const numbered = t => new Paragraph({
  numbering: { reference: "nums", level: 0 },
  children: [new TextRun({ text: t, size: 24, font: "Arial" })]
});
const sp = () => new Paragraph({ children: [new TextRun("")] });
const note = t => new Paragraph({
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text: t, size: 20, font: "Arial", color: GREY, italics: true })]
});

// ── Table cell helpers ─────────────────────────────────────────────────────────
const hc = (t, w, fill) => new TableCell({
  borders: B, width:{size:w,type:WidthType.DXA},
  shading:{fill:fill||NAVY,type:ShadingType.CLEAR},
  margins:{top:80,bottom:80,left:140,right:140},
  children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:t,bold:true,size:20,font:"Arial",color:"FFFFFF"})]})]
});
const dc = (t, w, fill, center) => new TableCell({
  borders: B, width:{size:w,type:WidthType.DXA},
  shading:{fill:fill||"FFFFFF",type:ShadingType.CLEAR},
  margins:{top:80,bottom:80,left:140,right:140},
  children:[new Paragraph({alignment:center?AlignmentType.CENTER:AlignmentType.LEFT,children:[new TextRun({text:t,size:20,font:"Arial"})]})]
});
const colorCell = (t, w, fill) => new TableCell({
  borders: B, width:{size:w,type:WidthType.DXA},
  shading:{fill:fill,type:ShadingType.CLEAR},
  margins:{top:80,bottom:80,left:140,right:140},
  children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:t,bold:true,size:24,font:"Arial",color:"FFFFFF"})]})]
});

// ═══════════════════════════════════════════════════════════════════════════════
// VARIABLE TABLE  (the single reference table used throughout the chapter)
// ═══════════════════════════════════════════════════════════════════════════════
const varTable = new Table({
  width:{size:7956,type:WidthType.DXA}, columnWidths:[700,2000,2456,2800],
  rows:[
    new TableRow({tableHeader:true,children:[hc("Letter",700),hc("Name",2000),hc("What it measures",2456),hc("Where in the system",2800)]}),
    new TableRow({children:[dc("A",700,null,true),dc("Correct Answers",2000),dc("How many quiz answers the student got right",2456),dc("Stored in quiz results array",2800)]}),
    new TableRow({children:[dc("T",700,"F2F2F2",true),dc("Total Questions",2000,"F2F2F2"),dc("Total questions in that quiz",2456,"F2F2F2"),dc("Stored in quiz.questions.length",2800,"F2F2F2")]}),
    new TableRow({children:[dc("S",700,null,true),dc("Score (%)",2000),dc("A student's percentage score for one attempt",2456),dc("Calculated at quiz submit; saved in results",2800)]}),
    new TableRow({children:[dc("R",700,"F2F2F2",true),dc("Attempts (Retakes)",2000,"F2F2F2"),dc("Number of times the student has attempted a quiz",2456,"F2F2F2"),dc("results array length per quiz",2800,"F2F2F2")]}),
    new TableRow({children:[dc("F",700,null,true),dc("Total Flashcards",2000),dc("Total cards in one flashcard set",2456),dc("flashcard.cards.length",2800)]}),
    new TableRow({children:[dc("C",700,"F2F2F2",true),dc("Cards Read",2000,"F2F2F2"),dc("Flashcards the student has marked as read",2456,"F2F2F2"),dc("cards where isRead = true",2800,"F2F2F2")]}),
    new TableRow({children:[dc("W",700,null,true),dc("Starred Cards",2000),dc("Cards the student flagged as difficult",2456),dc("cards where isStarred = true",2800)]}),
    new TableRow({children:[dc("D",700,"F2F2F2",true),dc("Documents",2000,"F2F2F2"),dc("Number of documents the student uploaded",2456,"F2F2F2"),dc("documents collection, user-scoped",2800,"F2F2F2")]}),
    new TableRow({children:[dc("Q",700,null,true),dc("Quizzes Completed",2000),dc("Number of quizzes the student has submitted",2456),dc("quizzes with results.length > 0",2800)]}),
    new TableRow({children:[dc("P",700,"F2F2F2",true),dc("Overall Progress (%)",2000,"F2F2F2"),dc("Combined measure of all study activity",2456,"F2F2F2"),dc("Dashboard /progress endpoint",2800,"F2F2F2")]}),
  ]
});

// ── Grade boundary table ───────────────────────────────────────────────────────
const gradeTable = new Table({
  width:{size:7956,type:WidthType.DXA}, columnWidths:[800,1800,1556,1800,2000],
  rows:[
    new TableRow({tableHeader:true,children:[hc("Grade",800),hc("Condition",1800),hc("Score S",1556),hc("What it means",1800),hc("What the student should do",2000)]}),
    new TableRow({children:[colorCell("A",800,GREEN),dc("A ≥ 0.8 × T",1800),dc("S ≥ 80%",1556),dc("Excellent understanding",1800),dc("Move on to the next document",2000)]}),
    new TableRow({children:[colorCell("B",800,BLUE),dc("A ≥ 0.65 × T",1800,"F2F2F2"),dc("65% ≤ S < 80%",1556,"F2F2F2"),dc("Good, minor gaps remain",1800,"F2F2F2"),dc("Review starred flashcards (W) then retake",2000,"F2F2F2")]}),
    new TableRow({children:[colorCell("C",800,ORANGE),dc("A ≥ 0.5 × T",1800),dc("50% ≤ S < 65%",1556),dc("Some understanding",1800),dc("Re-read flashcards, re-attempt quiz",2000)]}),
    new TableRow({children:[colorCell("D",800,RED),dc("A < 0.5 × T",1800,"F2F2F2"),dc("S < 50%",1556,"F2F2F2"),dc("Needs significant revision",1800,"F2F2F2"),dc("Re-study document, then restart from C = 0",2000,"F2F2F2")]}),
  ]
});

// ── Progression example table ──────────────────────────────────────────────────
const progressTable = new Table({
  width:{size:7956,type:WidthType.DXA}, columnWidths:[1000,1200,1200,1400,900,1356,900],
  rows:[
    new TableRow({tableHeader:true,children:[hc("Attempt R",1000),hc("Correct A",1200),hc("Total T",1200),hc("Score  S = A/T×100",1400),hc("Grade",900),hc("Improvement ΔS",1356),hc("Status",900)]}),
    new TableRow({children:[dc("1",1000,"F2F2F2",true),dc("3",1200,"F2F2F2",true),dc("10",1200,"F2F2F2",true),dc("30%",1400,"F2F2F2",true),colorCell("D",900,RED),dc("—",1356,"F2F2F2",true),dc("Start",900,"F2F2F2",true)]}),
    new TableRow({children:[dc("2",1000,null,true),dc("6",1200,null,true),dc("10",1200,null,true),dc("60%",1400,null,true),colorCell("C",900,ORANGE),dc("+30%",1356,null,true),dc("Growing",900,null,true)]}),
    new TableRow({children:[dc("3",1000,"F2F2F2",true),dc("8",1200,"F2F2F2",true),dc("10",1200,"F2F2F2",true),dc("80%",1400,"F2F2F2",true),colorCell("A",900,GREEN),dc("+20%",1356,"F2F2F2",true),dc("Mastered",900,"F2F2F2",true)]}),
  ]
});

// ── FR table ──────────────────────────────────────────────────────────────────
const frTable = new Table({
  width:{size:7956,type:WidthType.DXA}, columnWidths:[800,4756,1400,1000],
  rows:[
    new TableRow({tableHeader:true,children:[hc("ID",800),hc("What the system must do",4756),hc("Related variable",1400),hc("Related endpoint",1000)]}),
    new TableRow({children:[dc("FR1",800),dc("Allow a student to register and log in securely.",4756),dc("D, Q, F, P (all user-scoped)",1400),dc("/auth/login",1000)]}),
    new TableRow({children:[dc("FR2",800,"F2F2F2"),dc("Allow a student to upload PDF or text documents.",4756,"F2F2F2"),dc("D increases by 1",1400,"F2F2F2"),dc("/documents POST",1000,"F2F2F2")]}),
    new TableRow({children:[dc("FR3",800),dc("Extract and store the text content of uploaded documents.",4756),dc("Content feeds h_enc(X)",1400),dc("/documents POST",1000)]}),
    new TableRow({children:[dc("FR4",800,"F2F2F2"),dc("Generate AI flashcards from a document on demand.",4756,"F2F2F2"),dc("F = cards generated",1400,"F2F2F2"),dc("/ai/generate-flashcards",1000,"F2F2F2")]}),
    new TableRow({children:[dc("FR5",800),dc("Generate AI multiple-choice quizzes from a document.",4756),dc("T = questions generated",1400),dc("/ai/generate-quiz",1000)]}),
    new TableRow({children:[dc("FR6",800,"F2F2F2"),dc("Allow students to mark flashcards as read or starred.",4756,"F2F2F2"),dc("C and W updated",1400,"F2F2F2"),dc("/flashcards/mark-read",1000,"F2F2F2")]}),
    new TableRow({children:[dc("FR7",800),dc("Accept quiz submissions and return score S and grade automatically.",4756),dc("A, T, S, R recorded",1400),dc("/quizzes/submit",1000)]}),
    new TableRow({children:[dc("FR8",800,"F2F2F2"),dc("Allow students to chat with the AI about their document.",4756,"F2F2F2"),dc("Supports C growth",1400,"F2F2F2"),dc("/ai/chat",1000,"F2F2F2")]}),
    new TableRow({children:[dc("FR9",800),dc("Provide a dashboard showing D, Q, C, S_avg, S_best and P.",4756),dc("All variables displayed",1400),dc("/dashboard/*",1000)]}),
  ]
});

// ── NFR table ─────────────────────────────────────────────────────────────────
const nfrTable = new Table({
  width:{size:7956,type:WidthType.DXA}, columnWidths:[800,1600,5556],
  rows:[
    new TableRow({tableHeader:true,children:[hc("ID",800),hc("Type",1600),hc("Requirement",5556)]}),
    new TableRow({children:[dc("NFR1",800),dc("Performance",1600),dc("All API responses (including quiz scoring S = A/T × 100) shall complete within 30 seconds.",5556)]}),
    new TableRow({children:[dc("NFR2",800,"F2F2F2"),dc("Security",1600,"F2F2F2"),dc("Student data (scores, flashcards, documents) shall be protected by JWT authentication on every request.",5556,"F2F2F2")]}),
    new TableRow({children:[dc("NFR3",800),dc("Reliability",1600),dc("AI generation failures shall return a friendly error — student progress data is never lost.",5556)]}),
    new TableRow({children:[dc("NFR4",800,"F2F2F2"),dc("Scalability",1600,"F2F2F2"),dc("The MongoDB schema shall support multiple students simultaneously without degrading performance.",5556,"F2F2F2")]}),
    new TableRow({children:[dc("NFR5",800),dc("Usability",1600),dc("A student shall be able to upload a document, generate flashcards, and take a quiz within 5 minutes of first use.",5556)]}),
  ]
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering:{config:[
    {reference:"bullets",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]},
    {reference:"nums",   levels:[{level:0,format:LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}
  ]},
  styles:{
    default:{document:{run:{font:"Arial",size:24}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:34,bold:true,font:"Arial",color:NAVY},paragraph:{spacing:{before:400,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:28,bold:true,font:"Arial",color:BLUE},paragraph:{spacing:{before:280,after:120},outlineLevel:1}},
    ]
  },
  sections:[{
    properties:{page:{size:{width:11906,height:16838},margin:{top:1440,right:1260,bottom:1440,left:1800}}},
    headers:{default:new Header({children:[new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:6,color:BLUE,space:1}},children:[new TextRun({text:"AI Study Assistant  |  Chapter Three: Methodology & System Design",size:18,font:"Arial",color:GREY})]})]})} ,
    footers:{default:new Footer({children:[new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:6,color:BLUE,space:1}},alignment:AlignmentType.RIGHT,children:[new TextRun({text:"Page ",size:18,font:"Arial",color:GREY}),new TextRun({children:[PageNumber.CURRENT],size:18,font:"Arial",color:GREY}),new TextRun({text:" of ",size:18,font:"Arial",color:GREY}),new TextRun({children:[PageNumber.TOTAL_PAGES],size:18,font:"Arial",color:GREY})]})]})},
    children:[

      // ══ TITLE PAGE ══════════════════════════════════════════════════════════
      sp(),sp(),sp(),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:200,after:100},children:[new TextRun({text:"AI STUDY ASSISTANT",bold:true,size:56,font:"Arial",color:NAVY})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:100,after:200},children:[new TextRun({text:"An AI-Powered Learning Assistant for University Students",size:28,font:"Arial",color:BLUE})]}),
      new Paragraph({alignment:AlignmentType.CENTER,border:{bottom:{style:BorderStyle.SINGLE,size:8,color:BLUE,space:1},top:{style:BorderStyle.SINGLE,size:8,color:BLUE,space:1}},spacing:{before:200,after:200},children:[new TextRun({text:"CHAPTER THREE: METHODOLOGY & SYSTEM DESIGN",bold:true,size:34,font:"Arial",color:NAVY})]}),
      sp(),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:100,after:80},children:[new TextRun({text:"A Final Year Project Report",size:24,font:"Arial",color:GREY})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80,after:80},children:[new TextRun({text:"Department of Computer Science / Information Technology",size:24,font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80,after:80},children:[new TextRun({text:"Academic Year 2025/2026",size:24,font:"Arial"})]}),
      sp(),sp(),sp(),
      new Paragraph({pageBreakBefore:true,children:[new TextRun("")]}),

      // ══ 3.0 INTRODUCTION ════════════════════════════════════════════════════
      h1("3.0  Introduction"),
      body("This chapter explains how the AI Study Assistant was designed and how it works. It is written so that both a lecturer and a fellow student can follow along — no prior knowledge of AI is assumed."),
      body("To make everything concrete, one set of simple letter variables is used throughout the entire chapter. Every formula, every requirement, and every database field refers back to those letters. By the end of this chapter you will understand not only what was built, but exactly how the system turns a student's uploaded document into measurable learning progress."),
      sp(),
      panel("One-sentence summary of the project",
        "A student uploads a document (D), the AI generates flashcards (F) and a quiz (T questions), the student studies and takes the quiz, the system scores it (S = A/T × 100), and the dashboard shows their overall progress (P) growing over time."),
      sp(),

      // ══ 3.1 VARIABLE REFERENCE TABLE ════════════════════════════════════════
      h1("3.1  Variable Reference Table"),
      body("Every letter in this chapter is defined in the table below. Think of this as the key to reading the rest of the chapter. Refer back to it whenever a letter appears in a formula."),
      sp(),
      varTable,
      sp(),
      note("Table 3.1: All variables used in this chapter, their meaning, and where they live in the system."),
      sp(),
      body("These eleven variables describe the complete life of a student on the platform — from the moment they upload their first document (D = 1) to the moment their overall progress index reaches P = 100%. Every formula below uses only these letters."),
      sp(),

      // ══ 3.2 HOW THE AI MODEL WORKS ══════════════════════════════════════════
      h1("3.2  How the AI Model Works"),
      body("Before describing the methodology, it helps to understand the core AI pipeline — the engine that powers the system. The pipeline has four stages. Each stage is given a short name so it is easy to refer to later."),
      sp(),

      h2("3.2.1  The Four-Stage Pipeline"),
      body("Think of the pipeline like a production line. Raw material goes in one end and a finished product comes out the other:"),
      sp(),
      new Table({width:{size:7956,type:WidthType.DXA},columnWidths:[1400,360,1580,360,1580,360,1516,360,1440],rows:[
        new TableRow({children:[
          new TableCell({borders:B,shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},width:{size:1400,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"STEP 1",bold:true,size:18,font:"Arial",color:"FFFFFF"}),new TextRun({text:"\nX — Input",size:16,font:"Arial",color:"CCCCCC"})]})] }),
          new TableCell({borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},width:{size:360,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"⇒",bold:true,size:36,font:"Arial",color:BLUE})]})]}),
          new TableCell({borders:B,shading:{fill:BLUE,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},width:{size:1580,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"STEP 2",bold:true,size:18,font:"Arial",color:"FFFFFF"}),new TextRun({text:"\nh_enc — Encoder",size:16,font:"Arial",color:"CCCCCC"})]})] }),
          new TableCell({borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},width:{size:360,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"⇒",bold:true,size:36,font:"Arial",color:BLUE})]})]}),
          new TableCell({borders:B,shading:{fill:GREEN,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},width:{size:1580,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"STEP 3",bold:true,size:18,font:"Arial",color:"FFFFFF"}),new TextRun({text:"\nMθ — AI Model",size:16,font:"Arial",color:"CCCCCC"})]})] }),
          new TableCell({borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},width:{size:360,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"⇒",bold:true,size:36,font:"Arial",color:BLUE})]})]}),
          new TableCell({borders:B,shading:{fill:BLUE,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},width:{size:1516,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"STEP 4",bold:true,size:18,font:"Arial",color:"FFFFFF"}),new TextRun({text:"\nh_dec — Decoder",size:16,font:"Arial",color:"CCCCCC"})]})] }),
          new TableCell({borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},width:{size:360,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"⇒",bold:true,size:36,font:"Arial",color:BLUE})]})]}),
          new TableCell({borders:B,shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},width:{size:1440,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"STEP 5",bold:true,size:18,font:"Arial",color:"FFFFFF"}),new TextRun({text:"\nY — Output",size:16,font:"Arial",color:"CCCCCC"})]})] }),
        ]})
      ]}),
      sp(),
      note("Figure 3.1: The five-stage AI pipeline. Steps 2 and 4 are the two hypothesis functions."),
      sp(),
      body("In plain language, each step does the following:"),
      sp(),
      boldLine("Step 1 — X (Input)"),
      body("The student's document text and their request (e.g. 'generate 10 flashcards'). This is the raw material. In terms of our variables: X contains the document content that was stored when D was uploaded."),
      sp(),
      boldLine("Step 2 — h_enc (Encoder hypothesis)"),
      body("The system takes X and writes it into a carefully worded instruction — called a prompt — that tells the AI exactly what to produce and in what format. This step is called a hypothesis because we are making a structured guess about how to frame the question for the AI."),
      sp(),
      boldLine("Step 3 — Mθ (AI Model — LLaMA 3.3-70B via Groq)"),
      body("The AI model reads the prompt and generates a response. It predicts the most likely useful output — flashcards, quiz questions, a summary, or a chat reply. The model does not change; only the prompt changes depending on what the student requested."),
      sp(),
      boldLine("Step 4 — h_dec (Decoder hypothesis)"),
      body("The raw AI response is text. This step converts it into structured data that the system can save — for example, turning the AI's text into an array of flashcard objects or quiz question objects. If the conversion fails, the system returns a friendly error."),
      sp(),
      boldLine("Step 5 — Y (Output)"),
      body("The finished product delivered to the student: a set of F flashcards, a quiz of T questions, a summary, an explanation, or a chat reply. All of these feed directly into the student's progress variables."),
      sp(),
      body("Written as a single mathematical statement, the whole pipeline is:"),
      eq("Y  =  h_dec ( Mθ ( h_enc ( X ) ) )"),
      sp(),

      h2("3.2.2  What Each Output Produces (Linking Pipeline to Variables)"),
      body("The table below shows how each AI task maps to the student progress variables from Table 3.1:"),
      sp(),
      new Table({width:{size:7956,type:WidthType.DXA},columnWidths:[2000,1800,1956,2200],rows:[
        new TableRow({tableHeader:true,children:[hc("Student request",2000),hc("AI task (T)",1800),hc("Variable updated",1956),hc("Example result",2200)]}),
        new TableRow({children:[dc("'Generate flashcards'",2000),dc("gen_flashcards",1800),dc("F = number of cards generated",1956),dc("F = 15 new flashcards",2200)]}),
        new TableRow({children:[dc("'Generate quiz'",2000,"F2F2F2"),dc("gen_quiz",1800,"F2F2F2"),dc("T = number of questions",1956,"F2F2F2"),dc("T = 10 questions created",2200,"F2F2F2")]}),
        new TableRow({children:[dc("'Mark card as read'",2000),dc("(manual action)",1800),dc("C increases by 1",1956),dc("C = 7 of F = 15 read",2200)]}),
        new TableRow({children:[dc("'Star this card'",2000,"F2F2F2"),dc("(manual action)",1800,"F2F2F2"),dc("W increases by 1",1956,"F2F2F2"),dc("W = 3 difficult cards",2200,"F2F2F2")]}),
        new TableRow({children:[dc("'Submit quiz'",2000),dc("scoring",1800),dc("A, S, R all updated",1956),dc("A=8, T=10, S=80%",2200)]}),
        new TableRow({children:[dc("'View dashboard'",2000,"F2F2F2"),dc("(aggregation)",1800,"F2F2F2"),dc("P calculated from all vars",1956,"F2F2F2"),dc("P = 79%",2200,"F2F2F2")]}),
      ]}),
      sp(),
      note("Table 3.2: How each student action maps to a variable update."),
      sp(),

      // ══ 3.3 THE STUDENT JOURNEY ═════════════════════════════════════════════
      h1("3.3  The Student Journey Through the System"),
      body("This section walks through the complete experience of a student using the AI Study Assistant from start to finish. Every step is tied to the variables from Table 3.1 so it is always clear what is being recorded and why."),
      sp(),

      h2("Step 1 — Student Uploads a Document  (D increases by 1)"),
      body("The student logs in and uploads a PDF or text file — for example, their lecture notes on Data Structures. The system extracts all the text and saves it. The document counter D goes up by one. This document text is now available as input X for every AI task."),
      sp(),
      panel("What gets stored",
        "The document title, filename, file size, and the full extracted text are saved to the Documents collection in the database, linked to this student's account."),
      sp(),

      h2("Step 2 — Student Generates Flashcards  (F is set)"),
      body("The student clicks 'Generate Flashcards' and requests 15 cards. The system runs the AI pipeline: h_enc writes a prompt instructing the AI to produce 15 JSON flashcard objects from the lecture notes; Mθ (LLaMA 3.3-70B) generates them; h_dec parses the JSON and saves F = 15 cards to the database."),
      body("Each card has a front (the question or key term) and a back (the answer or explanation). Initially, C = 0 (none read) and W = 0 (none starred)."),
      sp(),

      h2("Step 3 — Student Studies the Flashcards  (C and W increase)"),
      body("The student works through the flashcard set. As they read each card, they click 'Mark as Read' and C increases by 1. If a card feels difficult, they click the star icon and W increases by 1. The system tracks both."),
      body("The flashcard completion rate — how much of the material the student has covered — is always visible:"),
      eq("Completion Rate  =  ( C / F )  ×  100"),
      body("Example: after reading 10 of 15 cards, Completion Rate = (10 / 15) × 100 = 67%."),
      sp(),
      body("Starred cards (W) are surfaced first in future review sessions, because the system knows the student finds those concepts difficult."),
      sp(),

      h2("Step 4 — Student Generates and Takes a Quiz  (T, A, S, R recorded)"),
      body("The student clicks 'Generate Quiz' and requests 10 questions. The AI pipeline runs again — this time the task is gen_quiz — and the system creates T = 10 multiple-choice questions, each with four options (A, B, C, D) and a correct answer stored privately in the database."),
      body("The student answers all 10 questions and submits. The system counts A (the number of correct answers) and calculates the score S:"),
      eq("S  =  ( A / T )  ×  100"),
      body("Example: the student gets 6 right out of 10. S = (6 / 10) × 100 = 60%. The attempt counter R is now 1. The result (A = 6, T = 10, S = 60%) is saved to the quiz results array in the database."),
      sp(),
      body("The score S is converted to a grade automatically using the boundaries in Table 3.3 below:"),
      sp(),
      gradeTable,
      sp(),
      note("Table 3.3: Grade boundaries. Each grade tells the student what S means and what to do next."),
      sp(),

      h2("Step 5 — Student Improves Through Retakes  (R, I, S_avg tracked)"),
      body("A score of 60% (Grade C) tells the student to review their flashcards and retake the quiz. They go back, read the starred cards (W), then attempt the quiz again. R is now 2. This time A = 8 and S = 80% — Grade A."),
      body("The system measures improvement I between the first and most recent attempt:"),
      eq("I  =  S_R  -  S_1  =  80  -  60  =  +20%"),
      body("A positive I means the student is growing. The dashboard shows this trend visually. The average score across all R attempts is:"),
      eq("S_avg  =  ( S_1 + S_2 + ... + S_R )  /  R  =  ( 60 + 80 )  /  2  =  70%"),
      sp(),
      body("The full three-attempt progression below shows how the system captures a student going from D-grade to A-grade:"),
      sp(),
      progressTable,
      sp(),
      note("Table 3.4: A worked example of student progression. Every row is one entry in the quiz results array."),
      sp(),

      h2("Step 6 — Student Checks their Overall Progress  (P calculated)"),
      body("The dashboard brings everything together into a single overall progress score P. It combines three things: how much of the flashcards has the student read (C%), how well are they doing on quizzes (S_avg), and how engaged are they — that is, how many quizzes have they completed relative to documents they uploaded (Q / D):"),
      eq("P  =  ( 0.30 × C% )  +  ( 0.50 × S_avg )  +  ( 0.20 × (Q / D) × 100 )"),
      body("The weights (0.30, 0.50, 0.20) reflect the importance of each activity. Quiz performance carries the most weight (50%) because it is the clearest evidence of understanding. Flashcard coverage (30%) shows effort. Quiz engagement (20%) encourages students to test themselves on every document they upload."),
      sp(),
      body("Example: a student with C% = 67, S_avg = 70, Q = 1, D = 1:"),
      eq("P  =  (0.30 × 67)  +  (0.50 × 70)  +  (0.20 × 100)  =  20.1 + 35 + 20  =  75.1%"),
      sp(),
      panel("How P helps the student",
        "P gives the student a single honest number. If P is low, the student knows they need to read more flashcards (raise C) or retake quizzes (raise S_avg). The system never just shows a red mark — it always shows which variable to work on next."),
      sp(),

      // ══ 3.4 RESEARCH APPROACH ═══════════════════════════════════════════════
      h1("3.4  Research Approach"),
      body("The project follows Design Science Research (DSR) methodology. In DSR the researcher designs and builds an artefact — in this case, the AI Study Assistant web application — and evaluates it against defined requirements. This is the correct methodology because the primary output of the project is a working software system, not a survey or a statistical experiment."),
      body("Within DSR, an Agile development process was used, organised into five two-week sprints:"),
      sp(),
      new Table({width:{size:7956,type:WidthType.DXA},columnWidths:[800,2200,2956,2000],rows:[
        new TableRow({tableHeader:true,children:[hc("Sprint",800),hc("Focus",2200),hc("What was built",2956),hc("Variables involved",2000)]}),
        new TableRow({children:[dc("1",800,null,true),dc("Foundation",2200),dc("User authentication, database setup, JWT security",2956),dc("D scope, user data",2000)]}),
        new TableRow({children:[dc("2",800,"F2F2F2",true),dc("Documents",2200,"F2F2F2"),dc("File upload, PDF text extraction, document storage",2956,"F2F2F2"),dc("D increases",2000,"F2F2F2")]}),
        new TableRow({children:[dc("3",800,null,true),dc("AI Integration",2200),dc("Flashcard generation (F), quiz generation (T), summary, chat",2956),dc("F, T, pipeline",2000)]}),
        new TableRow({children:[dc("4",800,"F2F2F2",true),dc("Frontend API",2200,"F2F2F2"),dc("Axios services, AuthContext, ProtectedRoute",2956,"F2F2F2"),dc("All variables surfaced to UI",2000,"F2F2F2")]}),
        new TableRow({children:[dc("5",800,null,true),dc("Dashboard & Scoring",2200),dc("Quiz submission (A, S), flashcard tracking (C, W), progress (P)",2956),dc("A, S, C, W, Q, P",2000)]}),
      ]}),
      sp(),
      note("Table 3.5: Agile sprints and the variables each sprint introduced."),
      sp(),

      // ══ 3.5 SYSTEM REQUIREMENTS ═════════════════════════════════════════════
      h1("3.5  System Requirements"),
      body("Requirements are written in terms of the student journey described in Section 3.3. Every functional requirement is directly linked to one or more progress variables so it is always clear why that feature exists."),
      sp(),
      h2("3.5.1  Functional Requirements"),
      sp(),
      frTable,
      sp(),
      note("Table 3.6: Functional requirements linked to progress variables and API endpoints."),
      sp(),
      h2("3.5.2  Non-Functional Requirements"),
      sp(),
      nfrTable,
      sp(),
      note("Table 3.7: Non-functional requirements. NFR5 expresses the 5-minute usability target."),
      sp(),

      // ══ 3.6 SYSTEM ARCHITECTURE ═════════════════════════════════════════════
      h1("3.6  System Architecture"),
      body("The system is divided into three tiers, matching the three phases of the student journey: the student interacts with Tier 1, the business logic lives in Tier 2, and all data — including every variable value — is stored in Tier 3."),
      sp(),
      boldLine("Tier 1 — What the student sees (React.js frontend)"),
      body("The student opens a browser and sees a React.js Single Page Application. Every action — uploading a document, clicking 'generate flashcards', submitting a quiz — sends an HTTP request to Tier 2 via the Axios library. The Auth Context keeps the student logged in across pages."),
      sp(),
      boldLine("Tier 2 — Where the logic lives (Node.js / Express.js backend)"),
      body("The backend receives every request, checks the student's JWT token, runs the appropriate controller (auth, document, flashcard, quiz, AI, dashboard), calls the Groq API if needed, and sends back a JSON response. This is where formulas like S = A/T × 100 are executed."),
      sp(),
      boldLine("Tier 3 — Where everything is stored (MongoDB Atlas)"),
      body("MongoDB stores all eleven variables. Every document the student uploads (D), every flashcard read (C), every quiz attempt (A, T, S, R) is a record in the database. The dashboard endpoints aggregate these records to compute S_avg, C%, and P."),
      sp(),
      boldLine("External AI Service (Groq — LLaMA 3.3-70B)"),
      body("This is Mθ in the pipeline. The Groq free tier allows 14,400 AI requests per day — enough for a full class of students. The model never sees student scores or personal data; it only ever receives the document content and a task instruction."),
      sp(),

      // ══ 3.7 DATABASE DESIGN ═════════════════════════════════════════════════
      h1("3.7  Database Design"),
      body("Each MongoDB collection stores one part of the student's progress. The field names below are given alongside the variable letter they represent so the link is always clear."),
      sp(),
      boldLine("Users — stores login credentials"),
      bullet("email, password (hashed) — identity fields, not part of progress variables"),
      bullet("username — display name on dashboard"),
      sp(),
      boldLine("Documents — stores D"),
      bullet("user (owner link), title, filename, fileSize — metadata"),
      bullet("content — the full extracted text; this is the X fed into h_enc"),
      bullet("Each new upload increments D by 1 for that student"),
      sp(),
      boldLine("Flashcards — stores F, C, W"),
      bullet("cards array — length of this array = F (total flashcards)"),
      bullet("cards[i].isRead — true when the student marks a card; sum of trues = C"),
      bullet("cards[i].isStarred — true when the student stars a card; sum of trues = W"),
      bullet("cards[i].reviewCount — how many times a card has been opened"),
      sp(),
      boldLine("Quizzes — stores T, A, S, R"),
      bullet("questions array — length = T (total questions)"),
      bullet("questions[i].correctAnswer — stored at generation time, hidden from the student"),
      bullet("results array — one entry per attempt; length = R"),
      bullet("results[r].score — the value of S for attempt r"),
      bullet("results[r].answers[i].isCorrect — true/false per question; sum of trues = A"),
      sp(),
      boldLine("Chat History — stores AI conversation"),
      bullet("messages array — each message has role ('user' or 'assistant') and content"),
      bullet("Not a progress variable, but supports deeper understanding of the document"),
      sp(),

      // ══ 3.8 TESTING STRATEGY ════════════════════════════════════════════════
      h1("3.8  Testing Strategy"),
      body("A suite of 48 automated tests was written in Postman, one group per API route group. The purpose of each test group is explained in terms of what it verifies about the student's progress variables."),
      sp(),
      new Table({width:{size:7956,type:WidthType.DXA},columnWidths:[1600,800,1956,1800,1800],rows:[
        new TableRow({tableHeader:true,children:[hc("Test group",1600),hc("Tests",800),hc("What it verifies",1956),hc("Variable protected",1800),hc("Pass result",1800)]}),
        new TableRow({children:[dc("Authentication",1600),dc("6",800,null,true),dc("Register, login, profile, reject duplicates",1956),dc("All (user scoping)",1800),dc("6 / 6 ✓",1800)]}),
        new TableRow({children:[dc("Documents",1600,"F2F2F2"),dc("8",800,"F2F2F2",true),dc("Upload, list, get by ID, delete",1956,"F2F2F2"),dc("D",1800,"F2F2F2"),dc("8 / 8 ✓",1800,"F2F2F2")]}),
        new TableRow({children:[dc("Flashcards",1600),dc("10",800,null,true),dc("Generate, mark read (C), star (W), delete",1956),dc("F, C, W",1800),dc("10 / 10 ✓",1800)]}),
        new TableRow({children:[dc("Quizzes",1600,"F2F2F2"),dc("10",800,"F2F2F2",true),dc("Generate, submit S=A/T×100, results, delete",1956,"F2F2F2"),dc("A, T, S, R",1800,"F2F2F2"),dc("10 / 10 ✓",1800,"F2F2F2")]}),
        new TableRow({children:[dc("AI Endpoints",1600),dc("8",800,null,true),dc("Flashcard output has F items; quiz has T questions",1956),dc("F, T (pipeline output)",1800),dc("8 / 8 ✓",1800)]}),
        new TableRow({children:[dc("Dashboard",1600,"F2F2F2"),dc("6",800,"F2F2F2",true),dc("Overview, stats (S_avg, S_best), progress P",1956,"F2F2F2"),dc("P, S_avg, Q, D",1800,"F2F2F2"),dc("6 / 6 ✓",1800,"F2F2F2")]}),
        new TableRow({children:[
          new TableCell({borders:B,shading:{fill:GREEN,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:140,right:140},width:{size:1600,type:WidthType.DXA},children:[new Paragraph({children:[new TextRun({text:"TOTAL",bold:true,size:22,font:"Arial",color:"FFFFFF"})]})]}),
          new TableCell({borders:B,shading:{fill:GREEN,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:140,right:140},width:{size:800,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"48",bold:true,size:22,font:"Arial",color:"FFFFFF"})]})]}),
          dc("All variables verified through full request-response cycles",1956,null),
          dc("All 11 variables",1800,null),
          new TableCell({borders:B,shading:{fill:GREEN,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:140,right:140},width:{size:1800,type:WidthType.DXA},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"48 / 48 ✓",bold:true,size:22,font:"Arial",color:"FFFFFF"})]})]}),
        ]}),
      ]}),
      sp(),
      note("Table 3.8: Test suite results. 48/48 tests pass, confirming all variables are correctly stored and returned."),
      sp(),

      // ══ 3.9 ETHICAL CONSIDERATIONS ══════════════════════════════════════════
      h1("3.9  Ethical Considerations"),
      boldLine("Student data privacy"),
      body("Every variable (A, S, C, W, D, Q, P) belongs only to the student who generated it. MongoDB stores them under that student's user ID. No lecturer, no other student, and no administrator can see another student's scores or documents."),
      sp(),
      boldLine("AI accuracy"),
      body("The AI model Mθ can make mistakes. A quiz question with an incorrect answer would give the student a wrong value of A and therefore a wrong S. The system addresses this by storing the AI-generated content before the student sees it, allowing future verification. Students are always reminded that AI-generated material is a study aid, not a source of truth."),
      sp(),
      boldLine("Fairness of grading"),
      body("The grade boundaries in Table 3.3 (A ≥ 80%, B ≥ 65%, etc.) are not connected to any formal university grading scheme. The grade shown on the dashboard is purely for self-assessment and motivation. No score S is ever submitted to a lecturer or stored in a way that could affect a student's official academic record."),
      sp(),
      boldLine("Honest progress reporting"),
      body("The overall progress score P is calculated transparently using the formula P = 0.30×C% + 0.50×S_avg + 0.20×(Q/D)×100. The student can see every component. There are no hidden algorithms. If a student wants to improve P, they know exactly which action to take."),
      sp(),

      // ══ 3.10 CHAPTER SUMMARY ════════════════════════════════════════════════
      h1("3.10  Chapter Summary"),
      body("This chapter described the complete methodology and system design of the AI Study Assistant using eleven simple letter variables (A, T, S, R, F, C, W, D, Q, and P) as a consistent thread from the first section to the last."),
      sp(),
      body("The core finding of this chapter is that a student's entire learning journey on the platform can be described by three formulas:"),
      eq("S  =  ( A / T )  ×  100                    (quiz score after each attempt)"),
      eq("I  =  S_R  -  S_1                          (improvement across retakes)"),
      eq("P  =  0.30×C%  +  0.50×S_avg  +  0.20×(Q/D)×100   (overall progress)"),
      sp(),
      body("These formulas are not abstract — every value is stored in MongoDB, every variable is updated by a real API endpoint, and every number is visible on the student's dashboard. The AI pipeline Y = h_dec(Mθ(h_enc(X))) is the engine that generates the raw material (flashcards and quizzes) that the student then uses to move those numbers upward."),
      sp(),
      body("All 48 backend API tests pass, confirming that every variable is correctly read, written, and returned. Chapter Four will show the implemented user interface and demonstrate the full student journey — from D = 1 (first document upload) through to a healthy overall progress score P."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:\\Users\\REALTECH\\Desktop\\AILEARNINGASSISTANT\\reports\\Chapter3.docx', buffer);
  console.log('Chapter3.docx rebuilt successfully');
}).catch(err => { console.error('Error:', err.message); process.exit(1); });
