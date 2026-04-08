import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { HiX, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose }) => {
    const {
        login,
        loginWith2fa,
        requestForgotPasswordOtp,
        resetPasswordWithOtp,
        requestSignupOtp,
        verifySignupOtp,
        resendSignupOtp,
    } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [otpStep, setOtpStep] = useState(false);
    const [is2faStep, setIs2faStep] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState('request');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsLogin(true);
            setOtpStep(false);
            setIs2faStep(false);
            setIsForgotPassword(false);
            setForgotStep('request');
            setForgotOtp('');
            setNewPassword('');
            setForm({ name: '', email: '', password: '', phone: '' });
            setOtpDigits(['', '', '', '', '', '']);
            setResendCountdown(0);
        }
    }, [isOpen]);

    // Reset forgot password state when switching tabs
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

    // OTP countdown timer
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

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleOtpDigitChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
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
            onClose();
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

    const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white";
    const labelClass = "text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block";
    const btnPrimary = "w-full bg-[#121212] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Dark overlay with blur */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            id="login-modal-close"
                        >
                            <HiX size={16} className="text-gray-500" />
                        </button>

                        {/* Header */}
                        <div className="bg-[#FDFBF7] border-b border-[#F0EBE1] px-8 pt-8 pb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-full bg-[#FCF8EE] flex items-center justify-center text-[#C9A34E]">
                                    <HiOutlineSparkles size={14} />
                                </div>
                                <h2 className="font-heading text-lg font-medium text-[#121212]">
                                    VIONARA
                                </h2>
                            </div>
                            <p className="text-[13px] text-gray-500">
                                {isLogin
                                    ? 'Sign in to continue your jewellery journey.'
                                    : 'Create an account to get started.'}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={otpStep || is2faStep ? 'otp' : isForgotPassword ? 'forgot' : `auth-${isLogin}`}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {/* ═══ OTP VERIFICATION ═══ */}
                                    {(!isLogin && otpStep) || (isLogin && is2faStep) ? (
                                        <div className="space-y-5">
                                            <div className="bg-[#FCF8EE] p-4 rounded-xl border border-[#F5EAD4] text-center">
                                                <p className="text-sm font-medium text-[#C9A34E]">Verify Your Email</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Enter the 6-digit code sent to<br />
                                                    <span className="font-semibold text-[#121212]">{form.email}</span>
                                                </p>
                                            </div>

                                            <div className="flex justify-between gap-1.5">
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
                                                        className={`w-10 h-12 border rounded-xl text-center text-xl font-medium outline-none transition-all
                                                            ${digit ? 'border-[#C9A34E] text-[#121212] bg-[#FCF8EE]/50' : 'border-gray-200 text-gray-400 bg-gray-50/50'}
                                                            focus:border-[#C9A34E] focus:bg-white focus:ring-4 focus:ring-[#C9A34E]/10`}
                                                    />
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={loading || otpDigits.join('').length < 6}
                                                onClick={handleSubmit}
                                                className={btnPrimary}
                                            >
                                                {loading ? 'Verifying...' : is2faStep ? 'Verify & Login' : 'Verify OTP & Create Account'}
                                            </button>

                                            <div className="flex items-center justify-between">
                                                <p className="text-[12px] text-gray-500">
                                                    {resendCountdown > 0
                                                        ? `Resend in ${resendCountdown}s`
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
                                                                toast.success('New code sent');
                                                            } else {
                                                                await resendSignupOtp(form.email);
                                                                toast.success('OTP resent');
                                                            }
                                                            setResendCountdown(30);
                                                            setOtpDigits(['', '', '', '', '', '']);
                                                            setTimeout(() => otpRefs.current[0]?.focus(), 50);
                                                        } catch (error) {
                                                            toast.error(error.response?.data?.message || 'Failed to resend');
                                                        } finally {
                                                            setResendLoading(false);
                                                        }
                                                    }}
                                                    className={`text-[12px] font-medium transition-colors ${
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
                                                className="w-full text-center text-[12px] text-gray-500 hover:text-[#121212] font-medium transition-colors"
                                            >
                                                ← Back to {is2faStep ? 'login' : 'sign up'}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* ═══ LOGIN/SIGNUP TABS ═══ */}
                                            {!isForgotPassword && (
                                                <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
                                                    <button
                                                        onClick={() => setIsLogin(true)}
                                                        className={`flex-1 py-2.5 text-[12px] font-medium rounded-md transition-all ${
                                                            isLogin ? 'bg-white shadow-sm text-[#121212]' : 'text-gray-500 hover:text-gray-800'
                                                        }`}
                                                    >
                                                        LOGIN
                                                    </button>
                                                    <button
                                                        onClick={() => setIsLogin(false)}
                                                        className={`flex-1 py-2.5 text-[12px] font-medium rounded-md transition-all ${
                                                            !isLogin ? 'bg-white shadow-sm text-[#121212]' : 'text-gray-500 hover:text-gray-800'
                                                        }`}
                                                    >
                                                        SIGN UP
                                                    </button>
                                                </div>
                                            )}

                                            {!isForgotPassword ? (
                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    {!isLogin && (
                                                        <div>
                                                            <label className={labelClass}>Full Name</label>
                                                            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="John Doe" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className={labelClass}>Email Address</label>
                                                        <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="you@example.com" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">Password</label>
                                                            {isLogin && (
                                                                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[11px] font-medium text-[#C9A34E] hover:text-[#A37E22] transition-colors">
                                                                    Forgot password?
                                                                </button>
                                                            )}
                                                        </div>
                                                        <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className={inputClass} placeholder="••••••••" />
                                                    </div>

                                                    <button type="submit" disabled={loading} className={btnPrimary}>
                                                        {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                                                    </button>

                                                    <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                                                        By continuing, you agree to Vionara's{' '}
                                                        <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
                                                        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                                                    </p>
                                                </form>
                                            ) : (
                                                /* ═══ FORGOT PASSWORD ═══ */
                                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                                    <div className="bg-[#FCF8EE] p-3 rounded-xl border border-[#F5EAD4] mb-2">
                                                        <h3 className="text-sm font-medium text-[#C9A34E] mb-1">Reset Password</h3>
                                                        <p className="text-xs text-gray-600">
                                                            {forgotStep === 'request'
                                                                ? 'Enter your email to receive a reset code.'
                                                                : 'Enter the OTP and your new password.'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className={labelClass}>Email Address</label>
                                                        <input name="email" type="email" value={form.email} onChange={handleChange} required disabled={forgotStep === 'verify'} className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`} placeholder="you@example.com" />
                                                    </div>

                                                    {forgotStep === 'verify' && (
                                                        <>
                                                            <div>
                                                                <label className={labelClass}>6-Digit OTP</label>
                                                                <input value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} required className={`${inputClass} tracking-[0.2em] font-medium`} placeholder="------" />
                                                            </div>
                                                            <div>
                                                                <label className={labelClass}>New Password</label>
                                                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="••••••••" />
                                                            </div>
                                                        </>
                                                    )}

                                                    <button type="submit" disabled={loading} className={btnPrimary}>
                                                        {loading ? 'Please wait...' : forgotStep === 'verify' ? 'Confirm Reset' : 'Send Reset Code'}
                                                    </button>

                                                    <button type="button" onClick={() => { setIsForgotPassword(false); setForgotOtp(''); setNewPassword(''); }} className="w-full text-center text-[12px] text-gray-500 hover:text-[#121212] mt-2 font-medium transition-colors">
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
