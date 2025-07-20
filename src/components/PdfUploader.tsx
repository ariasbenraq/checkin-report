import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploaderProps {
  onExtracted: (text: string) => void;
}

const PdfUploader = ({ onExtracted }: PdfUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleReadPDF = async () => {
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async function () {
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
      onExtracted(fullText);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md space-y-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="file:px-4 file:py-2 file:border-0 file:rounded-full file:bg-blue-600 file:text-white cursor-pointer"
      />
      <button
        onClick={handleReadPDF}
        disabled={!file}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Leyendo..." : "Leer PDF"}
      </button>
    </div>
  );
};

export default PdfUploader;
