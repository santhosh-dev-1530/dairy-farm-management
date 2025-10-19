import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Main Screens
import CattleListScreen from '../screens/cattle/CattleListScreen';
import CattleDetailScreen from '../screens/cattle/CattleDetailScreen';
import AddCattleScreen from '../screens/cattle/AddCattleScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Modal Screens
import AddSeminationScreen from '../screens/semination/AddSeminationScreen';
import PregnancyCheckScreen from '../screens/semination/PregnancyCheckScreen';
import AddFeedingScreen from '../screens/feeding/AddFeedingScreen';
import AddHealthRecordScreen from '../screens/health/AddHealthRecordScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const CattleStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CattleList" 
      component={CattleListScreen}
      options={{ title: 'Cattle' }}
    />
    <Stack.Screen 
      name="CattleDetail" 
      component={CattleDetailScreen}
      options={{ title: 'Cattle Details' }}
    />
    <Stack.Screen 
      name="AddCattle" 
      component={AddCattleScreen}
      options={{ title: 'Add Cattle' }}
    />
    <Stack.Screen 
      name="AddSemination" 
      component={AddSeminationScreen}
      options={{ title: 'Record Semination' }}
    />
    <Stack.Screen 
      name="PregnancyCheck" 
      component={PregnancyCheckScreen}
      options={{ title: 'Pregnancy Check' }}
    />
    <Stack.Screen 
      name="AddFeeding" 
      component={AddFeedingScreen}
      options={{ title: 'Record Feeding' }}
    />
    <Stack.Screen 
      name="AddHealthRecord" 
      component={AddHealthRecordScreen}
      options={{ title: 'Health Record' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Cattle') {
            iconName = 'pets';
          } else if (route.name === 'AddCattle') {
            iconName = 'add-circle';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Cattle" 
        component={CattleStack}
        options={{ title: 'Cattle' }}
      />
      {user?.role === 'ADMIN' && (
        <Tab.Screen 
          name="AddCattle" 
          component={AddCattleScreen}
          options={{ title: 'Add Cattle' }}
        />
      )}
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

export default AppNavigator;
