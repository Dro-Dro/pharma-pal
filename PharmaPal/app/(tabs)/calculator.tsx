import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Image, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type TimeUnit = 'minute' | 'hour' | 'day' | 'week';

type TitrationStage = {
  startDose: string;
  increment: string;
  frequency: string;
};

type MeasurementUnit = 'mg' | 'ml' | 'g' | 'mcg' | 'units';

export default function TabTwoScreen() {
  const [weightUnit, setWeightUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [packageSize, setPackageSize] = useState('1');
  const [frequencyNumber, setFrequencyNumber] = useState('1');
  const [frequencyPattern, setFrequencyPattern] = useState('every');
  const [frequencyUnit, setFrequencyUnit] = useState('day');
  const [outputUnit, setOutputUnit] = useState<TimeUnit>('day');
  const [daySupply, setDaySupply] = useState('');
  const [calculationType, setCalculationType] = useState('daySupply');
  const [result, setResult] = useState('');
  const [includeTitration, setIncludeTitration] = useState(false);
  const [titrationStages, setTitrationStages] = useState<TitrationStage[]>([{
    startDose: '',
    increment: '',
    frequency: '7'
  }]);
  const [maxDose, setMaxDose] = useState<string>('');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('units');
  const [previousUnit, setPreviousUnit] = useState<MeasurementUnit>('units');

  const timeConversions: Record<TimeUnit, number> = {
    minute: 1/1440,
    hour: 1/24,
    day: 1,
    week: 7,
  };

  const unitConversions: Record<MeasurementUnit, number> = {
    mg: 1,
    g: 0.001,
    mcg: 1000,
    ml: 1,
    units: 1,
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

      let totalUnits = (quantityNum / packageSizeNum);
      
      if (includeTitration) {
        let totalTitrationDays = 0;
        let currentDose = parseFloat(titrationStages[0].startDose);
        let remainingUnits = quantityNum / packageSizeNum;
        const maxDoseNum = parseFloat(maxDose);
        
        if (isNaN(maxDoseNum)) {
            setResult('Please enter a valid maximum dose');
            return;
        }

        for (const stage of titrationStages) {
            const startDose = currentDose;
            const increment = parseFloat(stage.increment);
            const freqDays = parseFloat(stage.frequency);
            
            if (isNaN(startDose) || isNaN(increment) || isNaN(freqDays)) {
                setResult('Please enter valid titration values');
                return;
            }

            const stageSteps = Math.ceil((quantityNum - startDose) / increment);
            
            // Check each step in this stage
            for (let step = 0; step < stageSteps; step++) {
                const doseAtStep = Math.min(startDose + (step * increment), maxDoseNum);
                
                // If we've hit the maximum dose, no need to continue incrementing
                if (doseAtStep >= maxDoseNum) {
                    // Calculate remaining units at max dose
                    const unitsAtMaxDose = maxDoseNum * freqDays;
                    
                    // Check if we have enough units for this period
                    if (remainingUnits - unitsAtMaxDose <= 0) {
                        const daysLeft = remainingUnits / maxDoseNum;
                        totalTitrationDays += daysLeft;
                        
                        const convertedResult = totalTitrationDays / timeConversions[outputUnit];
                        setResult(`${convertedResult.toFixed(1)} ${outputUnit}${convertedResult === 1 ? '' : 's'} (supply exhausted at max dose)`);
                        return;
                    }
                    
                    remainingUnits -= unitsAtMaxDose;
                    totalTitrationDays += freqDays;
                    continue;
                }

                const unitsForThisPeriod = doseAtStep * freqDays;
                
                // Check if we have enough units left
                if (remainingUnits - unitsForThisPeriod <= 0) {
                    const daysLeft = remainingUnits / doseAtStep;
                    totalTitrationDays += daysLeft;
                    
                    const convertedResult = totalTitrationDays / timeConversions[outputUnit];
                    setResult(`${convertedResult.toFixed(1)} ${outputUnit}${convertedResult === 1 ? '' : 's'} (supply exhausted during titration)`);
                    return;
                }
                
                remainingUnits -= unitsForThisPeriod;
                totalTitrationDays += freqDays;
            }
            
            currentDose = Math.min(startDose + (stageSteps * increment), maxDoseNum);
        }

        // If we still have units left after titration
        if (remainingUnits > 0) {
            const dailyRate = getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
            const remainingDays = remainingUnits / dailyRate;
            const totalDays = totalTitrationDays + remainingDays;
            const convertedResult = totalDays / timeConversions[outputUnit];
            setResult(`${convertedResult.toFixed(1)} ${outputUnit}${convertedResult === 1 ? '' : 's'} (includes ${totalTitrationDays} days of titration)`);
        }
      } else {
        const dailyRate = getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
        const daysResult = totalUnits / dailyRate;
        const convertedResult = daysResult / timeConversions[outputUnit];
        setResult(`${convertedResult.toFixed(1)} ${outputUnit}${convertedResult === 1 ? '' : 's'}`);
      }

    } else {  // calculationType === 'quantity'
        const daysNum = parseFloat(daySupply);
        const frequencyNum = parseFloat(frequencyNumber);
        const packageSizeNum = parseFloat(packageSize);
        
        if (isNaN(daysNum) || isNaN(frequencyNum) || isNaN(packageSizeNum)) {
            setResult('Please enter valid numbers');
            return;
        }

        if (includeTitration) {
            const maxDoseNum = parseFloat(maxDose);
            let currentDose = parseFloat(titrationStages[0].startDose);
            let totalUnitsNeeded = 0;
            let remainingDays = daysNum * timeConversions[outputUnit];

            if (isNaN(maxDoseNum)) {
                setResult('Please enter a valid maximum dose');
                return;
            }

            // Calculate units needed during titration
            for (const stage of titrationStages) {
                const startDose = currentDose;
                const increment = parseFloat(stage.increment);
                const freqDays = parseFloat(stage.frequency);
                
                if (isNaN(startDose) || isNaN(increment) || isNaN(freqDays)) {
                    setResult('Please enter valid titration values');
                    return;
                }

                let daysInThisStage = 0;
                let stageUnits = 0;
                let currentStepDose = startDose;

                while (daysInThisStage < remainingDays && currentStepDose < maxDoseNum) {
                    stageUnits += currentStepDose * freqDays;
                    currentStepDose = Math.min(currentStepDose + increment, maxDoseNum);
                    daysInThisStage += freqDays;

                    if (daysInThisStage > remainingDays) {
                        // Adjust for partial period
                        const excess = daysInThisStage - remainingDays;
                        stageUnits -= (currentStepDose * excess);
                        daysInThisStage = remainingDays;
                    }
                }

                totalUnitsNeeded += stageUnits;
                remainingDays -= daysInThisStage;
                currentDose = currentStepDose;

                if (remainingDays <= 0) break;
            }

            // If there are remaining days, calculate units at max dose
            if (remainingDays > 0) {
                totalUnitsNeeded += maxDoseNum * remainingDays;
            }

            // Adjust for package size
            const totalPackages = Math.ceil(totalUnitsNeeded / packageSizeNum);
            const finalQuantity = totalPackages * packageSizeNum;
            
            setResult(`${finalQuantity} units needed`);

        } else {
            // Regular quantity calculation without titration
            const actualDays = daysNum * timeConversions[outputUnit];
            const dailyRate = getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
            const quantityNeeded = (actualDays * dailyRate) * packageSizeNum;
            setResult(`${Math.ceil(quantityNeeded)} units needed`);
        }
    }
  };

  const getFrequencyPerDay = (freq: number, pattern: string, unit: string) => {
    let baseRate = freq;
    
    switch(unit) {
      case 'minute':
        baseRate = freq / (1440);
        break;
      case 'hour':
        baseRate = freq / 24;
        break;
      case 'day':
        baseRate = freq;
        break;
      case 'week':
        baseRate = freq * 7;
        break;
    }

    if (pattern === 'everyOther') {
      baseRate = baseRate * 2;
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
                <Picker
                  selectedValue={measurementUnit}
                  onValueChange={setMeasurementUnit}
                  style={styles.unitPicker}>
                  <Picker.Item label="units" value="units" />
                  <Picker.Item label="mg" value="mg" />
                  <Picker.Item label="ml" value="ml" />
                  <Picker.Item label="g" value="g" />
                  <Picker.Item label="mcg" value="mcg" />
                </Picker>
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

              <View style={styles.titrationToggle}>
                <TouchableOpacity 
                  style={[styles.toggleButton, includeTitration && styles.toggleButtonActive]}
                  onPress={() => setIncludeTitration(!includeTitration)}>
                  <ThemedText>Include Titration</ThemedText>
                </TouchableOpacity>
              </View>

              {includeTitration && (
                <View style={styles.titrationInputs}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={maxDose}
                      onChangeText={setMaxDose}
                      keyboardType="numeric"
                      placeholder="Maximum dose"
                      placeholderTextColor="#666"
                    />
                    <ThemedText style={styles.unitLabel}>units</ThemedText>
                  </View>

                  {titrationStages.map((stage, index) => (
                    <View key={index} style={styles.titrationStage}>
                      <ThemedText style={styles.stageTitle}>Stage {index + 1}</ThemedText>
                      
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.input, styles.inputFlex]}
                          value={stage.startDose}
                          onChangeText={(value) => {
                            const newStages = [...titrationStages];
                            newStages[index].startDose = value;
                            setTitrationStages(newStages);
                          }}
                          keyboardType="numeric"
                          placeholder="Starting dose"
                          placeholderTextColor="#666"
                        />
                        <ThemedText style={styles.unitLabel}>units</ThemedText>
                      </View>

                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.input, styles.inputFlex]}
                          value={stage.increment}
                          onChangeText={(value) => {
                            const newStages = [...titrationStages];
                            newStages[index].increment = value;
                            setTitrationStages(newStages);
                          }}
                          keyboardType="numeric"
                          placeholder="Increase by"
                          placeholderTextColor="#666"
                        />
                        <ThemedText style={styles.unitLabel}>units</ThemedText>
                      </View>

                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.input, styles.inputFlex]}
                          value={stage.frequency}
                          onChangeText={(value) => {
                            const newStages = [...titrationStages];
                            newStages[index].frequency = value;
                            setTitrationStages(newStages);
                          }}
                          keyboardType="numeric"
                          placeholder="Days between increases"
                          placeholderTextColor="#666"
                        />
                        <ThemedText style={styles.unitLabel}>days</ThemedText>
                      </View>

                      {titrationStages.length > 1 && (
                        <TouchableOpacity 
                          style={styles.removeStageButton}
                          onPress={() => {
                            const newStages = titrationStages.filter((_, i) => i !== index);
                            setTitrationStages(newStages);
                          }}>
                          <ThemedText style={styles.removeStageText}>Remove Stage</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={styles.addStageButton}
                    onPress={() => {
                      setTitrationStages([...titrationStages, {
                        startDose: '',
                        increment: '',
                        frequency: '7'
                      }]);
                    }}>
                    <ThemedText>Add Stage</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
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
          <View style={[styles.inputRow, styles.resultContainer]}>
            <ThemedText style={styles.result}>
              {result ? (() => {
                if (calculationType === 'daySupply') {
                  return result;
                }
                const numericResult = parseFloat(result);
                if (isNaN(numericResult)) return result;
                
                const convertedValue = numericResult * 
                  (unitConversions[measurementUnit] / unitConversions[previousUnit]);
                return convertedValue.toFixed(2);
              })() : ''}
            </ThemedText>
            {result && calculationType === 'quantity' && (
              <Picker
                selectedValue={measurementUnit}
                onValueChange={(newUnit) => {
                  const previousUnit = measurementUnit;
                  setMeasurementUnit(newUnit);
                  setPreviousUnit(previousUnit);
                }}
                style={styles.unitPicker}>
                <Picker.Item label="units" value="units" />
                <Picker.Item label="mg" value="mg" />
                <Picker.Item label="ml" value="ml" />
                <Picker.Item label="g" value="g" />
                <Picker.Item label="mcg" value="mcg" />
              </Picker>
            )}
          </View>
          <ThemedText style={styles.info}>
            Day Supply Calculation: (Quantity ÷ Package Size) ÷ Frequency
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
  },
  titrationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  titrationInputs: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  titrationStage: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  stageTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addStageButton: {
    backgroundColor: '#91e655',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  removeStageButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  removeStageText: {
    color: 'white',
  },
  resultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
