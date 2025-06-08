
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

export default function AliceReaderScreen() {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [tags, setTags] = useState('');
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadText = async () => {
      const fileUri = FileSystem.documentDirectory + 'alice.txt';
      await FileSystem.writeAsStringAsync(fileUri, `Alice's Adventures in Wonderland

CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank...`);
      const text = await FileSystem.readAsStringAsync(fileUri);
      setContent(text);
    };
    loadText();
  }, []);

  const speakText = () => {
    Speech.speak(content.slice(0, 500));
  };

  const saveQuote = () => {
    const note = {
      quote: selectedText,
      tags: tags.split(',').map(t => t.trim()),
      audioNote: recordingUri
    };
    console.log("Saved note:", note);
    Alert.alert("Quote saved", `Tags: ${note.tags.join(', ')}\nAudio: ${note.audioNote || 'None'}`);
    setModalVisible(false);
    setSelectedText('');
    setTags('');
    setRecordingUri('');
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {content.split('\n\n').map((para, idx) => (
          <TouchableOpacity key={idx} onLongPress={() => setSelectedText(para)}>
            <Text style={[styles.paragraph, selectedText === para && styles.highlight]}>
              {para}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button title="Read Aloud" onPress={speakText} />
      <Button title="Save Highlight" onPress={() => selectedText ? setModalVisible(true) : Alert.alert("No selection")} />
      <Button title="Back" onPress={() => navigation.goBack()} />

      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Tag Your Quote</Text>
          <TextInput placeholder="Tags (comma separated)" value={tags} onChangeText={setTags} style={styles.input} />
          <Button title={recording ? "Stop Recording" : "Record Audio Note"} onPress={recording ? stopRecording : startRecording} />
          <Button title="Save Quote" onPress={saveQuote} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  scroll: { marginBottom: 20 },
  paragraph: { fontSize: 18, marginBottom: 16, color: '#333' },
  highlight: { backgroundColor: '#ffffcc', borderRadius: 6, padding: 4 },
  modal: { marginTop: 120, marginHorizontal: 20, backgroundColor: 'white', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, marginBottom: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 10 }
});