import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { BudgetsListScreen } from '../screens/BudgetsListScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminDashboard } from '../screens/AdminDashboard';
import { BottomTabBar } from '../components/BottomTabBar';
import { BudgetDetailScreen } from '../screens/BudgetDetailScreen';
import { PortfolioDetailScreen } from '../screens/PortfolioDetailScreen';
import { PortfolioItem } from '../store/appStore';

type Screen =
  | 'Splash' | 'Onboarding' | 'Login' | 'Register'
  | 'Main' | 'Budget' | 'Chat' | 'BudgetDetail' | 'PortfolioDetail';

type TabScreen = 'Home' | 'BudgetsList' | 'Portfolio' | 'Chat' | 'Profile' | 'AdminDashboard';

// Wraps any screen with a fade + slide-up entrance animation.
// Re-runs when `screenKey` changes (screen or active tab switched).
function ScreenTransition({ children, screenKey }: { children: React.ReactNode; screenKey: string }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(14);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 100, friction: 14, useNativeDriver: true }),
    ]).start();
  }, [screenKey]);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function SuccessToast({ visible }: { visible: boolean }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={{
      position: 'absolute', top: 52, left: 16, right: 16, zIndex: 999,
      transform: [{ translateY }], opacity,
    }}>
      <View style={{
        backgroundColor: '#059669', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
      }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Orçamento enviado!</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>
            Nossa equipe entrará em contato em breve.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export function AppNavigator() {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);

  const [screen, setScreen] = useState<Screen>('Splash');
  const [activeTab, setActiveTab] = useState<TabScreen>('Home');
  const [selectedServiceType, setSelectedServiceType] = useState<string | undefined>();
  const [selectedBudgetId, setSelectedBudgetId]         = useState<string | undefined>();
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | undefined>();
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Unique key for ScreenTransition — changes on every navigation action
  const [transitionKey, setTransitionKey] = useState(0);
  const bumpKey = useCallback(() => setTransitionKey((k) => k + 1), []);

  const go = (s: Screen) => { setScreen(s); bumpKey(); };

  const goToService = (serviceId: string) => {
    setSelectedServiceType(serviceId);
    go('Budget');
  };

  const goToBudget = () => {
    setSelectedServiceType(undefined);
    go('Budget');
  };

  const goToBudgetDetail = (id: string) => {
    setSelectedBudgetId(id);
    go('BudgetDetail');
  };

  const goToPortfolioDetail = (item: PortfolioItem) => {
    setSelectedPortfolioItem(item);
    go('PortfolioDetail');
  };

  const handleBudgetSuccess = () => {
    setActiveTab('Home');
    go('Main');
    // Show toast after navigation settles
    setTimeout(() => {
      setShowToast(true);
      toastTimer.current = setTimeout(() => setShowToast(false), 4000);
    }, 100);
  };

  // Splash (no transition — intentional)
  if (screen === 'Splash') {
    return (
      <SplashScreen onFinish={() => {
        if (!hasSeenOnboarding) go('Onboarding');
        else if (!isAuthenticated) go('Login');
        else {
          setActiveTab(user?.role === 'admin' ? 'AdminDashboard' : 'Home');
          go('Main');
        }
      }} />
    );
  }

  if (screen === 'Onboarding') {
    return (
      <ScreenTransition screenKey={`onboarding-${transitionKey}`}>
        <OnboardingScreen onFinish={() => go('Login')} />
      </ScreenTransition>
    );
  }

  if (screen === 'Login') {
    return (
      <ScreenTransition screenKey={`login-${transitionKey}`}>
        <LoginScreen
          onLogin={() => {
            setActiveTab(user?.role === 'admin' ? 'AdminDashboard' : 'Home');
            go('Main');
          }}
          onGoRegister={() => go('Register')}
        />
      </ScreenTransition>
    );
  }

  if (screen === 'Register') {
    return (
      <ScreenTransition screenKey={`register-${transitionKey}`}>
        <RegisterScreen
          onRegister={() => { setActiveTab('Home'); go('Main'); }}
          onGoLogin={() => go('Login')}
        />
      </ScreenTransition>
    );
  }

  if (screen === 'Budget') {
    return (
      <ScreenTransition screenKey={`budget-${transitionKey}`}>
        <BudgetScreen
          initialServiceType={selectedServiceType}
          onSuccess={handleBudgetSuccess}
          onBack={() => go('Main')}
        />
      </ScreenTransition>
    );
  }

  if (screen === 'Chat') {
    return (
      <ScreenTransition screenKey={`chat-${transitionKey}`}>
        <ChatScreen onBack={() => go('Main')} />
      </ScreenTransition>
    );
  }

  if (screen === 'BudgetDetail') {
    return (
      <ScreenTransition screenKey={`budgetdetail-${transitionKey}`}>
        <BudgetDetailScreen
          budgetId={selectedBudgetId!}
          onBack={() => go('Main')}
        />
      </ScreenTransition>
    );
  }

  if (screen === 'PortfolioDetail') {
    return (
      <ScreenTransition screenKey={`portfoliodetail-${transitionKey}`}>
        <PortfolioDetailScreen
          item={selectedPortfolioItem!}
          onBack={() => go('Main')}
        />
      </ScreenTransition>
    );
  }

  // Main Tab Layout
  const renderTab = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen
            onBudget={goToBudget}
            onPortfolio={() => setActiveTab('Portfolio')}
            onServiceDetail={goToService}
            onAllServices={goToBudget}
            onPortfolioDetail={goToPortfolioDetail}
          />
        );
      case 'BudgetsList':
        return (
          <BudgetsListScreen
            onBudgetDetail={goToBudgetDetail}
            onNewBudget={goToBudget}
          />
        );
      case 'Portfolio':
        return <PortfolioScreen onDetail={goToPortfolioDetail} />;
      case 'Chat':
        return <ChatScreen onBack={() => setActiveTab('Home')} />;
      case 'Profile':
        return <ProfileScreen onLogout={() => go('Login')} />;
      case 'AdminDashboard':
        return (
          <AdminDashboard
            onBudgetDetail={goToBudgetDetail}
            onAllBudgets={() => setActiveTab('BudgetsList')}
          />
        );
      default:
        return null;
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'Chat') {
      go('Chat');
    } else {
      setActiveTab(tab as TabScreen);
      bumpKey();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0D0A' }}>
      <ScreenTransition screenKey={`tab-${activeTab}-${transitionKey}`}>
        {renderTab()}
      </ScreenTransition>
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={user?.role}
      />
      <SuccessToast visible={showToast} />
    </View>
  );
}
