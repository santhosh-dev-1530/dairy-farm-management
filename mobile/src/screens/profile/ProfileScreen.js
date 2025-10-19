import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  List,
  Divider,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'USER':
        return 'User';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return theme.colors.primary;
      case 'USER':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={user?.username?.charAt(0).toUpperCase() || 'U'}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          />
          
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={[styles.username, { color: theme.colors.onSurface }]}>
              {user?.username}
            </Text>
            <Text variant="titleMedium" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
              {user?.email}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.role, { color: getRoleColor(user?.role) }]}
            >
              {getRoleLabel(user?.role)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics */}
      {profile && (
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Your Statistics
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.primary }]}>
                  {profile._count?.assignedCattle || 0}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Assigned Cattle
                </Text>
              </View>
              
              {user?.role === 'ADMIN' && (
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.secondary }]}>
                    {profile._count?.createdCattle || 0}
                  </Text>
                  <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Total Cattle
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Account Information */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Account Information
          </Text>
          
          <List.Item
            title="Username"
            description={user?.username}
            left={(props) => <List.Icon {...props} icon="account" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="email" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Role"
            description={getRoleLabel(user?.role)}
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Member Since"
            description={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={[styles.appCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            App Information
          </Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Build"
            description="1.0.0 (1)"
            left={(props) => <List.Icon {...props} icon="code-tags" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={[styles.actionsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Actions
          </Text>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Help', 'Contact your administrator for help')}
            style={styles.actionButton}
            icon="help-circle"
          >
            Help & Support
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('About', 'Dairy Farm Management System v1.0.0')}
            style={styles.actionButton}
            icon="information"
          >
            About
          </Button>
          
          <Divider style={styles.divider} />
          
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            icon="logout"
            buttonColor={theme.colors.error}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  headerContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    marginBottom: 8,
    opacity: 0.8,
  },
  role: {
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  appCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  actionsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  listItem: {
    paddingVertical: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  logoutButton: {
    borderRadius: 8,
  },
});

export default ProfileScreen;
