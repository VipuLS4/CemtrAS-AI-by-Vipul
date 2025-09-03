import React, { useState } from 'react';
import { Send, Mic, Paperclip, X, FileText, Image, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { FileUpload } from '../types';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  onFileUpload?: (files: FileUpload[]) => void;
  uploadedFiles?: FileUpload[];
  onRemoveFile?: (fileId: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  isLoading, 
  placeholder,
  onFileUpload,
  uploadedFiles = [],
  onRemoveFile
}) => {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}. Only JPG, PNG, GIF, WebP, and PDF files are supported.`;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleFiles = async (files: File[]) => {
    if (!isAuthenticated || !onFileUpload) {
      setUploadError('File upload is only available for logged-in users.');
      return;
    }

    setUploadError(null);

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join('\n'));
      return;
    }

    if (validFiles.length === 0) return;

    try {
      const fileUploads: FileUpload[] = await Promise.all(
        validFiles.map(async (file) => {
          return new Promise<FileUpload>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `file_${Date.now()}_${Math.random()}`,
                name: file.name,
                type: file.type,
                size: file.size,
                content: reader.result as string,
                uploadDate: new Date()
              });
            };
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsDataURL(file);
          });
        })
      );

      onFileUpload(fileUploads);
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process files');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isAuthenticated) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="text-blue-500" size={16} />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="text-red-500" size={16} />;
    }
    return <FileText className="text-gray-500" size={16} />;
  };

  return (
    <div className="space-y-3" role="region" aria-label="Message composition">
      {/* Upload Error Display */}
      {uploadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3" role="alert" aria-live="assertive">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-red-700 dark:text-red-300 text-sm">
              {uploadError.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-500 hover:text-red-700 ml-auto"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files Display */}
      {isAuthenticated && uploadedFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700" role="region" aria-label="Uploaded files">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="text-blue-500" size={16} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Uploaded Files ({uploadedFiles.length})
            </span>
          </div>
          <div className="space-y-2" role="list" aria-label="File list">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-sm transition-shadow"
                role="listitem"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                  </div>
                </div>
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded"
                    aria-label={`Remove file ${file.name}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Instructions for Authenticated Users */}
      {isAuthenticated && uploadedFiles.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4" role="note" aria-label="File upload instructions">
          <div className="flex items-start gap-3">
            <Upload className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">📎 Upload Files for Analysis</p>
              <p className="text-xs">
                Drag & drop or click to upload PDF documents, JPG/PNG images (max 10MB each)
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3" role="search" aria-label="Send message">
        <div 
          className={`flex-1 relative transition-all duration-200 ${
            isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || "Ask about your cement plant challenge or upload files for analysis..."}
            disabled={isLoading}
            className="w-full px-4 py-3 pr-20 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm
                     transition-all duration-200"
            aria-label="Type your message"
            aria-describedby="message-help"
          />
          <div id="message-help" className="sr-only">
            Type your question about cement plant operations or upload files for analysis. Press Enter or click Send to submit.
          </div>
          
          {/* File Upload Button (Authenticated Users Only) */}
          {isAuthenticated && (
            <>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                aria-describedby="file-upload-help"
              />
              <div id="file-upload-help" className="sr-only">
                Upload PDF documents or image files (JPG, PNG, GIF, WebP) up to 10MB each for AI analysis
              </div>
              <label
                htmlFor="file-upload"
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Upload PDF or image files for analysis"
                title="Upload PDF or image files"
              >
                <Paperclip size={16} />
              </label>
            </>
          )}
          
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Voice input (coming soon)"
            title="Voice input (coming soon)"
            disabled
          >
            <Mic size={16} />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center gap-2 
                   font-semibold text-sm shadow-lg hover:shadow-xl"
          aria-label="Send message"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      {/* Drag & Drop Overlay */}
      {isDragOver && isAuthenticated && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-blue-300">
            <div className="text-center">
              <Upload className="text-blue-600 dark:text-blue-400 mx-auto mb-2" size={32} />
              <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                Drop files here to upload
              </div>
              <div className="text-blue-500 dark:text-blue-300 text-sm mt-1">
                PDF documents & images (JPG, PNG, GIF, WebP)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Help for Guest Users */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3" role="note" aria-label="File upload limitation">
          <div className="flex items-center gap-2">
            <Paperclip className="text-yellow-600" size={16} />
            <span className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold">
              📎 Login to upload PDF documents and images for AI analysis
            </span>
          </div>
        </div>
      )}
    </div>
  );
};