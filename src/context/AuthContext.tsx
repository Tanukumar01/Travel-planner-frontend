import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { ReactNode } from "react";
import { fetchCurrentUser, loginUser, registerUser } from "../lib/api";
import type { AuthResponse, User } from "../types";

type AuthContextValue = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "travel-docs-auth";

const storeAuth = (auth: AuthResponse): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

const readStoredAuth = (): AuthResponse | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AuthResponse;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrapAuth = async (): Promise<void> => {
            const stored = readStoredAuth();

            if (!stored?.token) {
                setLoading(false);
                return;
            }

            try {
                const profile = await fetchCurrentUser(stored.token);
                setUser(profile);
                setToken(stored.token);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            } finally {
                setLoading(false);
            }
        };

        void bootstrapAuth();
    }, []);

    const saveSession = async (auth: AuthResponse): Promise<void> => {
        storeAuth(auth);
        setToken(auth.token);
        setUser({
            _id: auth._id,
            name: auth.name,
            email: auth.email,
        });
    };

    const login = async (email: string, password: string): Promise<void> => {
        const auth = await loginUser({ email, password });
        await saveSession(auth);
    };

    const register = async (
        name: string,
        email: string,
        password: string
    ): Promise<void> => {
        const auth = await registerUser({ name, email, password });
        await saveSession(auth);
    };

    const logout = (): void => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};
