import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

export async function POST(req) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ success: false, message: 'Incorrect email or password' }, { status: 401 });
        }

        // OTP Temporarily Disabled!
        const token = generateToken(user._id);

        return NextResponse.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar }
        });
    } catch (error) {
        console.error("❌ [API Log] LOGIN FATAL CRASH:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
