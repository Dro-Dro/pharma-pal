import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Image, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  const [dosage, setDosage] = useState('');
  const [weight, setWeight] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [dosageResult, setDosageResult] = useState('');

  const calculateDosage = () => {
    const dosageNum = parseFloat(dosage);
    const weightNum = parseFloat(weight);

    if (isNaN(dosageNum) || isNaN(weightNum)) {
      setDosageResult('Please enter valid numbers');
      return;
    }

    // Convert weight to kg if needed
    const weightInKg = weightUnit === 'lbs' ? weightNum * 0.453592 : weightNum;

    // Convert dosage to mg if needed
    let dosageInMg = dosageNum;
    switch (dosageUnit) {
      case 'g': dosageInMg = dosageNum * 1000; break;
      case 'mcg': dosageInMg = dosageNum / 1000; break;
    }

    const result = dosageInMg * weightInKg;
    setDosageResult(`Total Dose: ${result.toFixed(2)} mg`);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="medkit" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Calculator</ThemedText>
      </ThemedView>
      <ThemedText>Please select the category of the medication you want to calculate the day supply for and confirm any additional perameters.</ThemedText>
      
      <ThemedView style={styles.pickerContainer}>
        <ThemedText>What type of Medication?</ThemedText>
        <Picker
            selectedValue={weightUnit}
            onValueChange={setWeightUnit}
            style={styles.medTypePicker}>
            <Picker.Item label="Tablet" value="Tablet" />
            <Picker.Item label="Capsule" value="Capsule" />
            <Picker.Item label="Liquid" value="Liquid" />
            <Picker.Item label="Eye Drops" value="Eye Drops" />
            <Picker.Item label="Topical" value="Topical" />
            <Picker.Item label="Oral Inhaler" value="Oral Inhaler" />
            <Picker.Item label="Nasal Inhaler" value="Nasal Inhaler" />
            <Picker.Item label="Diabetic Injectable" value="Diabetic Injectable" />
            <Picker.Item label="Insulin Medication" value="Insulin Medication" />
          </Picker>
      </ThemedView>
      
        <ThemedView style={styles.calculatorContainer}>
          <ThemedText type="subtitle">Day Supply Calculator</ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
              placeholder="Enter strength"
              placeholderTextColor="#666"
            />
            <Picker
              selectedValue={dosageUnit}
              onValueChange={setDosageUnit}
              style={styles.picker}>
              <Picker.Item label="mg" value="mg" />
              <Picker.Item label="g" value="g" />
              <Picker.Item label="mcg" value="mcg" />
            </Picker>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="Enter quantity"
              placeholderTextColor="#666"
            />
            <Picker
              selectedValue={weightUnit}
              onValueChange={setWeightUnit}
              style={styles.picker}>
              <Picker.Item label="kg" value="kg" />
              <Picker.Item label="lbs" value="lbs" />
            </Picker>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={calculateDosage}>
            <ThemedText>Calculate Dosage</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.result}>{dosageResult}</ThemedText>
          <ThemedText style={styles.info}>
            This calculator helps determine day supply based on user input.
            Always verify calculations and consult official guidelines.
          </ThemedText>
        </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#91e655',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  calculatorContainer: {
    padding: 20,
    marginBottom: 20,
  },
  pickerContainer: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#91e655',
    padding: 10,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    gap: 10,
  },
  inputFlex: {
    flex: 2,
  },
  picker: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  medTypePicker: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  info: {
    marginTop: 20,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#777',
  },
  titleHeader: {
    marginBottom: 20,
    fontWeight: 'bold'
  }
});
