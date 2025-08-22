import React from "react";
import { SignIn } from "@clerk/clerk-react";
// import ToggleButton from "../../components/AnimatedDarkModeToggle";
import Navbar from "../../components/Navbar";

export default function SignInPage() {
  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Navbar always on top */}
      <Navbar />

      {/* Add padding-top to offset fixed navbar */}
      <div className="flex-1 lg:grid lg:grid-cols-12 pt-16">
        {/* Left Side with Branding (desktop only) */}
        <aside className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 items-center justify-center bg-emerald-800 overflow-hidden">
          <img
            alt="PlagioGuard Background"
            src="https://www.safespace.qa/sites/default/files/2020-06/ARTPV0040_Img_Different-Kinds-of-Plagiarism-Practices_V2%20-%20en.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="relative z-10 p-12 text-white">
            <a href="/" className="block">
              <img
                src="/PlagLogo.jpeg"
                alt="PlagioGuard Logo"
                className="h-14 w-14 rounded-full shadow-md"
              />
            </a>
            <h2 className="mt-6 text-4xl font-bold">
              Welcome to PlagioGuard 🔍
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90 max-w-md">
              PlagioGuard is your trusted companion for detecting plagiarism,
              AI-generated content, and ensuring research integrity.  
              Sign in to protect your academic work.
            </p>
          </div>
        </aside>

        {/* Right Side with Sign In */}
        <main className="flex items-center justify-center px-6 py-10 sm:px-12 lg:col-span-7 xl:col-span-6 relative">
          <div className="max-w-md w-full relative">
            {/* Mobile Branding */}
            <div className="block lg:hidden mb-8 text-center">
              <a
                href="/"
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md"
              >
                <img
                  src="/PlagLogo.jpeg"
                  alt="PlagioGuard Logo"
                  className="h-10 w-10 rounded-full"
                />
              </a>
              <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to PlagioGuard 🔍
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Sign in to continue protecting your research integrity.
              </p>
            </div>

            {/* Clerk Sign In */}
            <div className="flex justify-center py-6">
              <SignIn
                appearance={{
                  elements: {
                    formButtonPrimary: {
                      fontSize: "14px",
                      textTransform: "none",
                      backgroundColor: "#059669", // emerald-600
                      "&:hover, &:focus, &:active": {
                        backgroundColor: "#047857", // emerald-700
                      },
                    },
                    card: {
                      borderRadius: "0.75rem",
                      boxShadow:
                        "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                    },
                  },
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
