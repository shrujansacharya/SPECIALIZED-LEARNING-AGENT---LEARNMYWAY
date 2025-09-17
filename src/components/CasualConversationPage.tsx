// CasualConversationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, ArrowLeft, RefreshCw, User, Bot, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { GeminiService } from '../lib/gemini-service';

export const CasualConversationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<{ role: 'user' | 'bot' | 'feedback', text: string }[]>([]);
  const [status, setStatus] = useState('Press the microphone to start speaking...');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [currentLevel, setCurrentLevel] = useState(location.state?.level || 'Beginner');
  const currentMode = 'casual'; // Fixed to casual
  const [isServiceReady, setIsServiceReady] = useState(false);

  useEffect(() => {
    setStatus('Initializing Gemini API...');
    setIsServiceReady(true);
  }, []);

  useEffect(() => {
    const setInitialContent = async () => {
      let welcomeMessage = '';

      switch (currentLevel) {
        case 'Beginner':
          welcomeMessage = 'Welcome to your casual English conversation practice! Let\'s start with something simple: What\'s your favorite color?';
          break;
        case 'Intermediate':
          welcomeMessage = 'Welcome to your casual English conversation practice! Let\'s chat: What did you do last weekend?';
          break;
        case 'Advanced':
          welcomeMessage = 'Welcome to your casual English conversation practice! Let\'s discuss: What are your thoughts on current technology trends?';
          break;
        default:
          welcomeMessage = 'Welcome to your casual English conversation practice! What would you like to talk about?';
      }

      setConversation([{ role: 'bot', text: welcomeMessage }]);
      speakText(welcomeMessage);
      setStatus('Speech recognition ready. Click the microphone to practice speaking.');
    };

    setInitialContent();
  }, [currentLevel]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size);
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob created:', audioBlob.size);
        await handleAudioTranscription(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Recording... Speak now!');
      console.log('Recording started');
    } catch (error: unknown) {
      console.error('Error starting recording:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setStatus('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setStatus('No microphone found. Please connect a microphone and try again.');
        } else {
          setStatus('Failed to start recording. Please check microphone permissions.');
        }
      } else {
        setStatus('Failed to start recording. Please check microphone permissions.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording, isRecording:', isRecording);
    if (mediaRecorderRef.current && isRecording) {
      console.log('Calling mediaRecorder.stop()');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing your speech with Gemini API...');
    } else {
      console.log('Cannot stop recording: mediaRecorder or isRecording is false');
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    try {
      const transcription = await GeminiService.transcribeAudio(audioBlob);
      if (transcription) {
        await handleSpeechResult(transcription);
      } else {
        setStatus('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setStatus('Error processing audio. Please try again.');
    }
  };

  const handleSpeechResult = async (transcription: string) => {
    setConversation((prev) => [...prev, { role: 'user', text: transcription }]);
    setStatus('Analyzing your speech...');

    try {
      let feedback = '';
      let response = '';

      // Use last bot message as expected text for feedback
      const lastBotMessage = conversation.slice().reverse().find(msg => msg.role === 'bot')?.text || '';

      feedback = await GeminiService.generateFeedback(transcription, lastBotMessage, currentLevel);
      response = await GeminiService.generateResponse(transcription, currentLevel, currentMode);

      setConversation((prev) => [
        ...prev,
        { role: 'feedback', text: feedback },
        { role: 'bot', text: response },
      ]);

      speakText(response);
      setStatus('Listen to the AI response and speak again!');
    } catch (err: any) {
      console.error('Error processing speech:', err);
      setConversation((prev) => [...prev, { role: 'feedback', text: 'Error analyzing speech. Please try again.' }]);
      setStatus('Click the microphone to try again.');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser.');
      setStatus('Text-to-speech not supported. Please use a compatible browser.');
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLevel(e.target.value);
    setConversation([]);
    setStatus('Changing level...');
  };

  const clearConversation = () => {
    setConversation([]);
    setStatus('Conversation cleared. Start speaking!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-700 p-8">
      <div className="max-w-4xl mx-auto flex gap-8">
        <motion.div
          className="w-64 bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Options</h2>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-1 block">Select Level</label>
              <select
                value={currentLevel}
                onChange={handleLevelChange}
                className="w-full bg-white/20 text-white border border-white/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <button
              onClick={clearConversation}
              className="w-full p-2 rounded-lg text-left text-white bg-red-500/20 hover:bg-red-500/30 transition-all"
            >
              Clear Conversation
            </button>
          </div>
        </motion.div>

        <div className="flex-1 space-y-8">
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative mb-6">
              <motion.button
                onClick={() => navigate('/speaking', { state: { level: currentLevel } })}
                className="absolute left-0 top-0 text-white hover:text-yellow-400 transition-colors p-2 rounded-lg bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={24} />
              </motion.button>
              <h1 className="text-5xl font-extrabold text-white flex items-center justify-center gap-4">
                <MessageSquare className="text-purple-400" size={48} />
                Casual Conversation ({currentLevel})
              </h1>
            </div>
            <p className="text-lg text-white/80 mb-8 text-center">
              Practice casual English conversations with AI feedback. Powered by Gemini API.
            </p>
          </motion.div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {conversation.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/50 flex items-center justify-center">
                      {msg.role === 'bot' ? <Bot className="text-white" size={20} /> : <User className="text-white" size={20} />}
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-xl max-w-[80%] shadow-md ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : msg.role === 'bot'
                        ? 'bg-pink-600 text-white rounded-bl-none'
                        : 'bg-red-600 text-white rounded-bl-none'
                    }`}
                  >
                    <strong>{msg.role === 'user' ? 'You:' : msg.role === 'bot' ? 'AI Friend:' : 'Feedback:'}</strong> {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/50 flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={conversationEndRef} />
          </div>

          <div className="flex justify-center items-center gap-6">
            <motion.button
              onClick={() => {
                console.log('Button clicked, isRecording:', isRecording);
                if (isRecording) {
                  console.log('Calling stopRecording');
                  stopRecording();
                } else {
                  console.log('Calling startRecording');
                  startRecording();
                }
              }}
              className={`p-6 rounded-full shadow-lg ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-500'} hover:opacity-90`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={status.includes('Error') || status.includes('Microphone access denied') || !isServiceReady}
            >
              <Mic size={48} className="text-white" />
            </motion.button>
            <p className="text-white text-xl flex-1 text-center">{status}</p>
            <motion.button
              onClick={() => speakText(conversation.slice().reverse().find((msg: { role: string }) => msg.role === 'bot')?.text || '')}
              className="p-6 rounded-full shadow-lg bg-pink-500 hover:opacity-90"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Replay last AI response"
              disabled={!conversation.some((msg) => msg.role === 'bot')}
            >
              <Volume2 size={48} className="text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasualConversationPage;
