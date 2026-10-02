import { useState, FormEvent } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await registerUser(email, password, name);
      login(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
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
            minLength={6}
            autoComplete="new-password"
          />

          {error && (
            <p role="alert" className="text-[var(--color-error)] text-sm">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <button
          onClick={onSwitchToLogin}
          className="mt-6 w-full text-center text-[var(--color-primary-light)] underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-primary-light)] rounded"
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  );
}