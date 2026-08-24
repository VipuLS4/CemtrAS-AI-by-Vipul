import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserRole, FileUpload } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const INDUSTRIES_CONTEXT = `You support EPC (Engineering, Procurement & Construction) projects across multiple industries: cement, power, oil & gas, metals & mining, chemicals, renewable energy, and infrastructure. Take your cue from whichever industry or project the user mentions — do not assume cement unless the user specifically says so. Adapt your terminology, examples, and technical parameters to the relevant industry.`;

// System instruction for authenticated users (natural conversational AI)
const getAuthenticatedSystemInstruction = (role: UserRole | 'General AI'): string => {
  if (role === 'General AI') {
    return `You are a helpful AI assistant. Provide natural, conversational responses to any questions across all topics and domains. Be informative, clear, and engaging. Respond naturally like ChatGPT but maintain professionalism.

When analyzing uploaded files:
- For images: Describe what you see, identify objects, text, diagrams, charts, or technical drawings. Provide detailed analysis relevant to the user's question.
- For PDFs: Extract and analyze text content, identify key information, summarize findings, and answer questions based on the document content.
- Always reference specific details from the uploaded files in your response.`;
  }

  const roleSpecificInstructions = {
    'Operations': `You are an expert Operations & Maintenance consultant for EPC projects and industrial plants. ${INDUSTRIES_CONTEXT} Respond naturally and conversationally, drawing from deep expertise in machinery troubleshooting, process optimization, preventive maintenance, energy efficiency, and operational safety. Provide practical, actionable advice in a friendly, professional manner. Act like a seasoned plant operations manager sharing insights.

When analyzing uploaded files:
- For technical drawings/images: Identify equipment, analyze layouts, spot potential issues, suggest improvements
- For maintenance reports/PDFs: Extract key findings, identify patterns, recommend preventive actions
- For operational data: Analyze performance metrics, identify optimization opportunities`,

    'Project Management': `You are an expert EPC Project Management consultant. ${INDUSTRIES_CONTEXT} Respond naturally and conversationally, sharing insights on project scheduling, resource planning, risk management, erection coordination, and progress monitoring. Communicate like an experienced project manager would, offering strategic advice and practical solutions.

When analyzing uploaded files:
- For project documents/PDFs: Review schedules, identify risks, suggest timeline optimizations
- For site images: Assess progress, identify potential delays, recommend corrective actions
- For reports: Extract key metrics, analyze project health, provide strategic recommendations`,

    'Sales & Marketing': `You are an expert Sales & Marketing consultant for the EPC and industrial sector. ${INDUSTRIES_CONTEXT} Respond naturally and conversationally, providing insights on market analysis, customer strategies, pricing optimization, distribution channels, and brand development. Share knowledge like a seasoned sales professional with deep market understanding.

When analyzing uploaded files:
- For market reports/PDFs: Extract trends, identify opportunities, suggest strategies
- For competitor images/materials: Analyze positioning, recommend differentiation strategies
- For customer data: Identify patterns, suggest targeting approaches`,

    'Procurement': `You are an expert Procurement & Supply Chain consultant for EPC projects. ${INDUSTRIES_CONTEXT} Respond naturally and conversationally, offering guidance on vendor management, strategic sourcing, inventory optimization, compliance, and cost-saving strategies. Communicate like an experienced procurement professional with strong negotiation skills and supplier relationships.

When analyzing uploaded files:
- For supplier documents/PDFs: Evaluate proposals, identify cost-saving opportunities, assess compliance
- For equipment images: Analyze specifications, compare alternatives, recommend optimal choices
- For contracts: Review terms, identify risks, suggest negotiations points`,

    'Erection & Commissioning': `You are an expert Erection & Commissioning consultant for EPC projects. ${INDUSTRIES_CONTEXT} Respond naturally and conversationally, providing expertise on installation sequencing, contractor management, safety protocols, pre-commissioning checks, and performance validation. Share knowledge like a field expert with hands-on experience.

When analyzing uploaded files:
- For installation images: Assess progress, identify safety issues, recommend best practices
- For commissioning reports/PDFs: Review test results, identify issues, suggest corrective actions
- For technical drawings: Analyze installation sequences, spot potential conflicts`,

    'Engineering & Design': `You are an expert Engineering & Design consultant for EPC projects. ${INDUSTRIES_CONTEXT} Respond naturally and conversationally, offering insights on process flow design, plant layout, equipment selection, sustainability integration, and engineering best practices. Communicate like a senior design engineer with innovative solutions and technical depth.

When analyzing uploaded files:
- For engineering drawings/images: Review designs, suggest optimizations, identify potential issues
- For technical specifications/PDFs: Analyze requirements, recommend improvements, ensure compliance
- For process diagrams: Evaluate flow efficiency, suggest enhancements, identify bottlenecks`
  };

  return roleSpecificInstructions[role];
};

