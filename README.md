# Livo Pronounce AI

> **AI-Powered Speech Intelligence**
> 
> *Speak Clearly. Improve Confidently.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009485?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Demo

### Live Application
```
🌐 Live Application : Coming Soon
📄 API Documentation : Coming Soon
💻 Source Code : https://github.com/R0HIT-45/livo-pronounce-ai
```

After deployment, links will be updated with:
- Vercel Frontend URL
- Render Backend URL
- Live Swagger API Documentation

---

## Preview

### Project Showcase

Coming soon with interactive previews of:
- Home Page
- Upload Workspace
- AI Processing Animation
- Results Dashboard

---

## About the Project

Livo Pronounce AI is a modern AI-powered speech intelligence platform designed to help learners, professionals, and public speakers improve spoken English through actionable pronunciation feedback.

The application combines a responsive React frontend with a FastAPI backend powered by OpenAI Whisper to evaluate pronunciation, clarity, fluency, confidence, and speaking speed. Users receive detailed AI-generated insights within seconds through an intuitive dashboard.

---

## Key Features

### 🎤 Audio Input
- Drag & Drop Upload
- Browser Recording
- Multiple Audio Formats (.wav, .mp3, .m4a)
- Real-time File Validation

### 🤖 AI Speech Intelligence
- Speech-to-Text Transcription
- Pronunciation Assessment
- Clarity Detection
- Fluency Analysis
- Confidence Evaluation
- Speaking Pace (WPM)

### 📊 AI-Generated Report
- Overall Score (0-100)
- Grade (A-F Scale)
- AI Summary & Feedback
- Full Transcript with Timestamps
- Strengths Identification
- Focus Areas for Improvement
- Word-Level Confidence Scores
- Speaking Speed Analysis

### ✨ User Experience
- Fully Responsive Design
- Mobile Support
- Smooth Processing Animations
- Comprehensive Error Handling
- Glassmorphism UI Design
- Framer Motion Transitions

---

## Architecture

```
                    User
                     │
                     ▼
           React Frontend (Vite)
                     │
      multipart/form-data Upload
                     │
                     ▼
              FastAPI Backend
                     │
            Audio Validation
                     │
                     ▼
             OpenAI Whisper
                     │
              Speech Transcript
                     │
                     ▼
          Speech Assessment Engine
                     │
                     ▼
              JSON Response
                     │
                     ▼
          Interactive Dashboard
```

---

## Project Workflow

```
Upload Audio
    ↓
Validate Audio
    ↓
Transcribe Speech
    ↓
Analyze Pronunciation
    ↓
Generate Scores
    ↓
Generate AI Feedback
    ↓
Display Interactive Results
```

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React** | UI Component Framework |
| **TypeScript** | Type-Safe Development |
| **TailwindCSS** | Utility-First Styling |
| **Vite** | Lightning-Fast Build Tool |
| **TanStack Router** | Modern Routing |
| **TanStack Query** | Data Fetching & Caching |
| **Framer Motion** | Advanced Animations |
| **Lucide React** | Beautiful Icon Library |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-Performance REST API |
| **Python** | Backend Development |
| **OpenAI Whisper** | Speech Recognition |
| **Pydantic** | Data Validation |
| **Uvicorn** | ASGI Server |
| **NumPy** | Numerical Computing |
| **FFmpeg** | Audio Processing |

---

## Folder Structure

```
livo-pronounce-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tests/
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── router.tsx
│   │   └── server.ts
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docs/
├── README.md
├── LICENSE
└── .gitignore
```

---

## Installation

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload
```

**Backend will run on:** `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

**Frontend will run on:** `http://localhost:5173`

---

## API Endpoints

### Analyze Speech

```http
POST /api/v1/analyze
Content-Type: multipart/form-data

audio=file.wav
```

**Request Parameters:**
- `audio` (file): Audio file (.wav, .mp3, .m4a)

**Response:**
```json
{
  "overall_score": 85,
  "grade": "B+",
  "clarity": 82,
  "fluency": 88,
  "confidence": 85,
  "speaking_speed": 145,
  "transcript": "The quick brown fox jumps over the lazy dog",
  "summary": "Your pronunciation is clear with good pacing...",
  "strengths": ["Good rhythm", "Clear articulation"],
  "focus_areas": ["Stress patterns", "Intonation"],
  "word_feedback": [
    {
      "word": "quick",
      "confidence": 0.95,
      "pronunciation": "kwɪk"
    }
  ]
}
```

### Health Check

```http
GET /api/v1/health
```

---

## Performance Highlights

✅ FastAPI-based REST API with async support  
✅ Responsive React UI with smooth animations  
✅ OpenAI Whisper integration for accurate transcription  
✅ Full TypeScript architecture for type safety  
✅ Mobile-first responsive design  
✅ Component-based modular architecture  
✅ RESTful communication with proper error handling  
✅ Comprehensive input validation  
✅ Interactive results dashboard  
✅ Clean, maintainable code organization  
✅ Modern CSS animations and transitions  

---

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_key
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## Future Roadmap

🔐 **User Authentication & Accounts**
- User registration and login
- Speech history tracking
- Progress analytics

🎯 **Advanced Features**
- Real-time speech analysis
- AI Conversation Practice
- Accent Detection
- PDF Report Export
- Leaderboards & Achievements

🌍 **Internationalization**
- Multiple Languages Support
- Regional Accent Detection

📱 **Experience Enhancements**
- Personalized Learning Plans
- Mobile App
- Voice Feedback

---

## Development Guidelines

### Code Style
- ESLint for JavaScript/TypeScript
- Prettier for code formatting
- Type-safe development with TypeScript
- Functional React components with hooks

### Testing
- Unit tests for critical functions
- Integration tests for API endpoints
- Component tests for React UI

### Git Workflow
```
main branch → production ready
develop branch → staging
feature/* → feature development
```

---

## Performance Metrics

- **API Response Time:** < 3 seconds for 30-second audio
- **Frontend Load Time:** < 2 seconds
- **Transcription Accuracy:** 95%+ with Whisper
- **Mobile Performance:** Lighthouse score > 90

---

## Troubleshooting

### Audio Upload Issues
- Ensure audio file is under 25MB
- Supported formats: WAV, MP3, M4A
- Check browser permissions for microphone access

### Backend Errors
- Verify OpenAI API key is valid
- Check FFmpeg installation
- Ensure Python 3.11+ is installed

### CORS Issues
- Verify `ALLOWED_ORIGINS` in backend .env
- Check frontend API URL configuration

---

## License

MIT License - see [LICENSE](LICENSE) file for details

This project is open source and free to use, modify, and distribute.

---

## Author

**D Rohith Subrahmanya Sai**

- 🎓 B.Tech – Computer Science & Design
- 💡 AI • Full Stack Development • Software Engineering
- 🔗 GitHub: [@R0HIT-45](https://github.com/R0HIT-45)
- 📧 Repository: [livo-pronounce-ai](https://github.com/R0HIT-45/livo-pronounce-ai)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others

---

## Acknowledgments

- OpenAI for Whisper API
- React & TanStack communities
- FastAPI framework
- All open-source contributors

---

**Made with ❤️ by Rohith**
