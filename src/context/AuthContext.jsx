import { createContext, useContext, useState, useEffect } from 'react';
import {
    loginUser,
    adminLoginApi,
    registerUser,
    getProfile,
    requestLoginOtp,
    verifyLoginOtpApi,
    verify2faApi,
    requestForgotPasswordOtpApi,
    resetPasswordWithOtpApi,
    requestSignupOtpApi,
    verifySignupOtpApi,
    resendSignupOtpApi,
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('vionara_token');
        if (token) {
            getProfile()
                .then(({ data }) => setUser(data.user))
                .catch(() => localStorage.removeItem('vionara_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { data } = await loginUser({ email, password });
        if (data.token) {
            localStorage.setItem('vionara_token', data.token);
        }
        if (data.user) {
            setUser(data.user);
        }
        return data;
    };

    const adminLogin = async (email, password) => {
        const { data } = await adminLoginApi({ email, password });
        if (data.token) {
            localStorage.setItem('vionara_token', data.token);
        }
        if (data.user) {
            setUser(data.user);
        }
        return data;
    };

    const loginWithOtp = async (email, otp) => {
        const { data } = await verifyLoginOtpApi({ email, otp });
        localStorage.setItem('vionara_token', data.token);
        setUser(data.user);
        return data;
    };

    const loginWith2fa = async (email, otp) => {
        const { data } = await verify2faApi({ email, otp });
        localStorage.setItem('vionara_token', data.token);
        setUser(data.user);
        return data;
    };

    const requestOtpForLogin = async (email) => {
        const { data } = await requestLoginOtp({ email });
        return data;
    };

    const requestForgotPasswordOtp = async (email) => {
        const { data } = await requestForgotPasswordOtpApi({ email });
        return data;
    };

    const resetPasswordWithOtp = async (email, otp, newPassword) => {
        const { data } = await resetPasswordWithOtpApi({ email, otp, newPassword });
        return data;
    };

    const requestSignupOtp = async ({ name, email, password, phone }) => {
        const { data } = await requestSignupOtpApi({ name, email, password, phone });
        return data;
    };

    const verifySignupOtp = async (email, otp) => {
        const { data } = await verifySignupOtpApi({ email, otp });
        localStorage.setItem('vionara_token', data.token);
        setUser(data.user);
        return data;
    };

    const resendSignupOtp = async (email) => {
        const { data } = await resendSignupOtpApi({ email });
        return data;
    };

    const register = async (name, email, password, phone) => {
        const { data } = await registerUser({ name, email, password, phone });
        localStorage.setItem('vionara_token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('vionara_token');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const refreshUser = async () => {
        try {
            const { data } = await getProfile();
            if (data && data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                adminLogin,
                register,
                logout,
                updateUser,
                isAdmin: user?.role === 'admin',
                showLoginModal,
                setShowLoginModal,
                loginWithOtp,
                loginWith2fa,
                requestOtpForLogin,
                requestForgotPasswordOtp,
                resetPasswordWithOtp,
                requestSignupOtp,
                verifySignupOtp,
                resendSignupOtp,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
