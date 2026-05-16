"use client";

import { ReactNode } from "react";
import ConvexClientProvider from "../app/ConvexClientProvider";
import { LanguageProvider } from "./LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <LanguageProvider>
        <LanguageSwitcher />
        {children}
      </LanguageProvider>
    </ConvexClientProvider>
  );
}
