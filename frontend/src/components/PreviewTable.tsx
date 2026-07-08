"use client";

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface PreviewTableProps {
  headers: string[];
  rows: any[];
}

export function PreviewTable({ headers, rows }: PreviewTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  if (!headers.length) return null;

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
      <div 
        ref={parentRef} 
        className="w-full overflow-auto max-h-[500px] custom-scrollbar"
      >
        <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-[#111] sticky top-0 z-20">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 font-bold border-b border-slate-200 dark:border-neutral-800">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="divide-y divide-slate-100 dark:divide-neutral-800 relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={virtualRow.index}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {headers.map((h, i) => (
                    <td key={i} className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {row[h] || "-"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
