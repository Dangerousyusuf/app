import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Type definitions
interface RouteParams {
  clubId: string;
  clubName: string;
}

interface ClubUsersScreenProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  role: string;
  avatar: string | null;
}

interface SearchUser {
  user_id: string;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
}

interface FilterOption {
  key: string;
  label: string;
  count: number;
}

interface Colors {
  background: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  surface: string;
  border: string;
  shadow?: string;
  warning: string;
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeFilterBadgeText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  userCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow || '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  userDetails: {
    marginTop: 8,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  joinDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 17,
    color: colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addUserButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addUserButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchInputWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  searchResultsContainer: {
    marginTop: 12,
  },
  searchResultCard: {
    margin: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 2,
  },
  selectIndicator: {
    marginLeft: 8,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedUsersContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedUsersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedUsersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedUserChipText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  removeSelectedUserButton: {
    padding: 2,
  },
  // Eski stiller (geriye uyumluluk için)
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultUsername: {
    fontSize: 14,
    marginBottom: 2,
  },
  searchResultEmail: {
    fontSize: 12,
  },
});

const ClubUsersScreen: React.FC<ClubUsersScreenProps> = ({ navigation, route }) => {
  const { colors }: { colors: Colors } = useTheme();
  const { token } = useAuth();
  const { clubId, clubName } = route.params || {};
  const styles = createStyles(colors);
  const [selectedFilter, setSelectedFilter] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('Üye');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state değişti:', showAddUserModal);
  }, [showAddUserModal]);

  // Mock data - tüm kullanıcılar tek listede
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 532 123 45 67',
      joinDate: '2023-01-15',
      role: 'Sahibi',
      avatar: null,
    },
    {
      id: 2,
      name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      phone: '+90 533 234 56 78',
      joinDate: '2023-02-20',
      role: 'Antrenör',
      avatar: null,
    },
    {
      id: 3,
      name: 'Ayşe Demir',
      email: 'ayse@example.com',
      phone: '+90 534 345 67 89',
      joinDate: '2023-03-10',
      role: 'Temizlikçi',
      avatar: null,
    },
    {
      id: 4,
      name: 'Fatma Özkan',
      email: 'fatma@example.com',
      phone: '+90 535 456 78 90',
      joinDate: '2023-04-05',
      role: 'Üye',
      avatar: null,
    },
    {
      id: 5,
      name: 'Ali Veli',
      email: 'ali@example.com',
      phone: '+90 536 567 89 01',
      joinDate: '2023-05-12',
      role: 'Üye',
      avatar: null,
    },
  ];

  const filterOptions: FilterOption[] = [
    { key: 'Tümü', label: 'Tümü', count: mockUsers.length },
    { key: 'Sahibi', label: 'Sahibi', count: mockUsers.filter(u => u.role === 'Sahibi').length },
    { key: 'Antrenör', label: 'Antrenör', count: mockUsers.filter(u => u.role === 'Antrenör').length },
    { key: 'Temizlikçi', label: 'Temizlikçi', count: mockUsers.filter(u => u.role === 'Temizlikçi').length },
    { key: 'Üye', label: 'Üye', count: mockUsers.filter(u => u.role === 'Üye').length },
  ];

  const getFilteredUsers = (): User[] => {
    let filtered = mockUsers;
    
    if (selectedFilter !== 'Tümü') {
      filtered = filtered.filter(user => user.role === selectedFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    }
    
    return filtered;
  };

  const getCurrentData = (): User[] => {
    return getFilteredUsers();
  };

  // Kullanıcı arama fonksiyonu
  const searchUsers = async (query: string): Promise<void> => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      console.log('Arama sorgusu:', query);
      console.log('Token var mı:', !!token);
      console.log('Token değeri:', token ? token.substring(0, 20) + '...' : 'null');

      // AuthService'deki axios instance'ını kullan
      const authService = (await import('../../services/authService')).default;
      await authService.setAuthHeader();
      
      const response = await authService.api.get(`/users/search?q=${encodeURIComponent(query)}`);
      
      console.log('Arama sonuçları:', response.data);
      const users = response.data.data || [];
      console.log('Set edilen kullanıcılar:', users);
      console.log('Kullanıcı sayısı:', users.length);
      setSearchResults(users);
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      setSearchResults([]);
    }
  };

  // Kullanıcı seçme fonksiyonu
  const selectUser = (user: SearchUser): void => {
    const isSelected = selectedUsers.some(u => u.user_id === user.user_id);
    
    if (isSelected) {
      // Kullanıcı zaten seçili, listeden çıkar
      setSelectedUsers(selectedUsers.filter(u => u.user_id !== user.user_id));
    } else {
      // Kullanıcı seçili değil, listeye ekle
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Kullanıcı listesini yenileme fonksiyonu
  const loadUsers = (): void => {
    // Bu fonksiyon kulüp kullanıcılarını yeniden yüklemek için kullanılır
    // Şu an mock data kullanıldığı için herhangi bir işlem yapmıyor
    // Gerçek API entegrasyonunda burada kulüp kullanıcıları yeniden çekilecek
    console.log('Kullanıcı listesi yenilendi');
  };

  // Seçilen kullanıcıları sahip olarak ekleme fonksiyonu
  const addOwnersToClub = async (): Promise<void> => {
    try {
      console.log('Sahip ekleme işlemi başlatılıyor...');
      console.log('Seçilen kullanıcılar:', selectedUsers);
      console.log('Kulüp ID:', clubId);

      // ClubsOwnersService'i import et
      const { default: clubsOwnersService } = await import('../../services/clubsOwnersService');

      // Her seçilen kullanıcı için sahiplik kaydı oluştur
      const promises = selectedUsers.map(async (user) => {
        const ownerData = {
          user_id: parseInt(user.user_id), // String'den integer'a çevir
          ownership_type: 'owner' as const,
          ownership_percentage: 100.00 / selectedUsers.length, // Eşit paylaşım
          start_date: new Date().toISOString().split('T')[0]
        };

        console.log('Sahip ekleniyor:', ownerData);
        
        // ClubsOwnersService kullanarak sahip ekle
        return clubsOwnersService.addOwnerToClub(clubId, ownerData);
      });

      // Tüm sahiplik kayıtlarını paralel olarak oluştur
      await Promise.all(promises);

      Alert.alert(
        'Başarılı',
        `${selectedUsers.length} kullanıcı başarıyla sahip olarak eklendi.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Modal'ı kapat ve verileri temizle
              setShowAddUserModal(false);
              setSelectedUsers([]);
              setSearchResults([]);
              setNewUserName('');
              setSelectedRole('Üye');
              
              // Kullanıcı listesini yenile
              loadUsers();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Sahip ekleme hatası:', error);
      
      let errorMessage = 'Sahip eklenirken bir hata oluştu.';
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', errorMessage);
    }
  };

  const renderUserCard = (user: User) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.userDetailRow}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.userDetailRow}>
          <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>
      </View>
      
      <Text style={styles.joinDate}>
        Katılım: {new Date(user.joinDate).toLocaleDateString('tr-TR')}
      </Text>
      
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Kullanıcılar</Text>
          <Text style={styles.headerSubtitle}>{clubName}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            console.log('+ butonu tıklandı, modal açılıyor...');
            setShowAddUserModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kullanıcı ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterBadge,
                selectedFilter === filter.key && styles.activeFilterBadge
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  selectedFilter === filter.key && styles.activeFilterBadgeText
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {getCurrentData().length > 0 ? (
          getCurrentData().map(renderUserCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              Bu kategoride henüz kullanıcı bulunmuyor
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Kullanıcı Ekleme Modal */}
      <Modal
        visible={showAddUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddUserModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddUserModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Kullanıcı Ekle</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Rol Seçimi */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Rol</Text>
              <View style={styles.roleContainer}>
                {['Üye', 'Temizlikçi', 'Antrenör', 'Yönetici', 'Sahip'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: selectedRole === role ? colors.primary : colors.surface,
                        borderColor: selectedRole === role ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      {
                        color: selectedRole === role ? '#FFFFFF' : colors.text
                      }
                    ]}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Kullanıcı Arama */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Kullanıcı Ara</Text>
              <View style={styles.searchInputWrapper}>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={newUserName}
                  onChangeText={(text) => {
                    setNewUserName(text);
                    searchUsers(text);
                  }}
                  placeholder="Kullanıcı adı veya e-posta ile ara..."
                  placeholderTextColor={colors.textSecondary}
                />
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.searchIcon}
                />
              </View>
              
              {/* Arama Sonuçları */}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  {searchResults.map((user) => {
                    const isSelected = selectedUsers.some(u => u.user_id === user.user_id);
                    return (
                    <TouchableOpacity
                      key={user.user_id}
                      style={[styles.searchResultCard, { 
                        backgroundColor: isSelected ? colors.primary + '10' : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1
                      }]}
                      onPress={() => selectUser(user)}
                    >
                      <View style={styles.userCardContent}>
                        <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.userAvatarText, { color: colors.primary }]}>
                            {user.first_name?.charAt(0)?.toUpperCase()}{user.last_name?.charAt(0)?.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={[styles.userName, { color: colors.text }]}>
                            {user.first_name} {user.last_name}
                          </Text>
                          <Text style={[styles.userUsername, { color: colors.textSecondary }]}>
                            @{user.user_name}
                          </Text>
                          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                            {user.email}
                          </Text>
                        </View>
                        <View style={styles.selectIndicator}>
                          {isSelected ? (
                            <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                              <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                          ) : (
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </View>

            {/* Sahip Ekleme Uyarısı */}
            {selectedRole === 'Sahip' && (
              <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
                <Ionicons name="warning" size={20} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  Sahip rolü eklemek kulübün sahiplik yapısını değiştirir. Bu işlem geri alınamaz.
                </Text>
              </View>
            )}
            
            {/* Seçilen Kullanıcılar */}
            {selectedUsers.length > 0 && (
              <View style={[styles.selectedUsersContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.selectedUsersTitle, { color: colors.text }]}>Seçilen Kullanıcılar ({selectedUsers.length})</Text>
                <View style={styles.selectedUsersChips}>
                  {selectedUsers.map((user) => (
                    <View key={user.user_id} style={[styles.selectedUserChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                      <Text style={[styles.selectedUserChipText, { color: colors.primary }]}>
                        {user.first_name} {user.last_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => selectUser(user)}
                        style={styles.removeSelectedUserButton}
                      >
                        <Ionicons name="close" size={14} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => {
                setShowAddUserModal(false);
                setNewUserName('');
                setSelectedRole('Üye');
                setSelectedUsers([]);
                setSearchResults([]);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.addUserButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (selectedRole === 'Sahip') {
                  // Sahip ekleme fonksiyonu
                  if (selectedUsers.length === 0) {
                    Alert.alert('Uyarı', 'Lütfen en az bir kullanıcı seçin.');
                    return;
                  }
                  
                  Alert.alert(
                    'Sahip Ekle',
                    `${selectedUsers.length} kullanıcıyı sahip olarak eklemek istediğinizden emin misiniz?`,
                    [
                      { text: 'İptal', style: 'cancel' },
                      { 
                        text: 'Ekle', 
                        onPress: () => addOwnersToClub()
                      }
                    ]
                  );
                } else {
                  // Diğer roller için placeholder
                  Alert.alert('Bilgi', `${selectedRole} rolü için ekleme fonksiyonu henüz aktif değil.`);
                }
              }}
              disabled={selectedRole === 'Sahip' ? selectedUsers.length === 0 : !newUserName.trim()}
            >
              <Text style={styles.addUserButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ClubUsersScreen;