import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { AuthState, AuthUser, Profile } from "@/lib/types";

const AuthContext = createContext<AuthState | null>(null);

const SESSION_TIMEOUT_MS = 6000;

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    name: string,
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
            () => reject(new Error(`${name} timed out after ${timeoutMs}ms`)),
            timeoutMs,
        );
    });

    return Promise.race([promise, timeoutPromise]).finally(() =>
        clearTimeout(timeoutId),
    );
}

async function fetchProfile(
    userId: string,
    email: string,
): Promise<AuthUser | null> {
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error || !profile) return null;
    return { id: userId, email, profile: profile as Profile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const hydrateFromSession = async (
            session: Awaited<
                ReturnType<typeof supabase.auth.getSession>
            >["data"]["session"],
        ) => {
            if (!session) {
                if (!cancelled) setUser(null);
                return;
            }

            try {
                const authUser = await withTimeout(
                    fetchProfile(session.user.id, session.user.email ?? ""),
                    SESSION_TIMEOUT_MS,
                    "fetchProfile",
                );
                if (!cancelled) setUser(authUser);
            } catch (err) {
                console.warn("Auth profile hydration failed:", err);
                if (!cancelled) setUser(null);
            }
        };

        const init = async () => {
            try {
                const {
                    data: { session },
                } = await withTimeout(
                    supabase.auth.getSession(),
                    SESSION_TIMEOUT_MS,
                    "supabase.auth.getSession",
                );
                await hydrateFromSession(session);
            } catch (err) {
                console.error("Auth init error:", err);
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void init();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;

            if (event === "SIGNED_OUT") {
                setUser(null);
                setIsLoading(false);
                return;
            }

            if (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION" ||
                event === "TOKEN_REFRESHED" ||
                event === "USER_UPDATED"
            ) {
                setIsLoading(true);
                // Avoid awaiting directly in auth callback to prevent re-entrancy issues.
                void (async () => {
                    await hydrateFromSession(session);
                    if (!cancelled) setIsLoading(false);
                })();
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<boolean> => {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setIsLoading(false);
                return false;
            }
            return true;
        },
        [],
    );

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const value: AuthState = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.profile?.is_admin ?? false,
        isLoading,
        login,
        logout,
        toggleRole: () => {
            console.warn("toggleRole is disabled");
        },
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
