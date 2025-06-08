import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Modal, 
  Alert,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { ArrowLeft, Play, Bookmark, Mic, MicOff, Save, X } from 'lucide-react-native';
import { logger } from '@/utils/logger';

const ALICE_TEXT = `Alice's Adventures in Wonderland

CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.`;

interface Note {
  id: string;
  quote: string;
  tags: string[];
  audioNote?: string;
  timestamp: string;
}

export default function AliceReaderScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [tags, setTags] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const timer = logger.startTimer('AliceReaderScreen_Load');
    logger.info('Screen', 'Alice Reader screen mounted');
    logger.logUserAction('screen_view', 'AliceReader');
    
    loadText();
    timer();
    
    return () => {
      logger.info('Screen', 'Alice Reader screen unmounted');
      // Clean up any ongoing recording or speech
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      Speech.stop();
    };
  }, []);

  const loadText = async () => {
    try {
      logger.debug('FileSystem', 'Loading Alice text');
      const fileUri = FileSystem.documentDirectory + 'alice.txt';
      await FileSystem.writeAsStringAsync(fileUri, ALICE_TEXT);
      const text = await FileSystem.readAsStringAsync(fileUri);
      setContent(text);
      logger.info('FileSystem', 'Alice text loaded successfully', { 
        textLength: text.length,
        fileUri 
      });
    } catch (error) {
      logger.error('FileSystem', 'Failed to load Alice text', { error: error.toString() });
      setContent(ALICE_TEXT); // Fallback to hardcoded text
    }
  };

  const speakText = () => {
    const textToSpeak = content.slice(0, 500);
    logger.logUserAction('read_aloud', 'AliceReader', { 
      textLength: textToSpeak.length 
    });
    
    logger.info('Speech', 'Starting text-to-speech', { textLength: textToSpeak.length });
    
    Speech.speak(textToSpeak, {
      onStart: () => {
        logger.debug('Speech', 'Speech synthesis started');
      },
      onDone: () => {
        logger.info('Speech', 'Speech synthesis completed');
      },
      onError: (error) => {
        logger.error('Speech', 'Speech synthesis failed', { error: error.toString() });
      }
    });
  };

  const handleTextSelection = (paragraph: string) => {
    setSelectedText(paragraph);
    logger.logUserAction('text_selection', 'AliceReader', { 
      selectedLength: paragraph.length,
      preview: paragraph.slice(0, 50) + '...'
    });
  };

  const saveQuote = () => {
    if (!selectedText) {
      logger.warn('AliceReader', 'Attempted to save quote without selection');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      quote: selectedText,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      audioNote: recordingUri || undefined,
      timestamp: new Date().toISOString()
    };

    setNotes(prev => [...prev, note]);
    
    logger.logUserAction('save_quote', 'AliceReader', {
      quoteLength: selectedText.length,
      tagsCount: note.tags.length,
      hasAudio: !!recordingUri,
      noteId: note.id
    });
    
    logger.info('Notes', 'Quote saved successfully', {
      noteId: note.id,
      tags: note.tags,
      hasAudio: !!note.audioNote
    });

    Alert.alert(
      "Quote Saved", 
      `Tags: ${note.tags.join(', ') || 'None'}\nAudio: ${note.audioNote ? 'Included' : 'None'}`
    );
    
    // Reset form
    setModalVisible(false);
    setSelectedText('');
    setTags('');
    setRecordingUri('');
  };

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      logger.warn('Audio', 'Recording not supported on web platform');
      Alert.alert('Not Supported', 'Audio recording is not available on web platform');
      return;
    }

    try {
      logger.debug('Audio', 'Requesting audio permissions');
      const permission = await Audio.requestPermissionsAsync();
      
      if (!permission.granted) {
        logger.warn('Audio', 'Audio permission denied');
        Alert.alert('Permission Required', 'Please grant microphone permission to record audio notes');
        return;
      }

      logger.info('Audio', 'Starting audio recording');
      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true 
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      
      logger.logUserAction('start_recording', 'AliceReader');
      logger.debug('Audio', 'Recording started successfully');
      
    } catch (error) {
      logger.error('Audio', 'Failed to start recording', { error: error.toString() });
      Alert.alert('Recording Error', 'Failed to start audio recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      logger.warn('Audio', 'Attempted to stop recording but no recording in progress');
      return;
    }

    try {
      logger.info('Audio', 'Stopping audio recording');
      setIsRecording(false);
      setRecording(null);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri || '');
      
      logger.logUserAction('stop_recording', 'AliceReader', { recordingUri: uri });
      logger.info('Audio', 'Recording stopped successfully', { uri });
      
    } catch (error) {
      logger.error('Audio', 'Failed to stop recording', { error: error.toString() });
      Alert.alert('Recording Error', 'Failed to stop audio recording');
    }
  };

  const handleBackPress = () => {
    logger.logUserAction('back_press', 'AliceReader');
    logger.logNavigation('AliceReader', 'Library');
    router.back();
  };

  const openSaveModal = () => {
    if (!selectedText) {
      logger.warn('AliceReader', 'No text selected for highlighting');
      Alert.alert("No Selection", "Please select some text first by long-pressing on a paragraph");
      return;
    }
    
    logger.logUserAction('open_save_modal', 'AliceReader');
    setModalVisible(true);
  };

  const closeSaveModal = () => {
    logger.logUserAction('close_save_modal', 'AliceReader');
    setModalVisible(false);
    setTags('');
    setRecordingUri('');
    if (recording) {
      stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alice in Wonderland</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {content.split('\n\n').map((paragraph, idx) => (
          <TouchableOpacity 
            key={idx} 
            onLongPress={() => handleTextSelection(paragraph)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.paragraph, 
              selectedText === paragraph && styles.highlight
            ]}>
              {paragraph}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={speakText}
          activeOpacity={0.7}
        >
          <Play size={20} color="#007AFF" />
          <Text style={styles.controlButtonText}>Read Aloud</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, selectedText ? styles.controlButtonActive : styles.controlButtonDisabled]} 
          onPress={openSaveModal}
          activeOpacity={0.7}
        >
          <Bookmark size={20} color={selectedText ? "#FFFFFF" : "#8E8E93"} />
          <Text style={[
            styles.controlButtonText, 
            selectedText ? styles.controlButtonTextActive : styles.controlButtonTextDisabled
          ]}>
            Save Highlight
          </Text>
        </TouchableOpacity>
      </View>

      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={closeSaveModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Highlight</Text>
              <TouchableOpacity onPress={closeSaveModal} activeOpacity={0.7}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.selectedQuote} numberOfLines={3}>
              "{selectedText}"
            </Text>
            
            <TextInput 
              placeholder="Add tags (comma separated)" 
              value={tags} 
              onChangeText={setTags} 
              style={styles.input}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.7}
            >
              {isRecording ? (
                <MicOff size={20} color="#FFFFFF" />
              ) : (
                <Mic size={20} color="#007AFF" />
              )}
              <Text style={[
                styles.recordButtonText,
                isRecording && styles.recordButtonTextActive
              ]}>
                {isRecording ? "Stop Recording" : "Record Audio Note"}
              </Text>
            </TouchableOpacity>
            
            {recordingUri && (
              <Text style={styles.recordingStatus}>✓ Audio note recorded</Text>
            )}
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveQuote}
              activeOpacity={0.8}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Quote</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scroll: { 
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  paragraph: { 
    fontSize: 18, 
    lineHeight: 28,
    marginBottom: 24, 
    color: '#1C1C1E',
    fontWeight: '400',
  },
  highlight: { 
    backgroundColor: '#FFF3CD', 
    borderRadius: 8, 
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD60A',
  },
  bottomControls: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  controlButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  controlButtonDisabled: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E5EA',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  controlButtonTextActive: {
    color: '#FFFFFF',
  },
  controlButtonTextDisabled: {
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: { 
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '600',
    color: '#1C1C1E',
  },
  selectedQuote: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  input: { 
    borderColor: '#E5E5EA', 
    borderWidth: 1, 
    borderRadius: 12,
    padding: 16, 
    marginBottom: 16,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  recordButtonTextActive: {
    color: '#FFFFFF',
  },
  recordingStatus: {
    fontSize: 14,
    color: '#34C759',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});