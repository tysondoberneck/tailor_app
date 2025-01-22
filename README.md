# Tailor AI

A full-stack web application that helps users quickly generate a job-targeted version of their resume. The system:

- Parses a **PDF resume** to extract text.
- Accepts a **job description** (manually pasted).
- Integrates with **GPT-4** to produce bullet-pointed highlights aligned with the job requirements.
- Evaluates alignment and provides a match percentage.

---

## Features

- **Resume Parsing**: Upload a PDF, and the server extracts the raw text.
- **Job Description Alignment**: Paste in a job description, and GPT-4 tailors bullet points to match relevant skills and experience.
- **Match Score**: GPT-4 provides an alignment overview and calculates a match percentage (1-100).
- **Additional Accomplishments**: Include extra achievements not listed in the resume to be considered, if relevant.

---

## Prerequisites

- **Node.js** (version 14 or later).
- **npm** (or **yarn**) for dependency management.
- A valid **OpenAI API Key** with GPT-4 access.

---

## Installation

1. **Clone** this repository:
   ```bash
   git clone https://github.com/your-username/tailor_app.git
   cd tailor_app
2. **Install** server dependencies:
   ```bash
   Copy
   cd server
   npm install
3. **Install** client dependencies:
```bash
  Copy
  cd ../client
  npm install
