import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type BrowserMode = 'everyday' | 'developer' | 'privacy' | 'power';

export type Profile = {
  id: string;
  name: string;
  icon: string;
  accent: 'cyan' | 'amber' | 'violet' | 'green' | 'rose';
  temporary: boolean;
  createdAt: string;
  storageNamespace: string;
};

export type BrowserTab = {
  id: string;
  profileId: string;
  title: string;
  url: string;
  private: boolean;
  updatedAt: string;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  profileId: string;
  createdAt: string;
};

export type HistoryEntry = {
  id: string;
  title: string;
  url: string;
  profileId: string;
  visitedAt: string;
};

export type BrowserExtension = {
  id: string;
  name: string;
  match: string;
  code: string;
  enabled: boolean;
  createdAt: string;
};

export type BrowserSettings = {
  privacyMode: 'balanced' | 'strict';
  routeMode: 'direct' | 'user';
  presentation: 'balanced' | 'desktop';
  httpsFirst: boolean;
  trackingProtection: boolean;
  reduceMotion: boolean;
  userAgentPreset: 'kairox' | 'mobile' | 'desktop' | 'custom';
  customUserAgent: string;
  searchEngine: 'google' | 'duckduckgo' | 'brave';
  javaScriptEnabled: boolean;
  thirdPartyCookies: boolean;
  blockTrackers: boolean;
  blockPopups: boolean;
  proxy: {
    enabled: boolean;
    scheme: 'http' | 'https' | 'socks5';
    host: string;
    port: string;
  };
  extensions: BrowserExtension[];
};

type PersistedState = {
  profiles: Profile[];
  tabs: BrowserTab[];
  bookmarks: Bookmark[];
  history: HistoryEntry[];
  settings: BrowserSettings;
};

type KairoxContextValue = PersistedState & {
  hydrated: boolean;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  createProfile: (name: string, temporary?: boolean) => Profile | null;
  cloneProfile: (profileId: string) => Profile | null;
  deleteProfile: (profileId: string) => void;
  addTab: (url?: string, title?: string, privateTab?: boolean) => BrowserTab;
  closeTab: (tabId: string) => void;
  toggleBookmark: (url: string, title?: string) => void;
  isBookmarked: (url: string) => boolean;
  addHistory: (url: string, title?: string) => void;
  clearHistory: () => void;
  updateSettings: (patch: Partial<BrowserSettings>) => void;
  addExtension: (extension: Omit<BrowserExtension, 'id' | 'createdAt'>) => BrowserExtension | null;
  updateExtension: (extensionId: string, patch: Partial<Omit<BrowserExtension, 'id' | 'createdAt'>>) => void;
  deleteExtension: (extensionId: string) => void;
  profileTabs: (profileId: string) => BrowserTab[];
};

const STORAGE_KEY = '@kairox/browser-state-v1';
const palette: Profile['accent'][] = ['cyan', 'amber', 'violet', 'green', 'rose'];
const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const initialProfiles: Profile[] = [
  { id: 'personal', name: 'Personal', icon: '◌', accent: 'cyan', temporary: false, createdAt: now(), storageNamespace: 'profile-personal' },
  { id: 'development', name: 'Development', icon: '</>', accent: 'violet', temporary: false, createdAt: now(), storageNamespace: 'profile-development' },
  { id: 'research', name: 'Research', icon: '◍', accent: 'amber', temporary: false, createdAt: now(), storageNamespace: 'profile-research' },
];

const initialTabs: BrowserTab[] = [
  { id: 'tab-kairox', profileId: 'personal', title: 'Kairox new tab', url: 'kairox://home', private: false, updatedAt: now() },
  { id: 'tab-docs', profileId: 'development', title: 'Kairox docs', url: 'https://developer.mozilla.org', private: false, updatedAt: now() },
];

