export type ReportCategory = 'wypadek' | 'niebezpieczenstwo' | 'policja';

export interface Report {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  category: ReportCategory;
  imageUrl: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Wypadek na Fordońskiej',
    description:
      'Dwa samochody osobowe się zderzyły, zablokowany prawy pas. Policja już jest na miejscu.',
    lat: 53.1235,
    lng: 18.0084,
    category: 'wypadek',
    imageUrl:
      'https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=400&auto=format&fit=crop',
    upvotes: 14,
    downvotes: 1,
    createdAt: '10 min temu'
  },
  {
    id: '2',
    title: 'Ktoś pływa w Brdzie',
    description: 'Znowu morsują poza sezonem niedaleko Wyspy Młyńskiej. Lepiej uważać.',
    lat: 53.125,
    lng: 18.0,
    category: 'niebezpieczenstwo',
    imageUrl:
      'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=400&auto=format&fit=crop',
    upvotes: 5,
    downvotes: 12,
    createdAt: '25 min temu'
  },
  {
    id: '3',
    title: 'Suszarka za krzakami',
    description: 'Stoją z radarem na wylotówce, noga z gazu!',
    lat: 53.135,
    lng: 18.015,
    category: 'policja',
    imageUrl: 'https://unsplash.com/photos/blue-bmw-car-in-a-dark-room-ffH_GkINfyY',
    upvotes: 89,
    downvotes: 0,
    createdAt: '2 min temu'
  },
  {
    id: '4',
    title: 'Wielka wyrwa w asfalcie',
    description: 'Na Rondzie Jagiellonów znowu dziura, w którą można wpaść całym kołem. Omijajcie!',
    lat: 53.1215,
    lng: 18.005,
    category: 'niebezpieczenstwo',
    imageUrl:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=400&auto=format&fit=crop',
    upvotes: 34,
    downvotes: 2,
    createdAt: '1 godz. temu'
  }
];
