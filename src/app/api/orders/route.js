import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req) {
    try {
        await connectDB();
        
        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        // Return user's orders
        const orders = await Order.find({ user: user._id }).sort('-createdAt');
        
        return NextResponse.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const orderData = await req.json();
        orderData.user = user._id; // Force attach current user
        
        const order = await Order.create(orderData);

        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
