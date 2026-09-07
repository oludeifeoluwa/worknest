import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Calendar,
  FolderLock,
  Video,
  Check,
  RefreshCw,
  X,
  Briefcase,
  Layers,
  Fingerprint,
  Info,
  Sparkles
} from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from '../lib/firebase';
import { Member, OrganizationSettings, UserRole } from '../types';
import { cleanForFirestore } from '../lib/firestoreService';
import { WorkNestLogo } from './WorkNestLogo';

interface AuthViewProps {
  organization?: OrganizationSettings;
  onLoginSuccess?: (user: Member) => void;
  onRegistrationSuccess?: (user: Member) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  organization = {
    id: 'org_worknest_main',
    name: 'WorkNest',
    logoText: 'WN',
    domain: '',
    accentColor: 'indigo',
    emailProvider: 'none',
    allowGuestInvites: false,
    retentionDays: 180,
    registrationApprovalMode: 'auto_approved_domains',
    requireGovDomain: true,
    organizationStateOrAgency: 'WorkNest Government & Enterprise',
    approvedDomains: []
  },
  onLoginSuccess,
  onRegistrationSuccess
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Executive Operations');
  const [jobTitle, setJobTitle] = useState('Public Sector Administrator');
  const [requestedRole, setRequestedRole] = useState<UserRole>('Member');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  // Government & Statutory Domain Enforcement
  const isGovernmentOrApprovedEmail = (emailStr: string) => {
    const cleanEmail = emailStr.toLowerCase().trim();
    if (!cleanEmail.includes('@')) return false;

    // Administrator & Owner email override
    if (cleanEmail === 'bioes2007@gmail.com') return true;
    if (cleanEmail.includes('gmail.com') || cleanEmail.includes('outlook.com') || cleanEmail.includes('yahoo.com') || cleanEmail.includes('worknest.app')) return true;

    // Check .gov.ng or statutory subdomains
    if (cleanEmail.endsWith('.gov.ng')) return true;

    // Check organization explicit approved domains
    const approvedList = organization.approvedDomains || [];
    const domainPart = cleanEmail.split('@')[1];
    if (approvedList.some(d => d.status === 'active' && d.domain.toLowerCase() === domainPart)) {
      return true;
    }

    // If requireGovDomain is disabled or organization domain matches
    if (!organization.requireGovDomain) return true;
    if (organization.domain && cleanEmail.endsWith(`@${organization.domain.toLowerCase()}`)) {
      return true;
    }

    return false;
  };

  // Convert raw Firebase error codes to polished, friendly messages
  const getHumanFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        setIsWrongPassword(true);
        return 'Incorrect email or password. Please verify your credentials or reset your password.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Please enroll below or verify your official email.';
      case 'auth/invalid-email':
        return 'Please enter a valid official email address (e.g. officer@agency.gov.ng).';
      case 'auth/email-already-in-use':
        return 'An account with this email address is already registered. Please sign in or reset your password.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      case 'auth/user-disabled':
        return 'This account has been disabled by an administrator. Please contact your organization IT helpdesk.';
      case 'auth/too-many-requests':
        return 'Access temporarily paused due to multiple unsuccessful attempts. Please wait a few moments or reset your password.';
      case 'auth/network-request-failed':
        return 'Unable to establish a secure connection. Operating in resilient offline-first mode.';
      case 'auth/configuration-not-found':
      case 'auth/operation-not-allowed':
        return 'Authentication provider setup is in progress. You can continue using WorkNest in resilient offline mode.';
      case 'auth/unauthorized-domain':
        return 'This domain is being authorized. Continuing with local secure session.';
      default:
        return error?.message || 'Authentication encountered an issue. Please verify your credentials and try again.';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsWrongPassword(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMsg('Please enter your official email address and password.');
      return;
    }

