# QA Forge 🚀

**Enterprise-Grade AI Manual Test Case Generator for Jira.**

QA Forge transforms the way QA engineers work by automating the tedious process of writing manual test cases. By integrating directly with Jira and leveraging high-performance LLMs via Groq, it generates comprehensive test suites (Positive, Negative, and Edge cases) in seconds and pushes them directly back to your project.

---

## ✨ Key Features

- **🔐 Enterprise Authentication**: Secured by **AWS Cognito Hosted UI** with JWT verification and stateless session management.
- **🧠 AI-Powered Generation**: Uses ultra-fast LLMs (via Groq) to analyze Jira ticket descriptions and generate structured test cases.
- **🎟️ Deep Jira Integration**: 
  - Reads ticket data directly from Jira.
  - Automatically creates subtasks for each generated test case.
  - Generates and attaches formatted `.xlsx` test suites to tickets.
- **📱 Responsive Glassmorphic UI**: High-end modern design built with React, Vite, and Framer Motion—fully responsive from Desktop to Mobile.
- **⚡ Performance First**: Backend powered by FastAPI (Python) and frontend by Vite (React/TypeScript).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+ (TypeScript)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Glassmorphism)
- **Animations**: Framer Motion
- **Auth**: AWS Amplify v6

### Backend
- **Framework**: FastAPI
- **AI Integration**: Groq SDK
- **Jira Integration**: Requests + Atlassian-style API
- **Auth Verification**: `python-jose` (RSA JWKS verification)
- **Environment**: `python-dotenv`

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- AWS Cognito User Pool (configured)
- Jira API Token
- Groq API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
JIRA_BASE_URL="https://your-domain.atlassian.net/"
JIRA_EMAIL="your-email@example.com"
JIRA_API_TOKEN="your-jira-token"
GROQ_API_KEY="your-groq-key"

COGNITO_REGION="your-region"
COGNITO_USER_POOL_ID="your-user-pool-id"
COGNITO_APP_CLIENT_ID="your-app-client-id"
```

Start the backend:
```bash
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Update the configuration in `src/main.tsx` with your AWS Cognito details.

Start the development server:
```bash
npm run dev
```

---

## 🛡️ Security
- **Strict JWT Validation**: The backend validates every request signature against AWS Cognito's public JWKS.
- **Environment Isolation**: All sensitive API keys and tokens are managed via `.env` and excluded from source control.
- **OAuth 2.0 Flow**: Implements the secure Authorization Code Flow with PKCE via Cognito.

---

## 📝 License
Proudly built as an enterprise-grade QA automation platform.
