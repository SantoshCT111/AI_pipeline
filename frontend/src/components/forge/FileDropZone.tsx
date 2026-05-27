import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    if (acceptedFiles.length > 0) setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (selectedFile) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10">
            <FileText size={22} className="text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)} · PDF</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} aria-label="Remove file">
            <X size={18} />
          </Button>
        </div>
        <Button onClick={() => onFileAccepted(selectedFile)}>Generate quiz</Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <input {...getInputProps()} />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
        <Upload size={22} className="text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground">
        {isDragActive ? 'Drop your PDF here' : 'Drag and drop a PDF'}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">or click to browse · max 10MB</p>
    </div>
  );
}
