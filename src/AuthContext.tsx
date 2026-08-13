import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { deleteAccountSearch, getAccount, loginAccount, logoutAccount, recordAccountSearch, registerAccount, saveAccountSearch, setFavorite } from "./account-api";
import type { AccountSnapshot, SearchCriteria } from "./types";

type AuthContextValue = {
  account: AccountSnapshot | null;
  loading: boolean;
  register: (input: { name?: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (key: string) => Promise<void>;
  saveSearch: (name: string, criteria: SearchCriteria) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  recordSearch: (criteria: SearchCriteria) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccount().then(setAccount).catch(() => setAccount(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    account,
    loading,
    register: async (input) => { setAccount(await registerAccount(input)); },
    login: async (input) => { setAccount(await loginAccount(input)); },
    logout: async () => { await logoutAccount(); setAccount(null); },
    toggleFavorite: async (key) => {
      if (!account) throw new Error("Sign in to save opportunities.");
      const normalized = key.startsWith("opportunity:") ? key : `opportunity:${key}`;
      const favorite = account.favoriteKeys.includes(normalized);
      setAccount(await setFavorite(normalized, !favorite));
    },
    saveSearch: async (name, criteria) => { setAccount(await saveAccountSearch(name, criteria)); },
    deleteSavedSearch: async (id) => { setAccount(await deleteAccountSearch(id)); },
    recordSearch: async (criteria) => {
      if (!account) return;
      const next = await recordAccountSearch(criteria);
      if (next) setAccount(next);
    }
  }), [account, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
