"use client";

import { ReactNode } from "react";
import ConvexClientProvider from "../app/ConvexClientProvider";
import { LanguageProvider } from "./LanguageContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ConvexClientProvider>
  );
}
