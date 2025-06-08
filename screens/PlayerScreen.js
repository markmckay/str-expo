import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Slider } from 'react-native';
import * as Speech from 'expo-speech';

export default function PlayerScreen() {
  const [progress, setProgress] = useState(0);

  const speakText = () => {
    Speech.speak("This is your converted spoken text.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Player</Text>
      <Slider style={{ width: 300 }} minimumValue={0} maximumValue={100} value={progress} onValueChange={setProgress} />
      <View style={styles.controls}>
        <Button title="⏪ 10s" onPress={() => setProgress(p => Math.max(0, p - 10))} />
        <Button title="▶️ Speak" onPress={speakText} />
        <Button title="15s ⏩" onPress={() => setProgress(p => Math.min(100, p + 15))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  title: { fontSize: 22, marginBottom: 30 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 }
});