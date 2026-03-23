// constants/sizes.ts

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SIZES = {
  // 1. Marginesy i Paddingi (8-point grid)
  xs: 4,
  sm: 8,
  md: 16, // Standardowy margines ekranu
  lg: 24, // Duży margines, często używany w kontenerach z tekstem
  xl: 32,
  xxl: 48,

  // 2. Zaokrąglenia rogów (Border Radius)
  radius_sm: 8, // Małe przyciski, tagi
  radius_md: 12, // Karty, inputy (najbardziej popularne)
  radius_lg: 16, // Duże karty, modale
  radius_xl: 24, // Bottom sheets
  radius_pill: 999, // Idealne zaokrąglenie pigułki / koła

  // 3. Rozmiary fontów (Typografia)
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body_lg: 16, // Główny tekst czytany
  body_md: 14, // Standardowy tekst podrzędny
  body_sm: 12, // Drobny tekst (np. etykiety w pasku nawigacji)
  tiny: 10, // Mikrotekst (np. czas dodania zgłoszenia)

  // 4. Rozmiary ikon
  icon_sm: 16,
  icon_md: 24, // Standardowa ikona w nawigacji
  icon_lg: 32,
  icon_xl: 48,

  // 5. Specyficzne dla komponentów
  input_height: 52, // Wysokość idealna pod kciuk (Min. 44px według wytycznych Apple)
  button_height: 56, // Gruby, "klikalny" przycisk
  bottom_tab_height: Platform.OS === 'ios' ? 85 : 65, // Z uwzględnieniem dolnego paska w iPhone

  // 6. Wymiary ekranu
  width,
  height
};
