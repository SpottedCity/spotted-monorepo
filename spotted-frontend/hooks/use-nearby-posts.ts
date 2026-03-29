import { apiClient } from '@/constants/api';
import { useEffect, useState } from 'react';

export const useNearbyPosts = (lat?: number, lng?: number, radius: number = 15) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNearbyPosts = async () => {
    if (!lat || !lng) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get(
        `/posts/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`
      );
      setPosts(response.data);
    } catch (err: any) {
      console.error('Błąd pobierania zgłoszeń:', err);
      setError('Nie udało się pobrać zgłoszeń z okolicy');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyPosts();
  }, [lat, lng, radius]);

  return { posts, isLoading, error, refetch: fetchNearbyPosts };
};
