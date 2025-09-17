// Gemini API Service for Project Builder Chatbot
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  private conversationHistory: GeminiMessage[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    message: string, 
    projectContext?: {
      title: string;
      type: 'software' | 'science';
      description: string;
      skills: string[];
      difficulty: string;
    }
  ): Promise<string> {
    try {
      // Build context-aware prompt
      let systemPrompt = `You are an AI assistant helping users with project building. You provide clear, step-by-step guidance for both software and science projects.`;
      
      if (projectContext) {
        systemPrompt += `\n\nCurrent Project Context:
- Title: ${projectContext.title}
- Type: ${projectContext.type}
- Description: ${projectContext.description}
- Skills Required: ${projectContext.skills.join(', ')}
- Difficulty: ${projectContext.difficulty}

Please provide specific, actionable advice related to this project. For software projects, include code examples when helpful. For science projects, suggest materials and step-by-step procedures.`;
      }

      // Add system prompt to conversation if it's the first message
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: systemPrompt }]
        });
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: 'I understand. I\'m ready to help you with your project. What specific guidance do you need?' }]
        });
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const requestBody = {
        contents: this.conversationHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const assistantMessage = data.candidates[0].content.parts[0].text;
      
      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: assistantMessage }]
      });

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback responses based on project type and common questions
      if (projectContext) {
        return this.getFallbackResponse(message, projectContext);
      }
      
      return 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment, or feel free to ask a more specific question about your project.';
    }
  }

  private getFallbackResponse(message: string, projectContext: any): string {
    const lowerMessage = message.toLowerCase();
    
    if (projectContext.type === 'software') {
      if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
        return `To start your ${projectContext.title} project:

1. **Set up your development environment**
   - Install Node.js and npm
   - Create a new React project: \`npx create-react-app ${projectContext.title.toLowerCase().replace(/\s+/g, '-')}\`

2. **Plan your components**
   - Identify the main features: ${projectContext.skills.join(', ')}
   - Sketch out your user interface

3. **Start with basic structure**
   - Create your main component
   - Add basic styling with CSS

Would you like me to help you with any specific part of the setup?`;
      }
      
      if (lowerMessage.includes('code') || lowerMessage.includes('example')) {
        return `Here's a basic code structure for your ${projectContext.title}:

\`\`\`jsx
import React, { useState } from 'react';

function ${projectContext.title.replace(/\s+/g, '')}() {
  const [data, setData] = useState([]);
  
  // Add your logic here
  
  return (
    <div className="app">
      <h1>${projectContext.title}</h1>
      {/* Add your components here */}
    </div>
  );
}

export default ${projectContext.title.replace(/\s+/g, '')};
\`\`\`

What specific functionality would you like to implement first?`;
      }
    } else if (projectContext.type === 'science') {
      if (lowerMessage.includes('materials') || lowerMessage.includes('supplies')) {
        return `For your ${projectContext.title} project, you'll typically need:

**Basic Materials:**
- Cardboard or foam board for the base
- Modeling clay or papier-mâché
- Acrylic paints and brushes
- Glue and tape
- Markers for labeling

**Specific to your project:**
${projectContext.skills.map(skill => `- Materials for ${skill.toLowerCase()}`).join('\n')}

**Tools:**
- Scissors
- Ruler or measuring tape
- Pencil for sketching

Would you like specific recommendations for any of these materials?`;
      }
      
      if (lowerMessage.includes('steps') || lowerMessage.includes('how')) {
        return `Here's a general approach for your ${projectContext.title}:

1. **Planning Phase**
   - Research the scientific concept
   - Sketch your design
   - Gather all materials

2. **Construction Phase**
   - Start with the base structure
   - Add main components
   - Focus on accuracy and scale

3. **Finishing Phase**
   - Add details and labels
   - Test functionality (if applicable)
   - Create an explanation card

What specific step would you like detailed guidance on?`;
      }
    }
    
    return `I'd be happy to help with your ${projectContext.title} project! Could you be more specific about what you need help with? For example:

- Getting started with setup
- Specific technical challenges
- Material recommendations
- Step-by-step guidance
- Troubleshooting issues

What aspect of the project are you working on right now?`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getConversationLength(): number {
    return this.conversationHistory.length;
  }
}

// Export a singleton instance
let geminiService: GeminiService | null = null;

export const getGeminiService = (apiKey: string): GeminiService => {
  if (!geminiService) {
    geminiService = new GeminiService(apiKey);
  }
  return geminiService;
};

export default GeminiService;

