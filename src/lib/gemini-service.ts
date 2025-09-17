import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAs2RqPN-OQMfR027M1eeogi6A2otFDiWo';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export class GeminiService {
  static async generateText(prompt: string): Promise<string> {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return text || '';
    } catch (error) {
      console.error('Error generating text from Gemini API:', error);
      throw error;
    }
  }

  static async generateDailyChallenge(challengeType: string): Promise<string> {
    try {
      const prompt = `Generate a daily ${challengeType} challenge for language learning. Make it engaging and educational. Provide a clear task or question.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return text || `Sample ${challengeType} challenge: Practice your skills!`;
    } catch (error) {
      console.error('Error generating daily challenge from Gemini API:', error);
      throw error;
    }
  }

  // New method for audio transcription using Gemini's multimodal capabilities
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);

      const prompt = `Please transcribe the following audio file. Provide only the transcription text without any additional commentary.`;

      // Create a multimodal prompt with audio
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/webm', // or 'audio/wav' depending on your recording format
            data: base64Audio
          }
        },
        prompt
      ]);

      const response = await result.response;
      const transcription = await response.text();
      return transcription.trim() || '';
    } catch (error) {
      console.error('Error transcribing audio with Gemini API:', error);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }

  // New method for generating feedback on speech
  static async generateFeedback(transcription: string, expectedText: string, level: string): Promise<string> {
    try {
      const prompt = `You are an English speaking tutor. The student was asked to say: "${expectedText}"
The student said: "${transcription}"

Please provide constructive feedback on their speech for a ${level} level learner. Focus on:
1. Pronunciation accuracy
2. Fluency and naturalness
3. Grammar and vocabulary usage
4. Areas for improvement

Keep the feedback encouraging and specific. Limit to 2-3 sentences.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const feedback = await response.text();
      return feedback.trim() || 'Good effort! Keep practicing.';
    } catch (error) {
      console.error('Error generating feedback with Gemini API:', error);
      return 'Great effort! Keep practicing your pronunciation and fluency.';
    }
  }

  // New method for generating AI tutor responses
  static async generateResponse(transcription: string, level: string, mode: string): Promise<string> {
    try {
      let prompt = '';

      if (mode === 'sentence') {
        prompt = `You are an English speaking tutor. The student said: "${transcription}"
This is for a ${level} level learner practicing sentence repetition.

Respond naturally and encouragingly. If they made mistakes, gently correct them and provide the correct version. Then suggest practicing another similar sentence. Keep your response conversational and under 50 words.`;
      } else if (mode === 'guided') {
        prompt = `You are an English speaking tutor in a guided practice session. The student said: "${transcription}"
This is for a ${level} level learner.

Continue the conversation naturally. Ask follow-up questions or provide relevant responses to keep the practice going. Keep your response conversational and under 50 words.`;
      } else if (mode === 'casual') {
        prompt = `You are having a casual conversation with an English learner. The student said: "${transcription}"
This is for a ${level} level learner.

Respond naturally as you would in a friendly chat. Keep the conversation flowing with appropriate questions or comments. Keep your response conversational and under 50 words.`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = await response.text();
      return aiResponse.trim() || 'That\'s interesting! Tell me more.';
    } catch (error) {
      console.error('Error generating response with Gemini API:', error);
      return 'I\'m here to help you practice! What would you like to talk about?';
    }
  }

  // New method for generating sentences for practice
  static async generateSentence(level: string): Promise<string> {
    try {
      const prompt = `Generate a single English sentence suitable for a ${level} level learner to practice speaking. The sentence should be:
- Clear and natural
- Appropriate for the level (beginner: simple words, intermediate: moderate complexity, advanced: complex structures)
- Between 8-15 words
- Provide only the sentence, no additional text or explanation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const sentence = await response.text();
      return sentence.trim() || 'Hello, how are you today?';
    } catch (error) {
      console.error('Error generating sentence with Gemini API:', error);
      const fallbackSentences = {
        Beginner: ['Hello, my name is John.', 'I like to eat apples.', 'Where is the park?'],
        Intermediate: ['I enjoy reading books in the evening.', 'Can you tell me about your favorite movie?', 'I went to the beach last weekend.'],
        Advanced: ['The economic policies of the new government are quite controversial.', 'I believe technology is shaping our future in profound ways.', 'What are your thoughts on climate change mitigation?'],
      };
      const sentences = fallbackSentences[level as keyof typeof fallbackSentences] || fallbackSentences.Beginner;
      return sentences[Math.floor(Math.random() * sentences.length)];
    }
  }

  // Helper method to convert blob to base64
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Added fallback method for development to avoid API errors
export class GeminiServiceFallback {
  static async generateDailyChallenge(challengeType: string): Promise<string> {
    return Promise.resolve(`Sample ${challengeType} challenge: Describe your favorite topic in detail.`);
  }
}

export default GeminiService;