import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
    onLogin: (email: string, password: string) => Promise<void>;
    onRegister: (name: string, email: string, password: string) => Promise<void>;
};

const AuthPanel = ({ onLogin, onRegister }: Props) => {
    const [mode, setMode] = useState<"login" | "register">("register");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") || "");
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        setSubmitting(true);
        setError("");

        try {
            if (mode === "login") {
                await onLogin(email, password);
            } else {
                await onRegister(name, email, password);
            }
        } catch (submissionError) {
            setError(
                submissionError instanceof Error
                    ? submissionError.message
                    : "Something went wrong"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_460px]">
            <div className="px-1 lg:pr-8">
                <span className="text-xs font-medium tracking-[0.34em] text-mint uppercase">
                    Travel planning workspace
                </span>
                <h1 className="mt-4 max-w-[10ch] text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-stone-50 sm:text-6xl md:text-7xl">
                    Turn your bookings into a trip plan you can actually use
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                    Upload tickets, hotel confirmations, or travel documents and get a
                    cleaner itinerary, quick trip context, and a shareable plan in one
                    place. The flow is built to feel simple even when the travel details
                    are messy.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                        ["Upload once", "Flights, stays, and other travel confirmations"],
                        ["Review faster", "See summaries, checklists, and day plans"],
                        ["Share easily", "Send a polished itinerary link when ready"],
                    ].map(([title, copy]) => (
                        <div
                            key={title}
                            className="rounded-3xl border border-white/8 bg-slate-900/35 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.16)]"
                        >
                            <p className="text-sm font-semibold text-stone-100">{title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    {["AI summaries", "Smart itinerary", "Private workspace"].map(
                        (item) => (
                            <span
                                key={item}
                                className="rounded-full border border-mint/35 bg-cyan-950/25 px-4 py-2 text-sm text-mint"
                            >
                                {item}
                            </span>
                        )
                    )}
                </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-800/75 p-7 shadow-[0_28px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        {mode === "login" ? "Welcome back" : "Create your workspace"}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-50">
                        {mode === "login" ? "Sign in to continue" : "Start planning smarter"}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                        {mode === "login"
                            ? "Access your saved itineraries, upload new bookings, and continue planning."
                            : "Create an account to save trips, review uploads, and share itinerary pages."}
                    </p>
                </div>

                <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/8 bg-slate-900/60 p-1.5">
                    <button
                        className={`relative pb-2 text-base transition ${
                            mode === "login"
                                ? "rounded-xl bg-white/8 py-3 font-semibold text-stone-50"
                                : "py-3 text-slate-300 hover:text-slate-100"
                        }`}
                        type="button"
                        onClick={() => setMode("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`relative pb-2 text-base transition ${
                            mode === "register"
                                ? "rounded-xl bg-white/8 py-3 font-semibold text-stone-50"
                                : "py-3 text-slate-300 hover:text-slate-100"
                        }`}
                        type="button"
                        onClick={() => setMode("register")}
                    >
                        Signup
                    </button>
                </div>

                <form className="grid gap-4" onSubmit={handleSubmit}>
                    {mode === "register" ? (
                        <label className="grid gap-2 text-sm text-slate-100">
                            Full name
                            <input
                                className="rounded-xl border border-slate-600/70 bg-slate-800/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-mint/60"
                                name="name"
                                placeholder="Your full name"
                                required
                            />
                        </label>
                    ) : null}

                    <label className="grid gap-2 text-sm text-slate-100">
                        Email
                        <input
                            className="rounded-xl border border-slate-600/70 bg-slate-800/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-mint/60"
                            type="email"
                            name="email"
                            placeholder="your.email@example.com"
                            required
                        />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-100">
                        Password
                        <input
                            className="rounded-xl border border-slate-600/70 bg-slate-800/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-mint/60"
                            type="password"
                            name="password"
                            placeholder={
                                mode === "login"
                                    ? "Enter your password"
                                    : "Enter a strong password"
                            }
                            required
                        />
                    </label>

                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                    <button
                        className="mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(255,109,28,0.26)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting
                            ? "Please wait..."
                            : mode === "login"
                            ? "Login"
                            : "Create account"}
                    </button>

                    <p className="text-center text-sm text-slate-400">
                        {mode === "login"
                            ? "Use the account you created to manage your itinerary history."
                            : "You can log in right after signup and start uploading bookings."}
                    </p>
                </form>
            </div>
        </section>
    );
};

export default AuthPanel;
