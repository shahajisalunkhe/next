import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        phone: { type: String, default: '' },
        otpCode: { type: String, required: true },
        otpExpiresAt: { type: Date, required: true },
        otpAttempts: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('PendingUser', pendingUserSchema);

