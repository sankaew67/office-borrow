// pages/register.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import { FiUserPlus, FiLoader, FiAlertCircle, FiUser, FiMail, FiLock } from 'react-icons/fi'; // Added specific input icons
import { toast, Toaster } from 'react-hot-toast'; // Import toast for notifications

// Define User type (Ideally, move this to a shared types file, e.g., 'types/index.ts')
type User = {
  id: number | string;
  name: string;
  // email?: string; // Optional: Add email if needed in the User type
};

// Helper function (Ideally, move this to a shared utils file, e.g., 'utils/errors.ts')
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
    return "An unknown error occurred";
};


export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear error when user starts typing
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // --- Client-side validation ---
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setError("Please fill in all fields.");
        return;
    }
    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
    }
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    // --- End Validation ---

    setLoading(true);

    // --- Start of Mock API Logic ---
    // console.warn("Using mock registration - replace with API call");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate potential conflict
    if (formData.email.toLowerCase() === "existing@example.com") {
        setError("An account with this email already exists. Please try logging in.");
        setLoading(false);
        return;
    }

    try {
        // Simulate success
        console.log("Mock registration successful for:", formData.email);
        // Use toast notification instead of alert
        toast.success("Registration successful! Redirecting to login...");
        // Add a slight delay before redirecting to allow user to see the toast
        setTimeout(() => {
            router.push("/login");
        }, 1000); // 1 second delay

    } catch (err) {
        console.error("Mock registration process error:", err);
        setError("An unexpected error occurred during registration.");
        setLoading(false); // Ensure loading is stopped on unexpected error
    }
    // setLoading(false) is handled in error cases or implicitly by redirect
    // --- End of Mock API Logic ---


    /* ... (Real API Call Logic remains commented out) ... */
  };

  return (
    // --- UPDATED BACKGROUND CONTAINER ---
    // Added relative positioning and overflow-hidden to contain the shapes
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Toaster for notifications */}
      <Toaster position="top-right" reverseOrder={false} toastOptions={{
          className: 'text-sm font-medium',
          style: {
              borderRadius: '8px',
              background: '#374151', // Darker gray
              color: '#fff',
          },
          success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
      }}/>

      {/* --- START: Animated Background Shapes (Same as Login) --- */}
      <div className="absolute top-[-10%] left-[-15%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-8%] right-[-10%] w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[25%] left-[10%] w-60 h-60 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      {/* --- END: Animated Background Shapes --- */}

      {/* --- UPDATED REGISTER CARD --- */}
      {/* Added relative and z-10 to ensure the card is above the background shapes */}
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-md hover:shadow-lg w-full max-w-md transition-shadow duration-300 border border-gray-100">
        {/* Icon and Title Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full mb-4">
             <FiUserPlus className="text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
            Create New Account
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Join the Device Borrow System
          </p>
        </div>

        {/* Error Display: Consistent styling */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-5 flex items-start shadow-sm" // Use rounded-lg
            role="alert"
            id="error-message" // Add id for aria-describedby
          >
            <FiAlertCircle className="h-5 w-5 mr-2.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5"> {/* Increased spacing */}
          {/* Full Name Input with Icon */}
          <div className="relative">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g., Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  // Input styling: Added padding-left for icon, refined focus ring
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  required
                  disabled={loading}
                  aria-describedby={error ? "error-message" : undefined}
                />
            </div>
          </div>

          {/* Email Input with Icon */}
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g., jane.d@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  // Input styling: Consistent with others
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  required
                  disabled={loading}
                  aria-describedby={error ? "error-message" : undefined}
                />
            </div>
          </div>

          {/* Password Input with Icon */}
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
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  // Input styling: Consistent with others
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  required
                  minLength={6}
                  disabled={loading}
                  aria-describedby={error ? "error-message" : undefined}
                />
            </div>
             {/* Optional: Add password strength indicator here */}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            // Button styling: Consistent indigo theme, clear loading/disabled states
            className={`w-full py-2.5 px-4 font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out flex items-center justify-center text-sm ${
              loading
                ? "bg-indigo-300 cursor-wait text-indigo-800" // Clearer loading state
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
            disabled={loading}
          >
            {loading ? (
                <>
                    <FiLoader className="animate-spin -ml-1 mr-2.5 h-5 w-5" />
                    Registering...
                </>
            ) : (
                "Create Account" // Changed button text slightly
            )}
          </button>
        </form>

        {/* Link to Login Page */}
        <p className="text-center text-sm text-gray-500 mt-8"> {/* Increased top margin */}
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Log in here
          </Link>
        </p>
      </div>
      {/* Hidden span for aria-describedby */}
      {/* <span id="error-message" className="sr-only">{error}</span> */} {/* No need for separate span if id is on the visible error div */}
    </div>
  );
}
