'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Future auth logic
    console.log(isLogin ? "Login" : "Signup", { email, password });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 lg:p-12 font-body relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#C9A34E 0.5px, transparent 0.5px)', backgroundSize: '40px 40px', backgroundPosition: 'center', backgroundOpacity: 0.1 }}>
        <div className="absolute inset-0 bg-[#FDFDFD]/90 backdrop-blur-sm"></div>

        <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] relative z-10 border border-gray-100">
            <div className="text-center mb-10">
                <Link href="/">
                    <h1 className="font-heading text-3xl font-semibold tracking-[0.18em] text-[#121212]">VIONARA</h1>
                </Link>
            </div>

            <div className="flex mb-8 bg-gray-50 rounded-lg p-1">
                <button 
                    type="button"
                    onClick={() => setIsLogin(true)} 
                    className={`flex-1 py-2.5 text-[13px] font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow-sm text-[#121212]' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    LOGIN
                </button>
                <button 
                    type="button"
                    onClick={() => setIsLogin(false)} 
                    className={`flex-1 py-2.5 text-[13px] font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow-sm text-[#121212]' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    SIGN UP
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                    <input 
                        name="email" 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white" 
                        placeholder="you@example.com" 
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">Password</label>
                        {isLogin && (
                            <Link href="/auth/forgot-password" className="text-[12px] font-medium text-[#C9A34E] hover:text-[#A37E22] transition-colors">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <input 
                        name="password" 
                        type="password" 
                        required 
                        minLength={6} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white" 
                        placeholder="••••••••" 
                    />
                </div>
                
                <button type="submit" className="w-full bg-[#121212] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-all mt-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] cursor-pointer">
                    {isLogin ? 'Sign In' : 'Create Account'}
                </button>
                
                <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
                    By continuing, you agree to Vionara's <br/>
                    <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                </p>
            </form>
        </div>
    </div>
  );
}
