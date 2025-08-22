import { SignUp } from "@clerk/clerk-react";
import Navbar from "../../components/Navbar";
// import ToggleButton from "../../components/AnimatedDarkModeToggle";

export default function SignUpPage() {
  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Navbar always at top */}
      <Navbar />

      {/* Add top padding so content doesn't hide behind fixed navbar */}
      <div className="flex-1 lg:grid lg:grid-cols-12 pt-16">
        {/* Left side with image + branding (desktop only) */}
        <aside className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 items-center justify-center bg-emerald-800 overflow-hidden">
          <img
            alt="PlagioGuard Background"
            src="https://images.unsplash.com/photo-1590608897129-79da98d159f2?auto=format&fit=crop&w=1000&q=80"
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
            <h2 className="mt-6 text-4xl font-bold">Join PlagioGuard 🔍</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90 max-w-md">
              Secure your research with advanced AI + plagiarism detection.  
              Sign up to access our full suite of integrity tools today.
            </p>
          </div>
        </aside>

        {/* Right side with SignUp form */}
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
                Join PlagioGuard 🔍
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Protect your research with AI-powered detection.
              </p>
            </div>

            {/* Clerk Sign Up */}
            <div className="flex justify-center py-6">
              <SignUp
                appearance={{
                  elements: {
                    formButtonPrimary: {
                      fontSize: "14px",
                      textTransform: "none",
                      backgroundColor: "#047857", // emerald-700
                      "&:hover, &:focus, &:active": {
                        backgroundColor: "#065f46", // emerald-800
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
