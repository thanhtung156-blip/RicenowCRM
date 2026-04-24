"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password: "local", // dummy
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (err) {
      setError("Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100">
          <div className="p-10 text-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
            <h1 className="text-3xl font-black mb-2">Ricenow CRM</h1>
            <p className="text-indigo-100 text-sm">Hệ thống quản lý suất ăn công nghiệp</p>
          </div>

          <div className="p-10 space-y-8">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center space-x-3 py-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 font-bold text-slate-700"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>Đăng nhập với Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Hoặc Local Access</span>
              </div>
            </div>

            <form onSubmit={handleLocalSignIn} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email nội bộ</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@local.test"
                    className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? "Đang xử lý..." : "Vào hệ thống"}</span>
              </button>
            </form>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          Chưa cấu hình Google API? Sử dụng email bất kỳ để trải nghiệm bản Demo Local.
        </p>
      </div>
    </div>
  );
}
