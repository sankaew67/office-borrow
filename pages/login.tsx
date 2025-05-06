// pages/login.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import { FiLogIn, FiLoader, FiAlertCircle, FiUser, FiLock } from 'react-icons/fi';

// Define User type (Ideally, move this to a shared types file)
type User = {
  name: string;
  id: number | string;
  role?: 'admin' | 'user'; // <-- เพิ่ม role
};

// Helper function (Ideally, move this to a shared utils file)
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
    return "An unexpected error occurred";
};


export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    setLoading(true);

    // --- Start of Mock Logic ---
    await new Promise(resolve => setTimeout(resolve, 1200));

    // *** START: กำหนด Role ตอน Login ***
    const isAdmin = identifier.toLowerCase() === 'admin@example.com' || identifier.toLowerCase() === 'admin'; // สมมติ admin login
    const userRole = isAdmin ? 'admin' : 'user';
    const userName = identifier.includes('@') ? identifier.split('@')[0] : identifier;

    const mockUser: User = {
      name: userName,
      id: `mock-${Math.random().toString(36).substring(7)}`,
      role: userRole, // <-- กำหนด role ที่นี่
    };
    // *** END: กำหนด Role ตอน Login ***

    try {
      // Basic validation before saving (optional but good practice)
      if (!mockUser.name || !mockUser.id || !mockUser.role) {
          throw new Error("Mock user generation failed or missing role.");
      }
      localStorage.setItem("user", JSON.stringify(mockUser));
      console.log("Logged in as:", mockUser); // Log user data including role
      router.push("/");
    } catch (storageError) {
      console.error("Failed to save user to localStorage:", storageError);
      setError("An error occurred while saving your session. Please try again.");
      setLoading(false);
    }
    // --- End of Mock Logic ---

    /* ... (Real API Call Logic remains commented out) ... */
  };


  return (
    // --- UPDATED BACKGROUND CONTAINER ---
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* --- START: Animated Background Shapes --- */}
      <div className="absolute top-[-10%] left-[-15%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-8%] right-[-10%] w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[25%] left-[10%] w-60 h-60 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      {/* --- END: Animated Background Shapes --- */}

      {/* --- UPDATED LOGIN CARD --- */}
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-md hover:shadow-lg w-full max-w-md transition-shadow duration-300 border border-gray-100">
        {/* Icon and Title Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full mb-4">
             <FiLogIn className="text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
            Device Borrow System
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Please log in to continue
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-5 flex items-start shadow-sm"
            role="alert"
            id="error-message"
          >
            <FiAlertCircle className="h-5 w-5 mr-2.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Identifier Input */}
          <div className="relative">
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Username or Email
            </label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  placeholder="e.g., john.doe or admin@example.com" // Updated placeholder
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  value={identifier}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                  aria-describedby={error ? "error-message" : undefined}
                />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
             <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="•••••••• (any password for mock)" // Updated placeholder
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  aria-describedby={error ? "error-message" : undefined}
                />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2.5 px-4 font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out flex items-center justify-center text-sm ${
              loading
                ? "bg-indigo-300 cursor-wait text-indigo-800"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
            disabled={loading}
          >
            {loading ? (
                <>
                    <FiLoader className="animate-spin -ml-1 mr-2.5 h-5 w-5" />
                    Logging In...
                </>
            ) : (
                "Log In"
            )}
          </button>
        </form>

        {/* Link to Register Page */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
