import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image, AlertCircle } from 'lucide-react';
import { cn } from '../../util/cn';
import { Button } from './Button';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  files?: File[];
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({
    onFileSelect,
    onFileRemove,
    accept,
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = multiple ? 10 : 1,
    label,
    helperText,
    error,
    disabled = false,
    className,
    showPreview = true,
    files = [],
  }, ref) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string>('');

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
      }
      
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return type === fileExtension;
          }
          return fileType.match(type.replace('*', '.*'));
        });
        
        if (!isValidType) {
          return `File type not accepted. Accepted types: ${accept}`;
        }
      }
      
      return null;
    };

    const handleFiles = useCallback((newFiles: FileList | File[]) => {
      setUploadError('');
      const fileArray = Array.from(newFiles);
      
      if (!multiple && fileArray.length > 1) {
        setUploadError('Only one file is allowed');
        return;
      }
      
      if (files.length + fileArray.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      const validFiles: File[] = [];
      
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError(validationError);
          return;
        }
        validFiles.push(file);
      }
      
      onFileSelect(validFiles);
    }, [files.length, maxFiles, multiple, onFileSelect, maxSize, accept]);

    const handleDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (disabled) return;
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    }, [disabled, handleFiles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    };

    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) {
        return <Image size={20} className="text-blue-500" />;
      }
      return <File size={20} className="text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const displayError = error || uploadError;

    return (
      <div className={cn('w-full', className)} ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200',
            dragActive
              ? 'border-sage-400 bg-sage-50'
              : displayError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="text-center">
            <Upload className={cn(
              'mx-auto h-12 w-12 mb-4',
              displayError ? 'text-red-400' : 'text-gray-400'
            )} />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-sage-600 hover:text-sage-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            {accept && (
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: {accept}
              </p>
            )}
            {maxSize && (
              <p className="text-xs text-gray-500">
                Max file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            )}
          </div>
        </div>

        {displayError && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertCircle size={16} className="mr-1" />
            {displayError}
          </div>
        )}

        {helperText && !displayError && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}

        {/* File Preview */}
        {showPreview && files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {onFileRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileRemove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export { FileUpload };