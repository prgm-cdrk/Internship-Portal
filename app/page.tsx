// Landing page for ARCANA SOLUTION Internship Portal
// Full marketing page with hero, features, pricing, how it works, screenshots, testimonials, FAQ, footer

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';

// Counter animation hook
function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView, started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return { count, ref };
}

// Typing effect hook
function useTyping(text: string, speed: number = 50) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, done };
}

// Scroll progress hook
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

// FAQ accordion item component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-arcana-text font-medium">{question}</span>
        <svg
          className={`w-5 h-5 text-arcana-light shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-dark-300 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const scrollProgress = useScrollProgress();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallaxY, setParallaxY] = useState(0);

  // Typing effect for hero
  const { displayed: typedText, done: typingDone } = useTyping('The Modern Way to', 60);

  // Counter hooks for stats
  const interns = useCounter(500, 2500);
  const companies = useCounter(120, 2000);
  const satisfaction = useCounter(95, 1800);

  // Mouse follow glow
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Parallax on scroll
  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY * 0.3);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal (IntersectionObserver)
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [status]);

  return (
    <div className="min-h-screen bg-arcana-bg text-arcana-text overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ─── SCROLL PROGRESS BAR ─── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[100]">
        <div
          className="h-full bg-gradient-to-r from-arcana-deep via-arcana-primary to-arcana-light transition-none"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ─── MOUSE FOLLOW GLOW ─── */}
      <div
        className="fixed w-[400px] h-[400px] rounded-full blur-[120px] bg-arcana-primary/10 pointer-events-none z-0 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x - 200}px, ${mousePos.y - 200}px)` }}
      />

      {/* ─── ANIMATED BACKGROUND ─── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ transform: `translateY(${parallaxY}px)` }}>
        {/* Gradient orbs with varied animations */}
        <div className="absolute w-[500px] h-[500px] bg-arcana-primary/15 rounded-full blur-[120px] animate-drift" style={{ top: '10%', left: '-5%' }} />
        <div className="absolute w-[400px] h-[400px] bg-arcana-indigo/10 rounded-full blur-[100px] animate-drift-reverse" style={{ top: '60%', right: '-8%' }} />
        <div className="absolute w-[300px] h-[300px] bg-arcana-deep/15 rounded-full blur-[80px] animate-float" style={{ top: '30%', right: '20%', animationDuration: '8s' }} />
        <div className="absolute w-[250px] h-[250px] bg-arcana-light/10 rounded-full blur-[90px] animate-drift" style={{ bottom: '15%', left: '15%', animationDuration: '10s', animationDelay: '3s' }} />
        <div className="absolute w-[200px] h-[200px] bg-arcana-primary/10 rounded-full blur-[70px] animate-drift-reverse" style={{ top: '50%', left: '40%', animationDuration: '16s' }} />
        {/* Grid dots */}
        <div className="absolute inset-0 animate-shimmer" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ─── HEADER / NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-arcana-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/Arcana-Logo.png" alt="Arcana Solution" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold tracking-wide">ARCANA SOLUTION</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-dark-300">
            <a href="#features" className="hover:text-arcana-light transition-colors">Features</a>
            <a href="#pricing" className="hover:text-arcana-light transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-arcana-light transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-arcana-light transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 text-sm text-dark-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-medium bg-arcana-primary text-white rounded-lg hover:bg-arcana-deep transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-24 md:pt-32 pb-[128px] md:pb-[228px] px-6 overflow-hidden border-b border-white/5">

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy + CTAs */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-8 md:mb-[50px] tracking-[1px]">
                <span className={!typingDone ? 'typing-cursor' : ''}>{typedText}</span>
                <br />
                <span className="bg-gradient-to-r from-arcana-primary via-arcana-light to-arcana-indigo bg-clip-text text-transparent animate-gradient-text">
                  Manage Internships
                </span>
              </h1>

              <p className="text-base md:text-lg text-dark-300 mb-10 md:mb-[150px] leading-[1.8] max-w-lg">
                InternsHub connects companies with talented interns. Track applications, assign tasks,
                manage offboarding — all in one beautiful dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-arcana-primary text-white font-semibold rounded-xl hover:bg-arcana-deep transition-all hover:shadow-[0_0_30px_rgba(114,98,248,0.3)] text-center"
                >
                  Sign Up for Companies
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white/5 text-arcana-text font-semibold rounded-xl border border-white/10 hover:border-arcana-primary/50 hover:bg-white/10 transition-all text-center"
                >
                  Start Browsing Internships
                </Link>
              </div>
            </div>

            {/* Right — Product Logo */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative lg:ml-[150px] reveal">
                {/* Glow behind logo */}
                <div className="absolute inset-0 bg-arcana-primary/20 rounded-3xl blur-[60px] pointer-events-none" />
                <div className="relative bg-white/[0.03] rounded-3xl p-8 md:p-14 flex flex-col items-center gap-5">
                  <Image src="/internsHub-logo.png" alt="InternsHub" width={200} height={200} className="lg:hidden" />
                  <Image src="/internsHub-logo.png" alt="InternsHub" width={350} height={350} className="hidden lg:block" />
                  <span className="text-2xl md:text-4xl font-bold text-white tracking-[3px]" style={{ fontFamily: "'Satoshi', sans-serif" }}>InternsHub</span>
                  <span className="text-xs md:text-sm text-dark-400 tracking-[2px]">by Arcana Solution</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative -mt-10 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center gap-6 md:gap-6 px-4">
          <div ref={interns.ref} className="bg-dark-900/20 border border-white/10 rounded-2xl py-8 px-10 text-center shadow-2xl shadow-black/50">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{interns.count}+</p>
            <p className="text-sm text-dark-400">Interns Placed</p>
          </div>
          <div ref={companies.ref} className="bg-dark-900/20 border border-white/10 rounded-2xl py-8 px-10 text-center shadow-2xl shadow-black/50">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{companies.count}+</p>
            <p className="text-sm text-dark-400">Companies</p>
          </div>
          <div ref={satisfaction.ref} className="bg-dark-900/20 border border-white/10 rounded-2xl py-8 px-10 text-center shadow-2xl shadow-black/50">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{satisfaction.count}%</p>
            <p className="text-sm text-dark-400">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="pt-20 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-dark-300 max-w-xl mx-auto">
              A complete platform by Arcana Solution for managing the entire internship lifecycle — from posting to offboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Post Internships',
                desc: 'Create internship postings with descriptions, deadlines, and slot counts. Reach qualified candidates instantly.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Track Applications',
                desc: 'Monitor applicant progress from Applied to Hired with visual progress bars and real-time status updates.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Task Management',
                desc: 'Assign tasks to interns with deadlines. Track progress from Accept to Complete with review workflows.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Intern Lifecycle',
                desc: 'Manage the full journey — scheduling start dates, tracking progress, offboarding with 30-day retention.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: 'Smart Notifications',
                desc: 'Badge-based notification system for new applications, task updates, and status changes.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                title: 'Billing & Subscriptions',
                desc: 'Flexible pricing tiers with integrated PayMongo payments. Upgrade anytime as your needs grow.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="tilt-card p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-arcana-primary/30 hover:bg-arcana-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-arcana-primary/10 border border-arcana-primary/20 flex items-center justify-center text-arcana-light mb-5 group-hover:bg-arcana-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple Steps to Get Started</h2>
            <p className="text-dark-300 max-w-xl mx-auto">
              Whether you&apos;re a company hiring interns or a student looking for opportunities, InternsHub makes it easy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Companies */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-arcana-primary/20 border border-arcana-primary/30 flex items-center justify-center text-arcana-light text-sm font-bold">
                  C
                </span>
                For Companies
              </h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create Your Account', desc: 'Sign up and set up your company profile with industry and website.' },
                  { step: '02', title: 'Post Internships', desc: 'Create listings with descriptions, deadlines, and available slots.' },
                  { step: '03', title: 'Review & Hire', desc: 'Review applications, schedule interviews, and accept top candidates.' },
                  { step: '04', title: 'Manage & Offboard', desc: 'Assign tasks, track progress, and offboard interns when complete.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-arcana-primary font-mono text-sm font-bold mt-1">{item.step}</span>
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-dark-300 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Applicants */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-arcana-indigo/20 border border-arcana-indigo/30 flex items-center justify-center text-arcana-light text-sm font-bold">
                  A
                </span>
                For Applicants
              </h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Browse Internships', desc: 'Explore available positions from registered companies.' },
                  { step: '02', title: 'Apply with Resume', desc: 'Upload your PDF resume and submit your application in one click.' },
                  { step: '03', title: 'Track Progress', desc: 'Watch your application move through Applied → Reviewed → Interview → Hired.' },
                  { step: '04', title: 'Complete Tasks', desc: 'Start, work on, and finish assigned tasks to demonstrate your skills.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-arcana-indigo font-mono text-sm font-bold mt-1">{item.step}</span>
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-dark-300 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-dark-300 max-w-xl mx-auto">
              Start free on InternsHub and upgrade as your internship program grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'FREE',
                price: '₱0',
                period: '/month',
                desc: 'Perfect for small companies getting started',
                features: [
                  '1 active internship posting',
                  'Up to 10 applicants',
                  'Basic task management',
                  'Email support',
                ],
                cta: 'Get Started',
                popular: false,
              },
              {
                name: 'BASIC',
                price: '₱299',
                period: '/month',
                desc: 'For growing companies with active hiring',
                features: [
                  '5 active internship postings',
                  'Unlimited applicants',
                  'Full task management',
                  'Priority support',
                  'Announcement system',
                ],
                cta: 'Start Free Trial',
                popular: false,
              },
              {
                name: 'PRO',
                price: '₱499',
                period: '/month',
                desc: 'For companies with large internship programs',
                features: [
                  'Unlimited postings',
                  'Unlimited applicants',
                  'Advanced analytics',
                  'Dedicated support',
                  'Custom branding',
                  'API access',
                ],
                cta: 'Contact Sales',
                popular: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.popular
                    ? 'bg-arcana-primary/10 border-arcana-primary/40 shadow-[0_0_40px_rgba(114,98,248,0.1)]'
                    : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-arcana-primary text-white text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <p className="text-sm text-arcana-light font-medium tracking-wider uppercase mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-dark-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-dark-300 text-sm mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-dark-300">
                      <svg className="w-4 h-4 text-arcana-light shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-3 text-center rounded-xl font-medium text-sm transition-all ${
                    plan.popular
                      ? 'bg-arcana-primary text-white hover:bg-arcana-deep'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCREENSHOTS / DASHBOARD PREVIEW ─── */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Dashboard</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See It In Action</h2>
            <p className="text-dark-300 max-w-xl mx-auto">
              A clean, modern dashboard designed for clarity and efficiency.
            </p>
          </div>

          {/* Placeholder dashboard mockup */}
          <div className="relative max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-dark-900 overflow-hidden shadow-2xl shadow-arcana-primary/5">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-4 flex items-center gap-2 text-xs text-dark-400">
                  <Image src="/internsHub-logo.png" alt="InternsHub" width={14} height={14} className="rounded" />
                  internshub.arcana-solution.com
                </span>
              </div>
              {/* Fake dashboard content */}
              <div className="p-8">
                <div className="flex gap-6">
                  {/* Sidebar mockup */}
                  <div className="w-48 shrink-0 space-y-2 hidden md:block">
                    {['Dashboard', 'Internships', 'Applicants', 'Interns', 'Tasks', 'Billing'].map((item, i) => (
                      <div
                        key={item}
                        className={`px-4 py-2.5 rounded-lg text-sm ${i === 0 ? 'bg-arcana-primary/20 text-arcana-light' : 'text-dark-400'}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Main content mockup */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Active Interns', val: '12' },
                        { label: 'Pending Reviews', val: '5' },
                        { label: 'Applications', val: '48' },
                      ].map((s) => (
                        <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                          <p className="text-xs text-dark-400">{s.label}</p>
                          <p className="text-2xl font-bold text-white mt-1">{s.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                      <p className="text-sm text-dark-400 mb-3">Recent Activity</p>
                      {['Applied to Frontend Developer', 'Task "API Integration" completed', 'New announcement from TechCorp'].map((a, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-t border-white/5 first:border-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-arcana-primary" />
                          <span className="text-sm text-dark-300">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow behind */}
            <div className="absolute -inset-4 bg-arcana-primary/10 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What People Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: 'InternsHub transformed how we manage our internship program. The task tracking and applicant pipeline saved us hours every week.',
                name: 'Maria Santos',
                role: 'HR Manager, TechCorp',
              },
              {
                quote: 'As a student, I loved how easy it was to track my application status on InternsHub. The dashboard is beautiful and intuitive.',
                name: 'Juan Dela Cruz',
                role: 'Former Intern, now Full-Stack Dev',
              },
              {
                quote: 'The offboarding feature with 30-day retention is brilliant. We never lose important data when interns complete their terms.',
                name: 'Ana Reyes',
                role: 'CEO, StartupHub PH',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-arcana-primary/20 transition-colors"
              >
                <svg className="w-8 h-8 text-arcana-primary/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-dark-300 text-sm leading-relaxed mb-6">{t.quote}</p>
                <div>
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-dark-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="What is InternsHub?"
              answer="InternsHub is an internship management platform by Arcana Solution that connects companies with talented interns. It handles everything from posting internships to tracking applications, managing tasks, and offboarding."
            />
            <FAQItem
              question="How do I sign up as a company?"
              answer="Click 'Sign Up for Companies' and create an account with your email and password. After registration, set up your company profile and start posting internships on InternsHub right away."
            />
            <FAQItem
              question="Is there a free plan?"
              answer="Yes! The FREE plan on InternsHub lets you post 1 active internship with up to 10 applicants and basic task management. Upgrade to BASIC (₱299/mo) or PRO (₱499/mo) for more features."
            />
            <FAQItem
              question="How do applicants apply?"
              answer="Applicants browse available internships on InternsHub, upload a PDF resume (max 5MB), and submit their application. They can track their status from Applied all the way to Hired."
            />
            <FAQItem
              question="Can I cancel my subscription?"
              answer="Yes, you can downgrade or cancel your subscription at any time from the Billing page in your InternsHub dashboard. Changes take effect at the end of your current billing cycle."
            />
            <FAQItem
              question="What payment methods are accepted?"
              answer="InternsHub uses PayMongo for payments, supporting major Philippine payment methods including credit/debit cards, GCash, GrabPay, and bank transfers."
            />
          </div>
        </div>
      </section>

      {/* ─── CONTACT US ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-arcana-light text-sm font-medium tracking-wider uppercase mb-3">Contact Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get In Touch</h2>
            <p className="text-dark-300 max-w-xl mx-auto">
              Have questions, need a demo, or want to partner with us? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
            {/* Email */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center hover:border-arcana-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-arcana-primary/10 border border-arcana-primary/20 flex items-center justify-center text-arcana-light mx-auto mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <a href="mailto:hello@arcana-solution.com" className="text-dark-300 text-sm hover:text-arcana-light transition-colors">
                hello@arcana-solution.com
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center hover:border-arcana-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-arcana-primary/10 border border-arcana-primary/20 flex items-center justify-center text-arcana-light mx-auto mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Phone</h3>
              <a href="tel:+639123456789" className="text-dark-300 text-sm hover:text-arcana-light transition-colors">
                +63 912 345 6789
              </a>
            </div>

            {/* Location */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center hover:border-arcana-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-arcana-primary/10 border border-arcana-primary/20 flex items-center justify-center text-arcana-light mx-auto mb-5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Location</h3>
              <p className="text-dark-300 text-sm">Manila, Philippines</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-16 max-w-2xl mx-auto reveal">
            <form className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-dark-400 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-arcana-primary/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-dark-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-arcana-primary/50 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-dark-400 text-sm mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-arcana-primary/50 transition"
                />
              </div>
              <div>
                <label className="block text-dark-400 text-sm mb-2">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-arcana-primary/50 transition resize-none"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-arcana-primary text-white font-semibold rounded-xl hover:bg-arcana-deep transition-all hover:shadow-[0_0_30px_rgba(114,98,248,0.3)]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative reveal">
        {/* Top half — arcana background */}
        <div className="bg-arcana-primary/10 py-80 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Internship Program?
            </h2>
            <p className="text-dark-300 mb-16 max-w-lg mx-auto">
              Join hundreds of companies and interns already using InternsHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-arcana-primary text-white font-semibold rounded-xl hover:bg-arcana-deep transition-all hover:shadow-[0_0_30px_rgba(114,98,248,0.3)]"
              >
                Get Started Free
              </Link>
              <a
                href="mailto:hello@arcana-solution.com"
                className="px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:border-arcana-primary/50 transition-all"
              >
                Request Demo
              </a>
            </div>
          </div>
        </div>
        {/* Bottom half — features background */}
        <div className="bg-white/[0.02] py-16 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Set up your internship program in minutes, not weeks.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your data is encrypted and never shared with third parties.' },
              { icon: '💬', title: '24/7 Support', desc: 'Our team is always here to help you succeed.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <span className="text-3xl mb-3">{item.icon}</span>
                <p className="text-white font-semibold mb-1">{item.title}</p>
                <p className="text-dark-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/Arcana-Logo.png" alt="Arcana Solution" width={32} height={32} className="rounded-lg" />
                <span className="font-bold text-white">ARCANA SOLUTION</span>
              </div>
              <p className="text-dark-400 text-sm leading-relaxed">
                InternsHub — the modern internship management platform by Arcana Solution.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-white font-medium text-sm mb-4">Product</p>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'How It Works', 'Dashboard'].map((l) => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="text-dark-400 text-sm hover:text-arcana-light transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-white font-medium text-sm mb-4">Company</p>
              <ul className="space-y-2.5">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-dark-400 text-sm hover:text-arcana-light transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white font-medium text-sm mb-4">Legal</p>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-dark-400 text-sm hover:text-arcana-light transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-400 text-sm">
              &copy; {new Date().getFullYear()} Arcana Solution. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {/* GitHub */}
              <a href="#" className="text-dark-400 hover:text-arcana-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="text-dark-400 hover:text-arcana-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-dark-400 hover:text-arcana-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
