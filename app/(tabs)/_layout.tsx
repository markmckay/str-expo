import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Book, Play, Settings } from 'lucide-react-native';
import { logger } from '@/utils/logger';

export default function TabLayout() {
  useEffect(() => {
    logger.info('Navigation', 'Tab layout mounted');
    
    return () => {
      logger.info('Navigation', 'Tab layout unmounted');
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#F8F9FA',
          borderTopColor: '#E5E5EA',
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ size, color }) => (
            <Book size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            logger.logUserAction('tab_press', 'Library');
          },
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: 'Player',
          tabBarIcon: ({ size, color }) => (
            <Play size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            logger.logUserAction('tab_press', 'Player');
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            logger.logUserAction('tab_press', 'Settings');
          },
        }}
      />
    </Tabs>
  );
}