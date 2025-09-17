import { createClient } from '@supabase/supabase-js';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

type QuestionType = 'mcq' | 'true_false' | 'short_answer';

interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro', temperature: 0.7 });

const generateQuestionsPrompt = PromptTemplate.fromTemplate(`
Generate {numQuestions} {questionType} questions from the following text:
{text}

Format requirements:
- For multiple choice: include 4 options and mark the correct one
- For true/false: just state true or false
- For short answer: provide the expected answer
- Output must be valid JSON format that can be parsed directly
- Strictly follow this structure for each question: {id: string, type: string, question: string, options?: string[], correctAnswer: string, difficulty: string}

Output as a JSON array with exactly these fields for each question:
question, options (if applicable), correctAnswer, difficulty
`);

export async function generateQuizQuestions(filePath: string): Promise<GeneratedQuestion[]> {
  try {
    // Download file from Supabase storage
    const { data, error } = await supabase.storage
      .from('quiz-materials')
      .download(filePath);

    if (error || !data) {
      throw new Error(error?.message || 'Failed to download file');
    }

    // Load document based on file type
    let loader;
    if (filePath.endsWith('.pdf')) {
      loader = new PDFLoader(data);
    } else {
      loader = new TextLoader(data);
    }

    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const texts = await textSplitter.splitDocuments(docs);
    const questions: GeneratedQuestion[] = [];

    // Generate questions for each text chunk
    for (const text of texts) {
      const prompt = await generateQuestionsPrompt.format({
        text: text.pageContent,
        numQuestions: 3,
        questionType: 'mcq'
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      try {
        const parsedQuestions = JSON.parse(generatedText);
        questions.push(...parsedQuestions);
      } catch (parseError) {
        console.error('Error parsing generated questions:', parseError);
      }
    }

    return questions;
  } catch (err) {
    console.error('Error in generateQuizQuestions:', err);
    throw err;
  }
}