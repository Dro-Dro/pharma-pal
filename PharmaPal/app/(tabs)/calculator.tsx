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
  const [usesPerFrequency, setUsesPerFrequency] = useState('1');
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
  const [packageSize, setPackageSize] = useState('');
  const [numOfPackages, setNumOfPackages] = useState('1');
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

  const calculate = () => {
    const quantityNum = parseFloat(quantity);
    const usesPerFrequencyNum = parseFloat(usesPerFrequency);
    const frequencyNum = parseFloat(frequencyNumber);
    const dropsPerMlNum = parseFloat(dropsPerMl);
    
    let resultValue = 0;
    
    // Adjust quantity based on package size if enabled
    let adjustedQuantity = quantityNum;
    if (usePackageSize && packageSize) {
      const usesPerFrequencyMultiple = parseFloat(packageSize);
      if (!isNaN(usesPerFrequencyMultiple) && usesPerFrequencyMultiple > 0) {
        adjustedQuantity = Math.floor(quantityNum / usesPerFrequencyMultiple) * usesPerFrequencyMultiple;
      }
    }

    if (calculationType === 'daySupply') {
      // Validate inputs
      if (isNaN(adjustedQuantity) || isNaN(usesPerFrequencyNum) || isNaN(frequencyNum) || 
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
        // Calculate concentration ratio (e.g., mg/ml)
        const concentrationRatio = parseFloat(concentrationValue1) / parseFloat(concentrationValue2);
        
        // Calculate how many ml are needed for each prescribed dose
        // dosagePerUnit is the prescribed strength (e.g., 500mg)
        // concentrationRatio is the medication strength per ml (e.g., 250mg/ml)
        const mlPerDose = parseFloat(dosagePerUnit) / concentrationRatio;
        
        if (includeTitration && maxDose) {
          let remainingQuantity = adjustedQuantity; // This is in ml
          let totalDays = 0;

          // Process each titration stage
          for (let i = 0; i < titrationStages.length && remainingQuantity > 0; i++) {
            const currentStage = titrationStages[i];
            const stageDose = parseFloat(currentStage.quantity); // This is in prescribed units (e.g., mg)
            const stageDuration = parseFloat(currentStage.duration);

            if (isNaN(stageDose) || isNaN(stageDuration)) continue;

            // Convert prescribed dose to ml
            const stageMlPerDose = (stageDose / concentrationRatio) * usesPerFrequencyNum;
            const stageDailyMl = stageMlPerDose * dosesPerDay;
            const mlForStage = stageDailyMl * stageDuration;

            if (remainingQuantity >= mlForStage) {
              totalDays += stageDuration;
              remainingQuantity -= mlForStage;
            } else {
              totalDays += remainingQuantity / stageDailyMl;
              remainingQuantity = 0;
            }

            console.log('Titration Stage with Concentration:', {
              stage: i + 1,
              prescribedDose: stageDose,
              concentrationRatio,
              stageMlPerDose,
              stageDailyMl,
              mlForStage,
              remainingQuantity,
              totalDays
            });
          }

          // If there's still quantity left, use it at max dose
          if (remainingQuantity > 0) {
            const maxDoseNum = parseFloat(maxDose);
            const maxMlPerDose = (maxDoseNum / concentrationRatio) * usesPerFrequencyNum;
            const maxDailyMl = maxMlPerDose * dosesPerDay;
            const additionalDays = remainingQuantity / maxDailyMl;
            totalDays += additionalDays;

            console.log('Final Max Dose with Concentration:', {
              remainingQuantity,
              maxDoseNum,
              maxMlPerDose,
              maxDailyMl,
              additionalDays,
              totalDays
            });
          }

          resultValue = totalDays;
          console.log('Total Days:', totalDays);
        } else {
          // Regular concentration calculation
          // Convert the total volume (quantityNum) to doses based on mlPerDose
          const totalMlNeeded = mlPerDose * dosesPerDay * usesPerFrequencyNum;
          resultValue = quantityNum / totalMlNeeded;
          console.log('Total Days:', resultValue);
        }
        const resultString = `${resultValue} days supply`;
        setResult(resultString);
        return;
      } else if (includeTitration && maxDose) {
        console.log('Titration Initial Values:', {
          quantity: adjustedQuantity,
          titrationStages,
          maxDose: parseFloat(maxDose),
          dosesPerDay,
          usesPerFrequency: usesPerFrequencyNum
        });

        const maxDoseNum = parseFloat(maxDose) * usesPerFrequencyNum;
        let remainingQuantity = adjustedQuantity;
        let totalDays = 0;

        // Process each titration stage
        for (let i = 0; i < titrationStages.length && remainingQuantity > 0; i++) {
          const currentStage = titrationStages[i];
          const stageDose = parseFloat(currentStage.quantity) * usesPerFrequencyNum; // Account for uses per frequency
          const stageDuration = parseFloat(currentStage.duration);

          if (isNaN(stageDose) || isNaN(stageDuration)) continue;

          // Calculate daily usage based on frequency settings
          const stageDailyDose = stageDose * dosesPerDay;
          
          // Calculate quantity needed for this stage
          const quantityForStage = stageDailyDose * stageDuration;
          
          // If we have enough quantity for the full stage
          if (remainingQuantity >= quantityForStage) {
            totalDays += stageDuration;
            remainingQuantity -= quantityForStage;
          } else {
            // If we don't have enough for the full stage
            totalDays += remainingQuantity / stageDailyDose;
            remainingQuantity = 0;
          }

          console.log('Titration Stage Calculation:', {
            stage: i + 1,
            stageDose,
            stageDailyDose,
            stageDuration,
            quantityForStage,
            remainingQuantity,
            totalDays
          });
        }

        // If there's still quantity left, use it at max dose
        if (remainingQuantity > 0) {
          const maxDailyDose = maxDoseNum * dosesPerDay;
          const additionalDays = remainingQuantity / maxDailyDose;
          totalDays += additionalDays;
          
          console.log('Final Max Dose Calculation:', {
            remainingQuantity,
            maxDoseNum,
            maxDailyDose,
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
            return 0.5 * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'hour') {
            return (24 / parseFloat(frequencyNumber)) * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'day') {
            return parseFloat(frequencyNumber) * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'week') {
            return (parseFloat(frequencyNumber) / 7) * parseFloat(usesPerFrequency);
          }
          return getFrequencyPerDay(parseFloat(frequencyNumber), frequencyPattern, frequencyUnit) * parseFloat(usesPerFrequency);
        })();

        // calculate grams per puff
        const gramsPerPuff = gramsNum / puffsNum;

        // Calculate total puffs available
        const totalPuffs = adjustedQuantity / gramsPerPuff;
        
        // Calculate days supply
        resultValue = totalPuffs / dosesPerDay;

        console.log('Oral Inhaler Day Supply Initial Values:', {
          quantity: adjustedQuantity,
          puffsNum,
          totalPuffs,
          gramsPerPuff,
          gramsNum,
          dosesPerDay,
          resultValue,
          usesPerFrequency: usesPerFrequencyNum
        });

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
        const dailySprayUsage = dosesPerDay * usesPerFrequencyNum;
        resultValue = totalSprays / dailySprayUsage;
      } else if (weightUnit === 'Eye Drops') {
        console.log('Eye Drops Day Supply Initial Values:', {
          quantity: adjustedQuantity,         // Should be 8ml
          dropsPerMl: dropsPerMlNum,         // Should be 20 or 16
          dosesPerDay,                        // Should be 1
          usesPerFrequency: usesPerFrequencyNum,        // Should be 2.5ml
          beyondUseDate: beyondUseDateValue   // Should be 42
        });

        const totalDrops = adjustedQuantity * dropsPerMlNum;
        resultValue = totalDrops / dosesPerDay;

        console.log('Eye Drops Day Supply Calculation:', {
          totalDrops,                         // Should be 160 or 128
          resultValue: Math.floor(resultValue), // Should be 126 or 120 after BUD adjustment
          expectedDays: '126 or 120'          // (rounded down to nearest multiple of 42)
        });
      } else if (weightUnit === 'Topical') {
        // Calculate total grams per application
        const totalGramsPerApplication = TOPICAL_AREAS
          .filter(area => selectedAreas.has(area.name))
          .reduce((sum, area) => sum + area.grams, 0);
        
        // Calculate total grams needed
        const totalGramsNeeded = totalGramsPerApplication * dosesPerDay * usesPerFrequencyNum;
        
        // Calculate days supply
        resultValue = quantityNum / totalGramsNeeded;
      } else {
        const dailyUsage = dosesPerDay * usesPerFrequencyNum;
        resultValue = adjustedQuantity / dailyUsage;
      }

      // Convert to output unit
      let originalResult = resultValue * timeConversions[outputUnit];
      let finalResult = originalResult;
      
      // Apply beyond use date rounding only if the days supply per package exceeds the beyond use period
      if (useBeyondUseDate && beyondUseDateValue) {
        const beyondUsePeriod = parseFloat(beyondUseDateValue);
        if (!isNaN(beyondUsePeriod) && beyondUsePeriod > 0) {
          const daysPerPackage = (parseFloat(packageSize) * dropsPerMlNum) / dosesPerDay;
          if (daysPerPackage > beyondUsePeriod) {
            finalResult = Math.floor(originalResult / beyondUsePeriod) * beyondUsePeriod;
          }
        }
      }

      const roundedOriginal = Math.floor(originalResult);
      const roundedFinal = Math.floor(finalResult);

      // Format the result string
      let resultString = `${roundedFinal} (${finalResult.toFixed(1)}) ${outputUnit}${finalResult === 1 ? '' : 's'}`;
      
      // Add package count if package size is enabled
      if (usePackageSize && packageSize) {
        const usesPerFrequencyNum = parseFloat(packageSize);
        if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
          const packagesUsed = Math.ceil(adjustedQuantity / usesPerFrequencyNum);
          resultString += `\nPackages used: ${packagesUsed}`;
        }
      }
      
      if (usePackageSize || useBeyondUseDate) {
        resultString += `\nOriginal: ${roundedOriginal} (${originalResult.toFixed(1)}) ${outputUnit}${originalResult === 1 ? '' : 's'}`;
      }
      
      setResult(resultString);
    } else {  // calculationType === 'quantity'
      const daysNum = parseFloat(daySupply);
      const frequencyNum = parseFloat(frequencyNumber);
      const usesPerFrequencyNum = parseFloat(usesPerFrequency);
      
      if (isNaN(daysNum) || isNaN(frequencyNum) || isNaN(usesPerFrequencyNum)) {
        setResult('Please enter valid numbers');
        return;
      }

      // Convert target days to actual days based on time unit
      const actualDays = daysNum * timeConversions[outputUnit];

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
          concValue1: parseFloat(concentrationValue1), // Should be 200 mg/units
          concValue2: parseFloat(concentrationValue2), // Should be 1ml
          doseValue: parseFloat(dosagePerUnit),       // Should be 180 mg/units
          quantityNum,                                // Should be 90ml
          dosesPerDay                                 // Should be 1
        });

        // Calculate concentration ratio (e.g., mg/ml)
        const concentrationRatio = parseFloat(concentrationValue1) / parseFloat(concentrationValue2);
        console.log('Concentration Ratio:', concentrationRatio);
        if (includeTitration && maxDose) {
          let totalQuantity = 0;
          let remainingDays = actualDays;

          // Process each titration stage
          for (let i = 0; i < titrationStages.length && remainingDays > 0; i++) {
            const currentStage = titrationStages[i];
            const stageDose = parseFloat(currentStage.quantity) * usesPerFrequencyNum;
            const stageDuration = parseFloat(currentStage.duration);

            if (isNaN(stageDose) || isNaN(stageDuration)) continue;

            // Calculate days for this stage
            const daysInStage = Math.min(stageDuration, remainingDays);
            
            // Calculate daily usage based on frequency settings
            const stageDailyDose = stageDose * dosesPerDay;
            const quantityForStage = stageDailyDose * daysInStage;
            
            totalQuantity += quantityForStage;
            remainingDays -= daysInStage;
            console.log('Total Quantity:', totalQuantity);
            console.log('Remaining Days:', remainingDays);  
          }

          // If there are remaining days, calculate at max dose
          if (remainingDays > 0) {
            const maxDoseNum = parseFloat(maxDose) * usesPerFrequencyNum;
            const maxDailyDose = maxDoseNum * dosesPerDay;
            const finalQuantity = maxDailyDose * remainingDays;
            totalQuantity += finalQuantity;
            console.log('Final Quantity:', finalQuantity);
          }

          let resultString = `${totalQuantity.toFixed(2)} ${measurementUnit} needed`;
          if (usePackageSize && packageSize) {
            const usesPerFrequencyNum = parseFloat(packageSize);
            if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
              const roundedQuantity = Math.ceil(totalQuantity / usesPerFrequencyNum) * usesPerFrequencyNum;
              const packagesUsed = roundedQuantity / usesPerFrequencyNum;
              resultString = `${roundedQuantity} ${measurementUnit} (adjusted to package size) | ${totalQuantity.toFixed(2)} ${measurementUnit} (unadjusted)\nPackages used: ${packagesUsed}`;
            }
          }
          setResult(resultString);
          return;
        } else {
          // Regular concentration calculation
          const mlPerDose = parseFloat(dosagePerUnit) / concentrationRatio;
          const dailyMl = mlPerDose * dosesPerDay;
          const totalQuantity = dailyMl * actualDays;
          const numberOfPackages = parseFloat(numOfPackages);
          console.log('Total Quantity:', totalQuantity);
          console.log('Actual Days:', actualDays);
          console.log('Doses Per Day:', dosesPerDay);
          console.log('ML Per Dose:', mlPerDose);
          console.log('Daily ML:', dailyMl);

          let resultString = `${totalQuantity.toFixed(2)} ${measurementUnit} needed`;
          if (usePackageSize && packageSize) {
            const usesPerFrequencyNum = parseFloat(packageSize);
            if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
              let roundedQuantity = Math.floor(totalQuantity / usesPerFrequencyNum) * usesPerFrequencyNum;
              let packagesUsed = roundedQuantity / usesPerFrequencyNum;
              if (numberOfPackages > 1) {
                console.log('Rounded Quantity:', roundedQuantity);

                const totalPackageSize = numberOfPackages * usesPerFrequencyNum;
                console.log('Total Package Size:', totalPackageSize);

                roundedQuantity = Math.floor(totalQuantity / totalPackageSize) * totalPackageSize;
                console.log('Rounded Quantity (rounded by numOfPackages):', roundedQuantity);

                console.log('Packages Used:', packagesUsed);

                packagesUsed = Math.floor(packagesUsed / numberOfPackages) * numberOfPackages;
                console.log('Packages Used (rounded):', packagesUsed);
                const roundedPackagesUsed = packagesUsed / numberOfPackages;

                resultString = `${roundedQuantity} ${measurementUnit} (adjusted to package size) | ${totalQuantity.toFixed(2)} ${measurementUnit} (unadjusted)\nPackages used: ${packagesUsed} (${roundedPackagesUsed} x ${numberOfPackages}x${packageSize}${measurementUnit})`;
              } else {
                console.log('Rounded Quantity:', roundedQuantity);
                console.log('Packages Used:', packagesUsed);
                resultString = `${roundedQuantity} ${measurementUnit} (adjusted to package size) | ${totalQuantity.toFixed(2)} ${measurementUnit} (unadjusted)\nPackages used: ${packagesUsed}`;
              }
            }
          }
          setResult(resultString);
          return;
        }
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
      } else if (weightUnit === 'Eye Drops') {
        // Parse eye drops-specific values
        const dropsPerMlNum = parseFloat(dropsPerMl);
        const usesPerFrequencyNum = parseFloat(packageSize || '2.5');
        const beyondUsePeriod = parseFloat(beyondUseDateValue || '0');

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
          usesPerFrequency: usesPerFrequencyNum
        });

        if (useBeyondUseDate && beyondUseDateValue && beyondUsePeriod > 0 && usePackageSize && packageSize) {
          const packageSizeNum = parseFloat(packageSize);
          if (!isNaN(packageSizeNum) && packageSizeNum > 0) {
            if(actualDays < beyondUsePeriod) {
                const resultString = `${packageSizeNum} mL needed (adjusted to package size/BUD)\nPackages used: 1`;
                setResult(resultString);
              return;
            }
            // Round days down to BUD
            const daySupplyAdjusted = Math.floor(actualDays / beyondUsePeriod) * beyondUsePeriod;
            console.log('Day Supply Adjusted:', daySupplyAdjusted);

            // Calculate total drops needed
            const packagesNeeded = daySupplyAdjusted / beyondUsePeriod;
            console.log('Packages Needed:', packagesNeeded);

            // Convert drops to mL
            const mlNeeded = packagesNeeded * packageSizeNum;
            console.log('ML Needed:', mlNeeded);

            // Only round up if rounding down resulted in zero
            if (mlNeeded === 0 && packagesNeeded > 0) {
              let mlNeeded = packageSizeNum;
              console.log('ML Needed:', mlNeeded);
            }
            const packagesUsed = mlNeeded / packageSizeNum;
            const resultString = `${mlNeeded} mL needed (adjusted to package size/BUD)\nPackages used: ${packagesUsed}`;
            setResult(resultString);
            return;
          }
        } else {
          // Calculate total drops needed
          const totalDropsNeeded = actualDays * dosesPerDay;
        
          // Convert drops to mL
          const mlNeeded = totalDropsNeeded / dropsPerMlNum;
        
          let finalQuantity = mlNeeded;
          let resultString = `${mlNeeded.toFixed(2)} mL needed`;
          setResult(resultString);
          return;
        }
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
            return 0.5 * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'hour') {
            return (24 / parseFloat(frequencyNumber)) * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'day') {
            return parseFloat(frequencyNumber) * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'week') {
            return (parseFloat(frequencyNumber) / 7) * parseFloat(usesPerFrequency);
          }
          return getFrequencyPerDay(parseFloat(frequencyNumber), frequencyPattern, frequencyUnit) * parseFloat(usesPerFrequency);
        })();

        // Convert target days to actual days based on time unit
        const actualDays = parseFloat(daySupply) * timeConversions[outputUnit];

        // Calculate total puffs needed
        const totalPuffsNeeded = actualDays * dosesPerDay;
        
        // Calculate puffs per gram ratio
        const puffsPerGram = puffsNum / gramsNum;
        
        // Calculate grams needed
        const gramsNeeded = totalPuffsNeeded / puffsPerGram;
        
        let finalGrams = gramsNeeded;
        let resultString = `${gramsNeeded.toFixed(2)} grams needed`;
        // Round down to nearest package size, unless it would be zero
        if (usePackageSize && packageSize) {
          const usesPerFrequencyNum = parseFloat(packageSize);
          if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
            finalGrams = Math.floor(gramsNeeded / usesPerFrequencyNum) * usesPerFrequencyNum;
            // If rounding down would result in zero, round up instead
            if (finalGrams === 0 && gramsNeeded > 0) {
              finalGrams = usesPerFrequencyNum;
            }
            const packagesUsed = finalGrams / usesPerFrequencyNum;
            resultString = `${finalGrams} grams (adjusted to package size) | ${gramsNeeded.toFixed(2)} grams (unadjusted)\nPackages used: ${packagesUsed}`;
          }
        }
        setResult(resultString);
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
            return 0.5 * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'hour') {
            return (24 / parseFloat(frequencyNumber)) * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'day') {
            return parseFloat(frequencyNumber) * parseFloat(usesPerFrequency);
          }
          if (frequencyUnit === 'week') {
            return (parseFloat(frequencyNumber) / 7) * parseFloat(usesPerFrequency);
          }
          return getFrequencyPerDay(parseFloat(frequencyNumber), frequencyPattern, frequencyUnit) * parseFloat(usesPerFrequency);
        })();

        // Convert target days to actual days based on time unit
        const actualDays = parseFloat(daySupply) * timeConversions[outputUnit];

        // Calculate total puffs needed
        const totalSpraysNeeded = actualDays * dosesPerDay;
        
        // Calculate sprays per ml ratio
        const spraysPerMl = spraysNum / mlsNum;
        
        // Calculate ml needed
        const mlNeeded = totalSpraysNeeded / spraysPerMl;
        
        let finalMls = mlNeeded;
        let resultString = `${mlNeeded.toFixed(2)} ml needed`;
        // Round down to nearest package size, unless it would be zero
        if (usePackageSize && packageSize) {
          const usesPerFrequencyNum = parseFloat(packageSize);
          if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
            finalMls = Math.floor(mlNeeded / usesPerFrequencyNum) * usesPerFrequencyNum;
            // If rounding down would result in zero, round up instead
            if (finalMls === 0 && mlNeeded > 0) {
              finalMls = usesPerFrequencyNum;
            }
            const packagesUsed = finalMls / usesPerFrequencyNum;
            resultString = `${finalMls} ml (adjusted to package size) | ${mlNeeded.toFixed(2)} ml (unadjusted)\nPackages used: ${packagesUsed}`;
          }
        }
        setResult(resultString);
        return;
        
      } else if (weightUnit === 'Topical') {
        // Calculate doses per day
        const dosesPerDay = (() => {
          console.log('Frequency Values:', {
            frequencyNum,
            usesPerFrequencyNum,
            frequencyPattern,
            frequencyUnit,
            expectedDosesPerDay: 2
          });

          if (frequencyPattern === 'everyOther') {
            return 0.5 * usesPerFrequencyNum;
          }
          if (frequencyUnit === 'hour') {
            return (24 / frequencyNum) * usesPerFrequencyNum;
          }
          if (frequencyUnit === 'day') {
            return frequencyNum * usesPerFrequencyNum;
          }
          if (frequencyUnit === 'week') {
            return (frequencyNum / 7) * usesPerFrequencyNum;
          }
          return getFrequencyPerDay(frequencyNum, frequencyPattern, frequencyUnit) * usesPerFrequencyNum;
        })();

        

        // Calculate total grams per application
        const totalGramsPerApplication = TOPICAL_AREAS
          .filter(area => selectedAreas.has(area.name))
          .reduce((sum, area) => sum + area.grams, 0);

        // Calculate total grams needed
        const totalGramsNeeded = totalGramsPerApplication * dosesPerDay * daysNum;

        console.log('Detailed Topical Values:', {
          frequencyNum,
          frequencyPattern,
          frequencyUnit,
          dosesPerDay,
          totalGramsNeeded,
          totalGramsPerApplication,
          selectedAreas: Array.from(selectedAreas),
          packageSize,
          usesPerFrequencyNum,
          daysNum
        });
        
        let finalQuantity = totalGramsNeeded;
        let resultString = `${totalGramsNeeded.toFixed(2)} grams needed`;
        // Round down to nearest package size, unless it would be zero
        if (usePackageSize && packageSize) {
          const usesPerFrequencyNum = parseFloat(packageSize);
          if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
            finalQuantity = Math.floor(totalGramsNeeded / usesPerFrequencyNum) * usesPerFrequencyNum;
            // If rounding down would result in zero, round up instead
            if (finalQuantity === 0 && totalGramsNeeded > 0) {
              finalQuantity = usesPerFrequencyNum;
            }
            const packagesUsed = finalQuantity / usesPerFrequencyNum;
            resultString = `${finalQuantity} grams (adjusted to package size) | ${totalGramsNeeded.toFixed(2)} grams (unadjusted)\nPackages used: ${packagesUsed}`;
          }
        }
        setResult(resultString);

      } else {
        // Regular quantity calculation without titration or concentration
        const dailyUsage = dosesPerDay * usesPerFrequencyNum;
        const totalQuantity = dailyUsage * actualDays;
        
        let resultString = `${totalQuantity.toFixed(2)} units needed`;
        if (usePackageSize && packageSize) {
          const usesPerFrequencyNum = parseFloat(packageSize);
          if (!isNaN(usesPerFrequencyNum) && usesPerFrequencyNum > 0) {
            const roundedQuantity = Math.ceil(totalQuantity / usesPerFrequencyNum) * usesPerFrequencyNum;
            const packagesUsed = roundedQuantity / usesPerFrequencyNum;
            resultString = `${roundedQuantity} units (adjusted to package size) | ${totalQuantity.toFixed(2)} units (unadjusted)\nPackages used: ${packagesUsed}`;
          }
        }
        setResult(resultString);
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

  const formatFrequencyText = (uses: string, freq: string, pattern: string, unit: string) => {
    const freqNum = parseFloat(freq);
    const usesNum = parseFloat(uses);
    if (isNaN(freqNum)) return '';
    

    const unitPlural = freqNum > 1 ? unit + 's' : unit;
    
    if (usesNum > 1) {
      // if uses is greater than 1, then it is a plural
      uses = uses + ' times';
    } else {
      uses = uses + ' time';
    }
    if (pattern === 'everyOther') {
      return `${uses} every other ${unit}`;
    } else {
      return `${uses} every ${freqNum} ${unitPlural}`;
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
                styles.calculatorTypeButton, 
                calculationType === 'daySupply' && styles.calculatorTypeButtonActive
              ]}
              onPress={() => setCalculationType('daySupply')}>
              <ThemedText style={[
                styles.calculatorTypeText,
                calculationType === 'daySupply' && styles.calculatorTypeTextActive
              ]}>Calculate Days</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.calculatorTypeButton, 
                calculationType === 'quantity' && styles.calculatorTypeButtonActive
              ]}
              onPress={() => setCalculationType('quantity')}>
              <ThemedText style={[
                styles.calculatorTypeText,
                calculationType === 'quantity' && styles.calculatorTypeTextActive
              ]}>Calculate Quantity</ThemedText>
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
                value={numOfPackages}
                onChangeText={setNumOfPackages}
                keyboardType="numeric"
                placeholder="Number of packages"
                placeholderTextColor="#666"
              />
              <ThemedText>of Package Size</ThemedText>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={packageSize}
                onChangeText={setPackageSize}
                keyboardType="numeric"
                placeholder="Package size"
                placeholderTextColor="#666"
              />
              <ThemedText style={styles.unitLabel}>{measurementUnit}</ThemedText>
            </View>
          )}

          {useBeyondUseDate && (
            <View style={styles.inputRow}>
              <ThemedText>Beyond Use Date</ThemedText>
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
                <ThemedText>Quantity</ThemedText>
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
                  <Picker.Item label="tablet" value="tablet" />
                  <Picker.Item label="capsule" value="capsule" />
                  <Picker.Item label="liquid" value="liquid" />
                  <Picker.Item label="mg" value="mg" />
                  <Picker.Item label="ml" value="ml" />
                  <Picker.Item label="g" value="g" />
                  <Picker.Item label="gm" value="gm" />
                  <Picker.Item label="mcg" value="mcg" />
                </Picker>
              </View>

              {measurementUnit !== 'units' && !['Oral Inhaler', 'Nasal Inhaler', 'Eye Drops', 'Topical'].includes(weightUnit) && (
                <View style={styles.inputRow}>
                  <ThemedText>Dosage</ThemedText>
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
                    <Picker.Item label="units" value="units" />
                    <Picker.Item label="tablet" value="tablet" />
                    <Picker.Item label="capsule" value="capsule" />
                    <Picker.Item label="liquid" value="liquid" />
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
                  <ThemedText>Concentration</ThemedText>
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
                    <Picker.Item label="units" value="units" />
                    <Picker.Item label="tablet" value="tablet" />
                    <Picker.Item label="capsule" value="capsule" />
                    <Picker.Item label="liquid" value="liquid" />
                    <Picker.Item label="mg" value="mg" />
                    <Picker.Item label="ml" value="ml" />
                    <Picker.Item label="g" value="g" />
                    <Picker.Item label="mcg" value="mcg" />
                  </Picker>
                  <ThemedText>per</ThemedText>
                  <ThemedText>Volume</ThemedText>
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
                          placeholder="Quantity per frequency"
                          placeholderTextColor="#666"
                        />
                        <ThemedText style={styles.unitLabel}>{measurementUnit} per dose</ThemedText>
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
                        <ThemedText style={styles.unitLabel}>days in duration</ThemedText>
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
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex]}
                      value={maxDose}
                      onChangeText={setMaxDose}
                      keyboardType="numeric"
                      placeholder="Maximum dose"
                      placeholderTextColor="#666"
                    />
                    <ThemedText style={styles.unitLabel}>max {measurementUnit} per dose</ThemedText>
                  </View>
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
              <ThemedText>Day Supply</ThemedText>
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
                  value={usesPerFrequency}
                  onChangeText={setUsesPerFrequency}
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
                <Picker.Item label="every" value="every" />
                <Picker.Item label="every other" value="everyOther" />
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
              {formatFrequencyText(usesPerFrequency, frequencyNumber, frequencyPattern, frequencyUnit)}
            </ThemedText>
          </View>

          {calculationType === 'daySupply' && (
            <View style={[styles.inputRow, styles.showResultRow]}>
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
    alignItems: 'center',
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
    minWidth: 80,
    flexShrink: 1,
    flexGrow: 0,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 10,
  },
  inputFlex: {
    minWidth: 120,
    flexGrow: 0,
    flexShrink: 1,
  },
  picker: {
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 6,
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
    width: '100%',
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
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'center',
    minWidth: 120,
    alignItems: 'center',
    marginVertical: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyContainer: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  frequencyInput: {
    width: 60,
    minWidth: 60,
    textAlign: 'center',
    marginHorizontal: 5,
    flexGrow: 0,
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
    padding: 6,
    marginBottom: 12,
    alignItems: 'center',
    width: 'auto',
  },
  titrationStage: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
    marginBottom: 10,
    alignItems: 'center',
    width: 'auto',
    alignSelf: 'center',
  },
  stageTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 14,
  },
  addStageButton: {
    backgroundColor: '#91e655',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  removeStageButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  removeStageText: {
    color: 'white',
  },
  resultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  topicalContainer: {
    width: '90%',
    padding: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topicalButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    padding: 4,
  },
  topicalButton: {
    width: 'auto',
    minWidth: '30%',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 6,
    marginHorizontal: 3,
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
    fontSize: 12,
    color: '#2c3e50',
    lineHeight: 16,
    fontWeight: '500',
  },
  topicalButtonTextSelected: {
    color: '#1a472a',
    fontWeight: 'bold',
  },
  topicalTotal: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
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
    width: 'auto',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  inhalerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inhalerText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  usesPerFrequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  showResultRow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  calculatorTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#91e655',
    backgroundColor: '#fff',
    alignSelf: 'center',
    minWidth: 150,
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  calculatorTypeButtonActive: {
    backgroundColor: '#91e655',
    borderColor: '#7bc548',
    shadowColor: '#91e655',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  calculatorTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#91e655',
  },
  calculatorTypeTextActive: {
    color: '#fff',
  },
});
