// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma"; // <-- Use shared instance
import bcrypt from "bcryptjs";
import type { User } from '@prisma/client';

// Define response types
type RegisterSuccessResponse = {
    message: string;
    user: Omit<User, 'password'>; // Exclude password
};

type RegisterErrorResponse = {
    message: string;
};

type ResponseData = RegisterSuccessResponse | RegisterErrorResponse;

// Consider moving this to an environment variable
const BCRYPT_SALT_ROUNDS = 10;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== "POST") {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { email, password, name } = req.body;

    // 1. Input Validation
    if (!email || typeof email !== 'string' ||
        !password || typeof password !== 'string' ||
        !name || typeof name !== 'string') {
        return res.status(400).json({ message: "Email, password, and name are required and must be strings" });
    }

    // Optional: Add password complexity check
    if (password.length < 8) { // Example: Minimum 8 characters
         return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    try {
        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" }); // Use 409 Conflict
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        // 4. Create User
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // 5. Prepare response data (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;

        // 6. Send Success Response
        return res.status(201).json({
            message: "User registered successfully", // Changed message slightly
            user: userWithoutPassword,
        });

    } catch (error) {
        console.error("Registration error:", error);
        // Handle potential Prisma unique constraint errors specifically if needed
        // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        //     return res.status(409).json({ message: "Email already exists." });
        // }
        return res.status(500).json({ message: "Internal server error during registration" });
    }
}
