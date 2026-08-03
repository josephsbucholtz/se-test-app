"use client";
 
import { useFormStatus } from "react-dom";
 
// Must be rendered inside the <form action={signOut}> in layout.tsx —
// useFormStatus reads the pending state of its nearest parent form.
export default function SignOutButton() {
  const { pending } = useFormStatus();
 
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}