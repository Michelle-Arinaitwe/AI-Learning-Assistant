# AI Learning Assistant API Endpoints

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except auth) require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication APIs

### 1. Register User
- **POST** `/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User
- **POST** `/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Get User Profile
- **GET** `/auth/profile`

### 4. Update Password
- **POST** `/auth/update-password`
- **Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

## 📄 Document APIs

### 1. Upload Document
- **POST** `/documents/upload`
- **Form Data:**
  - `file`: PDF file
  - `title`: Document title

### 2. Get All Documents
- **GET** `/documents`

### 3. Get Single Document
- **GET** `/documents/:id`

### 4. Update Document
- **PUT** `/documents/:id`
- **Body:**
```json
{
  "title": "New Title"
}
```

### 5. Delete Document
- **DELETE** `/documents/:id`

---

## 🎴 Flashcard APIs

### 1. Get All Flashcards
- **GET** `/flashcards`

### 2. Get Flashcards by Document
- **GET** `/flashcards/document/:documentId`

### 3. Get Starred Flashcards
- **GET** `/flashcards/starred/all`

### 4. Mark Flashcard as Reviewed
- **PUT** `/flashcards/:flashcardId/review/:cardIndex`

### 5. Toggle Favorite
- **PUT** `/flashcards/:flashcardId/toggle-favorite/:cardIndex`

### 6. Delete Flashcard Set
- **DELETE** `/flashcards/:flashcardId`

### 7. Delete Single Card
- **DELETE** `/flashcards/:flashcardId/card/:cardIndex`

---

## 🤖 AI APIs

### 1. Generate Flashcards
- **POST** `/ai/generate-flashcards/:documentId`
- **Body:**
```json
{
  "count": 10
}
```

### 2. Generate Quiz
- **POST** `/ai/generate-quiz/:documentId`
- **Body:**
```json
{
  "questionCount": 5,
  "title": "My Quiz"
}
```

### 3. Generate Summary
- **POST** `/ai/generate-summary/:documentId`

### 4. Explain Concept
- **POST** `/ai/explain-concept/:documentId`
- **Body:**
```json
{
  "concept": "Machine Learning"
}
```

### 5. Chat with AI
- **POST** `/ai/chat/:documentId`
- **Body:**
```json
{
  "question": "What is artificial intelligence?"
}
```

### 6. Get Chat History
- **GET** `/ai/chat-history/:documentId`

---

## 📊 Quiz APIs

### 1. Get All Quizzes
- **GET** `/quizzes`

### 2. Get Quizzes by Document
- **GET** `/quizzes/document/:documentId`

### 3. Get Single Quiz
- **GET** `/quizzes/:quizId`

### 4. Submit Quiz
- **POST** `/quizzes/:quizId/submit`
- **Body:**
```json
{
  "userAnswers": [
    {
      "selectedAnswer": "Option text"
    }
  ]
}
```

### 5. Get Quiz Results
- **GET** `/quizzes/:quizId/results`

### 6. Delete Quiz
- **DELETE** `/quizzes/:quizId`

---

## 📈 Dashboard APIs

### 1. Get Dashboard Overview
- **GET** `/dashboard/overview`
- **Returns:** Summary stats, recent activity, top performers

### 2. Get Learning Statistics
- **GET** `/dashboard/stats`
- **Returns:** Document stats, flashcard stats, quiz stats, activity timeline

### 3. Get Progress by Difficulty
- **GET** `/dashboard/progress`
- **Returns:** Progress breakdown by difficulty level

---

## Testing Workflow

### Step 1: Authenticate
1. Register a new user or login to get JWT token
2. Copy the token from response

### Step 2: Upload Document
1. POST to `/documents/upload` with PDF file and title
2. Wait for document status to be "processed"
3. Note the documentId

### Step 3: Generate AI Content
1. Generate flashcards: POST to `/ai/generate-flashcards/:documentId`
2. Generate quiz: POST to `/ai/generate-quiz/:documentId`
3. Generate summary: POST to `/ai/generate-summary/:documentId`

### Step 4: Interact with Content
1. Review flashcards: PUT to `/flashcards/:flashcardId/review/:cardIndex`
2. Toggle favorites: PUT to `/flashcards/:flashcardId/toggle-favorite/:cardIndex`
3. Submit quiz: POST to `/quizzes/:quizId/submit`

### Step 5: View Progress
1. Get overview: GET `/dashboard/overview`
2. Get stats: GET `/dashboard/stats`
3. Get progress: GET `/dashboard/progress`

---

## Status Codes
- **200:** Success
- **201:** Created
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **500:** Server Error

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "data": {},
  "error": "Error message (if applicable)",
  "message": "Success message"
}
```
