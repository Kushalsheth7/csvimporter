"use client";

import React from "react";

interface ResultsTableProps {
  results: {
    total_imported: number;
    total_skipped: number;
    successfully_parsed: any[];
    skipped_records: any[];
  };
}

export function ResultsTable({ results }: ResultsTableProps) {
  const { total_imported, total_skipped, successfully_parsed, skipped_records } = results;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm text-center">
          <h3 className="text-xl font-semibold text-green-800">Successfully Imported</h3>
          <p className="text-4xl font-extrabold text-green-600 mt-2">{total_imported}</p>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm text-center">
          <h3 className="text-xl font-semibold text-red-800">Skipped (Invalid/Failed)</h3>
          <p className="text-4xl font-extrabold text-red-600 mt-2">{total_skipped}</p>
        </div>
      </div>

      {/* Imported Records */}
      {successfully_parsed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Successfully Parsed Records (AI Extracted)</h2>
          <div className="w-full overflow-hidden border rounded-xl shadow-sm">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 border-b">Name</th>
                    <th className="px-4 py-3 border-b">Email</th>
                    <th className="px-4 py-3 border-b">Mobile</th>
                    <th className="px-4 py-3 border-b">Source</th>
                    <th className="px-4 py-3 border-b">Status</th>
                    <th className="px-4 py-3 border-b">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {successfully_parsed.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.name || '-'}</td>
                      <td className="px-4 py-3 text-blue-600">{row.email || '-'}</td>
                      <td className="px-4 py-3">{row.mobile_without_country_code || '-'}</td>
                      <td className="px-4 py-3 text-purple-600 font-semibold">{row.data_source || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          {row.crm_status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={row.crm_note}>
                        {row.crm_note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Skipped Records */}
      {skipped_records.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold text-red-600">Skipped Records</h2>
          <div className="w-full overflow-hidden border border-red-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-red-800 uppercase bg-red-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 border-b border-red-200">Reason</th>
                    <th className="px-4 py-3 border-b border-red-200">Original Row Data</th>
                  </tr>
                </thead>
                <tbody>
                  {skipped_records.map((record, idx) => (
                    <tr key={idx} className="bg-white border-b border-red-100 hover:bg-red-50/50">
                      <td className="px-4 py-3 text-red-600 font-semibold">{record.reason}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-lg truncate">
                        {JSON.stringify(record.original_row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
