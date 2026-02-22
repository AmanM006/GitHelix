"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Github, ChevronDown, ChevronUp, ArrowLeft, ArrowRight as ArrowRightIcon } from "lucide-react";
import styles from "./home.module.css";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";
import TextReveal from "@/components/TextReveal";
import LiquidFilter from "@/components/LiquidFilter"; 

const steps = [
  {
    title: "Intelligent Ingestion",
    desc: "Connect your repository. GitHelix automatically embeds every issue, PR, and comment into a high-dimensional vector space using OpenAI's latest embeddings.",
    mockIssue: {
      title: "Fix: Memory leak in auth-service",
      tag: "bug",
      body: "Initial scan complete. Analyzing 405 issues for semantic patterns..."
    }
  },
  {
    title: "Semantic Deduplication",
    desc: "When a new issue arrives, we don't just match keywords. We compare intent. 'Login broken' and 'Auth 500 error' are detected as duplicates instantly.",
    mockIssue: {
      title: "User cannot log in via SSO",
      tag: "duplicate",
      body: "⚠️ Potential Duplicate Detected (98% match). See issue #402: 'Auth service crash on token refresh'."
    }
  },
  {
    title: "Automated Triage",
    desc: "GitHelix tags, categorizes, and even drafts responses for incoming issues based on your repository's history and contribution guidelines.",
    mockIssue: {
      title: "Feature: Dark Mode support",
      tag: "enhancement",
      body: "Bot: Thanks for the suggestion! We are tracking dark mode progress in Epic #89. I've linked this request there."
    }
  }
];

