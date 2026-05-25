/**
 * Seed Script — creates a demo account with documents, flashcards, and quiz data.
 *
 * Usage:
 *   node seed.mjs
 *
 * Requires the backend .env file to be present (reads MONGODB_URI from it).
 *
 * Login after seeding:
 *   Email:    demo@ailearning.com
 *   Password: demo123
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Error: MONGODB_URI not found in .env file.');
  process.exit(1);
}

// ─── Inline schemas (mirrors the real models) ────────────────────────────────

const User = mongoose.model('User', new mongoose.Schema({
  username: String, email: String, password: String, profileImage: { type: String, default: null }
}, { timestamps: true }));

const Document = mongoose.model('Document', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String, fileName: String, filePath: String,
  fileSize: { type: Number, default: 12345 },
  numPages: { type: Number, default: 5 },
  extractedText: { type: String, default: '' },
  chunks: [{ content: String, pageNumber: Number, chunkIndex: Number }],
  uploadDate: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  status: { type: String, default: 'processed' }
}, { timestamps: true }));

const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  documentId: mongoose.Schema.Types.ObjectId,
  cards: [{
    question: String, answer: String,
    difficulty: { type: String, default: 'medium' },
    lastReviewed: { type: Date, default: null },
    reviewCount: { type: Number, default: 0 },
    isStarred: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false }
  }]
}, { timestamps: true }));

const Quiz = mongoose.model('Quiz', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  documentId: mongoose.Schema.Types.ObjectId,
  title: String,
  questions: [{
    question: String, options: [String],
    correctAnswer: String, explanation: String,
    difficulty: { type: String, default: 'medium' }
  }],
  userAnswers: [{
    questionIndex: Number, selectedAnswer: String,
    isCorrect: Boolean, answeredAt: { type: Date, default: Date.now }
  }],
  score: { type: Number, default: 0 },
  totalQuestions: Number,
  completedAt: { type: Date, default: null }
}, { timestamps: true }));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const EMAIL    = 'demo@ailearning.com';
  const PASSWORD = 'demo123';

  let user = await User.findOne({ email: EMAIL });
  if (user) {
    console.log(`User already exists: ${EMAIL}`);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(PASSWORD, salt);
    user = await User.create({ username: 'DemoStudent', email: EMAIL, password: hash });
    console.log(`Created user: ${EMAIL}`);
  }
  const uid = user._id;

  await Document.deleteMany({ userId: uid });
  await Flashcard.deleteMany({ userId: uid });
  await Quiz.deleteMany({ userId: uid });

  const doc1 = await Document.create({
    userId: uid, title: 'Introduction to Machine Learning',
    fileName: 'intro_ml.pdf', filePath: 'uploads/intro_ml.pdf',
    fileSize: 204800, numPages: 12, status: 'processed',
    extractedText: 'Machine learning is a subset of artificial intelligence.',
    chunks: [{ content: 'ML enables computers to learn from data.', pageNumber: 1, chunkIndex: 0 }],
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastAccessed: new Date(Date.now() - 60 * 60 * 1000),
  });

  const doc2 = await Document.create({
    userId: uid, title: 'Data Structures and Algorithms',
    fileName: 'dsa_notes.pdf', filePath: 'uploads/dsa_notes.pdf',
    fileSize: 153600, numPages: 8, status: 'processed',
    extractedText: 'A data structure organises data for efficient access.',
    chunks: [{ content: 'Arrays store elements in contiguous memory.', pageNumber: 1, chunkIndex: 0 }],
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastAccessed: new Date(Date.now() - 30 * 60 * 1000),
  });

  await Flashcard.create({
    userId: uid, documentId: doc1._id,
    cards: [
      { question: 'What is machine learning?', answer: 'A subset of AI that enables systems to learn from data.', difficulty: 'easy', isStarred: true, isRead: true, reviewCount: 3 },
      { question: 'What is supervised learning?', answer: 'ML trained on labelled data to predict outcomes.', difficulty: 'medium', isRead: true, reviewCount: 2 },
      { question: 'What is overfitting?', answer: 'When a model learns training data too well and fails on new data.', difficulty: 'hard', isStarred: true, reviewCount: 1 },
    ]
  });

  await Flashcard.create({
    userId: uid, documentId: doc2._id,
    cards: [
      { question: 'What is an array?', answer: 'Elements stored in contiguous memory locations.', difficulty: 'easy', isRead: true, reviewCount: 4 },
      { question: 'What is a linked list?', answer: 'Nodes containing data and a pointer to the next node.', difficulty: 'easy', isStarred: true, isRead: true, reviewCount: 3 },
      { question: 'What is O(n) complexity?', answer: 'Runtime grows linearly with input size.', difficulty: 'medium', isRead: true, reviewCount: 2 },
    ]
  });

  await Quiz.create({
    userId: uid, documentId: doc1._id,
    title: 'Introduction to Machine Learning — Quiz',
    totalQuestions: 3, score: 2,
    completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    questions: [
      { question: 'What does ML stand for?', options: ['Machine Language', 'Machine Learning', 'Meta Logic', 'Model Learning'], correctAnswer: 'Machine Learning', explanation: 'ML = Machine Learning.', difficulty: 'easy' },
      { question: 'Which is a supervised algorithm?', options: ['K-Means', 'PCA', 'Linear Regression', 'DBSCAN'], correctAnswer: 'Linear Regression', explanation: 'Linear Regression uses labelled data.', difficulty: 'medium' },
      { question: 'What causes overfitting?', options: ['Too little data', 'Too simple a model', 'Too much regularisation', 'Too many epochs on a complex model'], correctAnswer: 'Too many epochs on a complex model', explanation: 'Complex models memorise noise in training data.', difficulty: 'hard' },
    ],
    userAnswers: [
      { questionIndex: 0, selectedAnswer: 'Machine Learning', isCorrect: true },
      { questionIndex: 1, selectedAnswer: 'Linear Regression', isCorrect: true },
      { questionIndex: 2, selectedAnswer: 'Too little data', isCorrect: false },
    ]
  });

  console.log('\n✅ Seed complete!');
  console.log('  Email:    demo@ailearning.com');
  console.log('  Password: demo123\n');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
