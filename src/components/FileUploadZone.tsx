import React, { useState } from 'react';
import { Upload, FileText, Image, X, AlertCircle, CheckCircle } from 'lucide-react';
import type { FileUpload } from '../types';

interface FileUploadZoneProps {
  onFileUpload: (files: FileUpload[]) => void;
  uploadedFiles: FileUpload[];
  onRemoveFile: (fileId: string) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  maxFiles = 5,
  maxSizePerFile = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];
    
    if (!validTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}. Only JPG, PNG, GIF, WebP, and PDF files are supported.`;
    }

    // Check file size
    const maxBytes = maxSizePerFile * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large: ${formatFileSize(file.size)}. Maximum size is ${maxSizePerFile}MB.`;
    }

    return null;
  };

  const handleFiles = async (files: File[]) => {
    if (uploadedFiles.length >= maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

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

    // Check total file count
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      validationErrors.push(`Too many files. Maximum ${maxFiles} files allowed.`);
    }

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join('\n'));
      setIsUploading(false);
      return;
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
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
      return <Image className="text-blue-500" size={20} />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="text-red-500" size={20} />;
    }
    return <FileText className="text-gray-500" size={20} />;
  };

  return (
    <div className="space-y-4" role="region" aria-label="File upload area">
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

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        aria-label="File upload area"
        tabIndex={0}
      >
        <input
          type="file"
          id="file-upload-zone"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <label htmlFor="file-upload-zone" className="cursor-pointer block">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className={`p-3 rounded-full ${isDragOver ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Upload className={`${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} size={24} />
              </div>
            </div>
            
            {isUploading ? (
              <div className="space-y-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-blue-600">Processing files...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {isDragOver ? 'Drop files here' : 'Upload Files for Analysis'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag & drop or click to select PDF documents and images
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Supported: PDF, JPG, PNG, GIF, WebP • Max {maxSizePerFile}MB per file • Up to {maxFiles} files
                </p>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3" role="region" aria-label="Uploaded files">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </h3>
            {uploadedFiles.length > 0 && (
              <button
                onClick={() => uploadedFiles.forEach(file => onRemoveFile(file.id))}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                aria-label="Remove all uploaded files"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-2" role="list" aria-label="File list">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-sm transition-shadow"
                role="listitem"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                
                {/* File Preview for Images */}
                {file.type.startsWith('image/') && (
                  <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden bg-gray-50">
                    <img 
                      src={file.content as string} 
                      alt={`Preview of ${file.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                  </div>
                </div>
                
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded"
                  aria-label={`Remove file ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};