import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Chip,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TimelineItem = ({ record, type, isLast }) => {
  const theme = useTheme();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'semination':
        return 'medical-services';
      case 'pregnancy':
        return 'pregnant-woman';
      case 'feeding':
        return 'restaurant';
      case 'health':
        return 'health-and-safety';
      default:
        return 'event';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'semination':
        return theme.colors.primary;
      case 'pregnancy':
        return theme.colors.tertiary;
      case 'feeding':
        return theme.colors.secondary;
      case 'health':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSeminationRecord = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Icon 
          name={getTypeIcon('semination')} 
          size={20} 
          color={getTypeColor('semination')} 
        />
        <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Semination Recorded
        </Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: getTypeColor('semination') + '20' }]}
          textStyle={[styles.statusText, { color: getTypeColor('semination') }]}
          compact
        >
          {record.isPregnant === null ? 'Pending Check' : 
           record.isPregnant ? 'Pregnant' : 'Not Pregnant'}
        </Chip>
      </View>
      
      <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
        {formatDate(record.seminationDate)} at {formatTime(record.seminationDate)}
      </Text>
      
      <Text variant="bodySmall" style={[styles.checkDate, { color: theme.colors.onSurfaceVariant }]}>
        Check due: {formatDate(record.checkDate)}
      </Text>
      
      {record.notes && (
        <Text variant="bodySmall" style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
          {record.notes}
        </Text>
      )}
      
      <Text variant="bodySmall" style={[styles.recordedBy, { color: theme.colors.onSurfaceVariant }]}>
        Recorded by: {record.createdBy?.username}
      </Text>
    </View>
  );

  const renderPregnancyRecord = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Icon 
          name={getTypeIcon('pregnancy')} 
          size={20} 
          color={getTypeColor('pregnancy')} 
        />
        <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Pregnancy Record
        </Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: getTypeColor('pregnancy') + '20' }]}
          textStyle={[styles.statusText, { color: getTypeColor('pregnancy') }]}
          compact
        >
          {record.status}
        </Chip>
      </View>
      
      <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
        Expected delivery: {formatDate(record.expectedDeliveryDate)}
      </Text>
      
      {record.actualDeliveryDate && (
        <Text variant="bodySmall" style={[styles.deliveryDate, { color: theme.colors.onSurfaceVariant }]}>
          Delivered: {formatDate(record.actualDeliveryDate)}
        </Text>
      )}
      
      {record.calf && (
        <Text variant="bodySmall" style={[styles.calfInfo, { color: theme.colors.onSurfaceVariant }]}>
          Calf: {record.calf.name} (#{record.calf.tagNumber})
        </Text>
      )}
      
      {record.notes && (
        <Text variant="bodySmall" style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
          {record.notes}
        </Text>
      )}
      
      <Text variant="bodySmall" style={[styles.recordedBy, { color: theme.colors.onSurfaceVariant }]}>
        Recorded by: {record.createdBy?.username}
      </Text>
    </View>
  );

  const renderFeedingRecord = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Icon 
          name={getTypeIcon('feeding')} 
          size={20} 
          color={getTypeColor('feeding')} 
        />
        <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Feeding Recorded
        </Text>
        {record.waterGiven && (
          <Chip
            style={[styles.statusChip, { backgroundColor: theme.colors.secondary + '20' }]}
            textStyle={[styles.statusText, { color: theme.colors.secondary }]}
            compact
          >
            Water Given
          </Chip>
        )}
      </View>
      
      <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
        {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
      </Text>
      
      <Text variant="bodySmall" style={[styles.feedInfo, { color: theme.colors.onSurfaceVariant }]}>
        {record.feedType}: {record.quantity} kg
      </Text>
      
      <Text variant="bodySmall" style={[styles.recordedBy, { color: theme.colors.onSurfaceVariant }]}>
        Recorded by: {record.recordedBy?.username}
      </Text>
    </View>
  );

  const renderHealthRecord = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Icon 
          name={getTypeIcon('health')} 
          size={20} 
          color={getTypeColor('health')} 
        />
        <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Health Record
        </Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: getTypeColor('health') + '20' }]}
          textStyle={[styles.statusText, { color: getTypeColor('health') }]}
          compact
        >
          {record.recordType}
        </Chip>
      </View>
      
      <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
        {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
      </Text>
      
      <Text variant="bodySmall" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        {record.description}
      </Text>
      
      {record.medication && (
        <Text variant="bodySmall" style={[styles.medication, { color: theme.colors.onSurfaceVariant }]}>
          Medication: {record.medication}
          {record.dosage && ` (${record.dosage})`}
        </Text>
      )}
      
      <Text variant="bodySmall" style={[styles.recordedBy, { color: theme.colors.onSurfaceVariant }]}>
        Recorded by: {record.recordedBy?.username}
      </Text>
    </View>
  );

  const renderContent = () => {
    switch (type) {
      case 'semination':
        return renderSeminationRecord();
      case 'pregnancy':
        return renderPregnancyRecord();
      case 'feeding':
        return renderFeedingRecord();
      case 'health':
        return renderHealthRecord();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />
        <View style={[styles.dot, { backgroundColor: getTypeColor(type) }]} />
        {!isLast && <View style={[styles.line, { backgroundColor: theme.colors.outline }]} />}
      </View>
      
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        {renderContent()}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  line: {
    width: 2,
    flex: 1,
    opacity: 0.3,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  card: {
    flex: 1,
    borderRadius: 8,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
  },
  statusChip: {
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  date: {
    fontWeight: '500',
    marginBottom: 4,
  },
  checkDate: {
    marginBottom: 4,
  },
  deliveryDate: {
    marginBottom: 4,
  },
  calfInfo: {
    marginBottom: 4,
  },
  feedInfo: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 4,
  },
  medication: {
    marginBottom: 4,
  },
  notes: {
    fontStyle: 'italic',
    marginBottom: 4,
  },
  recordedBy: {
    fontSize: 11,
    opacity: 0.7,
  },
});

export default TimelineItem;
