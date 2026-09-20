import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase-catalog';

export type AdminAuthStatus = 'checking' | 'signed_out' | 'admin' | 'not_admin' | 'unconfigured' | 'error';

type AdminAuthValue = {
  status: AdminAuthStatus;
  user: User | null;
  error: string;
  signIn: (email: string, password: string) => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setStatus('unconfigured');
      return;
    }
    const configuredClient = client;

    let mounted = true;
    async function resolveAdmin(session: Session | null) {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setError('');
          setStatus('signed_out');
        }
        return;
      }

      const { data, error: profileError } = await configuredClient
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!mounted) return;
      setUser(session.user);
      if (profileError) {
        setError('Admin roles are not available yet. Run the profile and RLS setup in supabase/schema.sql.');
        setStatus('error');
        return;
      }
      setStatus(data?.role === 'admin' ? 'admin' : 'not_admin');
      setError(data?.role === 'admin' ? '' : 'This account is not authorized for the admin workspace.');
    }

    void configuredClient.auth.getSession().then(({ data }) => resolveAdmin(data.session));
    const { data: listener } = configuredClient.auth.onAuthStateChange((_event, session) => {
      void resolveAdmin(session);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const client = getSupabaseClient();
    if (!client) return 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before signing in.';
    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error) return result.error.message;
    setError('');
    return null;
  }

  async function sendPasswordReset(email: string) {
    const client = getSupabaseClient();
    if (!client) return 'Add the Supabase browser credentials before requesting a reset.';
    const redirectTo = new URL('/admin/login', window.location.origin).toString();
    const result = await client.auth.resetPasswordForEmail(email, { redirectTo });
    return result.error?.message ?? null;
  }

  async function signOut() {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    setUser(null);
    setStatus('signed_out');
  }

  return (
    <AdminAuthContext.Provider value={{ status, user, error, signIn, sendPasswordReset, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('Admin auth is unavailable outside AdminAuthProvider');
  return value;
}