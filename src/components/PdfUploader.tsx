import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

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
      onExtracted(fullText, file);
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
  const loadDemoPDF = async () => {
    const pdfUrl = '/src/assets/test-analisis.pdf';
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const demoFile = new File([blob], 'test-analisis.pdf', { type: 'application/pdf' });
    
    setFile(demoFile);
    onFileSelected?.('test-analisis.pdf');
  };
  loadDemoPDF();
}, []);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 transition-all duration-300">
      <label
        htmlFor="file-upload"
        // onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer text-center hover:bg-blue-50 transition-colors"
      >
        <span className="material-symbols-outlined text-5xl text-blue-500 mb-2">
          upload_file
        </span>
        <p className="text-gray-600">
          Arrastra tu archivo PDF aquí o haz clic para seleccionar
        </p>
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
      </label>

      {file && (
        <div className="text-center text-sm text-gray-700">
          <strong>Archivo seleccionado:</strong> {file.name}
        </div>
      )}

      <button
        onClick={handleReadPDF}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded font-bold transition-colors ${
          file && !loading
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        {loading ? "Leyendo PDF..." : "Procesar PDF"}
      </button>
    </div>
  );
};

export default PdfUploader;
