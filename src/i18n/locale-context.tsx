"use client";

import { createContext, useContext } from "react";

import type { Locale } from "./config";
import es from "./dictionaries/es";

type Dictionary = typeof es;

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const fallbackContext: LocaleContextValue = {
  locale: "es",
  dictionary: es,
};

const LocaleContext = createContext<LocaleContextValue>(fallbackContext);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: Readonly<{
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}>) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  return useContext(LocaleContext);
}

export function useLocale() {
  return useLocaleContext().locale;
}

export function useDictionary() {
  return useLocaleContext().dictionary;
}