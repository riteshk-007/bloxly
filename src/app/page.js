import Link from 'next/link';
import { ArrowRight, Globe, Zap, Shield, CheckCircle, Sparkles, Rocket, Code, Star } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function Home() {
  return (
    <div className='min-h-screen bg-black text-white overflow-x-hidden'>
      <Navigation />
      <main className='relative overflow-hidden min-h-screen bg-black'>
        {/* Background Effects */}
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/5'></div>
          <div className='absolute inset-0' style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20'>
          <div className='text-center max-w-5xl mx-auto'>
            <div className='mb-8'>
              <span className='inline-flex items-center px-8 py-4 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-400/40 backdrop-blur-sm shadow-2xl'>
                <Sparkles className='w-5 h-5 mr-3' />
                🚀 The Future of Blog Management
                <Star className='w-5 h-5 ml-3 text-yellow-300' />
              </span>
            </div>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight'>
              <span className='bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent block'>
                Manage Every
              </span>
              <span className='bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent block relative'>
                Domain
                <div className='absolute -top-4 -right-8 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold transform rotate-12'>
                  NEW
                </div>
              </span>
              <span className='bg-gradient-to-r from-gray-100 to-white bg-clip-text text-transparent block'>
                Blog Platform
              </span>
            </h1>
            <p className='text-lg md:text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto'>
              Create, manage, and scale multiple domain-specific blogs with WordPress-level SEO, subscription management, and powerful analytics all in one platform.
            </p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center mb-20'>
              <Link href='/dashboard' className='group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-12 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl hover:shadow-yellow-400/50 flex items-center min-w-[280px] justify-center'>
                <Rocket className='w-6 h-6 mr-3' />
                Start Building Now
                <ArrowRight className='w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform' />
              </Link>
              <Link href='/blog' className='group border-2 border-gray-600 hover:border-yellow-400 text-white hover:text-yellow-400 px-12 py-5 rounded-2xl font-bold text-xl transition-all flex items-center min-w-[280px] justify-center'>
                <Globe className='w-6 h-6 mr-3' />
                View Demo Blog
              </Link>
            </div>
            <div className='mb-16'>
              <span className='inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-gray-900/50 text-gray-300 border border-gray-700 backdrop-blur-sm'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse'></span>
                500+ blogs created  99.9% uptime  24/7 support
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-gray-900/30 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Bloxly?
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to build and scale your blog empire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-gray-800 rounded-2xl p-8 hover:border-yellow-400/30 transition-colors">
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 p-4 rounded-xl w-fit mb-6">
                <Globe className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Multi-Domain Management</h3>
              <p className="text-gray-400">
                Manage unlimited domains from one dashboard. Each domain gets its own isolated blog environment.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-gray-800 rounded-2xl p-8 hover:border-yellow-400/30 transition-colors">
              <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/10 p-4 rounded-xl w-fit mb-6">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Lightning Fast</h3>
              <p className="text-gray-400">
                Built for speed and performance. Your blogs will load instantly and rank higher on search engines.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-gray-800 rounded-2xl p-8 hover:border-yellow-400/30 transition-colors">
              <div className="bg-gradient-to-br from-green-400/20 to-green-600/10 p-4 rounded-xl w-fit mb-6">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">SEO Optimized</h3>
              <p className="text-gray-400">
                Built-in SEO tools, automatic sitemaps, and meta optimization to boost your search rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/30 to-gray-900/50 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Trusted by Thousands
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-gray-400">Blogs Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-400">Active Domains</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className='py-32 bg-gradient-to-b from-gray-900/50 to-black relative'>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-20'>
            <h2 className='text-5xl md:text-6xl font-bold mb-8'>
              <span className='bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
                Choose Your Plan
              </span>
            </h2>
          </div>
          <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
            <div className='bg-gradient-to-br from-gray-900/90 to-black/80 border border-gray-800 rounded-3xl p-8'>
              <h3 className='text-2xl font-bold text-white mb-4'>Free</h3>
              <div className='text-4xl font-bold text-yellow-400 mb-6'>₹0<span className='text-lg text-gray-400'>/month</span></div>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-gray-300'>
                  <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
                  1 Domain
                </li>
                <li className='flex items-center text-gray-300'>
                  <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
                  5 Blog Posts
                </li>
              </ul>
              <Link href='/dashboard' className='block w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-3 rounded-lg font-semibold transition-colors'>
                Get Started
              </Link>
            </div>
            <div className='bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 border border-yellow-400/30 rounded-3xl p-8 relative'>
              <div className='absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold'>
                POPULAR
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>Pro</h3>
              <div className='text-4xl font-bold text-yellow-400 mb-6'>₹49<span className='text-lg text-gray-400'>/month</span></div>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-gray-300'>
                  <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
                  3 Domains
                </li>
                <li className='flex items-center text-gray-300'>
                  <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
                  20 Blog Posts per Domain
                </li>
              </ul>
              <Link href='/dashboard' className='block w-full bg-yellow-400 hover:bg-yellow-500 text-black text-center py-3 rounded-lg font-bold transition-colors'>
                Start Pro Plan
              </Link>
            </div>
            <div className='bg-gradient-to-br from-gray-900/90 to-black/80 border border-gray-800 rounded-3xl p-8'>
              <h3 className='text-2xl font-bold text-white mb-4'>Custom</h3>
              <div className='text-4xl font-bold text-yellow-400 mb-6'>₹69<span className='text-lg text-gray-400'>/30 days</span></div>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-gray-300'>
                  <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
                  Unlimited Domains
                </li>
                <li className='flex items-center text-gray-300'>
                  <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
                  Unlimited Blog Posts
                </li>
              </ul>
              <Link href='/dashboard' className='block w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-center py-3 rounded-lg font-bold transition-colors'>
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className='bg-black border-t border-gray-800 py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center justify-center text-center'>
            <div className='flex items-center mb-8'>
              <div className='bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-2xl mr-4'>
                <Code className='h-10 w-10 text-black' />
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent'>
                  Bloxly
                </h1>
                <p className='text-sm text-gray-400'>Multi-Domain Blog Platform</p>
              </div>
            </div>
            <p className='text-gray-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed'>
              Bloxly is a powerful platform designed to help content creators and businesses manage multiple domain-specific blogs with ease.
            </p>
            <div className='flex items-center mb-8'>
              <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
              <span className='text-green-400 font-medium'>All systems online</span>
            </div>
            <div className='border-t border-gray-800 pt-8 w-full'>
              <div className='flex flex-col md:flex-row justify-between items-center'>
                <p className='text-gray-400 mb-4 md:mb-0'>
                  2025 Bloxly. All rights reserved.
                </p>
                <div className='flex items-center space-x-2'>
                  <span className='text-gray-400'>Made with  by</span>
                  <Link href='https://codexprime.in' target='_blank' className='text-yellow-400 hover:text-yellow-300 font-semibold transition-colors'>
                    codexprime.in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
