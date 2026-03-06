'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface DbUser {
  id: string;
  role: string;
  email: string;
}

let cachedUser: DbUser | null = null;

export function useDbUser() {
  const { userId: clerkId } = useAuth();
  const [dbUser, setDbUser] = useState<DbUser | null>(cachedUser);

  useEffect(() => {
    if (!clerkId) return;
    if (cachedUser) { setDbUser(cachedUser); return; }
    fetch('/api/me').then((r) => r.json()).then((u) => {
      if (u.id) { cachedUser = u; setDbUser(u); }
    });
  }, [clerkId]);

  return dbUser;
}
