import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { setUserIdentity } from '../utils/analytics';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGSI: (idToken: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGSI: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                setUserIdentity(session.user.id, {
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name,
                });
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    setUserIdentity(session.user.id, {
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name,
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // GSI ID Token → Supabase 세션
    const signInWithGSI = async (idToken: string) => {
        const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGSI, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
