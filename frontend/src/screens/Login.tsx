import { useState, FormEvent } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-[var(--color-primary-light)] text-center mb-1">
          BeyondSight AI
        </h1>
        <p className="text-[var(--color-text-secondary)] text-center mb-8">
          Log in to continue
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" className="text-[var(--color-error)] text-sm">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
            Log In
          </Button>
        </form>

        <button
          onClick={onSwitchToRegister}
          className="mt-6 w-full text-center text-[var(--color-primary-light)] underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-primary-light)] rounded"
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}