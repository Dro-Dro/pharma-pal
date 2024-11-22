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
  const [weightUnit, setWeightUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [packageSize, setPackageSize] = useState('1');
  const [frequencyNumber, setFrequencyNumber] = useState('1');
  const [frequencyPattern, setFrequencyPattern] = useState('every');
  const [frequencyUnit, setFrequencyUnit] = useState('day');
  const [outputUnit, setOutputUnit] = useState('day');
  const [daySupply, setDaySupply] = useState('');
  const [calculationType, setCalculationType] = useState('daySupply');
  const [result, setResult] = useState('');

  const timeConversions = {
    minute: 1/1440, // 1/24/60 days
    hour: 1/24,     // 1/24 days
    day: 1,         // 1 day
    week: 7,        // 7 days
  };

  const calculate = () => {
    const quantityNum = parseFloat(quantity);
    const packageSizeNum = parseFloat(packageSize);
    const frequencyNum = parseFloat(frequencyNumber);
    
    if (calculationType === 'daySupply') {
      if (isNaN(quantityNum) || isNaN(packageSizeNum) || isNaN(frequencyNum)) {
        setResult('Please enter valid numbers');
        return;
      }
      if (quantityNum <= 0 || packageSizeNum <= 0 || frequencyNum <= 0) {
        setResult('Values must be greater than 0');
        return;
      }

      const totalUnits = (quantityNum / packageSizeNum);
      
      const dailyRate = getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
      
      const daysResult = totalUnits * dailyRate;
      
      const convertedResult = daysResult / timeConversions[outputUnit];
      setResult(`${convertedResult.toFixed(1)} ${outputUnit}${convertedResult === 1 ? '' : 's'}`);

    } else {
      const daysNum = parseFloat(daySupply);
      
      if (isNaN(daysNum)) {
        setResult('Please enter valid numbers');
        return;
      }

      const dailyRate = getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
      const actualDays = daysNum * timeConversions[outputUnit];
      const quantityNeeded = (actualDays / dailyRate) * packageSizeNum;
      setResult(`${Math.ceil(quantityNeeded)} units needed`);
    }
  };

  const getFrequencyPerDay = (freq: number, pattern: string, unit: string) => {
    let baseRate = 1;
    
    switch(unit) {
      case 'minute':
        baseRate = 1 / (freq * timeConversions.minute);
        break;
      case 'hour':
        baseRate = 1 / (freq * timeConversions.hour);
        break;
      case 'day':
        baseRate = 1 / freq;
        break;
      case 'week':
        baseRate = 1 / (freq * 7);
        break;
    }

    if (pattern === 'everyOther') {
      baseRate = baseRate / 2;
    }

    return baseRate;
  };

  const formatFrequencyText = (freq: string, pattern: string, unit: string) => {
    const freqNum = parseFloat(freq);
    if (isNaN(freqNum)) return '';

    const unitPlural = freqNum > 1 ? unit + 's' : unit;
    
    if (pattern === 'everyOther') {
      return `Once every other ${unit}`;
    } else {
      return `Once every ${freqNum} ${unitPlural}`;
    }
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
          <ThemedText type="subtitle">Calculator</ThemedText>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                calculationType === 'daySupply' && styles.toggleButtonActive
              ]}
              onPress={() => setCalculationType('daySupply')}>
              <ThemedText>Calculate Days</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                calculationType === 'quantity' && styles.toggleButtonActive
              ]}
              onPress={() => setCalculationType('quantity')}>
              <ThemedText>Calculate Quantity</ThemedText>
            </TouchableOpacity>
          </View>

          {calculationType === 'daySupply' ? (
            <>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="Enter quantity"
                  placeholderTextColor="#666"
                />
                <ThemedText style={styles.unitLabel}>units</ThemedText>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={packageSize}
                  onChangeText={setPackageSize}
                  keyboardType="numeric"
                  placeholder="Package size"
                  placeholderTextColor="#666"
                />
                <ThemedText style={styles.unitLabel}>units per package</ThemedText>
              </View>
            </>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={daySupply}
                onChangeText={setDaySupply}
                keyboardType="numeric"
                placeholder="Enter time"
                placeholderTextColor="#666"
              />
              <Picker
                selectedValue={outputUnit}
                onValueChange={setOutputUnit}
                style={styles.picker}>
                <Picker.Item label="Minutes" value="minute" />
                <Picker.Item label="Hours" value="hour" />
                <Picker.Item label="Days" value="day" />
                <Picker.Item label="Weeks" value="week" />
              </Picker>
            </View>
          )}

          <View style={styles.frequencyContainer}>
            <View style={styles.inputRow}>
              <Picker
                selectedValue={frequencyPattern}
                onValueChange={setFrequencyPattern}
                style={styles.patternPicker}>
                <Picker.Item label="Once every" value="every" />
                <Picker.Item label="Once every other" value="everyOther" />
              </Picker>
              
              <TextInput
                style={[styles.input, styles.frequencyInput]}
                value={frequencyNumber}
                onChangeText={setFrequencyNumber}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#666"
              />
              
              <Picker
                selectedValue={frequencyUnit}
                onValueChange={setFrequencyUnit}
                style={styles.unitPicker}>
                <Picker.Item label="minute(s)" value="minute" />
                <Picker.Item label="hour(s)" value="hour" />
                <Picker.Item label="day(s)" value="day" />
                <Picker.Item label="week(s)" value="week" />
              </Picker>
            </View>

            <ThemedText style={styles.frequencyDisplay}>
              {formatFrequencyText(frequencyNumber, frequencyPattern, frequencyUnit)}
            </ThemedText>
          </View>

          {calculationType === 'daySupply' && (
            <View style={styles.inputRow}>
              <ThemedText>Show result in: </ThemedText>
              <Picker
                selectedValue={outputUnit}
                onValueChange={setOutputUnit}
                style={styles.picker}>
                <Picker.Item label="Minutes" value="minute" />
                <Picker.Item label="Hours" value="hour" />
                <Picker.Item label="Days" value="day" />
                <Picker.Item label="Weeks" value="week" />
              </Picker>
            </View>
          )}

          <TouchableOpacity 
            style={styles.button}
            onPress={calculate}>
            <ThemedText>Calculate</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.result}>{result}</ThemedText>
          <ThemedText style={styles.info}>
            Day Supply Calculation: (Quantity ÷ Package Size) × Frequency
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
  },
  unitLabel: {
    marginLeft: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '45%',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyContainer: {
    width: '100%',
    marginBottom: 15,
  },
  frequencyInput: {
    width: 50,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  patternPicker: {
    flex: 1.2,
    minWidth: 130,
  },
  unitPicker: {
    flex: 1,
    minWidth: 100,
  },
  frequencyDisplay: {
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
    color: '#666',
  }
});
