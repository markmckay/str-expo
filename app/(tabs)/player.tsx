import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { logger } from '@/utils/logger';

export default function PlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.3);
  const [currentTime, setCurrentTime] = useState('1:23');
  const [totalTime, setTotalTime] = useState('4:49');

  useEffect(() => {
    const timer = logger.startTimer('PlayerScreen_Load');
    logger.info('Screen', 'Player screen mounted');
    logger.logUserAction('screen_view', 'Player');
    
    timer();
    
    return () => {
      logger.info('Screen', 'Player screen unmounted');
      // Stop any ongoing speech
      Speech.stop();
    };
  }, []);

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    logger.logUserAction(newPlayingState ? 'play' : 'pause', 'Player', {
      currentTime,
      progress,
      totalTime
    });

    if (newPlayingState) {
      logger.info('Audio', 'Starting text-to-speech playback');
      Speech.speak("This is your converted spoken text. Welcome to the audio player experience.", {
        onStart: () => {
          logger.debug('Audio', 'Speech started');
        },
        onDone: () => {
          logger.info('Audio', 'Speech completed');
          setIsPlaying(false);
        },
        onError: (error) => {
          logger.error('Audio', 'Speech error', { error: error.toString() });
          setIsPlaying(false);
        }
      });
    } else {
      logger.info('Audio', 'Stopping text-to-speech playback');
      Speech.stop();
    }
  };

  const handleSkipBack = () => {
    const newProgress = Math.max(0, progress - 0.1);
    setProgress(newProgress);
    logger.logUserAction('skip_back', 'Player', { 
      fromProgress: progress, 
      toProgress: newProgress,
      skipAmount: '10s'
    });
  };

  const handleSkipForward = () => {
    const newProgress = Math.min(1, progress + 0.15);
    setProgress(newProgress);
    logger.logUserAction('skip_forward', 'Player', { 
      fromProgress: progress, 
      toProgress: newProgress,
      skipAmount: '15s'
    });
  };

  const handleVolumePress = () => {
    logger.logUserAction('volume_press', 'Player');
    // Volume control would be implemented here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Now Playing</Text>
      </View>

      <View style={styles.albumArt}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' }}
          style={styles.albumImage}
        />
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>Sample Audio Track</Text>
        <Text style={styles.trackArtist}>Text-to-Speech Demo</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.timeText}>{totalTime}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleSkipBack}
          activeOpacity={0.7}
        >
          <SkipBack size={24} color="#1C1C1E" />
          <Text style={styles.skipText}>10s</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton} 
          onPress={handlePlayPause}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={32} color="#FFFFFF" />
          ) : (
            <Play size={32} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleSkipForward}
          activeOpacity={0.7}
        >
          <SkipForward size={24} color="#1C1C1E" />
          <Text style={styles.skipText}>15s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.volumeButton} 
          onPress={handleVolumePress}
          activeOpacity={0.7}
        >
          <Volume2 size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  albumArt: {
    alignItems: 'center',
    marginBottom: 40,
  },
  albumImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginHorizontal: 20,
  },
  skipText: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomControls: {
    alignItems: 'center',
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});