# 🤖 AI Decision Flow

An AI-powered visual decision workflow builder built using **React Flow, React, Express.js, OpenAI, and Inngest**.

The application allows users to create decision-based workflows visually using connected nodes. Each decision can evaluate user input and route the workflow through **YES / NO** branches.

## 🎯 Project Objective

The main objective of this project is to build a visual AI decision-making system where users can:

* Create decision nodes
* Define decision questions
* Connect nodes using YES/NO branches
* Run workflows with user input
* Get AI-based decisions
* View workflow execution results
* Save workflows locally
* Export and import workflows

## ✨ Features

* 🧩 Visual workflow editor
* 🔀 YES / NO decision branching
* 🤖 AI-powered decision making
* ⚡ Inngest workflow execution
* 🖥️ React-based frontend
* 🚀 Express.js backend
* 💾 LocalStorage workflow persistence
* 📤 Workflow export
* 📥 Workflow import
* 📝 Execution logs
* ➕ Add decision nodes
* 🗑️ Delete selected nodes
* 🧹 Clear workflow

## 🏗️ System Architecture

```text
User
  │
  ▼
React Frontend
  │
  │ Workflow + User Input
  ▼
Express.js Backend
  │
  ├── Direct Decision API
  │
  └── Inngest Workflow
          │
          ▼
     Decision Function
          │
          ▼
      AI Decision
       YES / NO
          │
          ▼
     Next Workflow Node
```

## 🔄 How the Workflow Works

1. The user creates decision nodes in the visual editor.
2. Each node contains a decision question.
3. Nodes are connected using YES and NO branches.
4. The user enters an input for the workflow.
5. The frontend sends the workflow and input to the backend.
6. The backend starts the workflow through Inngest.
7. Each decision is evaluated.
8. The result is either `YES` or `NO`.
9. The workflow follows the corresponding connected branch.
10. Execution results are displayed in the frontend.

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* React Flow (`@xyflow/react`)
* Tailwind CSS
* shadcn/ui

### Backend

* Node.js
* Express.js
* CORS
* dotenv
* OpenAI SDK

### Workflow

* Inngest
* Inngest Dev Server

## 📁 Project Structure

```text
AI_Decision_Flow_BE09/
│
├── backend/
│   ├── inngest/
│   │   └── functions.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── DecisionNode.jsx
│   │   │   └── FlowEditor.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/khushiekghara/AI_Decision_Flow_BE09.git
```

Go to the project directory:

```bash
cd AI_Decision_Flow_BE09
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
INNGEST_DEV=1
```

Start the backend:

```bash
node server.js
```

Backend runs at:

```text
http://localhost:5000
```

### Inngest Setup

Open another terminal:

```bash
cd AI_Decision_Flow_BE09
npx inngest-cli@latest dev -u http://localhost:5000/api/inngest
```

Inngest Dev Server runs at:

```text
http://localhost:8288
```

### Frontend Setup

Open another terminal:

```bash
cd AI_Decision_Flow_BE09/frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## 🔌 API Endpoints

### Health Check

```http
GET /
```

Returns the backend status.

### Direct Decision

```http
POST /api/decision
```

Example request:

```json
{
  "input": "My application is not working and I need technical help.",
  "prompt": "Is this a support request?"
}
```

Example response:

```json
{
  "decision": "YES"
}
```

### Run Workflow

```http
POST /api/workflow/run
```

This endpoint receives the workflow nodes, edges, and user input and starts the workflow through Inngest.

### Inngest Endpoint

```http
/api/inngest
```

This endpoint connects the Express backend with Inngest workflow functions.

## 🧪 Testing

The application was tested with different types of user input.

### Example 1

Input:

```text
My application is not working and I need technical help.
```

Decision:

```text
YES
```

### Example 2

Input:

```text
I want to buy a premium plan.
```

Decision:

```text
NO
```

### Example 3

Input:

```text
What is the weather today?
```

Decision:

```text
NO
```

The visual workflow, decision branches, workflow execution, and execution logs were also tested.

## 💾 Workflow Persistence

The workflow is stored in the browser's LocalStorage.

This allows the workflow to remain available after refreshing the page.

Users can also export and import their workflow configuration.

## 🔐 Environment Variables

The OpenAI API key is stored in the `.env` file.

The `.env` file is excluded from Git using `.gitignore`.

**Never commit API keys or other secrets to GitHub.**

## 🚀 Future Improvements

* User authentication
* Database-based workflow storage
* More node types
* Conditional operators
* Workflow versioning
* Cloud deployment
* Advanced execution history
* Better error handling
* Real-time workflow monitoring
* More AI models and providers

## 👩‍💻 Project

**AI Decision Flow — BE09**

Built as an AI workflow automation project using React Flow, Express.js, OpenAI, and Inngest.

