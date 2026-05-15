"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Supabase සම්බන්ධ කිරීම
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckStatus() {
  const [caseKey, setCaseKey] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newReply, setNewReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 👇 ලස්සන Popup එක (Toast) සඳහා අලුත් State එක 👇
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Popup එක පෙන්නලා තත්පර 3කින් මකන Function එක
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // තත්පර 3ක් තියෙයි
  };

  // Auto-Refresh (Live Update)
  useEffect(() => {
    let interval: any;
    if (complaint && caseKey) {
      interval = setInterval(async () => {
        const { data, error } = await supabase
          .from("complaints")
          .select("*")
          .eq("case_key", caseKey.trim().toUpperCase())
          .single();

        if (data && !error) {
          setComplaint(data);
        }
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [complaint, caseKey]);

  // විමර්ශකයාට ආපහු reply එකක් යැවීම
  const sendReply = async () => {
    if (!newReply.trim()) return;
    setIsSending(true);

    try {
      const { error } = await supabase
        .from("complaints")
        .update({ reporter_reply: newReply })
        .eq("id", complaint.id);

      if (error) throw error;

      // සාමාන්‍ය Alert එක වෙනුවට අලුත් Popup එක
      showToast("ඔබේ පණිවිඩය සාර්ථකව යොමු කෙරුණා!", "success");

      setComplaint({ ...complaint, reporter_reply: newReply });
      setNewReply("");
    } catch (err: any) {
      // Error එක ආවත් ලස්සන Popup එකෙන් පෙන්වයි
      showToast("පණිවිඩය යැවීමට නොහැකි විය!", "error");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("complaints")
        .select("*")
        .eq("case_key", caseKey.trim().toUpperCase())
        .single();

      if (fetchError || !data) {
        throw new Error(
          "ඔබ ඇතුළත් කළ Case Key අංකය වැරදියි හෝ පැමිණිල්ලක් සොයාගත නොහැක.",
        );
      }

      setComplaint(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
      {/* 👇 උඩින් මතුවෙන ලස්සන Toast Notification එක 👇 */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in transition-all duration-300">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full text-white">
                ✓
              </span>
            ) : (
              <span className="flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-white">
                ✕
              </span>
            )}
            {toast.message}
          </div>
        </div>
      )}
      {/* 👆 Toast එක අවසන් 👆 */}

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          පැමිණිල්ලේ තත්ත්වය
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          ඔබගේ රහස්‍ය Case Key අංකය ඇතුළත් කර විමර්ශන තත්ත්වය දැනගන්න.
        </p>

        <form onSubmit={handleCheckStatus} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={caseKey}
              onChange={(e) => setCaseKey(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-700 text-center font-mono text-xl uppercase tracking-widest"
              placeholder="CASE KEY"
              maxLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !caseKey.trim()}
            className={`w-full py-3 px-4 rounded-xl text-white font-bold shadow-md transition-all ${
              isLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 active:scale-95"
            }`}
          >
            {isLoading ? "සොයමින් පවතී..." : "තත්ත්වය පරීක්ෂා කරන්න"}
          </button>
        </form>

        {error && (
          <div className="mt-6 text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {complaint && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                වත්මන් තත්ත්වය
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  complaint.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : complaint.status === "Investigating"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {complaint.status || "Pending (සමාලෝචනය වෙමින් පවතී)"}
              </span>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                විමර්ශකයන්ගේ පණිවිඩය
              </h3>
              <p className="text-sm text-slate-700 font-medium">
                {complaint.investigator_reply ||
                  "තවමත් විමර්ශකයන්ගෙන් පණිවිඩයක් ලැබී නොමැත."}
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                ඔබගේ මුල් පැමිණිල්ල
              </h3>
              <div className="text-sm text-slate-600 italic">
                {complaint.description.includes("BEGIN PGP MESSAGE") ? (
                  <span className="text-emerald-600 font-semibold flex items-start text-left">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    මෙම දත්ත PGP තාක්ෂණයෙන් ආරක්ෂිතව සංකේතනය (Encrypt) කර ඇත.
                    මෙය කියවිය හැක්කේ විමර්ශකයින්ට පමණි.
                  </span>
                ) : (
                  `"${complaint.description}"`
                )}
              </div>
            </div>

            {/* Reply Box */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <p className="text-sm font-bold text-slate-600">
                විමර්ශකයාට පිළිතුරක් යවන්න:
              </p>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="ඔබේ පණිවිඩය මෙතැන ටයිප් කරන්න..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm h-24 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendReply}
                disabled={isSending || !newReply.trim()}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all disabled:bg-slate-400"
              >
                {isSending ? "යවමින් පවතී..." : "පණිවිඩය යවන්න"}
              </button>

              {complaint.reporter_reply && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase mb-1">
                    ✓ ඔබ යැවූ අවසන් පිළිතුර:
                  </p>
                  <p className="text-sm text-emerald-800">
                    {complaint.reporter_reply}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            ආපසු ප්‍රධාන පිටුවට
          </Link>
        </div>
      </div>
    </div>
  );
}
