import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';
import { prefetchAll, warmupBackend } from '../services/prefetch';
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
import { AdminPortfolioScreen } from '../screens/AdminPortfolioScreen';
import { BottomTabBar } from '../components/BottomTabBar';
import { BudgetDetailScreen } from '../screens/BudgetDetailScreen';
import { PortfolioDetailScreen } from '../screens/PortfolioDetailScreen';
import { PortfolioItem } from '../store/appStore';

type Screen =
  | 'Onboarding' | 'Login' | 'Register'
  | 'Main' | 'Budget' | 'Chat' | 'BudgetDetail' | 'PortfolioDetail' | 'AdminPortfolio';

type TabScreen = 'Home' | 'BudgetsList' | 'Portfolio' | 'Chat' | 'Profile' | 'AdminDashboard';

// ─── Animação de entrada leve ────────────────────────────────────────────────
function ScreenTransition({ children, screenKey }: { children: React.ReactNode; screenKey: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [screenKey]);

  return (
    <Animated.View style={{ flex: 1, opacity }}>
      {children}
    </Animated.View>
  );
}

// ─── Toast de sucesso ────────────────────────────────────────────────────────
const SuccessToast = memo(function SuccessToast({ visible }: { visible: boolean }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

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
});

// ─── Tabs persistentes — montadas uma vez, mostradas/escondidas com display ──
interface PersistentTabsProps {
  activeTab: TabScreen;
  role?: string;
  onBudget: () => void;
  onPortfolio: () => void;
  onServiceDetail: (id: string) => void;
  onAllServices: () => void;
  onPortfolioDetail: (item: PortfolioItem) => void;
  onBudgetDetail: (id: string) => void;
  onAllBudgets: () => void;
  onLogout: () => void;
  onChatBack: () => void;
  onManagePortfolio: () => void;
}

const PersistentTabs = memo(function PersistentTabs({
  activeTab, role,
  onBudget, onPortfolio, onServiceDetail, onAllServices,
  onPortfolioDetail, onBudgetDetail, onAllBudgets, onLogout, onChatBack, onManagePortfolio,
}: PersistentTabsProps) {
  const isAdmin = role === 'admin';

  return (
    <>
      {/* Home */}
      <View style={{ flex: 1, display: activeTab === 'Home' ? 'flex' : 'none' }}>
        <HomeScreen
          onBudget={onBudget}
          onPortfolio={onPortfolio}
          onServiceDetail={onServiceDetail}
          onAllServices={onAllServices}
          onPortfolioDetail={onPortfolioDetail}
        />
      </View>

      {/* Orçamentos */}
      <View style={{ flex: 1, display: activeTab === 'BudgetsList' ? 'flex' : 'none' }}>
        <BudgetsListScreen
          onBudgetDetail={onBudgetDetail}
          onNewBudget={onBudget}
        />
      </View>

      {/* Portfólio */}
      <View style={{ flex: 1, display: activeTab === 'Portfolio' ? 'flex' : 'none' }}>
        <PortfolioScreen onDetail={onPortfolioDetail} />
      </View>

      {/* Chat */}
      <View style={{ flex: 1, display: activeTab === 'Chat' ? 'flex' : 'none' }}>
        <ChatScreen onBack={onChatBack} />
      </View>

      {/* Perfil */}
      <View style={{ flex: 1, display: activeTab === 'Profile' ? 'flex' : 'none' }}>
        <ProfileScreen onLogout={onLogout} />
      </View>

      {/* Admin Dashboard */}
      {isAdmin && (
        <View style={{ flex: 1, display: activeTab === 'AdminDashboard' ? 'flex' : 'none' }}>
          <AdminDashboard
            onBudgetDetail={onBudgetDetail}
            onAllBudgets={onAllBudgets}
            onManagePortfolio={onManagePortfolio}
          />
        </View>
      )}
    </>
  );
});

// ─── Navegador principal ─────────────────────────────────────────────────────
export function AppNavigator() {
  const user             = useAppStore((s) => s.user);
  const isAuthenticated  = useAppStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);

  const initialScreen: Screen = !hasSeenOnboarding ? 'Onboarding' : !isAuthenticated ? 'Login' : 'Main';
  const [screen, setScreen]           = useState<Screen>(initialScreen);
  const [activeTab, setActiveTab]     = useState<TabScreen>(() => user?.role === 'admin' ? 'AdminDashboard' : 'Home');
  const [transitionKey, setTransitionKey] = useState(0);
  const [selectedServiceType, setSelectedServiceType] = useState<string | undefined>();
  const [selectedBudgetId, setSelectedBudgetId]       = useState<string | undefined>();
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | undefined>();
  const [showToast, setShowToast]     = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const bumpKey = useCallback(() => setTransitionKey((k) => k + 1), []);
  const go      = useCallback((s: Screen) => { setScreen(s); bumpKey(); }, [bumpKey]);

  useEffect(() => {
    warmupBackend();
    if (isAuthenticated) prefetchAll(user?.role ?? 'client');
  }, []);

  // Prefetch ao entrar no Main
  const enterMain = useCallback((role: 'client' | 'admin') => {
    const tab = role === 'admin' ? 'AdminDashboard' : 'Home';
    setActiveTab(tab);
    go('Main');
    prefetchAll(role);
  }, [go]);

  const goToBudget          = useCallback(() => { setSelectedServiceType(undefined); go('Budget'); }, [go]);
  const goToService         = useCallback((id: string) => { setSelectedServiceType(id); go('Budget'); }, [go]);
  const goToBudgetDetail    = useCallback((id: string) => { setSelectedBudgetId(id); go('BudgetDetail'); }, [go]);
  const goToPortfolioDetail = useCallback((item: PortfolioItem) => { setSelectedPortfolioItem(item); go('PortfolioDetail'); }, [go]);
  const goToAdminPortfolio  = useCallback(() => go('AdminPortfolio'), [go]);

  const handleBudgetSuccess = useCallback(() => {
    setActiveTab('Home');
    go('Main');
    setTimeout(() => {
      setShowToast(true);
      toastTimer.current = setTimeout(() => setShowToast(false), 4000);
    }, 100);
  }, [go]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabScreen);
  }, []);

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
          onLogin={() => enterMain(user?.role ?? 'client')}
          onGoRegister={() => go('Register')}
        />
      </ScreenTransition>
    );
  }

  if (screen === 'Register') {
    return (
      <ScreenTransition screenKey={`register-${transitionKey}`}>
        <RegisterScreen
          onRegister={() => enterMain(user?.role ?? 'client')}
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

  if (screen === 'AdminPortfolio') {
    return (
      <ScreenTransition screenKey={`adminportfolio-${transitionKey}`}>
        <AdminPortfolioScreen onBack={() => go('Main')} />
      </ScreenTransition>
    );
  }

  // ── Main — tabs sempre montadas ──────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#0F0D0A' }}>
      <PersistentTabs
        activeTab={activeTab}
        role={user?.role}
        onBudget={goToBudget}
        onPortfolio={() => setActiveTab('Portfolio')}
        onServiceDetail={goToService}
        onAllServices={goToBudget}
        onPortfolioDetail={goToPortfolioDetail}
        onBudgetDetail={goToBudgetDetail}
        onAllBudgets={() => setActiveTab('BudgetsList')}
        onLogout={() => go('Login')}
        onChatBack={() => setActiveTab('Home')}
        onManagePortfolio={goToAdminPortfolio}
      />
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={user?.role}
      />
      <SuccessToast visible={showToast} />
    </View>
  );
}
