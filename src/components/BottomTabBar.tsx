import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../store/appStore';
import { C, R, F } from '../theme';

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
  { id: 'Home',        icon: 'home-outline',       iconActive: 'home',       label: 'Início'     },
  { id: 'BudgetsList', icon: 'clipboard-outline',   iconActive: 'clipboard',  label: 'Orçamentos' },
  { id: 'Portfolio',   icon: 'images-outline',      iconActive: 'images',     label: 'Portfólio'  },
  { id: 'Chat',        icon: 'chatbubble-outline',  iconActive: 'chatbubble', label: 'Chat'       },
  { id: 'Profile',     icon: 'person-outline',      iconActive: 'person',     label: 'Perfil'     },
];

const ADMIN_TABS: Tab[] = [
  { id: 'AdminDashboard', icon: 'grid-outline',      iconActive: 'grid',       label: 'Dashboard'  },
  { id: 'BudgetsList',    icon: 'clipboard-outline', iconActive: 'clipboard',  label: 'Pedidos'    },
  { id: 'Portfolio',      icon: 'images-outline',    iconActive: 'images',     label: 'Portfólio'  },
  { id: 'Chat',           icon: 'chatbubble-outline',iconActive: 'chatbubble', label: 'Chat'       },
  { id: 'Profile',        icon: 'person-outline',    iconActive: 'person',     label: 'Perfil'     },
];

export function BottomTabBar({ activeTab, onTabChange, role }: Props) {
  const tabs = role === 'admin' ? ADMIN_TABS : CLIENT_TABS;

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: C.bgSurface,
      borderTopWidth: 1, borderTopColor: C.border,
      paddingBottom: Platform.OS === 'ios' ? 24 : 8,
      paddingTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.3, shadowRadius: 16, elevation: 16,
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }}
          >
            {/* Active indicator pill */}
            {isActive && (
              <View style={{
                position: 'absolute', top: 0,
                width: 36, height: 3,
                backgroundColor: C.amber, borderRadius: 2,
              }} />
            )}

            <View style={{
              width: 42, height: 34, borderRadius: R.sm,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: isActive ? C.amber + '18' : 'transparent',
              marginBottom: 2,
            }}>
              <Ionicons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={22}
                color={isActive ? C.amber : C.textDisabled}
              />
            </View>

            <Text style={{
              fontSize: 10,
              fontWeight: isActive ? '700' : '500',
              color: isActive ? C.amber : C.textDisabled,
              letterSpacing: 0.2,
              fontFamily: F.base,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
