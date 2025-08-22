import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-emerald-300/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2">
            <img
              src="/PlagLogo.jpeg"
              alt="PlagioGuard Logo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              PlagioGuard
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Dashboard
            </a>  
            <a
              href="/features"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
          
            <a
              href="/about-us"
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              About Us
            </a>
            <Button className="px-4 cursor-pointer py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200" 
            onClick={() => window.location.href = "/dashboard"}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-emerald-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white/95 backdrop-blur-lg shadow-xl md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  PlagioGuard
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-emerald-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile Links */}
              <nav className="flex flex-col text-lg space-y-2">
                <a
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-2 text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors border-b border-gray-200"
                >
                 Dashboard
                </a>
                <a
                  href="/features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-2 text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors border-b border-gray-200"
                >
                  Features
                </a>
              
                <a
                  href="/about-us"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-2 text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors border-b border-gray-200"
                >
                About-Us
                </a>
              </nav>

              <Button
                className="w-full cursor-pointer mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  window.location.href = "/dashboard"
                }}
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
