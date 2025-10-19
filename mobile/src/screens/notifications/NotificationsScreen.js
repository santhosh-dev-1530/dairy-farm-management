import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  useTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { notificationAPI } from '../../services/api';

const NotificationsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const response = await notificationAPI.getNotifications({
        page,
        limit: 20,
      });
      
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setHasMore(response.data.pagination.pages > page);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setRefreshing(true);
    loadNotifications(false);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }

      // Navigate based on notification type
      if (notification.cattleId) {
        navigation.navigate('CattleDetail', { cattle: { id: notification.cattleId } });
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PREGNANCY_CHECK_DUE':
        return 'pregnant-woman';
      case 'SEPARATION_REMINDER':
        return 'family-restroom';
      case 'HEALTH_ALERT':
        return 'health-and-safety';
      case 'MILESTONE_REMINDER':
        return 'event';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'PREGNANCY_CHECK_DUE':
        return theme.colors.tertiary;
      case 'SEPARATION_REMINDER':
        return theme.colors.secondary;
      case 'HEALTH_ALERT':
        return theme.colors.error;
      case 'MILESTONE_REMINDER':
        return theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'PREGNANCY_CHECK_DUE':
        return 'Pregnancy Check';
      case 'SEPARATION_REMINDER':
        return 'Separation';
      case 'HEALTH_ALERT':
        return 'Health Alert';
      case 'MILESTONE_REMINDER':
        return 'Milestone';
      default:
        return 'Notification';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }) => (
    <Card
      style={[
        styles.notificationCard,
        { 
          backgroundColor: theme.colors.surface,
          borderLeftColor: getNotificationColor(item.type),
          borderLeftWidth: item.isRead ? 0 : 4,
        }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Card.Content style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Icon
              name={getNotificationIcon(item.type)}
              size={24}
              color={getNotificationColor(item.type)}
            />
          </View>
          
          <View style={styles.notificationInfo}>
            <View style={styles.notificationTitleRow}>
              <Text
                variant="titleSmall"
                style={[
                  styles.notificationTitle,
                  { 
                    color: theme.colors.onSurface,
                    fontWeight: item.isRead ? 'normal' : 'bold'
                  }
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              
              <Chip
                style={[styles.typeChip, { backgroundColor: getNotificationColor(item.type) + '20' }]}
                textStyle={[styles.typeText, { color: getNotificationColor(item.type) }]}
                compact
              >
                {getTypeLabel(item.type)}
              </Chip>
            </View>
            
            <Text
              variant="bodyMedium"
              style={[styles.notificationMessage, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={3}
            >
              {item.message}
            </Text>
            
            <View style={styles.notificationFooter}>
              <Text
                variant="bodySmall"
                style={[styles.notificationDate, { color: theme.colors.onSurfaceVariant }]}
              >
                {formatDate(item.createdAt)}
              </Text>
              
              {item.cattle && (
                <Text
                  variant="bodySmall"
                  style={[styles.cattleInfo, { color: theme.colors.onSurfaceVariant }]}
                >
                  {item.cattle.name} (#{item.cattle.tagNumber})
                </Text>
              )}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-none" size={64} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
        No Notifications
      </Text>
      <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        You'll receive notifications for important events like pregnancy checks and health alerts
      </Text>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    flex: 1,
    marginRight: 8,
  },
  typeChip: {
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  notificationMessage: {
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
  },
  cattleInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;
