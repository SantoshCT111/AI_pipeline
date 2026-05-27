import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

interface FileDropZoneProps {
  onFileAccepted: (file: File) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropZone({ onFileAccepted }: FileDropZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleGenerate = () => {
    if (selectedFile) {
      onFileAccepted(selectedFile);
    }
  };

  // File selected state
  if (selectedFile) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4">
            {/* File icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50">
              <FileText size={24} className="text-red-500" />
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatFileSize(selectedFile.size)} · PDF Document
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemoveFile}
              className="flex-shrink-0 rounded-xl p-2 text-slate-400 transition-colors cursor-pointer hover:bg-red-50 hover:text-[#DC2626]"
              title="Remove file"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Generate button */}
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            className="cursor-pointer rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  // Drop zone states
  return (
    <div className="mx-auto mt-6 max-w-3xl">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 transition-all duration-200 ${
          isDragActive
            ? 'border-slate-900 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]'
            : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)]'
        }`}
      >
        <input {...getInputProps()} />

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <Upload
            size={24}
            className={`transition-colors duration-200 ${
              isDragActive ? 'text-slate-900' : 'text-slate-400'
            }`}
          />
        </div>

        <p className="mb-1 text-lg font-medium tracking-tight text-slate-900">
          {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
        </p>

        <p className="text-sm text-slate-400">
          or click to browse · PDF only · Max 10MB
        </p>
      </div>
    </div>
  );
}
