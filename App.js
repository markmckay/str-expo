import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from './screens/LibraryScreen';
import PlayerScreen from './screens/PlayerScreen';
import AliceReaderScreen from './screens/AliceReaderScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Library">
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
        <Stack.Screen name="AliceReader" component={AliceReaderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}