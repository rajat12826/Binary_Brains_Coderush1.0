// src/components/AboutPage.jsx

import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ShieldCheck, Sparkles, Users, Server, ArrowRight } from "lucide-react"

// SHADCN UI IMPORTS
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Navbar from "./Navbar"

const Footer = () => (
  <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-lg border-t border-emerald-300/50">
    <motion.div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <motion.div className="space-y-4">
          <div className="flex items-center space-x-2">
            <img
              src="/PlagLogo.jpeg"
              alt="PlagioGuard Logo"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              PlagioGuard
            </span>
          </div>
          <p className="text-gray-600">
            A next-generation Conference Management Toolkit designed to detect
            AI-generated text, plagiarism across languages, and stylistic
            anomalies in research submissions.
          </p>
        </motion.div>

        <motion.div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Product</h3>
          <div className="space-y-2">
            <a
              href="#features"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#modules"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Core Modules
            </a>
          </div>
        </motion.div>

        <motion.div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Company</h3>
          <div className="space-y-2">
            <a
              href="#about"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              About Us
            </a>
            <a
              href="#team"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Team
            </a>
            <a
              href="#contact"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </motion.div>

        <motion.div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Legal</h3>
          <div className="space-y-2">
            <a
              href="#"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="block text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 border-t border-emerald-300/50 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} PlagioGuard. All rights reserved.
      </div>
    </motion.div>
  </footer>
)

const customEase = [0.25, 0.46, 0.45, 0.94]
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, ease: customEase },
  },
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: customEase },
  },
}

const teamMembers = [
  { name: "Rajat Parihar", role: "Lead Developer - Detection Engine" },
  { name: "Varun Singh", role: "Project Manager - Conference Systems" },
  { name: "Saniya Katre", role: "QA & Compliance Tester" },
  { name: "Tushar Dhakate", role: "DevOps & Infrastructure" },
  { name: "Harshal Makode", role: "Application Developer" },
]

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white text-gray-800 overflow-hidden">
      <Navbar />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-24 md:pt-32 space-y-20"
      >
        {/* Hero Section */}
        <section id="about" className="relative px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 mb-4">
              Safeguarding Research with{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                PlagioGuard
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              As AI writing tools evolve, so do threats to research integrity.
              PlagioGuard empowers conference committees and institutions to
              detect AI-generated content, cross-language plagiarism, and hidden
              rephrasing patterns.
            </p>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <img
                src="https://knowledgeone.ca/wp-content/uploads/2020/10/shutterstock_1662856705.jpg"
                alt="Research integrity"
                className="rounded-2xl shadow-xl border border-emerald-300/50"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                The PlagioGuard Story
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Traditional plagiarism detectors often fail to spot
                AI-generated, paraphrased, or multilingual plagiarism. Our team
                built PlagioGuard to address these challenges head-on, ensuring
                fair and transparent research evaluation.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                With cutting-edge modules like{" "}
                <strong>stylometric fingerprinting</strong>,{" "}
                <strong>AI-watermark detection</strong>, and{" "}
                <strong>cross-language plagiarism analysis</strong>, PlagioGuard
                is redefining the standard of academic integrity tools.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Values Section */}
        <section id="modules" className="px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Core Principles
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="rounded-2xl p-6 border border-emerald-300/50 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">
                    Integrity
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Protecting academic research from manipulation and ensuring
                    fairness in evaluation.
                  </CardDescription>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="rounded-2xl p-6 border border-emerald-300/50 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">
                    Innovation
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Leveraging AI, entropy, and perplexity models to detect
                    hidden patterns in writing.
                  </CardDescription>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="rounded-2xl p-6 border border-emerald-300/50 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Server className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">
                    Reliability
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    A toolkit designed for scalability, accuracy, and robustness
                    across diverse academic domains.
                  </CardDescription>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Meet the Team
              </h2>
            </motion.div>
            <div className="flex justify-center flex-wrap gap-8">
              {teamMembers.map((member, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-emerald-100 text-emerald-600 text-lg font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h4 className="font-semibold text-lg text-gray-900">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-green-100 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Protect Research Integrity
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
              Join leading conferences and institutions already using PlagioGuard
              to safeguard their submission process. Start today.
            </p>
            <Link to="/signup">
              <Button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </motion.div>

      <Footer />
    </div>
  )
}

export default AboutPage
