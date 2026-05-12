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
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-800">Admin Login</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </Card>
    </main>
  );
}
