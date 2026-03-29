import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export const useImagePicker = (initialImage: string | null = null) => {
  const [imageUri, setImageUri] = useState<string | null>(initialImage);

  const pickImage = async (circular = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: circular ? [1, 1] : [4, 3],
      quality: 0.8
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      return uri;
    }

    return null;
  };

  const clearImage = () => setImageUri(null);

  return { imageUri, pickImage, clearImage };
};
