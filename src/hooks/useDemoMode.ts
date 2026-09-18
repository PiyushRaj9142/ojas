import { useState } from 'react';
import { DemoStep } from '../types/demo';

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: '1. Normal Cold Storage Baseline',
    titleHi: '1. सामान्य कोल्ड स्टोरेज स्थिति',
    description: 'Chamber is stabilized at 4.8°C. Sensors reading optimal conditions.',
    descriptionHi: 'कक्ष 4.8°C पर स्थिर है। सभी सेंसर सामान्य स्थिति दिखा रहे हैं।',
    telemetryOverride: {
      temperature: 4.8,
      windSpeed: 6.5,
      windGenerationKw: 1.8,
      batteryLevel: 72,
      powerConsumptionKw: 1.5,
      coolingState: 'ACTIVE',
    },
  },
  {
    stepNumber: 2,
    title: '2. Wind Generation Surge',
    titleHi: '2. पवन ऊर्जा उत्पादन में तेजी',
    description: 'VAWT Wind Turbine accelerates to 8.4 m/s, generating 2.4 kW clean power.',
    descriptionHi: 'पवन टर्बाइन 8.4 m/s पर पहुंच गया है, 2.4 kW स्वच्छ ऊर्जा का उत्पादन हो रहा है।',
    telemetryOverride: {
      temperature: 4.8,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 74,
      powerConsumptionKw: 1.6,
      coolingState: 'ACTIVE',
    },
  },
  {
    stepNumber: 3,
    title: '3. Hybrid Battery Charging',
    titleHi: '3. हाइब्रिड बैटरी चार्जिंग',
    description: 'Surplus power (+0.8 kW) charges battery rapidly from 72% up to 82%.',
    descriptionHi: 'अधिशेष बिजली (+0.8 kW) से बैटरी 72% से 82% तक चार्ज हो रही है।',
    telemetryOverride: {
      temperature: 4.8,
      windSpeed: 8.8,
      windGenerationKw: 2.6,
      batteryLevel: 82,
      powerConsumptionKw: 1.6,
      coolingState: 'ACTIVE',
    },
  },
  {
    stepNumber: 4,
    title: '4. Cooling Compressor Stable',
    titleHi: '4. शीतलन प्रणाली सक्रिय',
    description: 'Refrigeration unit maintains core temperature at 4.8°C with 0 grid power.',
    descriptionHi: 'शीतलन इकाई बिना किसी ग्रिड बिजली के 4.8°C तापमान बनाए रख रही है।',
    telemetryOverride: {
      temperature: 4.8,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 82,
      powerConsumptionKw: 1.6,
      coolingState: 'ACTIVE',
    },
  },
  {
    stepNumber: 5,
    title: '5. New Harvest Added (Tomato 120kg)',
    titleHi: '5. नई फसल खेप दर्ज (टमाटर 120kg)',
    description: 'Farmer Ramesh Patel stores 120 kg of Grade-A tomatoes in Zone A.',
    descriptionHi: 'किसान रमेश पटेल ने ज़ोन A में 120 kg ए-ग्रेड टमाटर सुरक्षित रखे।',
    telemetryOverride: {
      temperature: 5.1,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 82,
      powerConsumptionKw: 1.8,
      coolingState: 'ACTIVE',
      newCropAdded: true,
    },
  },
  {
    stepNumber: 6,
    title: '6. AI Spectral Vision Analysis',
    titleHi: '6. AI फसल गुणवत्ता विश्लेषण',
    description: 'AI vision scans tomato batch: 92% Freshness Score, 8 days shelf life.',
    descriptionHi: 'AI स्कैनर ने विश्लेषण किया: 92% ताजगी स्कोर, 8 दिन सुरक्षित शेल्फ-लाइफ।',
    telemetryOverride: {
      temperature: 4.8,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 82,
      powerConsumptionKw: 1.6,
      coolingState: 'ACTIVE',
    },
  },
  {
    stepNumber: 7,
    title: '7. AI Smart Selling Recommendation',
    titleHi: '7. AI मंडी बिक्री सिफारिश',
    description: 'AI advises: "Mandi price expected to rise +18% in 5 days. Hold & sell within 5-6 days."',
    descriptionHi: 'AI सलाह: "मंडी में 5 दिनों में 18% तेजी संभावित है। 5-6 दिनों में बेचें।"',
    telemetryOverride: {
      temperature: 4.8,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 82,
      powerConsumptionKw: 1.6,
      coolingState: 'ACTIVE',
    },
  },
  {
    stepNumber: 8,
    title: '8. Simulated Ambient Heat Spike',
    titleHi: '8. अचानक तापमान वृद्धि चेतावनी',
    description: 'Door left open simulation: Chamber temperature rises to 7.2°C.',
    descriptionHi: 'दरवाजा खुला रहने का सिमुलेशन: कक्ष का तापमान बढ़कर 7.2°C हो गया।',
    telemetryOverride: {
      temperature: 7.2,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 80,
      powerConsumptionKw: 2.2,
      coolingState: 'TURBO',
      activeAlert: 'Temperature above optimal range (7.2°C)!',
    },
  },
  {
    stepNumber: 9,
    title: '9. Critical Alert Dispatched',
    titleHi: '9. अलर्ट नोटिफिकेशन जारी',
    description: 'System triggers critical push notification to farmer with turbo cooling pulse.',
    descriptionHi: 'सिस्टम ने किसान को चेतावनी भेजी और टर्बो कूलिंग शुरू की।',
    telemetryOverride: {
      temperature: 6.4,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 79,
      powerConsumptionKw: 2.4,
      coolingState: 'TURBO',
      activeAlert: 'Auto-mitigation active. Pulldown in progress.',
    },
  },
  {
    stepNumber: 10,
    title: '10. Automated Thermal Recovery',
    titleHi: '10. तापमान स्वतः सामान्य रिकवर',
    description: 'Turbo pulldown successfully restores core temperature back to 4.9°C.',
    descriptionHi: 'टर्बो कूलिंग ने तापमान को सुरक्षित 4.9°C पर पुनः सामान्य कर दिया।',
    telemetryOverride: {
      temperature: 4.9,
      windSpeed: 8.4,
      windGenerationKw: 2.4,
      batteryLevel: 81,
      powerConsumptionKw: 1.6,
      coolingState: 'ACTIVE',
    },
  },
];

export function useDemoMode() {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startDemo = () => {
    setIsDemoActive(true);
    setCurrentStepIndex(0);
  };

  const stopDemo = () => {
    setIsDemoActive(false);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      stopDemo();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const currentStep = isDemoActive ? DEMO_STEPS[currentStepIndex] : null;

  return {
    isDemoActive,
    currentStepIndex,
    currentStep,
    totalSteps: DEMO_STEPS.length,
    startDemo,
    stopDemo,
    nextStep,
    prevStep,
  };
}