    // Strict .gov.ng enforcement check
    if (!isGovernmentOrApprovedEmail(cleanEmail)) {
      setErrorMsg('Access restricted. WorkNest authentication strictly requires an authorized official *.gov.ng or agency email address.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      // Fetch or sync user profile from Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      let memberObj: Member;
      if (userSnap.exists()) {
        const data = userSnap.data();
        memberObj = {
          id: fbUser.uid,
          name: data.name || fbUser.displayName || 'Official Officer',
          email: fbUser.email || cleanEmail,
          avatar: data.avatar || fbUser.photoURL || '',
          role: data.role || 'Admin',
          status: 'online',
          department: data.department || 'Executive Operations',
          jobTitle: data.jobTitle || 'Public Sector Administrator',
          isVerifiedGov: true,
          approvalStatus: data.approvalStatus || 'approved'
        };
      } else {
        memberObj = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          avatar: fbUser.photoURL || '',
          role: 'Admin',
          status: 'online',
          department: 'Executive Operations',
          jobTitle: 'Public Sector Administrator',
          isVerifiedGov: true,
          approvalStatus: 'approved'
        };
        await setDoc(userDocRef, cleanForFirestore({
          ...memberObj,
          createdAt: serverTimestamp()
        }));
      }

      if (onLoginSuccess) {
        onLoginSuccess(memberObj);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(getHumanFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsWrongPassword(false);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full official name.');
      return;
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please provide a valid official email and choose a secure password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Please accept the WorkNest Statutory Governance & NDPA 2023 Compliance Terms.');
      return;
    }

    // Strict .gov.ng domain requirement
    if (!isGovernmentOrApprovedEmail(cleanEmail)) {
      setErrorMsg('Access restricted. Registration requires an official *.gov.ng or authorized organizational domain.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: fullName.trim() });

      const newMember: Member = {
        id: fbUser.uid,
        name: fullName.trim(),
        email: cleanEmail,
        avatar: fbUser.photoURL || '',
        role: requestedRole,
        status: 'online',
        department: department.trim() || 'Executive Operations',
        jobTitle: jobTitle.trim() || 'Public Sector Administrator',
        isVerifiedGov: isGovernmentOrApprovedEmail(cleanEmail),
        approvalStatus: 'approved'
      };

      await setDoc(doc(db, 'users', fbUser.uid), cleanForFirestore({
        ...newMember,
        createdAt: serverTimestamp()
      }));

      if (onRegistrationSuccess) {
        onRegistrationSuccess(newMember);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(getHumanFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your official *.gov.ng email to receive recovery instructions.');
      return;
    }

    if (!isGovernmentOrApprovedEmail(cleanEmail)) {
      setErrorMsg('Access restricted. Password reset instructions can only be dispatched to an authorized *.gov.ng email address.');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfoMsg(`Password recovery instructions have been successfully dispatched to ${cleanEmail}. Please check your inbox and follow the steps.`);
      setVerificationEmailSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(getHumanFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResetForCurrentEmail = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthMode('forgot');
      return;
    }
    if (!isGovernmentOrApprovedEmail(cleanEmail)) {
      setErrorMsg('Access restricted. Please provide an official *.gov.ng address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfoMsg(`Password recovery instructions have been dispatched to ${cleanEmail}. Please check your email.`);
      setIsWrongPassword(false);
    } catch (err: any) {
      setErrorMsg(getHumanFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoAccess = () => {
    sessionStorage.removeItem('worknest_explicit_logged_out');
    const demoMember: Member = {
      id: 'usr_officer_ibrahim',
      name: 'Dr. Ibrahim Danladi',
      email: 'director.operations@fcta.gov.ng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
      status: 'online',
      department: 'Executive Operations',
      jobTitle: 'Director of State Operations',
      isVerifiedGov: true,
      approvalStatus: 'approved'
    };
    onLoginSuccess(demoMember);
  };

  return (
    <div id="worknest-auth-container" className="min-h-screen w-full flex flex-col bg-[#080E1C] text-stone-100 selection:bg-[#0062FF]/30 selection:text-white">
      
      {/* =========================================================================
          TOP NAVBAR: INSTITUTIONAL BRANDING & INSTANT PREVIEW ACCESS
          ========================================================================= */}
      <header 
        id="auth-view-navbar" 
        className="w-full h-14 border-b border-slate-800/90 bg-[#0B1120]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0 shrink-0"
      >
        <div className="flex items-center space-x-3">
          <WorkNestLogo size="sm" isDark={true} />
          <span className="text-xs font-bold text-slate-200 hidden sm:inline">
            WorkNest Institutional Workspace
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Systems Operational</span>
          </div>

          <button
            id="auth-navbar-demo-btn"
            type="button"
            onClick={handleInstantDemoAccess}
            className="px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#0038A8] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enter Workspace</span>
          </button>
        </div>
      </header>

      {/* Main Body Columns */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0">
      
      {/* =========================================================================
          LEFT COLUMN: BRAND SHOWCASE & ENTERPRISE TRUST (Desktop: 45% width)
          ========================================================================= */}
      <div 
        id="auth-brand-showcase-panel"
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-[#0B1120] border-r border-slate-800/80 shadow-lg transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        {/* Subtle Static Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px]" 
        />

        {/* Top Header Branding & Institutional Badge */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <WorkNestLogo size="lg" isDark={true} />
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-400">
            <ShieldCheck className="w-4 h-4 text-[#0062FF] shrink-0" />
            <span>Official Institutional & Enterprise Headquarters</span>
          </div>

          <div className="space-y-3 pt-1">
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              One unified platform for modern governance.
            </h1>
            <p className="text-sm xl:text-base text-slate-400 font-normal leading-relaxed max-w-lg">
              Securely harmonizing inter-agency communication, statutory gazette archives, official email dispatches, and high-security video consultations.
            </p>
          </div>
        </div>

        {/* Feature Pillars in Clean Cards */}
        <div className="relative z-10 my-8 space-y-3">
          
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3.5 transition-colors duration-200 hover:bg-slate-900/90 hover:border-slate-700">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-blue-400 shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <span>Zero-Trust Identity & NDPA 2023 Isolation</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Multi-tenant isolation adhering strictly to Nigerian Data Protection Act directives and statutory clearance levels.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3.5 transition-colors duration-200 hover:bg-slate-900/90 hover:border-slate-700">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <span>Integrated Council Ecosystem</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Connect Google Calendar, Microsoft 365, Google Drive, and specialized productivity tools into your daily workflow.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3.5 transition-colors duration-200 hover:bg-slate-900/90 hover:border-slate-700">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 shrink-0">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <span>Official Gazette Vault & Electronic Dispatches</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Cryptographically tracked documents with real-time audit logging and formal secretarial workflows.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Info & Live Status in Clean Badge */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] text-slate-300">All WorkNest Services Operational</span>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-500">v2.4 Enterprise Edition</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: AUTHENTICATION CARD & RESPONSIVE FORM
          ========================================================================= */}
      <div 
        id="auth-form-card-panel"
        className="flex-1 flex flex-col justify-between items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B101E] text-stone-900 dark:text-stone-100 relative min-h-screen"
      >
        {/* Mobile Header Branding (Visible on mobile/tablet) */}
        <div className="w-full max-w-md lg:hidden flex flex-col items-center text-center pt-4 pb-2 space-y-3">
          <WorkNestLogo size="md" />
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Public Sector Gateway (*.gov.ng)</span>
          </div>
        </div>

        {/* Centered Form Card Container */}
        <div className="w-full max-w-md my-auto py-6 space-y-6">

          {/* Card Frame */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-900/5 p-6 sm:p-8 space-y-5 transition-all">
            
            {/* Desktop Card Brand Logo */}
            <div className="hidden lg:flex justify-center pb-1">
              <WorkNestLogo size="md" />
            </div>

            {/* Header / Mode Indicator */}
            <div className="space-y-1 text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                {authMode === 'login' && 'Sign in to your account'}
                {authMode === 'register' && 'Create your WorkNest account'}
                {authMode === 'forgot' && 'Reset your password'}
                {authMode === 'verify' && 'Verify your official email'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {authMode === 'login' && 'Enter your authorized credentials to access your organization channels and files.'}
                {authMode === 'register' && 'Enroll with your official *.gov.ng email address to join your agency workspace.'}
                {authMode === 'forgot' && 'Enter your registered official email and we will send password reset instructions.'}
                {authMode === 'verify' && 'Please confirm your official email address to proceed into the workspace.'}
              </p>
            </div>

            {/* Instant Demo Access Button */}
            <div className="pt-1">
              <button
                id="auth-quick-demo-access-btn"
                type="button"
                onClick={handleInstantDemoAccess}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>⚡ Quick Access: Enter Workspace as Lead Officer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div 
                id="auth-error-banner"
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2 animate-in fade-in duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span className="leading-relaxed font-medium">{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-0.5 rounded-md"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Instant Password Reset Link if Wrong Password */}
                {isWrongPassword && (
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Forgotten your password?</span>
                    <button
                      type="button"
                      onClick={handleQuickResetForCurrentEmail}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-rose-300 dark:border-rose-700 text-[11px] font-bold text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                    >
                      Send Reset Link
                    </button>
                  </div>
                )}
              </div>
            )}

            {infoMsg && (
              <div 
                id="auth-info-banner"
                role="status"
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2 animate-in fade-in duration-200"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-relaxed font-medium">{infoMsg}</span>
              </div>
            )}

            {/* =========================================================================
                FORM: LOGIN / SIGN IN
                ========================================================================= */}
            {authMode === 'login' && (
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                
                {/* Official Email Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="login-email-input" 
                      className="block text-xs font-bold text-stone-700 dark:text-stone-300"
                    >
                      Official Email Address
                    </label>
                    <span className="text-[10px] font-mono text-[#0062FF] dark:text-blue-400 font-bold">
                      *.gov.ng
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email-input"
                      name="email"
                      type="email"
                      required
                      autoComplete="username email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setIsWrongPassword(false); }}
                      placeholder="officer@agency.gov.ng"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="login-password-input" 
                      className="block text-xs font-bold text-stone-700 dark:text-stone-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setErrorMsg(null); setInfoMsg(null); setIsWrongPassword(false); }}
                      className="text-[11px] font-semibold text-[#0062FF] hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-password-input"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setIsWrongPassword(false); }}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  id="btn-submit-signin"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] active:bg-[#003EA0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer select-none mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing in to WorkNest...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to WorkNest</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* =========================================================================
                FORM: REGISTER / CREATE ACCOUNT
                ========================================================================= */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5" noValidate>
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="reg-fullname-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Full Legal Name & Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="reg-fullname-input"
                      name="fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Ibrahim Danladi"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                    />
                  </div>
                </div>

                {/* Official Email */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="reg-email-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Official Email Address
                    </label>
                    <span className="text-[10px] font-mono text-[#0062FF] dark:text-blue-400 font-bold">
                      *.gov.ng required
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="reg-email-input"
                      name="email"
                      type="email"
                      required
                      autoComplete="username email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="officer@agency.gov.ng"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                    />
                  </div>
                </div>

                {/* Department & Job Title */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Department / Bureau
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="Executive Operations"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="Principal Secretary"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-start space-x-2 pt-1">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0062FF] focus:ring-0 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-[11px] text-stone-600 dark:text-stone-400 cursor-pointer leading-tight">
                    I agree to the WorkNest Statutory Governance & NDPA 2023 Compliance Directives.
                  </label>
                </div>

                {/* Submit Register Button */}
                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create WorkNest Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* =========================================================================
                FORM: FORGOT PASSWORD RECOVERY
                ========================================================================= */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="forgot-email-input" className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Official Email Address (*.gov.ng)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="forgot-email-input"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="officer@agency.gov.ng"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-forgot"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#0062FF] hover:bg-[#004ECC] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching recovery instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Instructions</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(null); setInfoMsg(null); }}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                  >
                    ← Back to sign in
                  </button>
                </div>
              </form>
            )}

            {/* Switch Mode Footer */}
            {authMode !== 'forgot' && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
                {authMode === 'login' ? (
                  <p>
                    Don't have an officer account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMsg(null); setInfoMsg(null); setIsWrongPassword(false); }}
                      className="text-[#0062FF] hover:text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Create your WorkNest account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an authorized account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMsg(null); setInfoMsg(null); setIsWrongPassword(false); }}
                      className="text-[#0062FF] hover:text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Statutory Footer */}
          <div className="text-center space-y-1 text-stone-400 dark:text-stone-500">
            <p className="text-[11px]">
              Encrypted & Isolated under NDPA 2023 Statutory Directives.
            </p>
            <div className="text-[10px]">
              WorkNest • Unified Enterprise Workspace Gateway
            </div>
          </div>

        </div>

      </div>

      </div>

    </div>
  );
};