const initialState: PersistedState = {
  profiles: initialProfiles,
  tabs: initialTabs,
  bookmarks: [
    { id: 'bookmark-mdn', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', profileId: 'development', createdAt: now() },
  ],
  history: [],
  settings: {
    privacyMode: 'balanced',
    routeMode: 'direct',
    presentation: 'balanced',
    httpsFirst: true,
    trackingProtection: true,
    reduceMotion: false,
    userAgentPreset: 'kairox',
    customUserAgent: '',
    searchEngine: 'google',
    javaScriptEnabled: true,
    thirdPartyCookies: false,
    blockTrackers: true,
    blockPopups: true,
    proxy: { enabled: false, scheme: 'http', host: '', port: '8080' },
    extensions: [],
  },
};

const KairoxContext = createContext<KairoxContextValue | null>(null);

export function KairoxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [activeProfileId, setActiveProfileIdState] = useState(initialProfiles[0].id);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedState;
           if (parsed.profiles?.length && parsed.tabs && parsed.settings) {
             setState({
               ...initialState,
               ...parsed,
               bookmarks: parsed.bookmarks ?? [],
               history: parsed.history ?? [],
                settings: {
                  ...initialState.settings,
                  ...parsed.settings,
                  proxy: { ...initialState.settings.proxy, ...parsed.settings.proxy },
                  extensions: parsed.settings.extensions ?? [],
                },
             });
           }
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const setActiveProfileId = (id: string) => {
    if (state.profiles.some((profile) => profile.id === id)) setActiveProfileIdState(id);
  };

  const createProfile = (name: string, temporary = false) => {
    const cleanName = name.trim();
    if (!cleanName || state.profiles.length >= 50) return null;
    const id = makeId('profile');
    const profile: Profile = {
      id,
      name: cleanName,
      icon: temporary ? '◒' : '◌',
      accent: palette[state.profiles.length % palette.length],
      temporary,
      createdAt: now(),
      storageNamespace: `profile-${id}`,
    };
    setState((previous) => ({
      ...previous,
      profiles: [...previous.profiles, profile],
      tabs: [...previous.tabs, { id: makeId('tab'), profileId: id, title: 'New tab', url: 'kairox://home', private: temporary, updatedAt: now() }],
      bookmarks: previous.bookmarks,
      history: previous.history,
    }));
    setActiveProfileIdState(id);
    return profile;
  };

  const cloneProfile = (profileId: string) => {
    const source = state.profiles.find((profile) => profile.id === profileId);
    if (!source || state.profiles.length >= 50) return null;
    const id = makeId('profile');
    const profile: Profile = { ...source, id, name: `${source.name} copy`, createdAt: now(), storageNamespace: `profile-${id}` };
    setState((previous) => ({
      ...previous,
      profiles: [...previous.profiles, profile],
      tabs: [...previous.tabs, { id: makeId('tab'), profileId: id, title: 'Cloned workspace', url: 'kairox://home', private: false, updatedAt: now() }],
      bookmarks: previous.bookmarks,
      history: previous.history,
    }));
    setActiveProfileIdState(id);
    return profile;
  };

  const deleteProfile = (profileId: string) => {
    if (state.profiles.length <= 1) return;
    const nextProfiles = state.profiles.filter((profile) => profile.id !== profileId);
    setState((previous) => ({
      ...previous,
      profiles: nextProfiles,
      tabs: previous.tabs.filter((tab) => tab.profileId !== profileId),
      bookmarks: previous.bookmarks.filter((bookmark) => bookmark.profileId !== profileId),
      history: previous.history.filter((entry) => entry.profileId !== profileId),
    }));
    if (activeProfileId === profileId) setActiveProfileIdState(nextProfiles[0].id);
  };

  const addTab = (url = 'kairox://home', title = 'New tab', privateTab = false) => {
    const tab: BrowserTab = { id: makeId('tab'), profileId: activeProfileId, title, url, private: privateTab, updatedAt: now() };
    setState((previous) => ({ ...previous, tabs: [...previous.tabs, tab] }));
    return tab;
  };

  const closeTab = (tabId: string) => {
    setState((previous) => {
      const nextTabs = previous.tabs.filter((tab) => tab.id !== tabId);
      return nextTabs.length ? { ...previous, tabs: nextTabs } : {
        ...previous,
        tabs: [...previous.tabs, { id: makeId('tab'), profileId: activeProfileId, title: 'New tab', url: 'kairox://home', private: false, updatedAt: now() }],
      };
    });
  };

  const toggleBookmark = (url: string, title = url.replace(/^https?:\/\//, '').split('/')[0]) => {
    const cleanUrl = url.trim();
    if (!cleanUrl || cleanUrl.startsWith('kairox://')) return;
    setState((previous) => {
      const existing = previous.bookmarks.find((bookmark) => bookmark.url === cleanUrl && bookmark.profileId === activeProfileId);
      return {
        ...previous,
        bookmarks: existing
          ? previous.bookmarks.filter((bookmark) => bookmark.id !== existing.id)
          : [{ id: makeId('bookmark'), title, url: cleanUrl, profileId: activeProfileId, createdAt: now() }, ...previous.bookmarks],
      };
    });
  };

  const isBookmarked = (url: string) => state.bookmarks.some((bookmark) => bookmark.url === url && bookmark.profileId === activeProfileId);

  const addHistory = (url: string, title = url.replace(/^https?:\/\//, '').split('/')[0]) => {
    const cleanUrl = url.trim();
    if (!cleanUrl || cleanUrl.startsWith('kairox://')) return;
    setState((previous) => ({
      ...previous,
      history: [
        { id: makeId('history'), title, url: cleanUrl, profileId: activeProfileId, visitedAt: now() },
        ...previous.history.filter((entry) => !(entry.url === cleanUrl && entry.profileId === activeProfileId)),
      ].slice(0, 100),
    }));
  };

  const clearHistory = () => {
    setState((previous) => ({ ...previous, history: previous.history.filter((entry) => entry.profileId !== activeProfileId) }));
  };

  const updateSettings = (patch: Partial<BrowserSettings>) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, ...patch } }));
  };

  const addExtension = (extension: Omit<BrowserExtension, 'id' | 'createdAt'>) => {
    if (!extension.name.trim() || !extension.code.trim() || state.settings.extensions.length >= 25) return null;
    const created: BrowserExtension = { ...extension, id: makeId('extension'), createdAt: now() };
    setState((previous) => ({ ...previous, settings: { ...previous.settings, extensions: [created, ...previous.settings.extensions] } }));
    return created;
  };

  const updateExtension = (extensionId: string, patch: Partial<Omit<BrowserExtension, 'id' | 'createdAt'>>) => {
    setState((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        extensions: previous.settings.extensions.map((extension) => extension.id === extensionId ? { ...extension, ...patch } : extension),
      },
    }));
  };

  const deleteExtension = (extensionId: string) => {
    setState((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        extensions: previous.settings.extensions.filter((extension) => extension.id !== extensionId),
      },
    }));
  };

  const profileTabs = (profileId: string) => state.tabs.filter((tab) => tab.profileId === profileId);

  const value = useMemo<KairoxContextValue>(() => ({
    ...state,
    hydrated,
    activeProfileId,
    setActiveProfileId,
    createProfile,
    cloneProfile,
    deleteProfile,
    addTab,
    closeTab,
    toggleBookmark,
    isBookmarked,
    addHistory,
    clearHistory,
    updateSettings,
    addExtension,
    updateExtension,
    deleteExtension,
    profileTabs,
  }), [state, hydrated, activeProfileId]);

  return <KairoxContext.Provider value={value}>{children}</KairoxContext.Provider>;
}

export function useKairox() {
  const value = useContext(KairoxContext);
  if (!value) throw new Error('useKairox must be used inside KairoxProvider');
  return value;
}