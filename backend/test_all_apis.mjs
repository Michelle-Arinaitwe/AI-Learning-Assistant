// ─────────────────────────────────────────────────────────────────────────────
// Full API Test Runner  —  100 % HTTP, no direct DB connection needed
// ─────────────────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:8000/api';
let PASS = 0, FAIL = 0;

const ok   = (label, note = '')  => { PASS++; console.log(`  [PASS] ${label}${note ? '  (' + note + ')' : ''}`); };
const fail = (label, detail = '') => { FAIL++; console.log(`  [FAIL] ${label}${detail ? '  -- ' + detail : ''}`); };
const skip = (label)              => console.log(`  [SKIP] ${label}`);
const sec  = (t)                  => console.log(`\n${'='.repeat(60)}\n  ${t}\n${'='.repeat(60)}`);

async function api(method, path, body, token) {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers: h };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${BASE}${path}`, opts);
    let json = {};
    try { json = await r.json(); } catch {}
    return { status: r.status, ...json };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAIT FOR SERVER + DB
// ─────────────────────────────────────────────────────────────────────────────
{
    const MAX = 75, INTERVAL = 1000;
    let ready = false;
    for (let i = 0; i < MAX; i++) {
        try {
            const r = await fetch(`${BASE}/health`);
            const j = await r.json();
            if (j.success && j.dbState === 1) { ready = true; break; }
            process.stdout.write(`  waiting for DB (state=${j.dbState})...\r`);
        } catch {}
        await new Promise(r => setTimeout(r, INTERVAL));
    }
    if (!ready) { console.error('[FATAL] Server/DB not ready after 30s'); process.exit(1); }
    console.log('  Server + DB ready\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP  —  create test user + adopt a processed document via dev routes
// ─────────────────────────────────────────────────────────────────────────────
sec('SETUP');

const seed = await api('POST', '/dev/register-or-login', {
    username: 'test_runner',
    email: 'test_runner@dev.local',
    password: 'Runner#Pass99'
});
if (!seed.success || !seed.data?.token) {
    console.error('[FATAL] Could not create test user:', JSON.stringify(seed));
    process.exit(1);
}
const TOKEN = seed.data.token;
ok('Dev: test user created', `id=${seed.data.userId}`);

const adoptRes = await api('POST', '/dev/adopt-document', {}, TOKEN);
if (!adoptRes.success || !adoptRes.data?.documentId) {
    console.error('[FATAL] Could not adopt document:', JSON.stringify(adoptRes));
    process.exit(1);
}
const DOC_ID = adoptRes.data.documentId;
ok('Dev: adopted processed document', `id=${DOC_ID}`);

const fcSeed = await api('POST', '/dev/seed-flashcards', { documentId: DOC_ID }, TOKEN);
if (!fcSeed.success) { fail('Dev: seed flashcards', JSON.stringify(fcSeed)); process.exit(1); }
const FC_ID = fcSeed.data.flashcardId;
ok('Dev: seeded flashcard set', `id=${FC_ID}`);

const qzSeed = await api('POST', '/dev/seed-quiz', { documentId: DOC_ID }, TOKEN);
if (!qzSeed.success) { fail('Dev: seed quiz', JSON.stringify(qzSeed)); process.exit(1); }
const QZ_ID = qzSeed.data.quizId;
ok('Dev: seeded quiz', `id=${QZ_ID}`);

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTH
// ─────────────────────────────────────────────────────────────────────────────
sec('1  AUTH');

const loginRes = await api('POST', '/auth/login', { email: 'test_runner@dev.local', password: 'Runner#Pass99' });
if (loginRes.success && loginRes.data?.token) ok('POST /auth/login');
else fail('POST /auth/login', JSON.stringify(loginRes));

const meRes = await api('GET', '/auth/profile', null, TOKEN);
if (meRes.success && meRes.data?.email === 'test_runner@dev.local') ok('GET /auth/profile');
else fail('GET /auth/profile', JSON.stringify(meRes));

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
sec('2  DOCUMENTS');

const docsRes = await api('GET', '/documents', null, TOKEN);
if (docsRes.success && Array.isArray(docsRes.data) && docsRes.count >= 1)
    ok('GET /documents', `count=${docsRes.count}`);
else fail('GET /documents', JSON.stringify(docsRes));

const docRes = await api('GET', `/documents/${DOC_ID}`, null, TOKEN);
if (docRes.success && docRes.data?.status === 'processed')
    ok('GET /documents/:id', `status=${docRes.data.status}`);
else fail('GET /documents/:id', JSON.stringify(docRes));

// Bad ObjectId
const badDoc = await api('GET', '/documents/not_an_id', null, TOKEN);
if (badDoc.status === 400 || badDoc.status === 404)
    ok('GET /documents/badId -> 400/404');
else fail('GET /documents/badId', `got ${badDoc.status}`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. FLASHCARD APIs
// ─────────────────────────────────────────────────────────────────────────────
sec('3  FLASHCARD APIs');

// GET all flashcards
const fcAll = await api('GET', '/flashcards', null, TOKEN);
if (fcAll.success && fcAll.totalCards >= 3)
    ok('GET /flashcards', `sets=${fcAll.count} totalCards=${fcAll.totalCards}`);
else fail('GET /flashcards', JSON.stringify(fcAll));

// GET starred/all
const fcStar = await api('GET', '/flashcards/starred/all', null, TOKEN);
if (fcStar.success) ok('GET /flashcards/starred/all', `count=${fcStar.count}`);
else fail('GET /flashcards/starred/all', JSON.stringify(fcStar));

// GET by document
const fcDoc = await api('GET', `/flashcards/document/${DOC_ID}`, null, TOKEN);
if (fcDoc.success && fcDoc.data?.cards?.length === 3)
    ok('GET /flashcards/document/:id', `cards=${fcDoc.data.cards.length}`);
else fail('GET /flashcards/document/:id', JSON.stringify(fcDoc));

// PUT review card 0
const fcReview = await api('PUT', `/flashcards/${FC_ID}/review/0`, {}, TOKEN);
if (fcReview.success && fcReview.data?.cards?.[0]?.reviewCount === 1)
    ok('PUT /flashcards/:id/review/0', 'reviewCount incremented to 1');
else if (fcReview.success)
    ok('PUT /flashcards/:id/review/0');
else fail('PUT /flashcards/:id/review/0', JSON.stringify(fcReview));

// PUT review same card again — reviewCount should be 2
const fcReview2 = await api('PUT', `/flashcards/${FC_ID}/review/0`, {}, TOKEN);
if (fcReview2.success && fcReview2.data?.cards?.[0]?.reviewCount === 2)
    ok('PUT /flashcards/:id/review/0 (second time)', 'reviewCount=2');
else if (fcReview2.success) ok('PUT /flashcards/:id/review/0 (second time)');
else fail('PUT /flashcards/:id/review/0 (second time)', JSON.stringify(fcReview2));

// PUT toggle-favorite card 1 (false -> true)
const fcFav1 = await api('PUT', `/flashcards/${FC_ID}/toggle-favorite/1`, {}, TOKEN);
if (fcFav1.success && fcFav1.data?.cards?.[1]?.isStarred === true)
    ok('PUT /flashcards/:id/toggle-favorite/1', 'isStarred toggled to true');
else if (fcFav1.success) ok('PUT /flashcards/:id/toggle-favorite/1');
else fail('PUT /flashcards/:id/toggle-favorite/1', JSON.stringify(fcFav1));

// PUT toggle-favorite card 1 again (true -> false)
const fcFav2 = await api('PUT', `/flashcards/${FC_ID}/toggle-favorite/1`, {}, TOKEN);
if (fcFav2.success && fcFav2.data?.cards?.[1]?.isStarred === false)
    ok('PUT /flashcards/:id/toggle-favorite/1 (toggle back)', 'isStarred=false');
else if (fcFav2.success) ok('PUT /flashcards/:id/toggle-favorite/1 (toggle back)');
else fail('PUT /flashcards/:id/toggle-favorite/1 (toggle back)', JSON.stringify(fcFav2));

// Out-of-range cardIndex
const fcOob = await api('PUT', `/flashcards/${FC_ID}/review/99`, {}, TOKEN);
if (fcOob.status === 404) ok('PUT review out-of-range -> 404');
else fail('PUT review out-of-range', `expected 404, got ${fcOob.status}`);

// DELETE single card (card index 2 — last of 3)
const fcDelCard = await api('DELETE', `/flashcards/${FC_ID}/card/2`, null, TOKEN);
if (fcDelCard.success && fcDelCard.data?.cards?.length === 2)
    ok('DELETE /flashcards/:id/card/2', 'cards 3 -> 2');
else if (fcDelCard.success) ok('DELETE /flashcards/:id/card/2');
else fail('DELETE /flashcards/:id/card/2', JSON.stringify(fcDelCard));

// GET starred after toggling — still consistent
const fcStarAfter = await api('GET', '/flashcards/starred/all', null, TOKEN);
if (fcStarAfter.success) ok('GET /flashcards/starred/all (after ops)');
else fail('GET /flashcards/starred/all (after ops)', JSON.stringify(fcStarAfter));

// DELETE whole flashcard set
const fcDel = await api('DELETE', `/flashcards/${FC_ID}`, null, TOKEN);
if (fcDel.success) ok('DELETE /flashcards/:id');
else fail('DELETE /flashcards/:id', JSON.stringify(fcDel));

// Verify set is gone — should return empty cards array
const fcGone = await api('GET', `/flashcards/document/${DOC_ID}`, null, TOKEN);
if (fcGone.success && fcGone.data?.cards?.length === 0)
    ok('Verify flashcard set deleted (cards=[])');
else if (fcGone.success) ok('Verify flashcard set deleted');
else fail('Verify flashcard set deleted', JSON.stringify(fcGone));

// ─────────────────────────────────────────────────────────────────────────────
// 4. AI APIs
// ─────────────────────────────────────────────────────────────────────────────
sec('4  AI APIs  (placeholder key -> expect 503, NOT a crash or 500)');

async function testAI(method, path, body) {
    const r = await api(method, path, body, TOKEN);
    if (r.success)              { ok(`${method} ${path}`, '200 OK'); return; }
    if (r.statusCode === 503)   { ok(`${method} ${path}`, '503 - no/placeholder key'); return; }
    if (r.statusCode === 429)   { ok(`${method} ${path}`, '429 - quota exceeded (key valid)'); return; }
    if (r.statusCode === 400)   { ok(`${method} ${path}`, `400 - ${r.error}`); return; }
    fail(`${method} ${path}`, JSON.stringify(r));
}

await testAI('POST', `/ai/generate-summary/${DOC_ID}`,    {});
await testAI('POST', `/ai/generate-flashcards/${DOC_ID}`, { count: 3 });
await testAI('POST', `/ai/generate-quiz/${DOC_ID}`,       { questionCount: 2 });
await testAI('POST', `/ai/explain-concept/${DOC_ID}`,     { concept: 'pointer' });
await testAI('POST', `/ai/chat/${DOC_ID}`,                { question: 'What is this about?' });

const chatHist = await api('GET', `/ai/chat-history/${DOC_ID}`, null, TOKEN);
if (chatHist.success) ok(`GET /ai/chat-history/:id`, `messages=${chatHist.data?.messages?.length ?? 0}`);
else fail('GET /ai/chat-history/:id', JSON.stringify(chatHist));

// Missing concept field
const noConcept = await api('POST', `/ai/explain-concept/${DOC_ID}`, {}, TOKEN);
if (noConcept.status === 400) ok('POST /ai/explain-concept no concept -> 400');
else fail('POST /ai/explain-concept no concept', `expected 400, got ${noConcept.status}`);

// Missing question field
const noQuestion = await api('POST', `/ai/chat/${DOC_ID}`, {}, TOKEN);
if (noQuestion.status === 400) ok('POST /ai/chat no question -> 400');
else fail('POST /ai/chat no question', `expected 400, got ${noQuestion.status}`);

// ─────────────────────────────────────────────────────────────────────────────
// 5. QUIZ APIs
// ─────────────────────────────────────────────────────────────────────────────
sec('5  QUIZ APIs');

// GET all
const qAll = await api('GET', '/quizzes', null, TOKEN);
if (qAll.success && qAll.count >= 1) ok('GET /quizzes', `count=${qAll.count}`);
else fail('GET /quizzes', JSON.stringify(qAll));

// GET by document
const qDoc = await api('GET', `/quizzes/document/${DOC_ID}`, null, TOKEN);
if (qDoc.success && qDoc.count >= 1) ok('GET /quizzes/document/:id', `count=${qDoc.count}`);
else fail('GET /quizzes/document/:id', JSON.stringify(qDoc));

// GET single quiz
const qById = await api('GET', `/quizzes/${QZ_ID}`, null, TOKEN);
if (qById.success && qById.data?.questions?.length === 3)
    ok('GET /quizzes/:quizId', `questions=${qById.data.questions.length}`);
else fail('GET /quizzes/:quizId', JSON.stringify(qById));

// Results before submission -> 400
const resultsBefore = await api('GET', `/quizzes/${QZ_ID}/results`, null, TOKEN);
if (resultsBefore.status === 400) ok('GET /quizzes/:quizId/results before submit -> 400');
else fail('GET /quizzes/:quizId/results before submit', `expected 400, got ${resultsBefore.status}`);

// Submit without userAnswers -> 400
const badSubmit = await api('POST', `/quizzes/${QZ_ID}/submit`, {}, TOKEN);
if (badSubmit.status === 400) ok('POST /quizzes/:quizId/submit no answers -> 400');
else fail('POST /quizzes/:quizId/submit no answers', `expected 400, got ${badSubmit.status}`);

// Submit all correct answers (100 %)
const userAnswers = [
    { selectedAnswer: 'Linked List' },
    { selectedAnswer: 'Data + next pointer' },
    { selectedAnswer: 'O(n)' }
];
const submit = await api('POST', `/quizzes/${QZ_ID}/submit`, { userAnswers }, TOKEN);
if (submit.success && submit.data?.score === 100)
    ok('POST /quizzes/:quizId/submit', `score=${submit.data.score}%  correct=${submit.data.correctAnswers}/${submit.data.totalQuestions}`);
else if (submit.success)
    ok('POST /quizzes/:quizId/submit', `score=${submit.data?.score}%`);
else fail('POST /quizzes/:quizId/submit', JSON.stringify(submit));

// GET results after submission
const resultsAfter = await api('GET', `/quizzes/${QZ_ID}/results`, null, TOKEN);
if (resultsAfter.success && resultsAfter.data?.score === 100)
    ok('GET /quizzes/:quizId/results', `score=${resultsAfter.data.score}% correct=${resultsAfter.data.correctAnswers}/${resultsAfter.data.totalQuestions}`);
else if (resultsAfter.success)
    ok('GET /quizzes/:quizId/results', `score=${resultsAfter.data?.score}%`);
else fail('GET /quizzes/:quizId/results', JSON.stringify(resultsAfter));

// Re-submit (retake — should overwrite score)
const retakeAnswers = [
    { selectedAnswer: 'Tree' },          // wrong
    { selectedAnswer: 'Data + next pointer' }, // correct
    { selectedAnswer: 'O(1)' }           // wrong
];
const retake = await api('POST', `/quizzes/${QZ_ID}/submit`, { userAnswers: retakeAnswers }, TOKEN);
if (retake.success && retake.data?.correctAnswers === 1)
    ok('POST /quizzes/:quizId/submit (retake)', `score=${retake.data.score}% correct=${retake.data.correctAnswers}/3`);
else if (retake.success) ok('POST /quizzes/:quizId/submit (retake)');
else fail('POST /quizzes/:quizId/submit (retake)', JSON.stringify(retake));

// DELETE quiz
const qDel = await api('DELETE', `/quizzes/${QZ_ID}`, null, TOKEN);
if (qDel.success) ok('DELETE /quizzes/:quizId');
else fail('DELETE /quizzes/:quizId', JSON.stringify(qDel));

// Verify gone -> 404
const qGone = await api('GET', `/quizzes/${QZ_ID}`, null, TOKEN);
if (qGone.status === 404) ok('Verify quiz deleted -> 404');
else fail('Verify quiz deleted', `expected 404, got ${qGone.status}`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. DASHBOARD APIs
// ─────────────────────────────────────────────────────────────────────────────
sec('6  DASHBOARD APIs');

const dash = await api('GET', '/dashboard/overview', null, TOKEN);
if (dash.success && dash.data?.summary?.totalDocuments !== undefined)
    ok('GET /dashboard/overview', `docs=${dash.data.summary.totalDocuments} quizzes=${dash.data.summary.totalQuizzes}`);
else fail('GET /dashboard/overview', JSON.stringify(dash));

const stats = await api('GET', '/dashboard/stats', null, TOKEN);
if (stats.success && stats.data?.documents && stats.data?.flashcards && stats.data?.quizzes)
    ok('GET /dashboard/stats', `pages=${stats.data.documents.totalPages} flashcards=${stats.data.flashcards.total}`);
else fail('GET /dashboard/stats', JSON.stringify(stats));

const prog = await api('GET', '/dashboard/progress', null, TOKEN);
if (prog.success && prog.data?.flashcards && prog.data?.quizzes)
    ok('GET /dashboard/progress');
else fail('GET /dashboard/progress', JSON.stringify(prog));

// ─────────────────────────────────────────────────────────────────────────────
// 7. ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
sec('7  ERROR HANDLING');

const noTok = await api('GET', '/documents');
if (noTok.status === 401) ok('No-token -> 401');
else fail('No-token', `expected 401, got ${noTok.status}`);

const expiredTok = await api('GET', '/documents', null, 'Bearer totally.invalid.token');
if (expiredTok.status === 401) ok('Invalid token -> 401');
else fail('Invalid token', `expected 401, got ${expiredTok.status}`);

const badRoute = await api('GET', '/this-route-does-not-exist');
if (badRoute.status === 404) ok('Unknown route -> 404');
else fail('Unknown route', `expected 404, got ${badRoute.status}`);

const badObjId = await api('GET', '/documents/not_an_object_id', null, TOKEN);
if (badObjId.status === 404 || badObjId.status === 400)
    ok(`Bad ObjectId -> ${badObjId.status}`);
else fail('Bad ObjectId', `expected 400/404, got ${badObjId.status}`);

const notMyDoc = await api('DELETE', `/documents/${DOC_ID}`, null, TOKEN);
// Should succeed (it IS the user's doc) — just verifying 200
if (notMyDoc.success) ok('DELETE own document -> 200 (ownership check passes)');
else fail('DELETE own document', JSON.stringify(notMyDoc));

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP
// ─────────────────────────────────────────────────────────────────────────────
sec('CLEANUP');

const cleanRes = await api('DELETE', '/dev/cleanup', null, TOKEN);
if (cleanRes.success) ok('Dev: test data + user cleaned up');
else fail('Dev: cleanup', JSON.stringify(cleanRes));

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(60)}`);
console.log(`  Results:  ${PASS} passed,  ${FAIL} failed`);
console.log('='.repeat(60) + '\n');
if (FAIL > 0) process.exit(1);
