import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { ChevronRight, Download, Trash2, Bug, Info } from 'lucide-react-native';
import { logger } from '@/utils/logger';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
    const timer = logger.startTimer('SettingsScreen_Load');
    logger.info('Screen', 'Settings screen mounted');
    logger.logUserAction('screen_view', 'Settings');
    
    timer();
    
    return () => {
      logger.info('Screen', 'Settings screen unmounted');
    };
  }, []);

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    logger.logUserAction('toggle_notifications', 'Settings', { enabled: value });
  };

  const handleAutoDownloadToggle = (value: boolean) => {
    setAutoDownload(value);
    logger.logUserAction('toggle_auto_download', 'Settings', { enabled: value });
  };

  const handleClearCache = () => {
    logger.logUserAction('clear_cache', 'Settings');
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            logger.info('Settings', 'Cache cleared by user');
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const handleExportLogs = () => {
    logger.logUserAction('export_logs', 'Settings');
    const logs = logger.exportLogs();
    logger.info('Settings', 'Logs exported', { logCount: logger.getLogs().length });
    
    Alert.alert(
      'Debug Logs',
      `Exported ${logger.getLogs().length} log entries. In a real app, these would be shared or saved to a file.`,
      [{ text: 'OK' }]
    );
  };

  const handleViewLogs = () => {
    logger.logUserAction('view_logs', 'Settings');
    const errorLogs = logger.getLogs(2); // Get warnings and errors
    
    Alert.alert(
      'Recent Issues',
      errorLogs.length > 0 
        ? `Found ${errorLogs.length} warnings/errors. Check console for details.`
        : 'No recent issues found.',
      [{ text: 'OK' }]
    );
    
    // Log the recent errors to console for debugging
    if (errorLogs.length > 0) {
      console.log('Recent errors and warnings:', errorLogs);
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true, 
    rightComponent 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showChevron && !rightComponent && (
          <ChevronRight size={16} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon={<Info size={20} color="#007AFF" />}
            title="Notifications"
            subtitle="Get notified about new content"
            showChevron={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          
          <SettingItem
            icon={<Download size={20} color="#34C759" />}
            title="Auto Download"
            subtitle="Download new episodes automatically"
            showChevron={false}
            rightComponent={
              <Switch
                value={autoDownload}
                onValueChange={handleAutoDownloadToggle}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          <SettingItem
            icon={<Trash2 size={20} color="#FF3B30" />}
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug</Text>
          
          <SettingItem
            icon={<Bug size={20} color="#FF9500" />}
            title="Export Debug Logs"
            subtitle="Share logs for troubleshooting"
            onPress={handleExportLogs}
          />
          
          <SettingItem
            icon={<Info size={20} color="#5856D6" />}
            title="View Recent Issues"
            subtitle="Check for errors and warnings"
            onPress={handleViewLogs}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Build 1</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
});