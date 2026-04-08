import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        
        const query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;

        const products = await Product.find(query).sort('-createdAt');
        
        // Ensure property strictly matches what frontend maps (res.data.products instead of res.data.data)
        return NextResponse.json({ success: true, count: products.length, products: products });
    } catch (error) {
        console.error("SERVER API OVERWRITE ERROR (products):", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        
        // Emulating 'admin' middleware protection 
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const data = await req.json();
        const product = await Product.create(data);

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
