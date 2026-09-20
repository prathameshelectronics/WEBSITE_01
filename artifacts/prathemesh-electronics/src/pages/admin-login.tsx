import { FormEvent, useState } from 'react';
import { ArrowRight, CircleAlert, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Redirect } from 'wouter';
import { useAdminAuth } from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const { status, error: authError, signIn, sendPasswordReset } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'admin') return <Redirect to="/admin" />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    const error = await signIn(email.trim(), password);
    setMessage(error ?? 'Signed in. Checking admin permissions…');
    setIsSubmitting(false);
  }

  async function handleReset() {
    if (!email.trim()) {
      setMessage('Enter your admin email first.');
      return;
    }
    setIsSubmitting(true);
    const error = await sendPasswordReset(email.trim());
    setMessage(error ?? 'If that email is registered, a reset link is on its way.');
    setIsSubmitting(false);
  }

  const isConfigured = status !== 'unconfigured';
  return (
    <main className="admin-login-page">
      <div className="admin-login-layout">
        <section className="admin-login-story">
          <div className="admin-sidebar-brand"><span className="brand-mark">pe</span><span><strong>prathemesh</strong><small>electronics / india</small></span></div>
          <span className="eyebrow">Private operations</span>
          <h1>Run the catalog with confidence.</h1>
          <p>Manage products, stock, and the customer experience from a workspace built for your team.</p>
          <div className="admin-login-points"><span><ShieldCheck size={16} /> Database-backed admin access</span><span><Sparkles size={16} /> Changes flow to the storefront</span></div>
        </section>
        <section className="admin-login-card">
          <div className="admin-login-card-head"><span className="admin-login-icon"><LockKeyhole size={19} /></span><span className="eyebrow">Admin workspace</span><h2>Sign in securely.</h2><p>Use the Supabase Auth account assigned to your admin role.</p></div>
          {!isConfigured && <div className="admin-auth-notice"><CircleAlert size={16} /><span>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable admin sign-in.</span></div>}
          {authError && status !== 'unconfigured' && <div className="admin-auth-error" role="alert"><CircleAlert size={16} />{authError}</div>}
          {message && <div className={message.includes('Signed in') || message.includes('way') ? 'admin-auth-success' : 'admin-auth-error'} role="status">{message}</div>}
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label className="admin-field"><span>Email</span><div className="admin-input-icon"><Mail size={15} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@prathemesh.in" autoComplete="email" required /></div></label>
            <label className="admin-field"><span>Password</span><div className="admin-input-icon"><LockKeyhole size={15} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /></div></label>
            <button className="button button-dark" type="submit" disabled={isSubmitting || !isConfigured}>{isSubmitting ? 'Checking access…' : 'Sign in'} <ArrowRight size={15} /></button>
          </form>
          <button className="admin-forgot-link" onClick={handleReset} disabled={isSubmitting || !isConfigured}>Forgot password?</button>
          <p className="admin-login-footnote">Customer accounts use the storefront separately. This area is never linked from public navigation.</p>
        </section>
      </div>
    </main>
  );
}