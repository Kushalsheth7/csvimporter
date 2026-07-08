"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion, Variants } from "framer-motion";
import { CheckCircle2, AlertCircle, Users, BarChart3, Download } from "lucide-react";
import Papa from "papaparse";

interface ResultsTableProps {
  results: {
    total_imported: number;
    total_skipped: number;
    successfully_parsed: any[];
    skipped_records: any[];
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardResults({ results }: ResultsTableProps) {
  const { total_imported, total_skipped, successfully_parsed, skipped_records } = results;

  // Aggregate Data for Charts
  const statusData = useMemo(() => {
    const counts = successfully_parsed.reduce((acc: any, row: any) => {
      const status = row.crm_status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [successfully_parsed]);

  const sourceData = useMemo(() => {
    const counts = successfully_parsed.reduce((acc: any, row: any) => {
      const source = row.data_source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [successfully_parsed]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handleDownload = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="space-y-8"
    >
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="p-6 bg-white/70 dark:bg-[#0a0a0a] backdrop-blur-xl border border-white/40 dark:border-neutral-800 shadow-xl shadow-blue-900/5 dark:shadow-none rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-blue-50/50 dark:text-blue-900/20 group-hover:scale-110 transition-transform duration-500">
             <Users size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-medium text-gray-500 dark:text-slate-400 flex items-center gap-2"><CheckCircle2 className="text-blue-500" size={20}/> Total Processed</h3>
            <p className="text-5xl font-black text-slate-800 dark:text-slate-100 mt-2 tracking-tight">{total_imported + total_skipped}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-900/20 rounded-3xl relative overflow-hidden group text-white">
          <div className="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 transition-transform duration-500">
             <CheckCircle2 size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-medium text-green-50 flex items-center gap-2"><CheckCircle2 className="text-green-200" size={20}/> Successfully Imported</h3>
            <p className="text-5xl font-black mt-2 tracking-tight">{total_imported}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 bg-white/70 dark:bg-[#0a0a0a] backdrop-blur-xl border border-red-100 dark:border-red-900/30 shadow-xl shadow-red-900/5 dark:shadow-none rounded-3xl relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 text-red-50 dark:text-red-900/20 group-hover:scale-110 transition-transform duration-500">
             <AlertCircle size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-medium text-red-400 flex items-center gap-2"><AlertCircle className="text-red-500" size={20}/> Skipped (Invalid)</h3>
            <p className="text-5xl font-black text-red-600 mt-2 tracking-tight">{total_skipped}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      {successfully_parsed.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          <div className="bg-white/80 dark:bg-[#0a0a0a] backdrop-blur-xl border border-white dark:border-neutral-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-500"/> Lead Status Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', backgroundColor: '#0f172a', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#0a0a0a] backdrop-blur-xl border border-white dark:border-neutral-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-500"/> Lead Source Analytics</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', backgroundColor: '#0f172a', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>
      )}

      {/* Imported Records Table */}
      {successfully_parsed.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <div className="flex justify-between items-center ml-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">Extracted Lead Records</h2>
            <button 
              onClick={() => handleDownload(successfully_parsed, "extracted_leads.csv")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download size={16} /> Export Valid Leads
            </button>
          </div>
          <div className="w-full overflow-hidden bg-white/60 dark:bg-[#0a0a0a] backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/80 dark:bg-[#111] sticky top-0 z-10 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Lead Details</th>
                    <th className="px-6 py-4 font-bold">Contact</th>
                    <th className="px-6 py-4 font-bold">Source</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">AI Notes</th>
                  </tr>
                </thead>
                <motion.tbody 
                  className="divide-y divide-slate-100 dark:divide-slate-800"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {successfully_parsed.map((row, idx) => (
                    <motion.tr 
                      key={idx} 
                      variants={rowVariants}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{row.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{row.company || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">{row.email || '-'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{row.mobile_without_country_code || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-wide">
                          {row.data_source || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          row.crm_status === 'GOOD_LEAD_FOLLOW_UP' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          row.crm_status === 'SALE_DONE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          row.crm_status === 'DID_NOT_CONNECT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {row.crm_status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={row.crm_note}>
                        {row.crm_note || '-'}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skipped Records Table */}
      {skipped_records.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4 pt-8">
          <div className="flex justify-between items-center ml-2">
            <h2 className="text-2xl font-black tracking-tight text-red-600 dark:text-red-500">Skipped Due To Invalid Data</h2>
            <button 
              onClick={() => handleDownload(skipped_records.map(r => ({ ...r.original_row, "Skip Reason": r.reason })), "skipped_leads_report.csv")}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
            >
              <Download size={16} /> Download Error Report
            </button>
          </div>
          <div className="w-full overflow-hidden bg-white/60 dark:bg-[#0a0a0a] backdrop-blur-md border border-red-100 dark:border-red-900/30 rounded-3xl shadow-xl shadow-red-900/5">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-red-800 dark:text-red-400 uppercase bg-red-50/80 dark:bg-[#111] sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 font-bold border-b border-red-100 dark:border-red-900/30">Reason</th>
                    <th className="px-6 py-4 font-bold border-b border-red-100 dark:border-red-900/30">Original Raw Row</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50 dark:divide-red-900/20">
                  {skipped_records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{record.reason}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-500 font-mono text-xs max-w-lg truncate">
                        {JSON.stringify(record.original_row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
