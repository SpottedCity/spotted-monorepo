// constants/mock-user.ts

export type TrustLevel = 'Nowicjusz' | 'Zaufany' | 'Ekspert Lojalny';
export type Role = 'user' | 'moderator' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;

  // LOKALIZACJA (wybrać województwo i miasto)
  voivodeship: string;
  city: string;

  // REPUTACJA I AKTYWNOŚĆ (oceniać wpisy, budować reputację)
  reputationScore: number; // Główny wskaźnik wiarygodności konta
  trustLevel: TrustLevel; // Ranga na podstawie punktów
  stats: {
    reportsAdded: number; // dodawać wpisy i pinezki
    commentsAdded: number; // komentować wpisy
    upvotesReceived: number; // oceniane przez społeczność
    downvotesReceived: number;
    fakeReportsGiven: number; // zgłaszać nieodpowiednie/fałszywe treści
  };

  // PREFERENCJE (obserwować wybrane wpisy lub kategorie)
  preferences: {
    observedCategories: string[]; // np. ['wypadek', 'policja', 'wydarzenia']
    notificationsEnabled: boolean; // otrzymywać powiadomienia
  };

  // METADANE
  role: Role;
  createdAt: string;
}

// === PRZYKŁADOWE DANE (MOCK) ===

export const mockCurrentUser: UserProfile = {
  id: 'usr_987654321',
  username: 'BydgoskiBatman',
  email: 'batman@bydgoszcz.pl',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',

  voivodeship: 'Kujawsko-Pomorskie',
  city: 'Bydgoszcz',

  reputationScore: 1250,
  trustLevel: 'Ekspert Lojalny',

  stats: {
    reportsAdded: 42,
    commentsAdded: 156,
    upvotesReceived: 380,
    downvotesReceived: 12,
    fakeReportsGiven: 5
  },

  preferences: {
    observedCategories: ['wypadek', 'niebezpieczenstwo', 'policja'],
    notificationsEnabled: true
  },

  role: 'user',
  createdAt: '2023-11-15T08:30:00Z'
};
