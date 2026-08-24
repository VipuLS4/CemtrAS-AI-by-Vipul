import React, { useState, useRef, useEffect } from 'react';
import { Factory, Building2, Zap, Flame, Mountain, FlaskConical, Wind, HardHat } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LoadingMessage } from './components/LoadingMessage';
import { ErrorMessage } from './components/ErrorMessage';
import { LoginScreen } from './components/LoginScreen';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { useChatHistory } from './contexts/ChatHistoryContext';
import { useTheme } from './contexts/ThemeContext';
import { generateResponse } from './utils/gemini';
import type { Message, UserRole, ChatState, ChatHistory } from './types';

function App() {
  const { user, isAuthenticated } = useAuth();
  const { saveChatHistory, loadChatHistory, setCurrentChatId } = useChatHistory();
  const { isDarkMode } = useTheme();
  const [showLogin, setShowLogin] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    selectedRole: 'Operations',
    uploadedFiles: []
  });
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isLoading]);

  // Check authentication status on mount
  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
      setShowAuth(false);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setShowLogin(false);
    setShowAuth(true);
  };

  const handleGuestAccess = () => {
    setShowLogin(false);
    setShowAuth(false);
  };

  const handleAuthComplete = () => {
    setShowAuth(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError('GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      files: chatState.uploadedFiles.length > 0 ? [...chatState.uploadedFiles] : undefined
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      uploadedFiles: [] // Clear uploaded files after sending
    }));

    setSidebarOpen(false);

    try {
      const aiResponse = await generateResponse(
        content, 
        chatState.selectedRole, 
        isAuthenticated,
        chatState.uploadedFiles
      );
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));
    } catch (err) {
      setChatState(prev => ({ ...prev, isLoading: false }));
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // Auto-save chat when messages change (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && chatState.messages.length >= 2) {
      const hasUserMessage = chatState.messages.some(m => m.role === 'user');
      const hasAIResponse = chatState.messages.some(m => m.role === 'assistant');
      
      if (hasUserMessage && hasAIResponse) {
        saveChatHistory({
          messages: chatState.messages,
          role: chatState.selectedRole
        });
      }
    }
  }, [chatState.messages, isAuthenticated, chatState.selectedRole, saveChatHistory]);

  const handleRoleChange = (role: UserRole | 'General AI') => {
    setChatState(prev => ({ ...prev, selectedRole: role }));
    setSidebarOpen(false);
  };

  const handleLoadChat = (history: ChatHistory) => {
    setChatState(prev => ({
      ...prev,
      messages: history.messages,
      selectedRole: history.role,
      isLoading: false
    }));
    setCurrentChatId(history.id);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      isLoading: false,
      uploadedFiles: []
    }));
    setCurrentChatId(null);
    setSidebarOpen(false);
  };

  const handleFileUpload = (files: FileUpload[]) => {
    setChatState(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files]
    }));
  };

  const handleRemoveFile = (fileId: string) => {
    setChatState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.id !== fileId)
    }));
  };
  const clearError = () => setError(null);

  if (showLogin && !isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} onGuestAccess={handleGuestAccess} />;
  }

  if (showAuth) {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`} role="application" aria-label="CemtrAS AI Application">
      <div className="h-full w-full flex bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <aside role="complementary" aria-label="Navigation and chat controls">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            selectedRole={chatState.selectedRole}
            onRoleChange={handleRoleChange}
            onLoadChat={handleLoadChat}
            onNewChat={handleNewChat}
            messageCount={chatState.messages.length}
            isLoading={chatState.isLoading}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header role="banner">
            <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              selectedRole={chatState.selectedRole}
            />
          </header>

          {/* Messages Container - Scrollable */}
          <main role="main" aria-label="Chat conversation" className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="p-4 space-y-4 min-h-full">
              {/* Error Display */}
              {error && (
                <div role="alert" aria-live="assertive">
                  <ErrorMessage 
                    message={error} 
                    onRetry={error.includes('GEMINI_API_KEY') ? undefined : clearError}
                  />
                </div>
              )}

              {chatState.messages.length === 0 && !error ? (
                <div className="text-center py-12 animate-fade-in" role="region" aria-label="Welcome message">
                  <div className="p-8 bg-gradient-to-br from-slate-700/10 to-blue-900/10 dark:from-slate-500/10 dark:to-blue-700/10 rounded-3xl w-32 h-32 mx-auto mb-8 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-lg">
                    <Factory className="text-slate-700 dark:text-slate-300 w-16 h-16" />
                  </div>
                  <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">Welcome to CemtrAS AI</h1>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto text-lg leading-relaxed">
                    AI-powered EPC Project Operations, Safety & Efficiency Expert — your trusted partner across cement, power, oil & gas, metals & mining, chemicals, renewable energy, and infrastructure projects.
                    {isAuthenticated && <span className="text-green-600 dark:text-green-400 font-semibold"><br/>You have access to General AI mode and chat history!</span>}
                  </p>
                  {/* Industry pill badges */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
                    {[
                      { label: 'Cement', icon: <Factory size={12} /> },
                      { label: 'Power', icon: <Zap size={12} /> },
                      { label: 'Oil & Gas', icon: <Flame size={12} /> },
                      { label: 'Metals & Mining', icon: <Mountain size={12} /> },
                      { label: 'Chemicals', icon: <FlaskConical size={12} /> },
                      { label: 'Renewable Energy', icon: <Wind size={12} /> },
                      { label: 'Infrastructure', icon: <HardHat size={12} /> },
                    ].map((ind) => (
                      <span key={ind.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {ind.icon}
                        {ind.label}
                      </span>
                    ))}
                  </div>
                  <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto border border-slate-200 dark:border-slate-700 shadow-lg" aria-labelledby="expertise-areas">
                    <h2 id="expertise-areas" className="text-xl font-bold text-slate-800 dark:text-white mb-6">Available Expertise Areas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="text-left space-y-3" role="list" aria-label="Primary expertise areas">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">Plant Operations & Maintenance</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">Project Management</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">Sales & Marketing</p>
                        </div>
                      </div>
                      <div className="text-left space-y-3" role="list" aria-label="Secondary expertise areas">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-rose-500 rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">Procurement & Supply Chain</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-sky-500 rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">Erection & Commissioning</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold">Engineering & Design</p>
                        </div>
                      </div>
                      {isAuthenticated && (
                        <div className="text-left space-y-3 sm:col-span-2" role="list" aria-label="Premium features">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-violet-500 rounded-full flex-shrink-0"></div>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold">General AI Assistant</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {!isAuthenticated && (
                      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl" role="note" aria-label="Login benefits">
                        <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm">
                          Login to unlock General AI mode, file uploads, and chat history!
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div role="log" aria-live="polite" aria-label="Chat messages">
                  {chatState.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {chatState.isLoading && <LoadingMessage />}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Input Area - Fixed at Bottom */}
          <section role="region" aria-label="Message input" className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex-shrink-0">
            <ChatInput 
              onSend={handleSendMessage}
              isLoading={chatState.isLoading || !!error}
              placeholder={`Ask about your EPC project or plant (${chatState.selectedRole} expertise)...`}
              onFileUpload={isAuthenticated ? handleFileUpload : undefined}
              uploadedFiles={chatState.uploadedFiles}
              onRemoveFile={isAuthenticated ? handleRemoveFile : undefined}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;