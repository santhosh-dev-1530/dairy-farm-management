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
  Searchbar,
  FAB,
  Card,
  Chip,
  Avatar,
  useTheme,
  ActivityIndicator,
  Menu,
  IconButton,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { cattleAPI } from '../../services/api';
import CattleCard from '../../components/CattleCard';

const CattleListScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [menuVisible, setMenuVisible] = useState(false);

  const statusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Pregnant', value: 'PREGNANT' },
    { label: 'Separated', value: 'SEPARATED' },
    { label: 'Deceased', value: 'DECEASED' },
  ];

  const loadCattle = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const params = {
        search: searchQuery,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        page: 1,
        limit: 50,
      };

      const response = await cattleAPI.getCattle(params);
      setCattle(response.data.cattle);
    } catch (error) {
      console.error('Error loading cattle:', error);
      Alert.alert('Error', 'Failed to load cattle data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCattle();
  }, [searchQuery, filterStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCattle(false);
  }, [searchQuery, filterStatus]);

  const handleCattlePress = (cattleItem) => {
    navigation.navigate('CattleDetail', { cattle: cattleItem });
  };

  const handleAddCattle = () => {
    navigation.navigate('AddCattle');
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

  const renderCattleItem = ({ item }) => (
    <CattleCard
      cattle={item}
      onPress={() => handleCattlePress(item)}
      statusColor={getStatusColor(item.status)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
        No Cattle Found
      </Text>
      <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery || filterStatus !== 'ALL' 
          ? 'Try adjusting your search or filter' 
          : 'Add your first cattle to get started'
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Search cattle..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.filterContainer}>
        <FlatList
          data={statusOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <Chip
              selected={filterStatus === item.value}
              onPress={() => setFilterStatus(item.value)}
              style={[
                styles.chip,
                filterStatus === item.value && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={[
                styles.chipText,
                filterStatus === item.value && { color: theme.colors.onPrimary }
              ]}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading cattle...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cattle}
        renderItem={renderCattleItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {user?.role === 'ADMIN' && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddCattle}
        />
      )}
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
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CattleListScreen;
