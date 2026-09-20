import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { profileRepo, subscribe } from '@/database';
import { DEFAULT_PROFILE } from '@/constants/defaults';
import type { ChildProfile, ChildProfileInput } from '@/types/models';

interface ProfileContextValue {
  /** The active child's profile. Falls back to the demo profile until loaded. */
  profile: ChildProfile;
  loaded: boolean;
  /** Preferred short name for greetings (nickname if set, else name). */
  displayName: string;
  updateProfile: (patch: Partial<ChildProfileInput>) => Promise<void>;
}

const FALLBACK: ChildProfile = { ...DEFAULT_PROFILE, id: 0, isActive: true, createdAt: '' };

const ProfileContext = createContext<ProfileContextValue>({
  profile: FALLBACK,
  loaded: false,
  displayName: FALLBACK.name,
  updateProfile: async () => {},
});

/**
 * Loads the active child profile once and keeps it in memory. Nothing in the UI hard-codes
 * a name — everything reads `profile` / `displayName` from here.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const p = await profileRepo.getActive();
      if (p) setProfile(p);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
    return subscribe('profile', reload);
  }, [reload]);

  const updateProfile = useCallback(
    async (patch: Partial<ChildProfileInput>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      if (profile.id) await profileRepo.patch(profile.id, patch);
    },
    [profile.id],
  );

  const value = useMemo(
    () => ({ profile, loaded, displayName: profile.nickname || profile.name, updateProfile }),
    [profile, loaded, updateProfile],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext);
}

/** Replaces {name} in parent-written messages with the child's name. */
export function personalize(template: string, name: string): string {
  return template.replace(/\{name\}/gi, name);
}
