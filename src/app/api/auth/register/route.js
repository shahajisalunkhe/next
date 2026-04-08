import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

export async function POST(req) {
    try {
        await connectDB();
        const { name, email, password, phone } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
        }

        const user = await User.create({ name, email, password, phone });
        const token = generateToken(user._id);

        return NextResponse.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
