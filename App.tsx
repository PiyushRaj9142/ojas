import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors } from './src/theme/colors';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { UserProfile, LanguageCode } from './src/types/user';
import { useSensors } from './src/hooks/useSensors';
import { useInventory } from './src/hooks/useInventory';
import { useAlerts } from './src/hooks/useAlerts';
import { useDemoMode } from './src/hooks/useDemoMode';
import { NotificationService } from './src/services/notificationService';
import { findUserByPhone } from './src/data/mockUsers';

import Header from './src/components/Header';
import BottomNav, { MainTabType } from './src/components/BottomNav';
import FloatingAssistantButton from './src/components/FloatingAssistantButton';
import DemoController from './src/components/DemoController';
import OfflineBanner from './src/components/OfflineBanner';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ColdStorageScreen from './src/screens/ColdStorageScreen';
import DigitalTwinScreen from './src/screens/DigitalTwinScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import EnergyScreen from './src/screens/EnergyScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export function MainApp() {
  const { theme } = useTheme();

  // App Phase State
  const [isSplash, setIsSplash] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Active Screen Routing
  const [activeTab, setActiveTab] = useState<MainTabType>('HOME');
  const [modalScreen, setModalScreen] = useState<string | null>(null);

  // User Profile State
  const [user, setUser] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Ramesh Patel (रमेश पटेल)',
    mobile: '9876543210',
    farmName: 'Patel Agro Farms (ग्रीन वैली फार्म्स)',
    coldStorageId: 'SC-001',
    location: 'Nashik, Maharashtra',
    totalCapacityKg: 500,
    language: 'en',
    tempUnit: '°C',
    weightUnit: 'kg',
    notificationsEnabled: true,
    darkMode: false,
    themeMode: 'LIGHT',
    demoMode: false,
    isLoggedIn: true,
  });

  // Offline Simulation State
  const [isOnline, setIsOnline] = useState(true);

  // Custom Hooks & Simulation Engines
  const { isDemoActive, currentStepIndex, currentStep, totalSteps, startDemo, stopDemo, nextStep, prevStep } = useDemoMode();
  
  const demoTelemetryOverride = currentStep?.telemetryOverride ? {
    temperature: currentStep.telemetryOverride.temperature,
    windSpeed: currentStep.telemetryOverride.windSpeed,
    windGenerationKw: currentStep.telemetryOverride.windGenerationKw,
    batteryLevel: currentStep.telemetryOverride.batteryLevel,
    powerConsumptionKw: currentStep.telemetryOverride.powerConsumptionKw,
    coolingCompressorState: currentStep.telemetryOverride.coolingState as any,
  } : undefined;

  const { telemetry, setTelemetry } = useSensors(isDemoActive, demoTelemetryOverride);
  const { crops, addCrop, removeCrop, totalWeightKg, totalValueInr } = useInventory();
  const { alerts, unreadCount, markAllAsRead, clearAllAlerts } = useAlerts();

  // Evaluate real-time IoT alerts from sensor data
  useEffect(() => {
    NotificationService.evaluateTelemetry(telemetry);
  }, [telemetry]);

  // Handlers
  const handleSelectLanguage = (lang: LanguageCode) => {
    setUser(prev => ({ ...prev, language: lang }));
  };

  const handleCycleLanguage = () => {
    setUser(prev => ({
      ...prev,
      language: prev.language === 'en' ? 'hi' : prev.language === 'hi' ? 'hinglish' : 'en',
    }));
  };

  const handleToggleTempUnit = () => {
    setUser(prev => ({ ...prev, tempUnit: prev.tempUnit === '°C' ? '°F' : '°C' }));
  };

  const handleToggleNotifications = () => {
    setUser(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  };

  const handleNavigation = (screenName: string) => {
    if (['HOME', 'STORAGE', 'ANALYTICS', 'ALERTS', 'PROFILE'].includes(screenName)) {
      setActiveTab(screenName as MainTabType);
      setModalScreen(null);
    } else {
      setModalScreen(screenName);
    }
  };

  // Render appropriate phase
  const renderContent = () => {
    // Phase 1: Splash Screen
    if (isSplash) {
      return <SplashScreen onFinish={() => setIsSplash(false)} />;
    }

    // Phase 2: Onboarding
    if (isOnboarding) {
      return <OnboardingScreen onFinish={() => setIsOnboarding(false)} />;
    }

    // Phase 3: Login Authentication
    if (!isLoggedIn) {
      return (
        <LoginScreen
          onLoginSuccess={(mob) => {
            const registered = findUserByPhone(mob);
            if (registered) {
              setUser({ ...registered, isLoggedIn: true });
            } else {
              setUser(prev => ({ ...prev, mobile: mob, isLoggedIn: true }));
            }
            setIsLoggedIn(true);
          }}
        />
      );
    }

    // Phase 4: Main Application
    const currentView = modalScreen || activeTab;

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card }]} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style={theme.statusBarStyle} />

        {/* Top Header */}
        <Header
          storageId={user.coldStorageId}
          isOnline={isOnline}
          onToggleOnline={() => setIsOnline(!isOnline)}
          language={user.language}
          onCycleLanguage={handleCycleLanguage}
          unreadAlertsCount={unreadCount}
          onPressAlerts={() => handleNavigation('ALERTS')}
          onPressSettings={() => handleNavigation('PROFILE')}
        />

        {/* Offline Banner */}
        <OfflineBanner
          isOffline={!isOnline}
          onSync={() => setIsOnline(true)}
        />

        {/* Judge Demo Mode Controller Bar */}
        {isDemoActive && currentStep && (
          <DemoController
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onNext={nextStep}
            onPrev={prevStep}
            onStop={stopDemo}
          />
        )}

        {/* Screen Container */}
        <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
          {currentView === 'HOME' && (
            <HomeScreen
              telemetry={telemetry}
              recentAlert={alerts[0]}
              onNavigate={handleNavigation}
              onStartDemo={startDemo}
              language={user.language}
            />
          )}

          {currentView === 'STORAGE' && (
            <ColdStorageScreen
              telemetry={telemetry}
              language={user.language}
            />
          )}

          {currentView === 'DIGITAL_TWIN' && (
            <DigitalTwinScreen
              telemetry={telemetry}
            />
          )}

          {currentView === 'INVENTORY' && (
            <InventoryScreen
              crops={crops}
              onAddCrop={addCrop}
              onRemoveCrop={removeCrop}
              totalWeightKg={totalWeightKg}
              totalValueInr={totalValueInr}
            />
          )}

          {currentView === 'ENERGY' && (
            <EnergyScreen
              telemetry={telemetry}
            />
          )}

          {currentView === 'ANALYTICS' && (
            <AnalyticsScreen />
          )}

          {currentView === 'ALERTS' && (
            <AlertsScreen
              alerts={alerts}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAllAlerts}
            />
          )}

          {currentView === 'ASSISTANT' && (
            <AIAssistantScreen
              language={user.language}
              onNavigate={handleNavigation}
            />
          )}

          {currentView === 'RECOMMENDATIONS' && (
            <RecommendationsScreen />
          )}

          {currentView === 'PROFILE' && (
            <ProfileScreen
              user={user}
              onUpdateLanguage={handleSelectLanguage}
              onToggleTempUnit={handleToggleTempUnit}
              onToggleNotifications={handleToggleNotifications}
              isDemoActive={isDemoActive}
              onToggleDemoMode={() => {
                if (isDemoActive) stopDemo();
                else startDemo();
              }}
              onLogout={() => setIsLoggedIn(false)}
            />
          )}
        </View>

        {/* Floating AI Assistant Button (when not on Assistant screen) */}
        {currentView !== 'ASSISTANT' && (
          <FloatingAssistantButton
            onPress={() => handleNavigation('ASSISTANT')}
            language={user.language}
          />
        )}

        {/* Bottom Tab Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setModalScreen(null);
          }}
          alertsCount={unreadCount}
        />
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaProvider>
      {renderContent()}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
