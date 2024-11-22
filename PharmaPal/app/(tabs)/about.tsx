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
        
        <ExternalLink href="https://drive.google.com/file/d/1YZ2-5sXE43XuWxJkhusvCf1IImZO5zc7/view?usp=sharing">
          <ThemedText type="link">PAAS Eye Drop Chart</ThemedText>
        </ExternalLink>

        <ExternalLink href="https://drive.google.com/file/d/1YZ2-5sXE43XuWxJkhusvCf1IImZO5zc7/view?usp=drive_link">
          <ThemedText type="link">PAAS Topical Medication Chart</ThemedText>
        </ExternalLink>

        <ExternalLink href="https://drive.google.com/file/d/1MIUr_B0ZeYEuu-pV8_VvXV3QKSQY9-QQ/view?usp=drive_link">
          <ThemedText type="link">PAAS Oral Inhaler Chart</ThemedText>
        </ExternalLink>

        <ExternalLink href="https://drive.google.com/file/d/1pJ3v5YwE3rJbKQPfOtIm3hm5X1oDYy9Z/view?usp=drive_link">
          <ThemedText type="link">PAAS Nasal Inhaler Chart</ThemedText>
        </ExternalLink>

        <ExternalLink href="https://drive.google.com/file/d/1_yPLY9VasJmf2EGUUZt80rVkFBG7FvXF/view?usp=drive_link">
          <ThemedText type="link">PAAS Diabetic Chart</ThemedText>
        </ExternalLink>

        <ExternalLink href="https://drive.google.com/file/d/1FjeayFv37AeRQlM613FgBF3ntVduDhhA/view?usp=drive_link">
          <ThemedText type="link">PAAS Insulin Chart</ThemedText>
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
