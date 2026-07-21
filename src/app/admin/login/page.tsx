import { Suspense } from "react";

import LoginForm from "./LoginForm";

function LoginFormFallback() {
  return (
    <main>
      <p>Loading login form…</p>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
