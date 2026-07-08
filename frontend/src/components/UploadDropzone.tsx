"use client";

import React, { useCallback, useState, useRef } from "react";

export function UploadDropzone({ onFileUpload }: { onFileUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          onFileUpload(file);
        } else {
          setError("Please upload a valid CSV file.");
        }
      }
    },
    [onFileUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        onFileUpload(file);
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors backdrop-blur-xl ${
          isDragging 
            ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20" 
            : "border-gray-300 bg-white dark:border-neutral-800 dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-full shadow-sm">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-slate-200">Drop your CSV file here</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">or click to browse files</p>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
    </div>
  );
}
