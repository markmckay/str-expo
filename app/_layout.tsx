import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { logger } from '@/utils/logger';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    logger.info('App', 'Root layout mounted');
    
    return () => {
      logger.info('App', 'Root layout unmounted');
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}