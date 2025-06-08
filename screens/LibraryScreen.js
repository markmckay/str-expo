import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LibraryScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>
      <Button title="Play Sample" onPress={() => navigation.navigate('Player')} />
      <Button title="Read Alice in Wonderland" onPress={() => navigation.navigate('AliceReader')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 }
});