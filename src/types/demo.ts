export interface DemoStep {
  stepNumber: number;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  telemetryOverride: {
    temperature: number;
    windSpeed: number;
    windGenerationKw: number;
    batteryLevel: number;
    powerConsumptionKw: number;
    coolingState: 'ACTIVE' | 'IDLE' | 'TURBO';
    newCropAdded?: boolean;
    activeAlert?: string;
  };
}
