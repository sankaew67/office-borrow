// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma"; // <-- Use shared instance
import bcrypt from "bcryptjs";
import type { User } from '@prisma/client'; // Import User type if needed for response

// Define a type for the successful response, excluding sensitive data
type LoginSuccessResponse = {
    message: string;
    user: Omit<User, 'password'>; // Exclude password field
};

type LoginErrorResponse = {
    message: string;
};

type ResponseData = LoginSuccessResponse | LoginErrorResponse;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData> // Use the defined response type
) {
    if (req.method !== "POST") {
        res.setHeader('Allow', ['POST']);
        // Use .json() for consistency, even though .end() works for 405
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ message: "Email and password are required and must be strings" });
    }

    try {
        // 2. Find User
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // 3. Validate User and Password
        // Combine checks and use await directly in the condition
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Use a generic message for security (don't reveal if email exists)
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Prepare user data for response (excluding password)
        const { password: _, ...userWithoutPassword } = user; // Destructure and omit password

        // NOTE: Implement JWT/Session creation here in a real application

        // 5. Send Success Response
        return res.status(200).json({
            message: "Login successful", // Changed message slightly
            user: userWithoutPassword,
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error during login" });
    }
}
