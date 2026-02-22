"use client";

import { signIn } from "next-auth/react"; 
import { Github, ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "./login.module.css";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      
      {/* 1. Background Animation (Same as Home) */}
      <div style={{position: 'fixed', inset: 0, pointerEvents: 'none'}}>
        <NeuralNetworkBackground />
      </div>

      {/* Back Link */}
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={18} /> Back to Home
      </Link>

      {/* 2. The Premium Login Card */}
      <div className={styles.loginCard}>
        {/* Glow Effects */}
        
        {/* Subtle Grid Pattern Overlay */}
        <div className={styles.gridOverlay}></div>

        {/* Content */}
        <h1 className={styles.logo}>GitHelix</h1>
        <p className={styles.subtitle}>Enter the intelligence engine.</p>

        <button 
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className={styles.githubBtn}
        >
          <Github size={20} />
          Sign in with GitHub
        </button>

        <p className={styles.terms}>
          By clicking continue, you agree to our <br/> 
          Terms of Service and Privacy Policy.
        </p>
      </div>

    </div>
  );
}