require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Configuration, OpenAIApi } = require('openai');

// Express setup
const app = express();
app.use(cors());
app.use(express.json());

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Multer in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// (A) Upload Resume & Parse Text (PDF only)
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname.toLowerCase();
    let extractedText = '';

    if (fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text;
    } else {
      return res
        .status(400)
        .json({ error: 'Unsupported file format. Please upload a PDF.' });
    }

    if (!extractedText) {
      return res
        .status(400)
        .json({ error: 'Could not extract text from resume file.' });
    }

    // Return the extracted text
    return res.json({ resumeText: extractedText });
  } catch (error) {
    console.error('Error uploading/parsing resume:', error);
    return res
      .status(500)
      .json({ error: 'Server error parsing resume file.' });
  }
});

// (B) Generate GPT-4 with rewording instructions
app.post('/api/generate', async (req, res) => {
  try {
    const { jobDescription, resumeText, additionalAccomplishments } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required.' });
    }
    if (!resumeText) {
      return res.status(400).json({ error: 'No resume text found.' });
    }

    const messages = [
      {
        role: 'system',
        content: `
          You are a helpful AI for resume writing. The user has:
          1) A job description.
          2) A candidate's resume text (editable by the user).
          3) Additional accomplishments not in their resume.

          Your instructions:
          - Identify each relevant job/employer from the candidate’s text.
          - For each employer, create bullet points that:
            (A) Are strictly relevant to the job description.
            (B) Are reworded or summarized if needed, rather than copied verbatim 
                from the resume text (unless it's already a perfect match). 
            (C) Exclude any points that do not match or add value to the job requirements.
          - If an additional accomplishment is relevant, merge it under the appropriate employer. 
            Otherwise, ignore it.
          - Provide a short "Aligned Areas" summary about strong matches.
          - Provide a short "Misaligned/Not Covered" section about missing requirements.
          - Provide a numeric match percentage (1-100).

          Return valid JSON:
          {
            "bulletPoints": "...",
            "alignment": "...",
            "misalignment": "...",
            "matchPercentage": "..."
          }

          - "bulletPoints" is a single string grouping each employer's heading with bullet points.
          - "alignment" is a short paragraph/list about strong matches.
          - "misalignment" is a short paragraph/list about missing requirements.
          - "matchPercentage" is a number 1-100.
          - Do not add extra keys or wrap in code blocks.
        `
      },
      {
        role: 'user',
        content: `
          JOB DESCRIPTION:
          "${jobDescription}"

          RESUME TEXT:
          "${resumeText}"

          ADDITIONAL ACCOMPLISHMENTS:
          "${additionalAccomplishments}"

          Please produce the JSON as requested.
        `
      }
    ];

    const responseAI = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const rawContent = responseAI.data.choices[0].message.content.trim();
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.error('Failed to parse JSON from GPT-4:', rawContent);
      return res.status(500).json({
        error: 'GPT-4 did not return valid JSON. Please try again.',
        rawContent
      });
    }

    // Return the structured data
    return res.json({
      bulletPoints: parsed.bulletPoints || '',
      alignment: parsed.alignment || '',
      misalignment: parsed.misalignment || '',
      matchPercentage: parsed.matchPercentage || 'N/A'
    });
  } catch (error) {
    console.error('Error generating GPT-4 text:', error.message);
    return res.status(500).json({
      error: 'Error generating bullet points with GPT-4.'
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
