import { apiClient } from '@/constants/api';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export const useNearbyPosts = (lat?: number, lng?: number, radius: number = 15) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNearbyPosts = useCallback(async () => {
    if (!lat || !lng) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get(
        `/posts/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`
      );
      setPosts(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Error');
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng, radius]);

  useFocusEffect(
    useCallback(() => {
      fetchNearbyPosts();
    }, [fetchNearbyPosts])
  );

  return { posts, isLoading, error, refetch: fetchNearbyPosts };
};
