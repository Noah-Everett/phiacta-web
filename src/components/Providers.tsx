"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { MathJaxContext } from "better-react-mathjax";

const mathJaxConfig = {
  tex: {
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
  },
};

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MathJaxContext config={mathJaxConfig}>{children}</MathJaxContext>
    </AuthProvider>
  );
}
