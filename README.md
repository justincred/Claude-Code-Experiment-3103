# 📚 AI-Powered Quiz Study Tool

A sophisticated study tool that maximizes your learning through AI-powered content extraction, concept generation, and interactive quiz modes.

## 🎯 Features

### 1. **Content Extraction**
- Automatically extracts text from PDF lecture materials
- Intelligent chunking for optimal processing
- Metadata extraction (title, author, page count)

### 2. **Concept Generation**
- AI-powered concept extraction from lecture materials
- Clear, concise explanations for each concept
- Automatic deduplication of similar concepts

### 3. **Question Generation**
- 5 recall questions per concept
- Varying difficulty levels (basic to application-level)
- AI-evaluated answers for immediate feedback

### 4. **Interactive Quiz Mode**
- Hidden answers until you respond
- Real-time answer evaluation with AI
- Immediate feedback on your responses
- Score tracking and performance metrics

### 5. **Spaced Repetition**
- SM-2 algorithm for optimal review scheduling
- Questions prioritized by difficulty
- Automatic scheduling of review sessions

### 6. **Progress Tracking**
- Overall study progress visualization
- Accuracy metrics and statistics
- Concept-level performance tracking
- Personalized recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Anthropic API Key (for Claude integration)
- PDF lecture materials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Claude-Code-Experiment-3103
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

4. **Add your PDF files**
   - Place your lecture PDF files in the project root directory
   - They will be automatically detected by the application

5. **Start the application**
   ```bash
   npm run dev
   ```
   This starts both the backend server (port 5000) and React frontend (port 3000)

6. **Open in browser**
   - Navigate to `http://localhost:3000`

## 📖 Usage

### Processing a New Document

1. On the home screen, you'll see available PDF files
2. Click "Extract Content" on a PDF to:
   - Extract all text from the lecture
   - Generate key concepts
   - Create 5 questions per concept
3. View the extracted concepts before starting

### Taking a Quiz

1. Click "Start Quiz" on any processed document
2. For each question:
   - Read the question carefully
   - Type your answer in the text area
   - Click "Submit Answer" to evaluate
   - See your score and feedback
   - Click "Show Expected Answer" to learn the correct answer
   - Click "Next Question" to continue

### Tracking Progress

1. Click "View Progress" to see:
   - Overall completion percentage
   - Accuracy rate
   - Number of questions answered
   - Detailed statistics
   - Personalized recommendations

### Spaced Repetition

- Questions are automatically scheduled for review
- Questions you got wrong appear more frequently
- The system learns your performance over time
- Focus on the questions that need the most attention

## 🏗️ Architecture

### Backend (Node.js + Express)
- `/server/index.js` - Main server
- `/server/routes/pdf.js` - PDF processing endpoints
- `/server/routes/study.js` - Quiz & study endpoints
- `/server/services/contentGenerator.js` - Claude AI integration
- `/server/services/pdfProcessor.js` - PDF text extraction
- `/server/db.js` - SQLite database management

### Frontend (React)
- `App.jsx` - Main application component
- `DocumentList.jsx` - Available materials view
- `ConceptViewer.jsx` - Concept display
- `QuizMode.jsx` - Interactive quiz interface
- `ProgressTracker.jsx` - Learning analytics

### Database
- SQLite with tables for:
  - Documents (PDFs)
  - Concepts (extracted topics)
  - Questions (auto-generated)
  - Study Sessions (performance tracking)
  - Spaced Repetition (scheduling)

## 🧠 How It Works

1. **Content Extraction**
   - PDF text is extracted and chunked
   - Each chunk is processed independently

2. **Concept Generation**
   - Claude API analyzes chunks
   - Extracts 5-10 main concepts per chunk
   - Deduplicates similar concepts

3. **Question Generation**
   - 5 questions generated per concept
   - Mix of recall, understanding, and application questions

4. **Answer Evaluation**
   - Claude evaluates your answer
   - Provides score (0-100%) and feedback
   - Leniently accepts wording variations

5. **Learning Optimization**
   - Spaced repetition scheduling (SM-2)
   - Performance tracking
   - Difficulty adjustment

## 📊 Study Tips

- ✨ **Consistency**: Study regularly for better retention
- 👍 **Active Recall**: Try to answer without looking at explanations
- 📚 **Review Errors**: Focus on concepts you got wrong
- 💡 **Deep Learning**: Understand the "why", not just facts
- ⏰ **Timing**: Use the tool 2-3 days before your quiz for best results

## 🔧 Configuration

### Server Configuration
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ANTHROPIC_API_KEY` - Claude API key

### Database
- SQLite database stored in `study.db`
- Automatically initialized on first run

## 🤖 AI Integration

This tool uses **Claude 3.5 Sonnet** for:
- Concept extraction from lecture materials
- Question generation from concepts
- Answer evaluation and feedback
- Personalized learning recommendations

## 📈 Performance Metrics

Track your improvement across:
- **Accuracy Rate** - % of questions answered correctly
- **Completion** - % of material reviewed
- **Concept Mastery** - Performance per concept
- **Spaced Repetition** - Questions due for review

## 🐛 Troubleshooting

### PDF Not Processing
- Ensure PDF is in project root directory
- Check that ANTHROPIC_API_KEY is set
- Verify PDF is readable (not corrupted)

### Questions Not Loading
- Wait for processing to complete (may take a few minutes)
- Check API rate limits
- Verify database connection

### Poor Answer Evaluations
- Provide detailed answers
- Use terminology from the course
- Be specific in explanations

## 📝 License

This project is designed for educational purposes.

## 🎓 Quiz Preparation Tips

### 2 Days Before Quiz
1. Process all relevant lecture PDFs
2. Start with easier concepts
3. Get a baseline score

### 1 Day Before Quiz
1. Focus on weak concepts
2. Review marked questions
3. Aim for 80%+ accuracy

### Day of Quiz
1. Light review of key concepts
2. Don't overload your brain
3. Trust your preparation!

---

**Good luck with your studying! You've got this! 🚀**
