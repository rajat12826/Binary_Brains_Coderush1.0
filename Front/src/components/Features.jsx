// src/components/FeaturesPage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  Brain,
  Languages,
  LayoutDashboard,
  Users,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

// SHADCN UI IMPORTS
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from './Navbar';

const Footer = () => (
  <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-lg border-t border-emerald-300/50">
    <motion.div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <motion.div className="space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              CMT Detect
            </span>
          </div>
          <p className="text-gray-600">
            Conference Management Toolkit to detect AI-generated and plagiarized research papers with cutting-edge technology.
          </p>
        </motion.div>

        <motion.div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Platform</h3>
          <div className="space-y-2">
            <Link to="/features" className="block text-gray-600 hover:text-emerald-600 transition-colors">Features</Link>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Modules</a>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">For Conferences</a>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">AI Research</a>
          </div>
        </motion.div>

        <motion.div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Company</h3>
          <div className="space-y-2">
            <Link to="/about-us" className="block text-gray-600 hover:text-emerald-600 transition-colors">About Us</Link>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Careers</a>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Blog</a>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Contact</a>
          </div>
        </motion.div>

        <motion.div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Legal</h3>
          <div className="space-y-2">
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Ethical Use</a>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 border-t border-emerald-300/50 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} CMT Detect. All rights reserved.
      </div>
    </motion.div>
  </footer>
);

const customEase = [0.25, 0.46, 0.45, 0.94];
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, ease: customEase } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customEase } } };
const imageVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: customEase } } };

const FeaturesPage = () => {
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
        <section className="relative px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 mb-4">
              Advanced <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">Detection Features</span> for Research Integrity
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              CMT Detect ensures authenticity in academic conferences by identifying plagiarism, AI-generated text, and maintaining author accountability.
            </p>
          </motion.div>
        </section>

        {/* Stylometric Fingerprinting */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-6">
              <Badge className="bg-emerald-100/50 text-emerald-700 border border-emerald-300/50">
                <FileSearch className="w-4 h-4 mr-2" /> Stylometry
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Stylometric Fingerprinting
              </h2>
              <p className="text-lg text-gray-600">
                Every researcher writes differently. We analyze linguistic patterns, sentence rhythm, and writing style to create a unique "fingerprint" that flags inconsistencies across submissions.
              </p>
            </motion.div>
            <motion.div variants={imageVariants}>
              <img src="https://aicompetence.org/wp-content/uploads/2025/05/n7zg65rted.webp" alt="Stylometry" className="rounded-2xl shadow-xl border border-emerald-300/50" />
            </motion.div>
          </div>
        </section>

        {/* AI Detection */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={imageVariants}>
              <img src="https://quantumzeitgeist.com/wp-content/uploads/LLM_main-4.jpg" alt="AI Detection" className="rounded-2xl shadow-xl border border-emerald-300/50" />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-6">
              <Badge className="bg-emerald-100/50 text-emerald-700 border border-emerald-300/50">
                <Brain className="w-4 h-4 mr-2" /> AI-Generated
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                AI-Watermark & Entropy Detection
              </h2>
              <p className="text-lg text-gray-600">
                Detect subtle AI signatures in text using entropy, perplexity, and watermarking techniques. Ensure conference submissions reflect genuine human research.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Multilingual Plagiarism */}
        {/* <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-6">
              <Badge className="bg-emerald-100/50 text-emerald-700 border border-emerald-300/50">
                <Languages className="w-4 h-4 mr-2" /> Multilingual
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Cross-Language & Rephrased Plagiarism Detection
              </h2>
              <p className="text-lg text-gray-600">
                Go beyond Turnitin. Identify rephrased and translated plagiarism across multiple languages with semantic similarity algorithms.
              </p>
            </motion.div>
            <motion.div variants={imageVariants}>
              <img src="https://i.ibb.co/bjLQLyz/plagiarism.png" alt="Multilingual detection" className="rounded-2xl shadow-xl border border-emerald-300/50" />
            </motion.div>
          </div>
        </section> */}

        {/* Conference Dashboard */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={imageVariants}>
              <img src="https://images.ctfassets.net/dfcvkz6j859j/3yyuVQqgzMOMr2AGytPI4u/85f2a29fa2b977819e36531d96c85fa2/Web-Analytics-Dashboard-Template-Example.png" alt="Dashboard" className="rounded-2xl shadow-xl border border-emerald-300/50" />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-6">
              <Badge className="bg-emerald-100/50 text-emerald-700 border border-emerald-300/50">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Unified Submission Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                Track papers, plagiarism scores, AI flags, and reviewer feedback in one powerful dashboard for organizers and reviewers.
              </p>
            </motion.div>
          </div>
        </section>

    
    33

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-green-100 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Ensure Integrity in Your Next Conference
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
              Protect your academic events with AI-powered plagiarism and content authenticity detection.
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
  );
};

export default FeaturesPage;
