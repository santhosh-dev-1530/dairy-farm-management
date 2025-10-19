import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Chip,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CattleCard = ({ cattle, onPress, statusColor }) => {
  const theme = useTheme();

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

  const getGenderIcon = (gender) => {
    return gender === 'MALE' ? 'male' : 'female';
  };

  const getGenderColor = (gender) => {
    return gender === 'MALE' ? theme.colors.primary : theme.colors.secondary;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={60}
                source={cattle.photo ? { uri: cattle.photo } : undefined}
                style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
              />
              {!cattle.photo && (
                <Avatar.Icon
                  size={60}
                  icon="cow"
                  style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
                />
              )}
            </View>
            
            <View style={styles.info}>
              <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
                {cattle.name}
              </Text>
              <Text variant="bodyMedium" style={[styles.tagNumber, { color: theme.colors.onSurfaceVariant }]}>
                #{cattle.tagNumber}
              </Text>
              <Text variant="bodySmall" style={[styles.breed, { color: theme.colors.onSurfaceVariant }]}>
                {cattle.breed}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                textStyle={[styles.statusText, { color: statusColor }]}
                compact
              >
                {getStatusLabel(cattle.status)}
              </Chip>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Icon 
                name={getGenderIcon(cattle.gender)} 
                size={16} 
                color={getGenderColor(cattle.gender)} 
              />
              <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {cattle.gender}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="cake" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {calculateAge(cattle.dateOfBirth)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="calendar-today" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                Born {formatDate(cattle.dateOfBirth)}
              </Text>
            </View>
          </View>

          {cattle.assignedUser && (
            <View style={styles.assignedUser}>
              <Icon name="person" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.assignedText, { color: theme.colors.onSurfaceVariant }]}>
                Assigned to: {cattle.assignedUser.username}
              </Text>
            </View>
          )}

          {cattle._count && (
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Semination
                </Text>
                <Text variant="bodySmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {cattle._count.seminationRecords || 0}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Pregnancies
                </Text>
                <Text variant="bodySmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {cattle._count.pregnancyRecords || 0}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Calves
                </Text>
                <Text variant="bodySmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {cattle._count.children || 0}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    borderRadius: 30,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tagNumber: {
    fontWeight: '500',
    marginBottom: 2,
  },
  breed: {
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
  },
  assignedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedText: {
    marginLeft: 4,
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CattleCard;
