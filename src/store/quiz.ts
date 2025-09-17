import { create } from 'zustand';

interface QuizState {
  currentStep: number;
  answers: {
    interests: string; // Changed from string[] to string
    learningStyle: string;
  };
  setAnswer: (type: 'interests' | 'learningStyle', value: string | string[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentStep: 0,
  answers: {
    interests: '', // Initialized as an empty string
    learningStyle: '',
  },
  setAnswer: (type, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [type]: value,
      },
    })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  reset: () =>
    set({
      currentStep: 0,
      answers: {
        interests: '',
        learningStyle: '',
      },
    }),
}));