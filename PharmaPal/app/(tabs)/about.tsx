import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="book" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">About</ThemedText>
      </ThemedView>
      <ThemedText>Below is information on this application, as well as additional resources.</ThemedText>
      <Collapsible title="PDF Resources">
        <ThemedText>Access helpful pharmacy reference materials:</ThemedText>
        
        <ExternalLink href="https://example.com/path-to-your-pdf.pdf">
          <ThemedText type="link">Drug Dosage Guidelines</ThemedText>
        </ExternalLink>

        <ExternalLink href="https://example.com/another-pdf.pdf">
          <ThemedText type="link">Medication Reference Chart</ThemedText>
        </ExternalLink>
      </Collapsible>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
