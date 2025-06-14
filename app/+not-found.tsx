import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { logger } from '@/utils/logger';
import { useEffect } from 'react';

export default function NotFoundScreen() {
  useEffect(() => {
    logger.warn('Navigation', '404 - Page not found');
    logger.logUserAction('404_page_view', 'NotFound');
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});