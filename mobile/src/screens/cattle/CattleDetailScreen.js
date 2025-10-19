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
  Chip,
  FAB,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { cattleAPI } from '../../services/api';
import TimelineItem from '../../components/TimelineItem';

const CattleDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { cattle: initialCattle } = route.params;
  
  const [cattle, setCattle] = useState(initialCattle);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timelineData, setTimelineData] = useState([]);

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'semination', label: 'Semination' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'feeding', label: 'Feeding' },
    { value: 'health', label: 'Health' },
  ];

  useEffect(() => {
    loadCattleDetails();
  }, []);

  const loadCattleDetails = async () => {
    try {
      setLoading(true);
      const response = await cattleAPI.getCattleById(cattle.id);
      setCattle(response.data.cattle);
    } catch (error) {
      console.error('Error loading cattle details:', error);
      Alert.alert('Error', 'Failed to load cattle details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.primary;
      case 'PREGNANT':
        return theme.colors.tertiary;
      case 'SEPARATED':
        return theme.colors.secondary;
      case 'DECEASED':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PREGNANT':
        return 'Pregnant';
      case 'SEPARATED':
        return 'Separated';
      case 'DECEASED':
        return 'Deceased';
      default:
        return status;
    }
  };

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'semination':
        navigation.navigate('AddSemination', { cattle });
        break;
      case 'feeding':
        navigation.navigate('AddFeeding', { cattle });
        break;
      case 'health':
        navigation.navigate('AddHealthRecord', { cattle });
        break;
      case 'pregnancy':
        // Check if there's a pending pregnancy check
        const pendingCheck = cattle.seminationRecords?.find(
          record => record.checkDate <= new Date() && record.isPregnant === null
        );
        if (pendingCheck) {
          navigation.navigate('PregnancyCheck', { 
            cattle, 
            seminationRecord: pendingCheck 
          });
        } else {
          Alert.alert('No Pending Check', 'No pregnancy check is due for this cattle');
        }
        break;
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Tag Number
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                #{cattle.tagNumber}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Breed
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {cattle.breed}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Gender
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {cattle.gender}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Age
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {calculateAge(cattle.dateOfBirth)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Date of Birth
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {formatDate(cattle.dateOfBirth)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Status
              </Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(cattle.status) + '20' }]}
                textStyle={[styles.statusText, { color: getStatusColor(cattle.status) }]}
                compact
              >
                {getStatusLabel(cattle.status)}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {cattle.parent && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Parent Information</Text>
            <View style={styles.parentInfo}>
              <Text variant="bodyMedium" style={[styles.parentName, { color: theme.colors.onSurface }]}>
                {cattle.parent.name}
              </Text>
              <Text variant="bodySmall" style={[styles.parentTag, { color: theme.colors.onSurfaceVariant }]}>
                #{cattle.parent.tagNumber}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {cattle.children && cattle.children.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Offspring ({cattle.children.length})</Text>
            {cattle.children.map((child) => (
              <View key={child.id} style={styles.childItem}>
                <Text variant="bodyMedium" style={[styles.childName, { color: theme.colors.onSurface }]}>
                  {child.name}
                </Text>
                <Text variant="bodySmall" style={[styles.childTag, { color: theme.colors.onSurfaceVariant }]}>
                  #{child.tagNumber} • {child.gender} • {formatDate(child.dateOfBirth)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderTimeline = (records, type) => {
    if (!records || records.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No {type} records found
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timeline}>
        {records.map((record, index) => (
          <TimelineItem
            key={record.id}
            record={record}
            type={type}
            isLast={index === records.length - 1}
          />
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'semination':
        return renderTimeline(cattle.seminationRecords, 'semination');
      case 'pregnancy':
        return renderTimeline(cattle.pregnancyRecords, 'pregnancy');
      case 'feeding':
        return renderTimeline(cattle.feedingRecords, 'feeding');
      case 'health':
        return renderTimeline(cattle.healthRecords, 'health');
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading cattle details...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Card */}
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Avatar.Image
                size={80}
                source={cattle.photo ? { uri: cattle.photo } : undefined}
                style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
              />
              {!cattle.photo && (
                <Avatar.Icon
                  size={80}
                  icon="cow"
                  style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
                />
              )}
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={[styles.cattleName, { color: theme.colors.onSurface }]}>
                  {cattle.name}
                </Text>
                <Text variant="titleMedium" style={[styles.cattleTag, { color: theme.colors.onSurfaceVariant }]}>
                  #{cattle.tagNumber}
                </Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(cattle.status) + '20' }]}
                  textStyle={[styles.statusText, { color: getStatusColor(cattle.status) }]}
                >
                  {getStatusLabel(cattle.status)}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={tabs}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Quick Actions FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // Show action sheet or modal with quick actions
          Alert.alert(
            'Quick Actions',
            'What would you like to record?',
            [
              { text: 'Semination', onPress: () => handleQuickAction('semination') },
              { text: 'Feeding', onPress: () => handleQuickAction('feeding') },
              { text: 'Health Record', onPress: () => handleQuickAction('health') },
              { text: 'Pregnancy Check', onPress: () => handleQuickAction('pregnancy') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
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
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 16,
  },
  headerContent: {
    padding: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  cattleName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cattleTag: {
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '45%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '500',
  },
  parentInfo: {
    marginTop: 8,
  },
  parentName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  parentTag: {
    opacity: 0.7,
  },
  childItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  childName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  childTag: {
    opacity: 0.7,
  },
  timeline: {
    paddingVertical: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CattleDetailScreen;
