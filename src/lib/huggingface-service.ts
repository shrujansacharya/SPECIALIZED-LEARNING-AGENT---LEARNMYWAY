import { pipeline } from '@huggingface/transformers';

class HuggingFaceService {
  private speechRecognizer: any;
  private isSpeechInitialized: boolean = false;

  constructor() {
    this.speechRecognizer = null;
  }

  // ---------------- SPEECH RECOGNITION ----------------
  async initSpeechRecognition() {
    if (!this.isSpeechInitialized) {
      try {
        console.log('Initializing speech recognition model...');
        try {
          this.speechRecognizer = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-tiny.en'
          );
          console.log('Whisper-tiny.en model loaded successfully');
        } catch (whisperError) {
          console.warn('Whisper-tiny.en failed, trying wav2vec2-base-960h...');
          this.speechRecognizer = await pipeline(
            'automatic-speech-recognition',
            'Xenova/wav2vec2-base-960h'
          );
          console.log('wav2vec2-base-960h model loaded successfully');
        }
        this.isSpeechInitialized = true;
      } catch (error) {
        console.error('Error initializing speech recognition model:', error);
        throw error;
      }
    }
  }

  async init() {
    await this.initSpeechRecognition();
  }

  // ---------------- TRANSCRIBE AUDIO (OpenAI Whisper API) ----------------
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.text || "";
    } catch (error: any) {
      console.error("Whisper API error:", error);
      // If Whisper fails, show user-friendly message
      if (error.message.includes('credentials') || error.message.includes('OpenAI') || error.message.includes('API key')) {
        throw new Error('Speech recognition service is not configured. Please contact administrator to set up OpenAI API key.');
      }
      if (error.message.includes('Unexpected end of JSON input')) {
        throw new Error('Speech recognition service is not responding. Please try again later.');
      }
      throw error;
    }
  }

  // ---------------- TEXT GENERATION (API) ----------------
  async generateResponse(prompt: string, level: string, mode: string): Promise<string> {
    try {
      const response = await fetch(
        "https://huggingface.co/openai-community/gpt2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `You are an English tutor. Mode: ${mode}, Level: ${level}. Student said: "${prompt}". Respond naturally in English.`,
            parameters: { max_new_tokens: 80, temperature: 0.7 }
          }),
        }
      );

      const data = await response.json();
      return data[0]?.generated_text?.trim() || "I'm not sure how to respond.";
    } catch (error) {
      console.error("Error generating response:", error);
      return "I couldn't generate a response. Try again!";
    }
  }

  async generateFeedback(userText: string, level: string): Promise<string> {
    try {
      const response = await fetch(
        "https://huggingface.co/openai-community/gpt2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `You are an English teacher. Provide short feedback for this sentence: "${userText}" (Level: ${level}).`,
            parameters: { max_new_tokens: 60, temperature: 0.5 }
          }),
        }
      );

      const data = await response.json();
      return data[0]?.generated_text?.trim() || "Good try! Keep practicing.";
    } catch (error) {
      console.error("Error generating feedback:", error);
      return "I couldn't analyze your speech. Try again!";
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        "https://huggingface.co/openai-community/gpt2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 50 } }),
        }
      );

      const data = await response.json();
      return data[0]?.generated_text?.trim() || "Hello! Let's practice a sentence.";
    } catch (error) {
      console.error("Error generating text:", error);
      return "Couldn't generate text.";
    }
  }
}

let huggingFaceServiceInstance: HuggingFaceService | null = null;

export const getHuggingFaceService = async () => {
  if (!huggingFaceServiceInstance) {
    huggingFaceServiceInstance = new HuggingFaceService();
    await huggingFaceServiceInstance.init();
  }
  return huggingFaceServiceInstance;
};