const faqs = [
  { q: "Who is GitHelix for?", a: "Maintainers of medium-to-large open source repositories and internal enterprise teams dealing with high issue volume." },
  { q: "How much work can I save?", a: "Our beta users report a 60% reduction in time spent on initial issue triage and duplicate detection." },
  { q: "Is my code secure?", a: "Yes. We only store vector embeddings of issue text, not your actual source code. We use SOC2 compliant infrastructure." },
  { q: "Do you offer on-premise?", a: "Yes, for enterprise clients we offer self-hosted Docker containers." },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowFloatingNav(true);
      } else {
        setShowFloatingNav(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // MOUSE TRACKING FOR LIQUID GLASS
  const handleNavMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const nav = e.currentTarget;
    const rect = nav.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    nav.style.setProperty("--mouse-x", `${x}px`);
    nav.style.setProperty("--mouse-y", `${y}px`);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className={styles.container}>
      
      <LiquidFilter />

      <div style={{position: 'fixed', inset: 0, pointerEvents: 'none'}}>
        <NeuralNetworkBackground />
      </div>

      {/* --- STATIC NAVBAR --- */}
      <nav className={styles.navStatic} style={{ opacity: showFloatingNav ? 0 : 1, transition: 'opacity 0.3s' }}>
        <div className={styles.logo}>GitHelix</div>
        <div className={styles.navLinks}>
           <Link href="/api-docs" className={styles.navLink}>API</Link>
           <Link href="/docs" className={styles.navLink}>DOCS</Link>
           <Link href="/login" className={styles.navButton}>Sign In</Link>
        </div>
      </nav>

      {/* --- FLOATING LIQUID NAVBAR (WITH MOUSE TRACKING) --- */}
      <nav 
        className={`${styles.navFloating} ${showFloatingNav ? styles.navVisible : ''}`}
        onMouseMove={handleNavMouseMove}
      >
        <div className={styles.logo} style={{fontSize: '1.2rem'}}>GitHelix</div>
        <div className={styles.navLinks} style={{gap: '1.5rem'}}>
           <Link href="/api-docs" className={styles.navLink}>API</Link>
           <Link href="/docs" className={styles.navLink}>DOCS</Link>
           <Link href="/login" className={styles.navButton} style={{padding: '0.5rem 1rem'}}>Sign In</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className={styles.heroSection}>
        <div className={styles.card}>
            <div className={styles.cardBg}>
               <div className={styles.cardGlowBlue}></div>
               <div className={styles.cardGlowPurple}></div>
               <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <div className={styles.cardContent}>
              <h1 className={styles.heroTitle}>GitHelix</h1>
              <p className={styles.heroText}>
                Automate your issue triage. Stop manually checking for duplicates. 
                GitHelix uses vector embeddings to scan, detect, and tag redundant GitHub issues instantly.
              </p>
              <div className="flex flex-col items-center gap-4">
                 <Link href="/login" className={styles.ctaButton}>
                   Get Started <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>

            <a href="https://github.com/AmanM006" target="_blank" className={styles.openSourceBottom}>
                <Github className="w-4 h-4" /> Open Source
            </a>
        </div>
      </section>

      {/* --- HOW IT WORKS (SLIDER) --- */}
      <section className={styles.howItWorksSection}>
        <div className={styles.splitLayout}>
          
          <div className={styles.textContent}>
            <div className={styles.textTop}>
                <div key={currentStep}>
                   <h2 className={styles.bigHeading}>
                     <TextReveal text={steps[currentStep].title} delay={0} />
                   </h2>
                   <div className={styles.description}>
                     <TextReveal text={steps[currentStep].desc} delay={0.2} />
                   </div>
                </div>
            </div>

            {/* Slider Controls */}
            <div className={styles.sliderControls}>
              <button 
                onClick={prevStep} 
                className={styles.arrowBtn}
                disabled={currentStep === 0}
                style={{ opacity: currentStep === 0 ? 0 : 1 }}
              >
                <ArrowLeft size={16} />
              </button>

              <div className={styles.dashContainer}>
                {steps.map((_, index) => (
                  <div 
                    key={index} 
                    className={`${styles.indicator} ${index === currentStep ? styles.indicatorActive : ''}`}
                  ></div>
                ))}
              </div>

              <button 
                onClick={nextStep} 
                className={styles.arrowBtn}
                disabled={currentStep === steps.length - 1}
                style={{ opacity: currentStep === steps.length - 1 ? 0 : 1 }}
              >
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>

          <div className={styles.visualContainer}>
            <div className={styles.visualCard3D}>
               <div className={styles.browserHeader}>
                 <div className={`${styles.dot} ${styles.dotRed}`}></div>
                 <div className={`${styles.dot} ${styles.dotYellow}`}></div>
                 <div className={`${styles.dot} ${styles.dotGreen}`}></div>
               </div>

               <div className={styles.browserBodyDark}>
                 <div className={styles.issueHeader}>
                   <img 
                      src="https://github.com/AmanM006.png" 
                      alt="AmanM006" 
                      className={styles.issueAvatar} 
                   />
                   <div className={styles.issueMeta}>
                      <div style={{fontWeight:'bold', color:'white'}}>AmanM006</div>
                      <div>opened 2 hours ago</div>
                   </div>
                 </div>
                 <div className={styles.issueTitle}>
                   {steps[currentStep].mockIssue.title}
                 </div>
                 <div style={{marginBottom:'1rem'}}>
                    <span className={styles.issueTag}>
                      {steps[currentStep].mockIssue.tag}
                    </span>
                 </div>
                 <div className={styles.issueBody}>
                   {steps[currentStep].mockIssue.body}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className={styles.faqSection}>
        <h2 className={styles.faqHeader}>Common questions & answers</h2>
        <div>
          {faqs.map((f, i) => (
            <div key={i} className={styles.accordionItem} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className={styles.accordionTrigger}>
                {f.q}
                {openFaq === i ? <ChevronUp /> : <ChevronDown />}
              </div>
              <div className={`${styles.accordionContent} ${openFaq === i ? styles.open : ''}`}>
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h2 className={styles.footerHeading}>Interested in working with us?</h2>
            <Link href="/login" className={styles.bookCallBtn}>
              Email Us
            </Link>
          </div>
          <div className={styles.footerLinks}>
             <div className={styles.footerRow}>
               <span>Connect</span>
               <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', textAlign:'right'}}>
                 <a href="#">Twitter (X)</a>
                 <a href="#">LinkedIn</a>
                 <a href="https://github.com/AmanM006">GitHub</a>
               </div>
             </div>
             <div className={styles.footerRow}>
               <span>Email us</span>
               <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', textAlign:'right'}}>
                 <a href="mailto:amanm06.work@gmail.com">amanm06.work@gmail.com</a>
                 <span style={{color:'#999', fontSize:'0.8rem'}}>(Project Enquiries)</span>
               </div>
             </div>
          </div>
        </div>
        <div className={styles.bottomBar}>
          © 2025 GITHELIX DIGITAL LTD.
        </div>
      </footer>
    </div>
  );
}