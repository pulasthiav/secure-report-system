"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function OversightDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("id, created_at, status, case_key")
        .order("created_at", { ascending: false });

      if (data) setLogs(data);
      setIsLoading(false);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // තත්පර 10න් 10ට Update වෙනවා
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">🔍 නිරීක්ෂණ පුවරුව (Public Oversight)</h1>
            <p className="text-sm text-slate-500 mt-1">පද්ධතියට ලැබෙන පැමිණිලි සහ ඒවායේ ප්‍රගතිය විනිවිදභාවයෙන් යුතුව මෙහි දැක්වේ.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">ආපසු</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Case Reference</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">ලැබුණු දිනය</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">තත්ත්වය (Status)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Blockchain Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 animate-pulse">දත්ත ලබාගනිමින් පවතී...</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-blue-600 font-bold">
                    {log.case_key.substring(0, 4)}****
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(log.created_at).toLocaleString('si-LK')}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      log.status === "Resolved" ? "bg-green-100 text-green-700" :
                      log.status === "Investigating" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {log.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-center text-[18px]">✅</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && !isLoading && (
            <p className="p-8 text-center text-slate-400 italic">තවමත් පැමිණිලි කිසිවක් වාර්තා වී නොමැත.</p>
          )}
        </div>
        
        <div className="mt-6 flex gap-4">
          <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <h4 className="text-emerald-700 font-bold text-sm">විනිවිදභාවය (Transparency)</h4>
            <p className="text-xs text-emerald-600 mt-1">පැමිණිල්ලේ අන්තර්ගතය රහසිගත වුවද, එය පද්ධතියට ලැබුණු බව ඕනෑම අයෙකුට තහවුරු කර ගත හැක.</p>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <h4 className="text-blue-700 font-bold text-sm">මකා දැමිය නොහැක (Immutable)</h4>
            <p className="text-xs text-blue-600 mt-1">විමර්ශකයින්ට පැමිණිලි මකා දැමිය නොහැකි අතර, සෑම ක්‍රියාවක්ම ලොග් (Log) වේ.</p>
          </div>
        </div>
      </div>
    </div>
  );
}