import AuthPanel from "../components/AuthPanel";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
    const { login, register } = useAuth();

    return (
        <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
            <AuthPanel onLogin={login} onRegister={register} />
        </main>
    );
};

export default AuthPage;
