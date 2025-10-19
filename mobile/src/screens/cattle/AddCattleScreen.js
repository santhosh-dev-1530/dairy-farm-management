import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { cattleAPI } from '../../services/api';

const AddCattleScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [cattle, setCattle] = useState([]);
  const [formData, setFormData] = useState({
    tagNumber: '',
    name: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    parentId: '',
    assignedUserId: '',
  });
  const [errors, setErrors] = useState({});
  const [parentMenuVisible, setParentMenuVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCattle();
  }, []);

  const loadUsers = async () => {
    try {
      // In a real app, you'd have a users API endpoint
      // For now, we'll use a mock or get from context
      setUsers([
        { id: '1', username: 'John Doe' },
        { id: '2', username: 'Jane Smith' },
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCattle = async () => {
    try {
      const response = await cattleAPI.getCattle({ limit: 100 });
      setCattle(response.data.cattle);
    } catch (error) {
      console.error('Error loading cattle:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tagNumber.trim()) {
      newErrors.tagNumber = 'Tag number is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        parentId: formData.parentId || null,
        assignedUserId: formData.assignedUserId || null,
      };

      const response = await cattleAPI.addCattle(submitData);
      
      Alert.alert(
        'Success',
        'Cattle added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding cattle:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add cattle');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedParent = () => {
    return cattle.find(c => c.id === formData.parentId);
  };

  const getSelectedUser = () => {
    return users.find(u => u.id === formData.assignedUserId);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              Add New Cattle
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Enter the cattle information below
            </Text>

            <View style={styles.form}>
              <TextInput
                label="Tag Number *"
                value={formData.tagNumber}
                onChangeText={(text) => handleInputChange('tagNumber', text)}
                error={!!errors.tagNumber}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="tag" />}
                autoCapitalize="characters"
              />
              {errors.tagNumber && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.tagNumber}
                </Text>
              )}

              <TextInput
                label="Name *"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                error={!!errors.name}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="cow" />}
                autoCapitalize="words"
              />
              {errors.name && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.name}
                </Text>
              )}

              <TextInput
                label="Breed *"
                value={formData.breed}
                onChangeText={(text) => handleInputChange('breed', text)}
                error={!!errors.breed}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="pets" />}
                autoCapitalize="words"
              />
              {errors.breed && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.breed}
                </Text>
              )}

              <Menu
                visible={parentMenuVisible}
                onDismiss={() => setParentMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setParentMenuVisible(true)}
                    style={styles.menuButton}
                    contentStyle={styles.menuButtonContent}
                  >
                    {getSelectedParent() ? getSelectedParent().name : 'Select Parent (Optional)'}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    handleInputChange('parentId', '');
                    setParentMenuVisible(false);
                  }}
                  title="No Parent"
                />
                {cattle.map((c) => (
                  <Menu.Item
                    key={c.id}
                    onPress={() => {
                      handleInputChange('parentId', c.id);
                      setParentMenuVisible(false);
                    }}
                    title={`${c.name} (#${c.tagNumber})`}
                  />
                ))}
              </Menu>

              <Menu
                visible={userMenuVisible}
                onDismiss={() => setUserMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setUserMenuVisible(true)}
                    style={styles.menuButton}
                    contentStyle={styles.menuButtonContent}
                  >
                    {getSelectedUser() ? getSelectedUser().username : 'Assign to User (Optional)'}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    handleInputChange('assignedUserId', '');
                    setUserMenuVisible(false);
                  }}
                  title="No Assignment"
                />
                {users.map((u) => (
                  <Menu.Item
                    key={u.id}
                    onPress={() => {
                      handleInputChange('assignedUserId', u.id);
                      setUserMenuVisible(false);
                    }}
                    title={u.username}
                  />
                ))}
              </Menu>

              <Divider style={styles.divider} />

              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Gender *
              </Text>
              <View style={styles.genderContainer}>
                <Button
                  mode={formData.gender === 'MALE' ? 'contained' : 'outlined'}
                  onPress={() => handleInputChange('gender', 'MALE')}
                  style={styles.genderButton}
                >
                  Male
                </Button>
                <Button
                  mode={formData.gender === 'FEMALE' ? 'contained' : 'outlined'}
                  onPress={() => handleInputChange('gender', 'FEMALE')}
                  style={styles.genderButton}
                >
                  Female
                </Button>
              </View>
              {errors.gender && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.gender}
                </Text>
              )}

              <TextInput
                label="Date of Birth *"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                error={!!errors.dateOfBirth}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="calendar" />}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
              {errors.dateOfBirth && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.dateOfBirth}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  'Add Cattle'
                )}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 4,
  },
  errorText: {
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  menuButton: {
    marginBottom: 8,
  },
  menuButtonContent: {
    justifyContent: 'flex-start',
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddCattleScreen;
