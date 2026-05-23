import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import SharePage from "./pages/SharePage";

const AppRoutes = () => {
    const { loading, token } = useAuth();

    if (loading) {
        return (
            <main className="grid min-h-screen place-items-center px-6 text-slate-200">
                Loading application...
            </main>
        );
    }

    return (
        <Routes>
            <Route
                path="/"
                element={token ? <DashboardPage /> : <AuthPage />}
            />
            <Route path="/share/:shareId" element={<SharePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);

export default App;
