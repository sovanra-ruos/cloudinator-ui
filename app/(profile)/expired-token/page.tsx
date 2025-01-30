"use client"; // Mark this as a client component

// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ExpiredTokenPage() {
  // const router = useRouter();

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background:
          "radial-gradient(circle at center, var(--background-light), var(--background-dark))", // Dynamic gradient background
      }}
    >
      {/* Glassmorphism Card */}
      <div
        className="p-8 rounded-lg border border-gray-200 dark:border-white/10 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 shadow-lg text-center"
        style={{
          maxWidth: "400px",
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Session Expired
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your session has expired. Please log in again to continue.
        </p>

        {/* Login Button */}
        <Button
          // onClick={() => router.push("https://oauth2.cloudinator.istad.co")}
          // onClick={() => router.push("http://localhost:8081/login")}
          
          className="w-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
        >
          <Link href={"/oauth2/authorization/devops"}>Log In Again</Link>
        </Button>
      </div>

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :root {
          --background-light: #f0f0f0; /* Light mode background */
          --background-dark: #0a0a1a; /* Dark mode background */
        }

        .dark {
          --background-light: #1e1e2f; /* Dark mode background */
          --background-dark: #0a0a1a; /* Dark mode background */
        }
      `}</style>
    </div>
  );
}
