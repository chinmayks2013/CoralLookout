import { Suspense } from "react";
import { LoginView } from "@/components/auth/LoginView";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-md px-4 py-16 text-center text-slate-400">
          Loading…
        </section>
      }
    >
      <LoginView />
    </Suspense>
  );
}
