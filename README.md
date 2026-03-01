# AI Journal

> A modern, intelligent journaling application that leverages AI to analyze and provide insights on your personal journal entries.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AI Journal is a full-stack web application that allows users to create, manage, and analyze their journal entries using artificial intelligence. The application integrates with Hugging Face and Groq to provide sentiment analysis, mood tracking, and intelligent summaries of journal content.

Whether you're looking to reflect on your daily experiences or track your emotional journey over time, AI Journal provides the tools to better understand yourself through data-driven insights.

---

## ✨ Features

- **User Authentication**: Secure registration and login with JWT-based authentication
- **Journal Entry Management**: Create, read, update, and delete personal journal entries
- **AI-Powered Analysis**: Automatic sentiment, mood score, and summary generation using Hugging Face + Groq
- **AI Re-analysis on Update**: When journal content is updated, AI summary/sentiment/mood score are recalculated
- **Analytics Dashboard**: Mood trends, sentiment distribution, tag distribution, and average mood by tag
- **Smart Search Experience**: Search journals by title, content, and tags with focused search-only results view
- **Responsive Design**: Modern, user-friendly interface built with React and TypeScript
- **RESTful API**: Well-documented REST endpoints for all operations
- **Secure & Validated**: Input validation with Zod and password encryption with bcrypt

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: bcrypt for password hashing
- **AI Integration**: Hugging Face Inference API + Groq API
- **Development**: Nodemon, Prettier

### Frontend
- **Framework**: React 19.x
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Styling**: CSS
- **Linting**: ESLint

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud instance)
- **Hugging Face API Key** (for sentiment analysis)
- **Groq API Key** (for summary generation)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_JOURNAL
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# AI Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key
GROQ_API_KEY=your_groq_api_key

# Optional model overrides
# HUGGINGFACE_MODEL=cardiffnlp/twitter-roberta-base-sentiment-latest
# GROQ_MODEL=llama-3.1-8b-instant
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 🎬 Running the Application

### Development Mode

#### Backend
```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Frontend
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Production Build

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 📁 Project Structure

```
AI_JOURNAL/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── user.controller.js
│   │   │   ├── journal.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── models/             # Database schemas
│   │   │   ├── user.model.js
│   │   │   └── journal.model.js
│   │   ├── routers/            # API routes
│   │   │   ├── user.routes.js
│   │   │   ├── journal.router.js
│   │   │   └── analytics.router.js
│   │   ├── middlewares/        # Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── services/           # Business logic
│   │   │   └── ai.service.js
│   │   ├── validators/         # Input validation schemas
│   │   │   └── auth.validator.js
│   │   ├── utils/              # Utility classes
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── asyncHandler.js
│   │   ├── db/                 # Database connection
│   │   ├── app.js              # Express app configuration
│   │   └── index.js            # Server entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── navbar.tsx
│   │   │   └── journalEditorModal.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── journalDetail.tsx
│   │   │   ├── landingPage.tsx
│   │   │   └── notFound.tsx
│   │   ├── context/            # React context (state management)
│   │   │   ├── authContext.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── api/                # API integration
│   │   │   ├── axios.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── journal.api.ts
│   │   │   └── analytics.api.ts
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useAuth.ts
│   │   ├── routes/             # Route guards
│   │   │   ├── protectedRoute.tsx
│   │   │   └── publicRoute.tsx
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── auth.type.ts
│   │   │   ├── journal.type.ts
│   │   │   ├── user.type.ts
│   │   │   └── apiResponse.type.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── .env
│
├── README.md
└── package.json
```

---

## 🔌 API Endpoints

### Authentication Endpoints

```
POST   /api/v1/users/register       - Register a new user
POST   /api/v1/users/login          - Login with credentials
POST   /api/v1/users/logout         - Logout current user
POST   /api/v1/users/refresh-token  - Refresh authentication token
GET    /api/v1/users/me             - Get current user profile
POST   /api/v1/users/change-password- Update current user password
POST   /api/v1/users/update-account - Update account details
```

### Journal Endpoints

```
POST   /api/v1/journals             - Create a new journal entry
GET    /api/v1/journals             - Get all journal entries
GET    /api/v1/journals/:id         - Get a specific journal entry
PUT    /api/v1/journals/:id         - Update a journal entry
DELETE /api/v1/journals/:id         - Delete a journal entry
```

### Analytics Endpoints

```
GET    /api/v1/analytics/mood-trends            - Get mood trends
GET    /api/v1/analytics/sentiment-distribution - Get sentiment distribution
GET    /api/v1/analytics/tags-distribution      - Get top tags distribution
GET    /api/v1/analytics/average-mood-by-tag    - Get average mood grouped by tag
```

> For detailed API documentation, see the individual router files in `backend/src/routers/`

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Lipika Mandal**

---

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Happy journaling! 📔✨**
