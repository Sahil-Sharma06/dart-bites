"use client";

import { getClientAuth } from "@dartbites/firebase";
import { Button, Card } from "@dartbites/ui";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(getClientAuth(), email, password);
      router.push("/orders");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4 chalkboard-bg">
      <Card className="w-full max-w-sm space-y-4 !border-white/10 !bg-surface/90 !text-white">
        <h1 className="font-sora text-2xl font-extrabold uppercase tracking-tight">Admin Login</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder-on-surface-variant"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border border-white/10 bg-background/60 px-3 py-2 text-sm text-white placeholder-on-surface-variant"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button className="w-full !bg-secondary !text-on-secondary text-xs font-bold uppercase tracking-widest" type="submit">
            Sign In
          </Button>
        </form>
      </Card>
    </main>
  );
}
