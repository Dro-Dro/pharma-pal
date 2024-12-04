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
  quantity: string;
  duration: string;
};

type MeasurementUnit = 'mg' | 'ml' | 'g' | 'gm' | 'mcg' | 'units';

type TopicalArea = {
  name: string;
  grams: number;
};

const TOPICAL_AREAS: TopicalArea[] = [
  { name: "scalp", grams: 1.5 },
  { name: "face & neck", grams: 1.25 },
  { name: "1 hand - front/back/fingers", grams: 0.5 },
  { name: "2 hands - front/back/fingers", grams: 1 },
  { name: "1 entire arm & hand", grams: 2 },
  { name: "2 entire arms & hands", grams: 4 },
  { name: "elbows", grams: 0.5 },
  { name: "1 foot - top/sole/toes", grams: 0.75 },
  { name: "2 feet - top/sole/toes", grams: 1.50 },
  { name: "1 entire leg + foot", grams: 4 },
  { name: "2 entire legs + feet", grams: 8 },
  { name: "buttocks", grams: 2 },
  { name: "knees", grams: 0.5 },
  { name: "trunk front", grams: 4 },
  { name: "trunk back", grams: 4 },
  { name: "genitalia", grams: 0.5 },
  { name: "back and buttocks", grams: 3.5 },
  { name: "front of chest + abdomen", grams: 3.5 }
];

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
    quantity: '',
    duration: '7'
  }]);
  const [maxDose, setMaxDose] = useState<string>('');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('units');
  const [previousUnit, setPreviousUnit] = useState<MeasurementUnit>('units');
  const [dosagePerUnit, setDosagePerUnit] = useState('1');
  const [dosageUnit, setDosageUnit] = useState<MeasurementUnit>('units');
  const [concentrationEnabled, setConcentrationEnabled] = useState(false);
  const [concentrationValue1, setConcentrationValue1] = useState('');
  const [concentrationValue2, setConcentrationValue2] = useState('');
  const [concentrationUnit1, setConcentrationUnit1] = useState<MeasurementUnit>('mg');
  const [concentrationUnit2, setConcentrationUnit2] = useState<MeasurementUnit>('ml');
  const [dropsPerMl, setDropsPerMl] = useState('20');
  const [usePackageSize, setUsePackageSize] = useState(false);
  const [useBeyondUseDate, setUseBeyondUseDate] = useState(false);
  const [packageSizeValue, setPackageSizeValue] = useState('');
  const [beyondUseDateValue, setBeyondUseDateValue] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [puffsPerPackage, setPuffsPerPackage] = useState('');
  const [packageGrams, setPackageGrams] = useState('');
  const [spraysPerPackage, setSpraysPerPackage] = useState('');
  const [nasalPackageMls, setNasalPackageMls] = useState('');

  const timeConversions: Record<TimeUnit, number> = {
    minute: 1/1440,
    hour: 1/24,
    day: 1,
    week: 7,
  };

  const unitConversions: Record<MeasurementUnit, number> = {
    mcg: 1,           // base unit
    mg: 1000,         // 1 mg = 1000 mcg
    g: 1000000,       // 1 g = 1000 mg = 1,000,000 mcg
    gm: 1000000,      // same as g
    ml: 1000000,      // 1 ml = 1000 mg = 1,000,000 mcg
    units: 1000,      // assuming 1 unit = 1 mg
  };

  const calculate = () => {
    const quantityNum = parseFloat(quantity);
    const packageSizeNum = parseFloat(packageSize);
    const frequencyNum = parseFloat(frequencyNumber);
    const dropsPerMlNum = parseFloat(dropsPerMl);
    
    let resultValue = 0;
    
    // Adjust quantity based on package size if enabled
    let adjustedQuantity = quantityNum;
    if (usePackageSize && packageSizeValue) {
      const packageSizeMultiple = parseFloat(packageSizeValue);
      if (!isNaN(packageSizeMultiple) && packageSizeMultiple > 0) {
        adjustedQuantity = Math.floor(quantityNum / packageSizeMultiple) * packageSizeMultiple;
      }
    }

    if (calculationType === 'daySupply') {
      // Validate inputs
      if (isNaN(adjustedQuantity) || isNaN(packageSizeNum) || isNaN(frequencyNum) || 
          (weightUnit === 'Eye Drops' && isNaN(dropsPerMlNum))) {
        setResult('Please enter valid numbers');
        return;
      }

      // Calculate doses per day based on frequency
      const dosesPerDay = (() => {
        if (frequencyPattern === 'everyOther') {
          return 0.5;
        }
        if (frequencyUnit === 'hour') {
          return 24 / frequencyNum;
        }
        if (frequencyUnit === 'day') {
          return frequencyNum;
        }
        if (frequencyUnit === 'week') {
          return frequencyNum / 7;
        }
        return getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
      })();

      if (concentrationEnabled && concentrationValue1 && concentrationValue2) {
        // Add console.log statements to debug the calculation
        console.log('Concentration Values:', {
          concValue1: parseFloat(concentrationValue1), // Should be 25mg
          concValue2: parseFloat(concentrationValue2), // Should be 5ml
          doseValue: parseFloat(dosagePerUnit),       // Should be 12.5mg
          quantityNum,                                // Should be 120ml
          dosesPerDay                                 // Should be 3 (24/8)
        });

        // Calculate mg per ml in the concentration
        const mgPerMl = parseFloat(concentrationValue1) / parseFloat(concentrationValue2); // Should be 5mg/ml
        
        // Calculate ml needed per dose
        const mlPerDose = parseFloat(dosagePerUnit) / mgPerMl;  // Should be 2.5ml
        
        // Calculate total doses available
        const totalDoses = quantityNum / mlPerDose;             // Should be 48 doses
        
        // Calculate days supply
        resultValue = totalDoses / (dosesPerDay * packageSizeNum); // Should be 16 days

        console.log('Calculated Values:', {
          mgPerMl,
          mlPerDose,
          totalDoses,
          resultValue
        });
      } else if (includeTitration && maxDose) {
        console.log('Titration Initial Values:', {
          quantity: adjustedQuantity,
          titrationStages,
          maxDose: parseFloat(maxDose),
          dosesPerDay
        });

        const maxDoseNum = parseFloat(maxDose);
        let remainingQuantity = adjustedQuantity;
        let totalDays = 0;

        // Process each titration stage
        for (let i = 0; i < titrationStages.length && remainingQuantity > 0; i++) {
          const currentStage = titrationStages[i];
          const stageDose = parseFloat(currentStage.quantity);
          const stageDuration = parseFloat(currentStage.duration);

          if (isNaN(stageDose) || isNaN(stageDuration)) continue;

          // Calculate quantity needed for this stage
          const quantityForStage = stageDose * stageDuration;
          
          // If we have enough quantity for the full stage
          if (remainingQuantity >= quantityForStage) {
            totalDays += stageDuration;
            remainingQuantity -= quantityForStage;
          } else {
            // If we don't have enough for the full stage
            totalDays += remainingQuantity / stageDose;
            remainingQuantity = 0;
          }

          console.log('Titration Stage Calculation:', {
            stage: i + 1,
            stageDose,
            stageDuration,
            quantityForStage,
            remainingQuantity,
            totalDays
          });
        }

        // If there's still quantity left, use it at max dose
        if (remainingQuantity > 0) {
          const additionalDays = remainingQuantity / maxDoseNum;
          totalDays += additionalDays;
          
          console.log('Final Max Dose Calculation:', {
            remainingQuantity,
            maxDoseNum,
            additionalDays,
            totalDays
          });
        }

        resultValue = totalDays;
        console.log('Final Result:', {
          resultValue,
          expectedDays: 47
        });
      } else if (weightUnit === 'Oral Inhaler') {
        // Parse inhaler-specific values
        const puffsNum = parseFloat(puffsPerPackage);
        const gramsNum = parseFloat(packageGrams);
        
        if (isNaN(puffsNum) || isNaN(gramsNum)) {
          setResult('Please enter valid inhaler values');
          return;
        }

        // Calculate doses per day
        const dosesPerDay = (() => {
          if (frequencyPattern === 'everyOther') {
            return 0.5 * parseFloat(packageSize);
          }
          if (frequencyUnit === 'hour') {
            return (24 / parseFloat(frequencyNumber)) * parseFloat(packageSize);
          }
          if (frequencyUnit === 'day') {
            return parseFloat(frequencyNumber) * parseFloat(packageSize);
          }
          if (frequencyUnit === 'week') {
            return (parseFloat(frequencyNumber) / 7) * parseFloat(packageSize);
          }
          return getFrequencyPerDay(parseFloat(frequencyNumber), frequencyPattern, frequencyUnit) * parseFloat(packageSize);
        })();

        // Calculate total puffs available
        const totalPuffs = puffsNum * (quantityNum / gramsNum);
        
        // Calculate days supply
        resultValue = totalPuffs / dosesPerDay;

      } else if (weightUnit === 'Nasal Inhaler') {
        // Parse nasal inhaler-specific values
        const spraysNum = parseFloat(spraysPerPackage);
        const mlsNum = parseFloat(nasalPackageMls);
        
        if (isNaN(spraysNum) || isNaN(mlsNum)) {
          setResult('Please enter valid inhaler values');
          return;
        }

        // Calculate sprays per mL
        const spraysPerMl = spraysNum / mlsNum;
        
        // Calculate total sprays available
        const totalSprays = quantityNum * spraysPerMl;
        
        // Calculate daily spray usage
        const dailySprayUsage = dosesPerDay * packageSizeNum;
        resultValue = totalSprays / dailySprayUsage;
      } else if (weightUnit === 'Eye Drops') {
        console.log('Eye Drops Day Supply Initial Values:', {
          quantity: adjustedQuantity,         // Should be 8ml
          dropsPerMl: dropsPerMlNum,         // Should be 20 or 16
          dosesPerDay,                        // Should be 1
          packageSize: packageSizeNum,        // Should be 2.5ml
          beyondUseDate: beyondUseDateValue   // Should be 42
        });

        const totalDrops = adjustedQuantity * dropsPerMlNum;
        resultValue = totalDrops / dosesPerDay;

        console.log('Eye Drops Day Supply Calculation:', {
          totalDrops,                         // Should be 160 or 128
          resultValue: Math.floor(resultValue), // Should be 126 or 120 after BUD adjustment
          expectedDays: '126 or 120'          // (rounded down to nearest multiple of 42)
        });
      } else {
        const dailyUsage = dosesPerDay * packageSizeNum;
        resultValue = adjustedQuantity / dailyUsage;
      }

      // Convert to output unit
      let originalResult = resultValue * timeConversions[outputUnit];
      let finalResult = originalResult;
      
      // Apply beyond use date rounding only if the days supply per package exceeds the beyond use period
      if (useBeyondUseDate && beyondUseDateValue) {
        const beyondUsePeriod = parseFloat(beyondUseDateValue);
        if (!isNaN(beyondUsePeriod) && beyondUsePeriod > 0) {
          const daysPerPackage = (parseFloat(packageSizeValue) * dropsPerMlNum) / dosesPerDay;
          if (daysPerPackage > beyondUsePeriod) {
            finalResult = Math.floor(originalResult / beyondUsePeriod) * beyondUsePeriod;
          }
        }
      }

      const roundedOriginal = Math.floor(originalResult);
      const roundedFinal = Math.floor(finalResult);

      // Format the result string
      let resultString = `${roundedFinal} (${finalResult.toFixed(1)}) ${outputUnit}${finalResult === 1 ? '' : 's'}`;
      if (usePackageSize || useBeyondUseDate) {
        resultString += `\nOriginal: ${roundedOriginal} (${originalResult.toFixed(1)}) ${outputUnit}${originalResult === 1 ? '' : 's'}`;
      }
      setResult(resultString);
    } else {  // calculationType === 'quantity'
      const daysNum = parseFloat(daySupply);
      const frequencyNum = parseFloat(frequencyNumber);
      const packageSizeNum = parseFloat(packageSize);
      
      if (isNaN(daysNum) || isNaN(frequencyNum) || isNaN(packageSizeNum)) {
        setResult('Please enter valid numbers');
        return;
      }

      if (weightUnit === 'Eye Drops') {
        // Parse eye drops-specific values
        const dropsPerMlNum = parseFloat(dropsPerMl);
        const packageSizeNum = parseFloat(packageSizeValue || '2.5');

        // Calculate doses per day
        const dosesPerDay = (() => {
          if (frequencyPattern === 'everyOther') {
            return 0.5;
          }
          if (frequencyUnit === 'hour') {
            return 24 / frequencyNum;
          }
          if (frequencyUnit === 'day') {
            return frequencyNum;
          }
          if (frequencyUnit === 'week') {
            return frequencyNum / 7;
          }
          return getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit);
        })();

        // Convert target days to actual days based on time unit
        const actualDays = daysNum * timeConversions[outputUnit];

        // Eye Drops Quantity Testing
        console.log('Eye Drops Quantity Initial Values:', {
          targetDays: actualDays,
          dropsPerMl: dropsPerMlNum,
          dosesPerDay,
          packageSize: packageSizeNum
        });

        // Calculate total drops needed
        const totalDropsNeeded = actualDays * dosesPerDay;
        
        // Convert drops to mL
        const mlNeeded = totalDropsNeeded / dropsPerMlNum;
        
        // Calculate number of packages needed (round up)
        const packagesNeeded = Math.ceil(mlNeeded / packageSizeNum);
        
        // Final quantity is number of packages times package size
        const finalQuantity = packagesNeeded * packageSizeNum;

        // Eye Drops Quantity Testing
        console.log('Eye Drops Quantity Calculation:', {
          totalDropsNeeded,
          mlNeeded,
          packagesNeeded,
          finalQuantity,
          expectedQuantity: 2.5
        });

        setResult(`${finalQuantity} mL needed`);
      } else if (includeTitration && maxDose) {
        console.log('Quantity Calculation Initial Values:', {
          targetDays: daysNum,
          titrationStages,
          maxDose: parseFloat(maxDose)
        });

        const maxDoseNum = parseFloat(maxDose);
        let totalQuantity = 0;
        let remainingDays = daysNum;

        // Process each titration stage
        for (let i = 0; i < titrationStages.length && remainingDays > 0; i++) {
          const currentStage = titrationStages[i];
          const stageDose = parseFloat(currentStage.quantity);
          const stageDuration = parseFloat(currentStage.duration);

          if (isNaN(stageDose) || isNaN(stageDuration)) continue;

          // Calculate days for this stage
          const daysInStage = Math.min(stageDuration, remainingDays);
          
          // Add quantity for this stage
          totalQuantity += stageDose * daysInStage;
          remainingDays -= daysInStage;

          console.log('Quantity Stage Calculation:', {
            stage: i + 1,
            stageDose,
            daysInStage,
            quantityAdded: stageDose * daysInStage,
            remainingDays,
            totalQuantity
          });
        }

        // If there are remaining days, calculate at max dose
        if (remainingDays > 0) {
          const finalQuantity = maxDoseNum * remainingDays;
          totalQuantity += finalQuantity;

          console.log('Final Max Dose Quantity:', {
            remainingDays,
            maxDoseNum,
            finalQuantity,
            totalQuantity
          });
        }

        setResult(`${totalQuantity} units needed`);
        return;
      } else if (weightUnit === 'Topical') {
        // Calculate doses per day
        const dosesPerDay = (() => {
          console.log('Frequency Values:', {
            frequencyNum,
            packageSizeNum,
            frequencyPattern,
            frequencyUnit,
            expectedDosesPerDay: 2
          });

          if (frequencyPattern === 'everyOther') {
            return 0.5 * packageSizeNum;
          }
          if (frequencyUnit === 'hour') {
            return (24 / frequencyNum) * packageSizeNum;
          }
          if (frequencyUnit === 'day') {
            return frequencyNum * packageSizeNum;  // This will now be 2 * packageSize
          }
          if (frequencyUnit === 'week') {
            return (frequencyNum / 7) * packageSizeNum;
          }
          return getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit) * packageSizeNum;
        })();

        console.log('Detailed Topical Values:', {
          frequencyNum,
          frequencyPattern,
          frequencyUnit,
          dosesPerDay,
          selectedAreas: Array.from(selectedAreas),
          packageSizeNum,
          daysNum
        });

        // Calculate total grams per application
        const totalGramsPerApplication = TOPICAL_AREAS
          .filter(area => selectedAreas.has(area.name))
          .reduce((sum, area) => sum + area.grams, 0);

        // Calculate total grams needed
        const totalGramsNeeded = totalGramsPerApplication * dosesPerDay * daysNum;
        
        // Calculate number of packages needed (round up)
        const packagesNeeded = Math.ceil(totalGramsNeeded / packageSizeNum);
        
        // Final quantity is number of packages times package size
        const finalQuantity = packagesNeeded * packageSizeNum;

        console.log('Final Calculations:', {
          totalGramsPerApplication,
          dosesPerDay,
          daysNum,
          totalGramsNeeded,
          packagesNeeded,
          finalQuantity
        });

        setResult(`${finalQuantity} grams needed`);
      } else if (weightUnit === 'Oral Inhaler') {
        // Parse inhaler-specific values
        const puffsNum = parseFloat(puffsPerPackage);
        const gramsNum = parseFloat(packageGrams);
        
        if (isNaN(puffsNum) || isNaN(gramsNum)) {
          setResult('Please enter valid inhaler values');
          return;
        }

        // Calculate doses per day
        const dosesPerDay = (() => {
          if (frequencyPattern === 'everyOther') {
            return 0.5 * parseFloat(packageSize);
          }
          if (frequencyUnit === 'hour') {
            return (24 / parseFloat(frequencyNumber)) * parseFloat(packageSize);
          }
          if (frequencyUnit === 'day') {
            return parseFloat(frequencyNumber) * parseFloat(packageSize);
          }
          if (frequencyUnit === 'week') {
            return (parseFloat(frequencyNumber) / 7) * parseFloat(packageSize);
          }
          return getFrequencyPerDay(parseFloat(frequencyNumber), frequencyPattern, frequencyUnit) * parseFloat(packageSize);
        })();

        // Convert target days to actual days based on time unit
        const actualDays = parseFloat(daySupply) * timeConversions[outputUnit];

        // Calculate total puffs needed
        const totalPuffsNeeded = actualDays * dosesPerDay;
        
        // Calculate puffs per gram ratio
        const puffsPerGram = puffsNum / gramsNum;
        
        // Calculate grams needed
        const gramsNeeded = totalPuffsNeeded / puffsPerGram;
        
        // Round up to the nearest package size
        const packagesNeeded = Math.ceil(gramsNeeded / gramsNum);
        const finalGrams = packagesNeeded * gramsNum;

        console.log('Oral Inhaler Quantity Calculation:', {
          actualDays,
          dosesPerDay,
          totalPuffsNeeded,
          puffsPerGram,
          gramsNeeded,
          packagesNeeded,
          finalGrams
        });

        setResult(`${finalGrams} grams (adjusted to package size) | ${gramsNeeded} grams (unadjusted to package size)`);
        return;
      } else if (weightUnit === 'Nasal Inhaler') {
        // Parse inhaler-specific values
        const spraysNum = parseFloat(spraysPerPackage);
        const mlsNum = parseFloat(nasalPackageMls);
        
        if (isNaN(spraysNum) || isNaN(mlsNum)) {
          setResult('Please enter valid inhaler values');
          return;
        }

        // Calculate doses per day
        const dosesPerDay = (() => {
          if (frequencyPattern === 'everyOther') {
            return 0.5 * parseFloat(packageSize);
          }
          if (frequencyUnit === 'hour') {
            return (24 / parseFloat(frequencyNumber)) * parseFloat(packageSize);
          }
          if (frequencyUnit === 'day') {
            return parseFloat(frequencyNumber) * parseFloat(packageSize);
          }
          if (frequencyUnit === 'week') {
            return (parseFloat(frequencyNumber) / 7) * parseFloat(packageSize);
          }
          return getFrequencyPerDay(parseFloat(frequencyNumber), frequencyPattern, frequencyUnit) * parseFloat(packageSize);
        })();

        // Convert target days to actual days based on time unit
        const actualDays = parseFloat(daySupply) * timeConversions[outputUnit];

        // Calculate total puffs needed
        const totalSpraysNeeded = actualDays * dosesPerDay;
        
        // Calculate sprays per ml ratio
        const spraysPerMl = spraysNum / mlsNum;
        
        // Calculate ml needed
        const mlNeeded = totalSpraysNeeded / spraysPerMl;
        
        // Round up to the nearest package size
        const packagesNeeded = Math.ceil(mlNeeded / mlsNum);
        const finalMls = packagesNeeded * mlsNum;

        console.log('Nasal Inhaler Quantity Calculation:', {
          actualDays,
          dosesPerDay,
          totalSpraysNeeded,
          spraysPerMl,
          mlNeeded,
          packagesNeeded,
          finalMls
        });

        setResult(`${finalMls} ml (adjusted to package size) | ${mlNeeded} ml (unadjusted to package size)`);
        return;
      }
    }
  };

  const getFrequencyPerDay = (freq: number, pattern: string, unit: string) => {
    let baseRate = freq / timeConversions[unit as TimeUnit];
    
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

  const calculateTotalGrams = () => {
    return TOPICAL_AREAS
      .filter(area => selectedAreas.has(area.name))
      .reduce((sum, area) => sum + area.grams, 0);
  };

  const toggleArea = (areaName: string) => {
    const newSelected = new Set(selectedAreas);
    if (newSelected.has(areaName)) {
      newSelected.delete(areaName);
    } else {
      newSelected.add(areaName);
    }
    setSelectedAreas(newSelected);
    setDosagePerUnit(calculateTotalGrams().toString());
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

          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, usePackageSize && styles.toggleButtonActive]}
              onPress={() => setUsePackageSize(!usePackageSize)}>
              <ThemedText>Package Size</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, useBeyondUseDate && styles.toggleButtonActive]}
              onPress={() => setUseBeyondUseDate(!useBeyondUseDate)}>
              <ThemedText>Beyond Use Date</ThemedText>
            </TouchableOpacity>
          </View>

          {usePackageSize && (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={packageSizeValue}
                onChangeText={setPackageSizeValue}
                keyboardType="numeric"
                placeholder="Package size"
                placeholderTextColor="#666"
              />
              <ThemedText style={styles.unitLabel}>units</ThemedText>
            </View>
          )}

          {useBeyondUseDate && (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={beyondUseDateValue}
                onChangeText={setBeyondUseDateValue}
                keyboardType="numeric"
                placeholder="Beyond use date period"
                placeholderTextColor="#666"
              />
              <ThemedText style={styles.unitLabel}>{outputUnit}s</ThemedText>
            </View>
          )}

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
                  <Picker.Item label="gm" value="gm" />
                  <Picker.Item label="mcg" value="mcg" />
                </Picker>
              </View>

              {measurementUnit !== 'units' && !['Oral Inhaler', 'Nasal Inhaler', 'Eye Drops', 'Topical'].includes(weightUnit) && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    value={dosagePerUnit}
                    onChangeText={setDosagePerUnit}
                    keyboardType="numeric"
                    placeholder="Dosage"
                    placeholderTextColor="#666"
                  />
                  <Picker
                    selectedValue={dosageUnit}
                    onValueChange={setDosageUnit}
                    style={styles.unitPicker}>
                    <Picker.Item label="mg" value="mg" />
                    <Picker.Item label="ml" value="ml" />
                    <Picker.Item label="g" value="g" />
                    <Picker.Item label="gm" value="gm" />
                    <Picker.Item label="mcg" value="mcg" />
                  </Picker>
                </View>
              )}

              {weightUnit === 'Eye Drops' && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    value={dropsPerMl}
                    onChangeText={setDropsPerMl}
                    keyboardType="numeric"
                    placeholder="Drops per ml"
                    placeholderTextColor="#666"
                  />
                  <ThemedText style={styles.unitLabel}>drops/ml</ThemedText>
                </View>
              )}

              {weightUnit === 'Oral Inhaler' ? (
                <View style={styles.inhalerContainer}>
                  <View style={styles.inhalerInputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={puffsPerPackage}
                      onChangeText={setPuffsPerPackage}
                      keyboardType="numeric"
                      placeholder="Puffs"
                      placeholderTextColor="#666"
                    />
                    <ThemedText style={styles.inhalerText}>puffs per</ThemedText>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={packageGrams}
                      onChangeText={setPackageGrams}
                      keyboardType="numeric"
                      placeholder="Grams"
                      placeholderTextColor="#666"
                    />
                    <ThemedText style={styles.inhalerText}>gm</ThemedText>
                  </View>
                </View>
              ) : weightUnit === 'Nasal Inhaler' ? (
                <View style={styles.inhalerContainer}>
                  <View style={styles.inhalerInputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={spraysPerPackage}
                      onChangeText={setSpraysPerPackage}
                      keyboardType="numeric"
                      placeholder="Sprays"
                      placeholderTextColor="#666"
                    />
                    <ThemedText style={styles.inhalerText}>sprays per</ThemedText>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={nasalPackageMls}
                      onChangeText={setNasalPackageMls}
                      keyboardType="numeric"
                      placeholder="mL"
                      placeholderTextColor="#666"
                    />
                    <ThemedText style={styles.inhalerText}>mL</ThemedText>
                  </View>
                </View>
              ) : weightUnit === 'Topical' ? (
                <View style={styles.topicalContainer}>
                  <ThemedText style={styles.topicalTitle}>Select affected areas:</ThemedText>
                  <View style={styles.topicalButtonsGrid}>
                    {TOPICAL_AREAS.map((area) => (
                      <TouchableOpacity
                        key={area.name}
                        style={[
                          styles.topicalButton,
                          selectedAreas.has(area.name) && styles.topicalButtonSelected
                        ]}
                        onPress={() => toggleArea(area.name)}
                      >
                        <ThemedText style={[
                          styles.topicalButtonText,
                          selectedAreas.has(area.name) && styles.topicalButtonTextSelected
                        ]}>
                          {area.name}
                          {'\n'}
                          ({area.grams}g)
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ThemedText style={styles.topicalTotal}>
                    Total: {calculateTotalGrams()}g per application
                  </ThemedText>
                </View>
              ) : null}

              <View style={styles.titrationToggle}>
                <TouchableOpacity 
                  style={[styles.toggleButton, concentrationEnabled && styles.toggleButtonActive]}
                  onPress={() => setConcentrationEnabled(!concentrationEnabled)}>
                  <ThemedText>Include Concentration</ThemedText>
                </TouchableOpacity>
              </View>

              {concentrationEnabled && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    value={concentrationValue1}
                    onChangeText={setConcentrationValue1}
                    keyboardType="numeric"
                    placeholder="Concentration"
                    placeholderTextColor="#666"
                  />
                  <Picker
                    selectedValue={concentrationUnit1}
                    onValueChange={setConcentrationUnit1}
                    style={styles.unitPicker}>
                    <Picker.Item label="mg" value="mg" />
                    <Picker.Item label="ml" value="ml" />
                    <Picker.Item label="g" value="g" />
                    <Picker.Item label="mcg" value="mcg" />
                  </Picker>
                  <ThemedText>per</ThemedText>
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    value={concentrationValue2}
                    onChangeText={setConcentrationValue2}
                    keyboardType="numeric"
                    placeholder="Volume"
                    placeholderTextColor="#666"
                  />
                  <Picker
                    selectedValue={concentrationUnit2}
                    onValueChange={setConcentrationUnit2}
                    style={styles.unitPicker}>
                    <Picker.Item label="ml" value="ml" />
                    <Picker.Item label="mg" value="mg" />
                    <Picker.Item label="g" value="g" />
                    <Picker.Item label="mcg" value="mcg" />
                  </Picker>
                </View>
              )}

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
                          value={stage.quantity}
                          onChangeText={(value) => {
                            const newStages = [...titrationStages];
                            newStages[index].quantity = value;
                            setTitrationStages(newStages);
                          }}
                          keyboardType="numeric"
                          placeholder="Quantity per day"
                          placeholderTextColor="#666"
                        />
                        <ThemedText style={styles.unitLabel}>units/day</ThemedText>
                      </View>

                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.input, styles.inputFlex]}
                          value={stage.duration}
                          onChangeText={(value) => {
                            const newStages = [...titrationStages];
                            newStages[index].duration = value;
                            setTitrationStages(newStages);
                          }}
                          keyboardType="numeric"
                          placeholder="Duration"
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
                        quantity: '',
                        duration: '7'
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
              <View style={styles.usesPerFrequencyContainer}>
                <TextInput
                  style={[styles.input, styles.frequencyInput]}
                  value={packageSize}
                  onChangeText={setPackageSize}
                  keyboardType="numeric"
                  placeholder="Uses"
                  placeholderTextColor="#666"
                />
                <ThemedText style={styles.unitLabel}>uses per</ThemedText>
              </View>

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
              {result ? result : ''}
            </ThemedText>
          </View>
          <ThemedText style={styles.info}>
            Please reload the page when altering fields to find a different Day Supply.
            Don't reload the page once Day Supply has been calculated and you're trying to find a Quantity with a given Day Supply.
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
    gap: 10,
  },
  inputFlex: {
    flex: 1,
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
    marginVertical: 5,
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
  topicalContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topicalButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    padding: 5,
  },
  topicalButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topicalButtonSelected: {
    backgroundColor: '#91e655',
    borderColor: '#7bc548',
    shadowColor: '#91e655',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  topicalButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    fontWeight: '500',
  },
  topicalButtonTextSelected: {
    color: '#1a472a',
    fontWeight: 'bold',
  },
  topicalTotal: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    color: '#2e7d32',
    borderWidth: 2,
    borderColor: '#91e655',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inhalerContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inhalerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inhalerText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  usesPerFrequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});
