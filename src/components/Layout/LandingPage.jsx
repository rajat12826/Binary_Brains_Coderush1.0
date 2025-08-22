import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Star,
  Users,
  Play,
  Check,
  Shield,
  Sparkles,
  FileText,
  BarChart2,
  Brain,
  Search,
  Eye,
  AlertTriangle,
  Zap,
  Globe,
  BookOpen
} from 'lucide-react';
import Navbar from '../Navbar';

const CMTLanding = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Generated Content Detection",
      description: "Advanced entropy and perplexity analysis to identify AI-generated text patterns with 95% accuracy.",
      color: "from-emerald-500 to-green-600"
    },
    {
      icon: Search,
      title: "Multi-Language Plagiarism Check",
      description: "Detect plagiarism across multiple languages and identify rephrased content using semantic analysis.",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: Eye,
      title: "Stylometric Fingerprinting",
      description: "Create unique writing fingerprints for each author to detect style inconsistencies and ghostwriting.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "AI Watermark Detection",
      description: "Identify hidden watermarks and linguistic signatures left by AI writing tools and generators.",
      color: "from-lime-500 to-green-600"
    },
    {
      icon: BarChart2,
      title: "Real-time Analytics Dashboard",
      description: "Comprehensive reporting with detailed metrics on submission patterns and detection statistics.",
      color: "from-yellow-500 to-green-600"
    },
    {
      icon: FileText,
      title: "Conference Management Suite",
      description: "Complete toolkit for managing research paper submissions, reviews, and publication workflows.",
      color: "from-teal-500 to-emerald-600"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Conference Chair, ICAI 2024",
      content: "CMT has revolutionized our peer review process. We caught 40% more AI-generated submissions this year, maintaining the integrity of our conference proceedings.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Prof. Michael Rodriguez",
      role: "Department Head, Stanford University",
      content: "The stylometric fingerprinting feature is game-changing. We can now identify when students submit work that doesn't match their writing style with remarkable accuracy.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Dr. Emma Thompson",
      role: "Research Ethics Committee",
      content: "Finally, a tool that goes beyond traditional plagiarism detection. The AI watermark detection has helped us maintain academic integrity in the age of ChatGPT.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "500K+", label: "Papers Analyzed" },
    { number: "95%", label: "Detection Accuracy" },
    { number: "50+", label: "Languages Supported" },
    { number: "99.8%", label: "Uptime" }
  ];

  const pricingPlans = [
    {
      name: "Academic",
      price: "$299",
      period: "month",
      features: [
        "Up to 1,000 submissions/month",
        "Basic AI detection",
        "Plagiarism checking",
        "Email support",
        "Standard reporting",
        "Multi-language support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Conference Pro",
      price: "$899",
      period: "month",
      features: [
        "Up to 10,000 submissions/month",
        "Advanced AI watermark detection",
        "Stylometric fingerprinting",
        "Priority support",
        "Custom analytics dashboard",
        "API access",
        "White-label options"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      features: [
        "Unlimited submissions",
        "Full CMT suite access",
        "Dedicated infrastructure",
        "24/7 premium support",
        "Custom integrations",
        "Advanced security features",
        "Training & onboarding"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white text-gray-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-green-200/50 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-teal-200/50 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

     
     <Navbar/>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2">
                <div className="bg-emerald-100/50 text-emerald-700 border border-emerald-300/50 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2 inline" />
                  Next-Gen Academic Integrity Protection
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900">
                Detect AI-Generated Content
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  Beyond Traditional Plagiarism
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Advanced Conference Management ToolKit with AI detection, stylometric fingerprinting, 
                and multi-language plagiarism checking to maintain academic integrity in the age of AI.
              </p>
            </div>

          

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-500 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-40 left-10 w-20 h-20 bg-emerald-200/50 rounded-full blur-xl animate-bounce" style={{animationDuration: '3s'}} />
        <div className="absolute top-60 right-20 w-16 h-16 bg-green-200/50 rounded-full blur-xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}} />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Advanced Detection <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">Capabilities</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite goes beyond traditional plagiarism detection with cutting-edge AI analysis,
              stylometric fingerprinting, and multi-language support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="group relative rounded-2xl border border-emerald-300/50 hover:border-emerald-500/70 transition-all duration-300 shadow-md hover:shadow-xl bg-white p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-green-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                Trusted by Leading
              </span> Academic Institutions
            </h2>
            <p className="text-lg text-gray-600">
              See how conferences and universities are maintaining integrity with CMT Pro
            </p>
          </div>

          <div className="relative">
            <div className="transition-all duration-500 ease-in-out">
              <div className="rounded-2xl p-8 md:p-12 border border-emerald-300/50 shadow-lg bg-white">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {testimonials[activeTestimonial].name}
                    </h3>
                    <p className="text-emerald-700">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>

                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                <p className="text-lg text-gray-700 leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Simple, <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your institution's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="hover:-translate-y-2 transition-transform duration-300"
              >
                <div
                  className={`relative rounded-2xl border shadow-md ${
                    plan.popular
                      ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-500/50 scale-105'
                      : 'bg-white border-emerald-300/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center pb-8 p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {plan.price}
                      <span className="text-lg text-gray-500">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pb-8 px-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-6">
                    <button
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 transform ${
                        plan.popular
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-green-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Ready to protect
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                academic integrity?
              </span>
            </h2>

            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Join leading conferences and institutions worldwide in the fight against AI-generated plagiarism 
              and academic dishonesty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 rounded-xl hover:scale-105 transform">
                <span>Start Free Trial Today</span>
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>

              <p className="text-gray-600 text-sm">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-lg border-t border-emerald-300/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-emerald-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                PlagioGuard
                </span>
              </div>
              <p className="text-gray-600">
                Advanced Conference Management ToolKit for detecting AI-generated content and maintaining academic integrity.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
                <a href="#pricing" className="block text-gray-600 hover:text-emerald-600 transition-colors">Pricing</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">API Documentation</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Integration Guide</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Resources</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Research Papers</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Case Studies</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Blog</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Support Center</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Legal</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Terms of Service</a>
                <a href="#" className="block text-gray-600 hover:text-emerald-600 transition-colors">Data Security</a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-emerald-300/50 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CMT Pro. All rights reserved. Protecting Academic Integrity Worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CMTLanding;