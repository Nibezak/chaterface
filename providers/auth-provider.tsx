'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { init, id } from '@instantdb/react';
import { Homepage } from '../components/Homepage';
import Pricing from '@/components/Pricing';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '';

const db = init({ appId: APP_ID });

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_NAME = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_NAME || '';

interface AuthContextType {
  user: any | null; // Consider defining a more specific user type
  profile: any | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, user, error } = db.useAuth();
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const ensureProfile = async () => {
      if (user) {
        const profile = await db.queryOnce({
          userProfiles: {
            $: {
              where: {
                'user.id': user.id
              }
            }
          }
        }).then((data) => {
          return data.data.userProfiles[0];
        })

        if (!profile) {
          const profileId = id()
          await db.transact(db.tx.userProfiles[profileId].update({
            credits: 0
          }).link({user: user?.id}))
        }
      }
    };
    ensureProfile();
  }, [user]);


  const { data: profileData, isLoading: profileIsLoading, error: profileError } = db.useQuery({
    userProfiles: {
      $: {
        where: { 'user.id': user?.id ?? '' }
      }
    }
  })

  useEffect(() => {
    if (profileData) {
      setProfile(profileData.userProfiles[0])
    }
  }, [profileData])

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }
  if (error) {
    return <div>Authentication Error: {error.message}</div>;
  }

  if (profile && profile.credits == 0) {
    return(
      <div className='flex flex-col items-center justify-center h-screen dark'>
        <div className='text-lg font-medium text-sage-12'>Looks like you don't have any credits</div>
        <div className='text-sm text-sage-11'>Choose a plan that works for you</div>
        <Pricing userId={user?.id || ''} />
      </div>
    )
  }

  // Render children if user is authenticated, otherwise render Homepage component
  return (
    <AuthContext.Provider value={{ user, isLoading, error: error || null, profile: profile }}>
      {user ? children : <Homepage db={db} googleClientId={GOOGLE_CLIENT_ID} googleClientName={GOOGLE_CLIENT_NAME} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Return the whole context for flexibility, including user, isLoading, error
  return context;
} 