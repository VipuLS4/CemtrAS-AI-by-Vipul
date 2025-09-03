import React from 'react';
import { User, Bot, AlertTriangle, CheckCircle, Info, Target, BarChart3, Lightbulb, Shield, FileText, Image, Paperclip } from 'lucide-react';
import type { Message, FileUpload } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { isAuthenticated } = useAuth();
  const isUser = message.role === 'user';
  
  const renderStructuredContent = (content: string, isAuthenticatedUser: boolean) => {
    // For authenticated users, render content naturally without structured sections
    if (isAuthenticatedUser) {
      return (
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {content.split('\n').map((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
              return (
                <div key={index} className="flex items-start gap-3 ml-4 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{trimmedLine.replace(/^[•\-*]\s*/, '')}</span>
                </div>
              );
            }
            return trimmedLine ? <p key={index} className="mb-2">{trimmedLine}</p> : null;
          })}
        </div>
      );
    }

    // For guest users, maintain structured format
    // Split content by sections
    const sections = content.split(/(?=Section \d+:|Problem Understanding|Analysis|Actionable Recommendations|Compliance Notes|Cost & Efficiency)/g);
    
    return sections.map((section, index) => {
      if (section.trim() === '') return null;
      
      // Check for section headers
      if (section.includes('Problem Understanding') || section.includes('Section 1:')) {
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 text-red-700 font-bold text-sm mb-3">
              <Target className="w-4 h-4" />
              PROBLEM UNDERSTANDING
            </div>
            <div className="text-slate-700 leading-relaxed pl-4 border-l-4 border-red-200">
              {section.replace(/Problem Understanding|Section 1:/g, '').trim()}
            </div>
          </div>
        );
      }
      
      if (section.includes('Analysis') || section.includes('Section 2:')) {
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm mb-3">
              <BarChart3 className="w-4 h-4" />
              ANALYSIS / BEST PRACTICES
            </div>
            <div className="text-slate-700 leading-relaxed pl-4 border-l-4 border-blue-200">
              {formatBulletPoints(section.replace(/Analysis|Best Practices|Section 2:/g, '').trim())}
            </div>
          </div>
        );
      }
      
      if (section.includes('Actionable Recommendations') || section.includes('Solution') || section.includes('Section 3:')) {
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-green-200 bg-green-50 text-green-700 font-bold text-sm mb-3">
              <Lightbulb className="w-4 h-4" />
              ACTIONABLE RECOMMENDATIONS
            </div>
            <div className="text-slate-700 leading-relaxed pl-4 border-l-4 border-green-200">
              {formatBulletPoints(section.replace(/Actionable Recommendations|Solution|Recommendation|Section 3:/g, '').trim())}
            </div>
          </div>
        );
      }
      
      if (section.includes('Compliance Notes') || section.includes('Safety') || section.includes('Section 4:')) {
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 text-yellow-700 font-bold text-sm mb-3">
              <Shield className="w-4 h-4" />
              COMPLIANCE & SAFETY NOTES
            </div>
            <div className="text-slate-700 leading-relaxed pl-4 border-l-4 border-yellow-200">
              {formatBulletPoints(section.replace(/Compliance Notes|Safety|Best Practices|Section 4:/g, '').trim())}
            </div>
          </div>
        );
      }
      
      if (section.includes('Cost & Efficiency') || section.includes('Section 5:')) {
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-700 font-bold text-sm mb-3">
              <BarChart3 className="w-4 h-4" />
              COST & EFFICIENCY IMPLICATIONS
            </div>
            <div className="text-slate-700 leading-relaxed pl-4 border-l-4 border-purple-200">
              {formatBulletPoints(section.replace(/Cost & Efficiency|Section 5:/g, '').trim())}
            </div>
          </div>
        );
      }
      
      // Default content
      return (
        <div key={index} className="text-slate-700 leading-relaxed mb-4">
          {formatBulletPoints(section)}
        </div>
      );
    });
  };
  
  const formatBulletPoints = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        return (
          <div key={lineIndex} className="flex items-start gap-3 ml-4 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>{trimmedLine.replace(/^[•\-*]\s*/, '')}</span>
          </div>
        );
      }
      return trimmedLine ? <p key={lineIndex} className="mb-2">{trimmedLine}</p> : null;
    });
  };
  
  const renderFileAttachments = (files: FileUpload[]) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-3 space-y-2" role="region" aria-label="Attached files">
        <div className="text-xs font-semibold text-blue-200 mb-2 flex items-center gap-1">
          <Paperclip size={12} />
          Attached Files:
        </div>
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <div className="flex-shrink-0">
              {file.type.startsWith('image/') ? (
                <Image className="text-blue-600" size={18} />
              ) : file.type === 'application/pdf' ? (
                <FileText className="text-red-600" size={18} />
              ) : (
                <FileText className="text-gray-600" size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-blue-800 truncate">
                {file.name}
              </div>
              <div className="text-xs text-blue-600">
                {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
              </div>
            </div>
            {file.type.startsWith('image/') && (
              <div className="w-8 h-8 rounded border border-blue-300 overflow-hidden bg-white">
                <img 
                  src={file.content as string} 
                  alt={`Preview of ${file.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`} role="article" aria-label={`Message from ${isUser ? 'user' : 'CemtrAS AI'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
          : 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800'
      }`} aria-label={`${isUser ? 'User' : 'AI Assistant'} avatar`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      
      <div className={`flex-1 max-w-4xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-3 shadow-sm max-w-full ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl sm:rounded-2xl rounded-br-md'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl rounded-bl-md'
        }`} role="region" aria-label="Message content">
          <div className="text-sm leading-relaxed">
            {isUser ? (
              <div className="space-y-2">
                <div className="font-semibold break-words">{message.content}</div>
                {message.files && renderFileAttachments(message.files)}
              </div>
            ) : (
              <div className="space-y-2">
                {renderStructuredContent(message.content, isAuthenticated)}
              </div>
            )}
          </div>
        </div>
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium ${isUser ? 'text-right' : 'text-left'}`} role="note" aria-label="Message metadata">
          {isUser ? 'YOU' : 'CemtrAS AI'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};