"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { UploadDropzone } from "@/components/UploadDropzone";
import { PreviewTable } from "@/components/PreviewTable";
import { DashboardResults } from "@/components/DashboardResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  
  // Preview Data
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState("AI is Processing...");
  const [results, setResults] = useState<{
    total_imported: number;
    total_skipped: number;
    successfully_parsed: any[];
    skipped_records: any[];
  } | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('csvImporterState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.step) setStep(parsed.step);
        if (parsed.headers) setHeaders(parsed.headers);
        if (parsed.previewRows) setPreviewRows(parsed.previewRows);
        if (parsed.results) setResults(parsed.results);
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save if we have some meaningful state to persist
    if (step > 1) {
      localStorage.setItem('csvImporterState', JSON.stringify({
        step,
        headers,
        previewRows,
        results
      }));
    } else {
      localStorage.removeItem('csvImporterState');
    }
  }, [step, headers, previewRows, results]);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    
    // Parse for preview
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
        }
        setPreviewRows(results.data);
        setStep(2);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to read the CSV file.");
      }
    });
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    
    setStep(3);
    setIsProcessing(true);
    setLoadingText("Connecting to LLM Engine...");
    
    // Cycle loading texts to make it look cool
    const texts = [
      "Connecting to LLM Engine...",
      "Mapping columns to CRM fields...",
      "Extracting fuzzy data...",
      "Cleaning invalid rows...",
      "Finalizing JSON payload..."
    ];
    let textIdx = 0;
    const interval = setInterval(() => {
      textIdx = (textIdx + 1) % texts.length;
      setLoadingText(texts[textIdx]);
    }, 2000);

    const formData = new FormData();
    formData.append("csv", file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process CSV");
      }

      const data = await response.json();
      setResults(data);
      setStep(4);
      toast.success(`Successfully processed ${data.total_imported} records!`);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during processing. Please check the console and ensure the backend is running.");
      setStep(2); // Go back to preview if failed
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setStep(1); 
    setFile(null); 
    setResults(null); 
    setHeaders([]); 
    setPreviewRows([]);
    localStorage.removeItem('csvImporterState');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-8 font-sans selection:bg-blue-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 pt-8 pb-4">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            GrowEasy AI CSV Importer
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Intelligently extract CRM leads from any CSV layout using cutting-edge AI.
          </p>
        </div>

        {/* Stepper UI */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full border-4 font-black transition-all duration-500 shadow-sm ${
                step >= s ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/30 scale-110" : "bg-white border-slate-200 text-slate-400"
              }`}>
                {s}
              </div>
              {s !== 4 && <div className={`w-16 h-1.5 rounded-full mx-2 transition-all duration-500 ${step > s ? "bg-blue-600 shadow-sm shadow-blue-500/20" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
            <UploadDropzone onFileUpload={handleFileUpload} />
          </div>
        )}

        {/* Step 2 & 3: Preview and Confirm */}
        {(step === 2 || step === 3) && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-neutral-800">
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Preview Data <span className="text-blue-500 font-medium text-xl">({previewRows.length} rows)</span></h2>
              <div className="space-x-4 mt-4 md:mt-0 flex">
                <button 
                  onClick={resetFlow}
                  disabled={isProcessing}
                  className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-75 transition-all active:scale-95 flex items-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {loadingText}
                    </>
                  ) : "Confirm Import"}
                </button>
              </div>
            </div>
            
            <PreviewTable headers={headers} rows={previewRows} />
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            <DashboardResults results={results} />
            <div className="mt-12 text-center">
               <button 
                  onClick={resetFlow}
                  className="px-10 py-4 bg-slate-900 text-white text-lg font-black tracking-wide rounded-2xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  Import Another File
                </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