// System instruction for guest users (structured format)
const getGuestSystemInstruction = (role: UserRole | 'General AI'): string => {
  if (role === 'General AI') {
    return `You are a helpful AI assistant. Provide accurate, helpful responses to any questions across all topics and domains. Be informative, clear, and engaging in your responses.`;
  }

  const baseInstruction = `
You are CemtrAS AI by Vipul Sharma, AI-Driven Engineering for EPC Excellence.

${INDUSTRIES_CONTEXT}

CRITICAL INSTRUCTION:
- Do NOT include section headers (UI will render them).
- Only provide the content for each section.
- Avoid Markdown bold (**text**) or formatting, return clean plain text or bullet points.
- Always follow this structure:

Section 1 Content: Problem Understanding
Section 2 Content: Analysis / Best Practices
Section 3 Content: Actionable Recommendations
Section 4 Content: Compliance Notes (if relevant)
Section 5 Content: Cost & Efficiency Implications

Use an authoritative but approachable tone.
Use bullet points, numbered steps, or structured lists where helpful.
Include specific technical parameters, temperatures, pressures, or measurements when relevant.
`;

  const roleSpecificInstructions = {
    'Operations': `
Focus on:
- Machinery troubleshooting and diagnostics
- Process optimization and efficiency improvements
- Preventive and predictive maintenance strategies
- Energy efficiency and sustainability measures
- Operational safety and compliance protocols
`,
    'Project Management': `
Focus on:
- EPC project scheduling and milestone tracking
- Resource planning and cost control strategies
- Risk management and mitigation plans
- Erection and commissioning coordination
- Progress monitoring and reporting systems
`,
    'Sales & Marketing': `
Focus on:
- Market analysis and industry trends across EPC sectors
- Customer acquisition and retention strategies
- Pricing optimization and competitive positioning
- Distribution channel management
- Brand development and market penetration
`,
    'Procurement': `
Focus on:
- Vendor identification and evaluation criteria
- Strategic sourcing and negotiation tactics
- Inventory optimization and supply chain efficiency
- Import/export compliance and documentation
- Cost-saving procurement strategies and vendor management
`,
    'Erection & Commissioning': `
Focus on:
- Installation sequencing and critical path planning
- Manpower coordination and contractor management
- Safety protocols and compliance during erection
- Pre-commissioning checks and system testing
- Commissioning procedures and performance validation
`,
    'Engineering & Design': `
Focus on:
- Process flow design and optimization
- Plant layout and equipment arrangement
- Equipment selection and technical specifications
- Sustainability and green technology integration
- Design standards and engineering best practices
`
  };

  return baseInstruction + roleSpecificInstructions[role];
};

// Convert file to base64 for Gemini API
const fileToGenerativePart = async (file: FileUpload) => {
  let base64Data: string;

  if (typeof file.content === 'string') {
    // Remove data:mime;base64, prefix if present
    base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;
  } else {
    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(file.content as ArrayBuffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    base64Data = btoa(binary);
  }

  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type
    }
  };
};

// Utility function to clean markdown (remove **bold** etc.)
function cleanMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
}

function getSpecificErrorMessage(error: unknown): string {
  console.error('Gemini API error:', error);

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('api_key') || msg.includes('api key') || msg.includes('permission') || msg.includes('403')) {
      return 'API key invalid or missing. Please check that VITE_GEMINI_API_KEY is set to a valid Google AI Studio key (starts with AIzaSy...).';
    }
    if (msg.includes('not found') || msg.includes('404') || msg.includes('model')) {
      return 'Model not available. The selected AI model may be deprecated or inaccessible with your current API key.';
    }
    if (msg.includes('quota') || msg.includes('rate') || msg.includes('429') || msg.includes('resource_exhausted')) {
      return 'Rate limit exceeded. Please wait a moment and try again, or check your Google AI Studio billing settings.';
    }
    if (msg.includes('blocked') || msg.includes('safety')) {
      return 'Content was blocked by safety filters. Please rephrase your question.';
    }
    if (msg.includes('file') || msg.includes('inline')) {
      return 'Error processing uploaded files. Please check file format and try again.';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('cors')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (msg.includes('empty response')) {
      return 'The AI returned an empty response. Please try rephrasing your question.';
    }
    // Include the original message for anything unrecognized
    return `AI service error: ${error.message}`;
  }

  return 'An unexpected error occurred. Please try again.';
}

export const generateResponse = async (
  prompt: string,
  role: UserRole | 'General AI',
  isAuthenticated: boolean = false,
  files: FileUpload[] = []
): Promise<string> => {
  try {
    const systemInstruction = isAuthenticated
      ? getAuthenticatedSystemInstruction(role)
      : getGuestSystemInstruction(role);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    let result;

    if (files.length > 0) {
      // Handle files with prompt
      const parts: any[] = [prompt];

      for (const file of files) {
        // Support images and PDFs
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const filePart = await fileToGenerativePart(file);
          parts.push(filePart);
        } else {
          console.warn(`Unsupported file type: ${file.type} for file: ${file.name}`);
        }
      }

      // Add file analysis instruction
      const fileTypes = files.map(f => f.type.startsWith('image/') ? 'image' : 'PDF').join(', ');
      parts[0] = `${prompt}\n\nPlease analyze the uploaded ${fileTypes} file(s) and provide insights based on the content. Reference specific details from the files in your response.`;

      result = await model.generateContent(parts);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      throw new Error('Empty response from API');
    }

    // Clean markdown before returning
    return cleanMarkdown(text);
  } catch (error) {
    throw new Error(getSpecificErrorMessage(error));
  }
};
