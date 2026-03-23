import React, { Suspense, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

{
  /*
   * We need to load maps dynamically to avoid the "Metro error: window is not defined".
   * This happens because Expo Router on the web uses Server-Side Rendering (SSR).
   * Before the page reaches the browser, Expo tries to pre-render the HTML on a Node.js server to make it load faster.
   * The core issue is that the Node.js server is just a console environment - it doesn't have a graphical interface, a mouse, and most importantly, it lacks the browser's global `window` object.
   * Since Leaflet requires the `window` object to calculate map dimensions, we must ensure it only loads on the client side.
   */
}

const WebMap = React.lazy(() => import('@/components/map-container'));

export default function HomeScreen() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && isMounted ? (
        <Suspense
          fallback={
            <View style={styles.loading}>
              <Text>Ładowanie mapy...</Text>
            </View>
          }
        >
          <View style={styles.innerContainer}>
            <WebMap />
          </View>
        </Suspense>
      ) : (
        <View style={styles.loading}>
          <Text>KIEDYŚ MOŻE MAPA NATYWNA</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  }
});
