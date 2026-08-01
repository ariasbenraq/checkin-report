import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { UploadCloud, FileUp, Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploaderProps {
  onExtracted: (text: string, file: File) => void;
  onBusyChange?: (busy: boolean) => void;
  onFileSelected?: (name: string | null) => void;
}

const PdfUploader = ({ onExtracted, onBusyChange, onFileSelected }: PdfUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      onFileSelected?.(e.dataTransfer.files[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleReadPDF = async () => {
    if (!file) return;
    setLoading(true);
    onBusyChange?.(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        fullText += strings.join(" ") + "\n";
      }

      setLoading(false);
      onBusyChange?.(false);
      onExtracted(fullText, file);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-4 p-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : (
          <UploadCloud className="w-8 h-8 text-primary" />
        )}
      </div>

      <div className="text-center">
        <p className="text-body-md text-on-surface font-medium mb-1">
          {file ? file.name : "Arrastra tu archivo PDF aquí"}
        </p>
        <p className="text-body-sm text-on-surface-variant">
          {file ? "Listo para procesar" : "o haz clic para seleccionar"}
        </p>
      </div>

      <input
        id="file-upload"
        type="file"
        accept=".pdf,application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          setFile(f);
          onFileSelected?.(f?.name || null);
        }}
      />

      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md hover:bg-primary/90 transition-colors"
        >
          Seleccionar PDF
        </button>
      ) : (
        <button
          onClick={handleReadPDF}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Leyendo PDF...
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4" />
              Procesar PDF
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PdfUploader;
