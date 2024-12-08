import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Ionicons size={310} name="pulse" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedText>
        PharmaPal is a web application designed to assist pharmacists in calculating medication day supply and quantity. It provides a user-friendly interface for pharmacists to input medication details and receive accurate calculations.
      </ThemedText>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">DISCLAIMER !!!</ThemedText>
        <ThemedText>
          This app is not intended to be used as the only calculator for pharmacy calculations. It is provided to supplement your existing knowledge and skills. No patient information is stored or processed. PAAS charts were used as a reference, but the app is not endorsed by PAAS.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Our Calculator Page!</ThemedText>
        <ThemedText>
          On the bar at the bottom of the screen, press the <ThemedText type="defaultSemiBold">Calculator</ThemedText> tab to access that function.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Want more information?</ThemedText>
        <ThemedText>
          Tap the <ThemedText type="defaultSemiBold">About</ThemedText> tab to learn more about what's guided and influenced this app.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
});
