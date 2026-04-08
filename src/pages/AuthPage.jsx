import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } ;
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineHeart, HiOutlineGift } from 'react-icons/hi';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [otpStep, setOtpStep] = useState(false);
    
    const {
        login,
        loginWith2fa,
        requestForgotPasswordOtp,
        resetPasswordWithOtp,
        requestSignupOtp,
        verifySignupOtp,
        resendSignupOtp,
    } = useAuth();
    
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    
    const [is2faStep, setIs2faStep] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'verify'
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ── 6-box OTP handlers ────────────────────────────────────────────────────
    const handleOtpDigitChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1); // only last digit
        const next = [...otpDigits];
        next[idx] = val;
        setOtpDigits(next);
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            if (otpDigits[idx]) {
                const next = [...otpDigits];
                next[idx] = '';
                setOtpDigits(next);
            } else if (idx > 0) {
                otpRefs.current[idx - 1]?.focus();
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = ['', '', '', '', '', ''];
        pasted.split('').forEach((ch, i) => { next[i] = ch; });
        setOtpDigits(next);
        const focusIdx = Math.min(pasted.length, 5);
        otpRefs.current[focusIdx]?.focus();
    };

    useEffect(() => {
        setIsForgotPassword(false);
        setForgotStep('request');
        setForgotOtp('');
        setNewPassword('');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpStep(false);
        setIs2faStep(false);
        setResendCountdown(0);
    }, [isLogin]);

    // Start 30-second countdown when OTP step becomes active
    useEffect(() => {
        if (!otpStep && !is2faStep) return;
        setResendCountdown(30);
        const timer = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return () => clearInterval(timer);
    }, [otpStep, is2faStep]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                if (is2faStep) {
                    await loginWith2fa(form.email, otpDigits.join(''));
                    toast.success('Logged in successfully');
                } else {
                    const res = await login(form.email, form.password);
                    if (res.twoFactorRequired) {
                        setIs2faStep(true);
                        toast.success('Please verify the code sent to your email');
                        setLoading(false);
                        return;
                    }
                    toast.success('Welcome back!');
                }
            } else {
                if (!otpStep) {
                    await requestSignupOtp({
                        name: form.name,
                        email: form.email,
                        password: form.password,
                        phone: form.phone,
                    });
                    setOtpStep(true);
                    toast.success('OTP sent to your email');
                    setLoading(false);
                    return;
                } else {
                    await verifySignupOtp(form.email, otpDigits.join(''));
                    toast.success('Account created! Welcome to Vionara 🎉');
                }
            }
            router.push('/');
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (forgotStep === 'request') {
                const data = await requestForgotPasswordOtp(form.email);
                toast.success(data?.message || 'OTP sent to your email');
                setForgotStep('verify');
            } else {
                const data = await resetPasswordWithOtp(form.email, forgotOtp, newPassword);
                toast.success(data?.message || 'Password updated. You can now log in.');
                setIsForgotPassword(false);
                setForgotStep('request');
                setForgotOtp('');
                setNewPassword('');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 lg:p-12 font-body relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#C9A34E 0.5px, transparent 0.5px)', backgroundSize: '40px 40px', backgroundPosition: 'center', backgroundOpacity: 0.1 }}>
            
            {/* Background Decorative Blur overlay to soften the dots */}
            <div className="absolute inset-0 bg-[#FDFDFD]/90 backdrop-blur-sm"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-gray-100 min-h-[600px]"
            >
                {/* ─── LEFT SIDE: Promotional Branding ─── */}
                <div className="hidden md:flex flex-col justify-center w-[45%] bg-[#FDFBF7] p-12 relative overflow-hidden border-r border-[#F0EBE1]">
                    <div className="relative z-10">
                        <Link href="/" className="inline-block mb-12">
                            <h1 className="font-heading text-2xl font-semibold tracking-[0.18em] text-[#121212]">
                                VIONARA
                            </h1>
                        </Link>
                        
                        <h2 className="text-[#C9A34E] font-heading text-4xl mb-4 leading-[1.15] font-medium tracking-tight">
                            Get ₹500 OFF <br />
                            <span className="text-[#121212]">on your first order</span>
                        </h2>
                        
                        <p className="text-gray-500 text-sm mb-10 leading-relaxed max-w-sm">
                            Join the Vionara family and unlock exclusive privileges designed just for you.
                        </p>
                        
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 w-8 h-8 rounded-full bg-[#FCF8EE] flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                    <HiOutlineSparkles size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-[#121212]">Exclusive Offers</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Get early access to our latest collections and special member-only discounts.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 w-8 h-8 rounded-full bg-[#FCF8EE] flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                    <HiOutlineHeart size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-[#121212]">Wishlist Access</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Save your favorite pieces and track them across all your devices.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 w-8 h-8 rounded-full bg-[#FCF8EE] flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                    <HiOutlineGift size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-[#121212]">Personalized Shopping</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Enjoy tailored recommendations and a seamless checkout experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT SIDE: Authentication Form ─── */}
                <div className="w-full md:w-[55%] p-8 sm:p-12 md:p-14 lg:p-16 flex flex-col justify-center">
                    
                    {/* Mobile Logo Only */}
                    <div className="md:hidden text-center mb-10">
                        <Link href="/">
                            <h1 className="font-heading text-3xl font-semibold tracking-[0.18em] text-[#121212]">VIONARA</h1>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-[26px] font-heading font-medium text-[#121212] mb-1">Welcome to Vionara</h2>
                        <p className="text-[13px] text-gray-500">
                            {isLogin ? 'Login to continue your jewellery journey.' : 'Create an account to track orders and save your details.'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={otpStep || is2faStep ? 'otp' : isForgotPassword ? 'forgot' : 'auth'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* ═══════ OTP VERIFICATION SCREEN ════════ */}
                            {(!isLogin && otpStep) || (isLogin && is2faStep) ? (
                                <div className="space-y-6">
                                    <div className="bg-[#FCF8EE] p-4 rounded-xl border border-[#F5EAD4] mb-2 text-center">
                                        <p className="text-sm font-medium text-[#C9A34E]">Verify Your Email</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Enter the 6-digit code sent to <br/><span className="font-semibold text-[#121212]">{form.email}</span>
                                        </p>
                                    </div>

                                    {/* 6 digit boxes */}
                                    <div className="flex justify-between gap-1 sm:gap-2">
                                        {otpDigits.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                ref={el => otpRefs.current[idx] = el}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpDigitChange(e, idx)}
                                                onKeyDown={e => handleOtpKeyDown(e, idx)}
                                                onPaste={idx === 0 ? handleOtpPaste : undefined}
                                                className={`w-10 sm:w-12 h-12 sm:h-14 border rounded-xl text-center text-xl font-medium outline-none transition-all
                                                    ${digit ? 'border-[#C9A34E] text-[#121212] bg-[#FCF8EE]/50' : 'border-gray-200 text-gray-400 bg-gray-50/50'}
                                                    focus:border-[#C9A34E] focus:bg-white focus:ring-4 focus:ring-[#C9A34E]/10`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={loading || otpDigits.join('').length < 6}
                                        onClick={handleSubmit}
                                        className="w-full bg-[#121212] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                    >
                                        {loading ? 'Verifying...' : is2faStep ? 'Verify & Login' : 'Verify OTP & Create Account'}
                                    </button>

                                    {/* Resend row */}
                                    <div className="flex items-center justify-between mt-6">
                                        <p className="text-[13px] text-gray-500">
                                            {resendCountdown > 0
                                                ? `Resend available in ${resendCountdown}s`
                                                : "Didn't receive the code?"}
                                        </p>
                                        <button
                                            type="button"
                                            disabled={resendCountdown > 0 || resendLoading}
                                            onClick={async () => {
                                                setResendLoading(true);
                                                try {
                                                    if (is2faStep) {
                                                        await login(form.email, form.password);
                                                        toast.success('New code sent to your email');
                                                    } else {
                                                        await resendSignupOtp(form.email);
                                                        toast.success('OTP resent to your email');
                                                    }
                                                    setResendCountdown(30);
                                                    setOtpDigits(['', '', '', '', '', '']);
                                                    setTimeout(() => otpRefs.current[0]?.focus(), 50);
                                                } catch (error) {
                                                    toast.error(error.response?.data?.message || 'Failed to resend OTP');
                                                } finally {
                                                    setResendLoading(false);
                                                }
                                            }}
                                            className={`text-[13px] font-medium transition-colors ${
                                                resendCountdown > 0 || resendLoading
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-[#C9A34E] hover:text-[#A37E22] cursor-pointer'
                                            }`}
                                        >
                                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (is2faStep) setIs2faStep(false);
                                            else setOtpStep(false);
                                            setOtpDigits(['', '', '', '', '', '']);
                                        }}
                                        className="w-full text-center text-[13px] text-gray-500 hover:text-[#121212] mt-4 font-medium transition-colors"
                                    >
                                        ← Back to {is2faStep ? 'login' : 'sign up'}
                                    </button>
                                </div>
                            ) : (

                            /* ═══════ NORMAL LOGIN / SIGNUP FORM ════════════════════ */
                            <>
                                {/* Top Tabs */}
                                {!isForgotPassword && (
                                    <div className="flex mb-8 bg-gray-50 rounded-lg p-1">
                                        <button 
                                            onClick={() => setIsLogin(true)} 
                                            className={`flex-1 py-2.5 text-[13px] font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow-sm text-[#121212]' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            LOGIN
                                        </button>
                                        <button 
                                            onClick={() => setIsLogin(false)} 
                                            className={`flex-1 py-2.5 text-[13px] font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow-sm text-[#121212]' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            SIGN UP
                                        </button>
                                    </div>
                                )}

                                {!isForgotPassword ? (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {!isLogin && (
                                            <div>
                                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                                <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white" placeholder="John Doe" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                                            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white" placeholder="you@example.com" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">Password</label>
                                                {isLogin && (
                                                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[12px] font-medium text-[#C9A34E] hover:text-[#A37E22] transition-colors">
                                                        Forgot password?
                                                    </button>
                                                )}
                                            </div>
                                            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white" placeholder="••••••••" />
                                        </div>
                                        
                                        <button type="submit" disabled={loading} className="w-full bg-[#121212] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.15)]">
                                            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                                        </button>
                                        
                                        {/* Security text */}
                                        <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
                                            By continuing, you agree to Vionara's <br/>
                                            <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                                        </p>
                                    </form>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-5">
                                        
                                        <div className="bg-[#FCF8EE] p-4 rounded-xl border border-[#F5EAD4] mb-4">
                                            <h3 className="text-sm font-medium text-[#C9A34E] mb-1">Reset Password</h3>
                                            <p className="text-xs text-gray-600">
                                                {forgotStep === 'request' 
                                                    ? 'Enter your email address and we will send you a 6-digit code to reset your password.' 
                                                    : 'Enter the 6-digit OTP sent to your email and your new password below.'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                                            <input name="email" type="email" value={form.email} onChange={handleChange} required disabled={forgotStep === 'verify'} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed" placeholder="you@example.com" />
                                        </div>

                                        {forgotStep === 'verify' && (
                                            <>
                                                <div>
                                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">6-Digit OTP</label>
                                                    <input name="forgotOtp" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white tracking-[0.2em] font-medium" placeholder="------" />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">New Password</label>
                                                    <input name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white" placeholder="••••••••" />
                                                </div>
                                            </>
                                        )}

                                        <button type="submit" disabled={loading} className="w-full bg-[#121212] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                            {loading ? 'Please wait...' : forgotStep === 'verify' ? 'Confirm Reset Password' : 'Send Reset Code'}
                                        </button>

                                        <button type="button" onClick={() => { setIsForgotPassword(false); setForgotOtp(''); setNewPassword(''); }} className="w-full text-center text-[13px] text-gray-500 hover:text-[#121212] mt-4 font-medium transition-colors">
                                            ← Back to login
                                        </button>
                                    </form>
                                )}
                            </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
