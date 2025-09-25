import React from 'react';
import { View, StyleSheet } from 'react-native';
import WeatherScreen from '../components/WeatherScreen';

export default function Page() {
  return (
    <View style={styles.container}>
      <WeatherScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 