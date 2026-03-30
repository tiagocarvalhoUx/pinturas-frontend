import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../store/appStore';

interface Tab {
  id: string;
  icon: string;
  iconActive: string;
  label: string;
}

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role?: UserRole;
}

const CLIENT_TABS: Tab[] = [
  { id: 'Home', icon: 'home-outline', iconActive: 'home', label: 'Início' },
  { id: 'BudgetsList', icon: 'clipboard-outline', iconActive: 'clipboard', label: 'Orçamentos' },
  { id: 'Portfolio', icon: 'images-outline', iconActive: 'images', label: 'Portfólio' },
  { id: 'Chat', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Chat' },
  { id: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Perfil' },
];

const ADMIN_TABS: Tab[] = [
  { id: 'AdminDashboard', icon: 'grid-outline', iconActive: 'grid', label: 'Dashboard' },
  { id: 'BudgetsList', icon: 'clipboard-outline', iconActive: 'clipboard', label: 'Pedidos' },
  { id: 'Portfolio', icon: 'images-outline', iconActive: 'images', label: 'Portfólio' },
  { id: 'Chat', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Chat' },
  { id: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Perfil' },
];

export function BottomTabBar({ activeTab, onTabChange, role }: Props) {
  const tabs = role === 'admin' ? ADMIN_TABS : CLIENT_TABS;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}
          >
            <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={24}
                color={isActive ? '#2563EB' : '#94a3b8'}
              />
              {isActive && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    width: 4,
                    height: 4,
                    backgroundColor: '#2563EB',
                    borderRadius: 2,
                  }}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isActive ? '700' : '400',
                color: isActive ? '#2563EB' : '#94a3b8',
                marginTop: 6,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
