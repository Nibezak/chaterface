'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { init, id } from '@instantdb/react';
import { Homepage } from '../components/Homepage';
import Cookies from 'js-cookie';


const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '';
const db = init({ appId: APP_ID });

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_NAME = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_NAME || '';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  error: Error | null;
  db: any;
  sessionId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, user, error } = db.useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Ensure profile exists for logged in users; if not, create one.
  useEffect(() => {
    const ensureProfile = async () => {
      if (user) {
        const result = await db.queryOnce({
          userProfiles: {
            $: {
              where: { 'user.id': user.id }
            }
          }
        });
        const userProfile = result.data.userProfiles[0];
        if (!userProfile) {
          const profileId = id();
          await db.transact(
            db.tx.userProfiles[profileId].update({ credits: 0 }).link({ user: user.id })
          );
        }
      } else {
        // For non-logged in users, manage a session ID via cookies.
        let currentSessionId = Cookies.get('sessionId');
        if (!currentSessionId) {
          currentSessionId = id();
          Cookies.set('sessionId', currentSessionId, { expires: 7 });
        }
        setSessionId(currentSessionId);
      }
    };
    ensureProfile();
  }, [user]);

  const { data: profileData } = db.useQuery({
    userProfiles: {
      $: {
        where: { 'user.id': user?.id ?? '' }
      }
    }
  });

  useEffect(() => {
    if (profileData) {
      setProfile(profileData.userProfiles[0]);
    }
  }, [profileData]);


  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-sage-1 dark:bg-sage-2">
          <p className="text-sm text-sage-11 dark:text-sage-11">Loading authentication state...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm text-red-600">Authentication Error: {error.message}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthContext.Provider value={{ user, isLoading, error: error || null, profile, db, sessionId }}>
        {children}
      </AuthContext.Provider>
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}