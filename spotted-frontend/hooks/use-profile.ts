import { useState } from 'react';
import { Platform } from 'react-native'; // <-- Dodany import Platform
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useImagePicker } from '@/hooks/use-image-picker';
import { apiClient } from '@/constants/api';

const getTrustLevel = (score: number) => {
  if (score >= 1000) return 'Ekspert Lojalny';
  if (score >= 500) return 'Zaufany';
  return 'Nowicjusz';
};

export const useProfile = () => {
  const { pickImage } = useImagePicker();
  const { logout, user, refreshUser } = useAuth();
  const router = useRouter();

  const [apiError, setApiError] = useState('');
  const [isCityModalVisible, setCityModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const currentScore = user?.reputation?.score || 0;
  const currentTrustLevel = getTrustLevel(currentScore);
  const currentCityName = user?.selectedCity?.name || 'Wybierz miasto';

  const handleLogOut = async () => {
    setApiError('');
    try {
      await logout();
      router.replace('/login');
    } catch (error: any) {
      console.log('Logout error:', error);
    }
  };

  const handleCitySelect = async (cityId: string) => {
    if (!user?.id) return;
    setApiError('');
    try {
      await apiClient.put(`/users/${user.id}`, { selectedCityId: cityId });
      await refreshUser();
    } catch (error: any) {
      console.error('Błąd zmiany miasta:', error);
      setApiError('Nie udało się zaktualizować miasta.');
    }
  };

  const handlePickAndUploadAvatar = async () => {
    const uri = await pickImage(true);
    if (!uri) return;

    setApiError('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri,
          name: filename,
          type
        } as any);
      }

      await apiClient.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Awatar wysłany na backend i zapisany!');
      await refreshUser();
    } catch (error: any) {
      console.error('Błąd uploadu awatara:', error);
      setApiError('Nie udało się wgrać awatara na serwer.');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    user,
    currentScore,
    currentTrustLevel,
    currentCityName,
    apiError,
    isCityModalVisible,
    setCityModalVisible,
    isUploading,
    handleLogOut,
    handleCitySelect,
    handlePickAndUploadAvatar
  };
};
