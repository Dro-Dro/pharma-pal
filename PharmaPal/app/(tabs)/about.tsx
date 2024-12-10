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

      <Collapsible title="Functionality">
        <ThemedText>Need help with the app? This video will walk you through the calculator, while these collapsible sections will explain some of the individual features.</ThemedText>
        <ExternalLink href="https://youtu.be/3XmEpUH2KEU">
          <ThemedText type="link">Calculator Video</ThemedText>
        </ExternalLink>
        <Collapsible title="Calculate Days Supply">
          <Image 
            source={require('@/assets/images/calcDay.png')}
            style={styles.instructionImage}
            resizeMode="contain"
          />
          <ThemedText>When using the calculator, the first step is to calculate the days supply. Enabling the Day Supply calculation requires the circled button to be colored green.</ThemedText>
          <ThemedText> </ThemedText>
          
          <Image 
            source={require('@/assets/images/calcDayNo.png')}
            style={styles.instructionImage}
            resizeMode="contain"
          />
          <ThemedText>If the button is white with green text, the day supply calculation is disabled and the quantity calculation is enabled.</ThemedText>
          <ThemedText>Make sure that all the fields are filled out correctly. If the fields are not filled out correctly, the result will say "Please enter valid numbers" as seen in the above image.</ThemedText>
          <ThemedText> </ThemedText>
        </Collapsible>
        <Collapsible title="Calculate Quantity">
          <Image 
              source={require('@/assets/images/calcquant.png')}
              style={styles.instructionImage}
              resizeMode="contain"
          />
          <ThemedText>When the calculate quantity button is pressed and the calculation is enabled, the quantity can be calculated. The screen should look similar to the one above.</ThemedText>
          <ThemedText>This can only be done after calculating the days supply and entering the relevant details into there.</ThemedText>
          <ThemedText>Once this is done, you can find the quantity by typing in the day supply in the relevant field then hitting the calculate button.</ThemedText>
          <ThemedText> </ThemedText>
        </Collapsible>
        <Collapsible title="Package Size and Beyond Use Date">
          <Image 
            source={require('@/assets/images/pkgsize.png')}
            style={styles.wideImage}
            resizeMode="contain"
          />
          <ThemedText>When the package size button is pressed and the calculation is enabled, the package size can be calculated. The screen should look similar to the one above.</ThemedText>
          <ThemedText>As seen in the image, the package size is broken up into two different fields.</ThemedText>
          <ThemedText>The first field is the number of individual units inside the package.</ThemedText>
          <ThemedText>The second field is the size of each individual unit.</ThemedText>
          <ThemedText>Most medications have a package of a single unit (e.g. 1 tablet of 25mg or just 25mg), so the first field will default to 1.</ThemedText>
          <ThemedText> </ThemedText>
          <ThemedText>For example, if there are 50 tablets in the package and each tablet is 100mg, the package size would be 50*100=5000mg.</ThemedText>
          <ThemedText>This might be represented to the user as 50x100mg.</ThemedText>
          <ThemedText>The first field would contain 50 and the second field would contain 100.</ThemedText>
          <ThemedText> </ThemedText>
        </Collapsible>
        <Collapsible title="Include Concentration">
          <Image 
            source={require('@/assets/images/concentration.png')}
            style={styles.wideImage}
            resizeMode="contain"
          />
          <ThemedText>When the include concentration button is pressed and the calculation is enabled, the concentration can be calculated. The screen should look similar to the one above.</ThemedText>
          <ThemedText>After the quantity and dosage are entered and the measurement units are different, you can use concentration to convert the values.</ThemedText>
          <ThemedText>Once this is done, you can find the concentration by typing in the relevant values into each field.</ThemedText>
          <ThemedText>The concentration will be used in the background for the calculations.</ThemedText>
          <ThemedText> </ThemedText>
          <ThemedText>For example, if the concentration is 25mg and the volume is 5ml, the dosage would be converted to 2.5mg.</ThemedText>
          <ThemedText>You can change the measurement values for each field if needed.</ThemedText>
          <ThemedText> </ThemedText>
        </Collapsible>
        <Collapsible title="Include Titration">
          <Image 
            source={require('@/assets/images/titration.png')}
            style={styles.instructionImage}
            resizeMode="contain"
          />
          <ThemedText>If the "Include Titration" button is pressed and the calculation is enabled, the titration can be calculated. The screen should look similar to the one above.</ThemedText>
          <ThemedText>Once this is done, you can find the titration by typing in the relevant values into each field.</ThemedText>
          <ThemedText> </ThemedText>
          <ThemedText>Three fields are required to calculate the titration.</ThemedText>
          <ThemedText>For each stage there are two fields:</ThemedText>
          <ThemedText>1. The dosage for that stage</ThemedText>
          <ThemedText>2. The duration of that stage</ThemedText>
          <ThemedText>The third field applies to the whole titration. It is the max dosage for after the stage / stages. This value can be considered the dosage "thereafter".</ThemedText>
          <ThemedText>Keep in mind that the dosage is applied according to the frequency that you have selected in the frequency input fields.</ThemedText>
          <ThemedText> </ThemedText>
          <ThemedText>If there are multiple stages, you can add as many as you want using the "Add Stage" button.</ThemedText>
          <ThemedText> </ThemedText>
          <ThemedText>In the screen above, 0.25ml is the dosage for the first stage, there are 7 days for the duration of the stage, and 5ml is the max dose.</ThemedText>
          <ThemedText> </ThemedText>
        </Collapsible>
      </Collapsible>

      <Collapsible title="About Us">
        <ThemedText>This app was created by Hakan Peterson at the University of Washington Bothell as a final project for the CSSE program.</ThemedText>
        <ThemedText>Special thanks to the following people for their help:</ThemedText>
        <ThemedText>My friends and family for their support and encouragement.</ThemedText>
        <ThemedText>My professors for their guidance and support.</ThemedText>
        <ThemedText>Professor Mark Kochanski for being a great mentor during this capstone project.</ThemedText>
        <ThemedText>Ostroms' Drug and Gift Staff for their help with the pharmacy reference materials and testing the app.</ThemedText>
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
  instructionImage: {
    width: '100%',
    height: 400,
    marginVertical: 10,
  },
  wideImage: {
    width: '50%',
    height: 200,
    marginVertical: 10,
  },
});
