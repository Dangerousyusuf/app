import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import clubsOwnersService from '../../services/clubsOwnersService';

// Type definitions
interface RouteParams {
  clubId: string;
}

interface ClubOwnersScreenProps {
  route: {
    params: RouteParams;
  };
  navigation: any;
}

interface Owner {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  ownership_type: 'owner' | 'partner' | 'investor';
  ownership_percentage: number;
  start_date: string;
}

interface FormData {
  user_id: string;
  ownership_type: 'owner' | 'partner' | 'investor';
  ownership_percentage: string;
  start_date: string;
}

interface Colors {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  white: string;
  border: string;
  success: string;
  error: string;
}

const ClubOwnersScreen: React.FC<ClubOwnersScreenProps> = ({ route, navigation }) => {
  const { clubId } = route.params;
  const { colors }: { colors: Colors } = useTheme();

  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState<FormData>({
    user_id: '',
    ownership_type: 'partner',
    ownership_percentage: '',
    start_date: ''
  });

  useEffect(() => {
    navigation.setOptions({
      title: 'Kulüp Sahipleri',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.text,
    });
  }, [colors]);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await clubsOwnersService.getClubOwners(clubId);
      if (response.success) {
        setOwners(response.data);
      }
    } catch (error) {
      console.error('Sahipler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadOwners();
    setRefreshing(false);
  };

  const handleAddOwner = async (): Promise<void> => {
    if (!formData.user_id.trim()) {
      Alert.alert('Hata', 'Kullanıcı ID gereklidir');
      return;
    }

    if (!formData.ownership_percentage.trim()) {
      Alert.alert('Hata', 'Sahiplik yüzdesi gereklidir');
      return;
    }

    try {
      const ownerData = {
        user_id: formData.user_id,
        ownership_type: formData.ownership_type,
        ownership_percentage: parseFloat(formData.ownership_percentage),
        start_date: formData.start_date || new Date().toISOString().split('T')[0]
      };

      const response = await clubsOwnersService.addOwnerToClub(clubId, ownerData);
      if (response.success) {
        setModalVisible(false);
        resetForm();
        loadOwners();
        Alert.alert('Başarılı', 'Sahip başarıyla eklendi');
      } else {
        Alert.alert('Hata', response.message || 'Sahip eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Sahip ekleme hatası:', error);
      Alert.alert('Hata', 'Sahip eklenirken hata oluştu');
    }
  };

  const handleUpdateOwner = async (): Promise<void> => {
    if (!selectedOwner) return;

    try {
      const ownerData = {
        ownership_type: formData.ownership_type,
        ownership_percentage: parseFloat(formData.ownership_percentage)
      };

      const response = await clubsOwnersService.updateOwnership(clubId, selectedOwner.id, ownerData);
      if (response.success) {
        setEditModalVisible(false);
        resetForm();
        setSelectedOwner(null);
        loadOwners();
        Alert.alert('Başarılı', 'Sahiplik bilgileri güncellendi');
      } else {
        Alert.alert('Hata', response.message || 'Güncelleme sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Sahiplik güncelleme hatası:', error);
      Alert.alert('Hata', 'Güncelleme sırasında hata oluştu');
    }
  };

  const handleRemoveOwner = (owner: Owner): void => {
    Alert.alert(
      'Sahip Kaldır',
      `${owner.full_name} adlı sahibi kaldırmak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await clubsOwnersService.removeOwnerFromClub(clubId, owner.id);
              if (response.success) {
                loadOwners();
                Alert.alert('Başarılı', 'Sahip başarıyla kaldırıldı');
              } else {
                Alert.alert('Hata', response.message || 'Sahip kaldırılırken hata oluştu');
              }
            } catch (error) {
              console.error('Sahip kaldırma hatası:', error);
              Alert.alert('Hata', 'Sahip kaldırılırken hata oluştu');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (owner: Owner): void => {
    setSelectedOwner(owner);
    setFormData({
      user_id: owner.user_id,
      ownership_type: owner.ownership_type,
      ownership_percentage: owner.ownership_percentage.toString(),
      start_date: owner.start_date
    });
    setEditModalVisible(true);
  };

  const resetForm = (): void => {
    setFormData({
      user_id: '',
      ownership_type: 'partner',
      ownership_percentage: '',
      start_date: ''
    });
  };

  const getOwnershipTypeLabel = (type: string): string => {
    switch (type) {
      case 'owner': return 'Sahip';
      case 'partner': return 'Ortak';
      case 'investor': return 'Yatırımcı';
      default: return type;
    }
  };

  const renderOwnerCard = (owner: Owner) => {
    const initials = owner.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();

    return (
      <View key={owner.id} style={[styles.ownerCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.ownerHeader}>
          <View style={[styles.ownerAvatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.ownerAvatarText, { color: colors.white }]}>{initials}</Text>
          </View>
          <View style={styles.ownerInfo}>
            <Text style={[styles.ownerName, { color: colors.text }]}>{owner.full_name}</Text>
            <Text style={[styles.ownerType, { color: colors.primary }]}>
              {getOwnershipTypeLabel(owner.ownership_type)} - %{owner.ownership_percentage}
            </Text>
            <Text style={[styles.ownerDate, { color: colors.textSecondary }]}>
              Başlangıç: {new Date(owner.start_date).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => openEditModal(owner)}
            >
              <Ionicons name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => handleRemoveOwner(owner)}
            >
              <Ionicons name="trash" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderModal = (
    visible: boolean,
    setVisible: (visible: boolean) => void,
    title: string,
    onSubmit: () => void
  ) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={() => {
                setVisible(false);
                resetForm();
                setSelectedOwner(null);
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {!selectedOwner && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Kullanıcı ID</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={formData.user_id}
                  onChangeText={(text) => setFormData({ ...formData, user_id: text })}
                  placeholder="Kullanıcı ID'sini girin"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Sahiplik Türü</Text>
              <View style={styles.pickerContainer}>
                {(['owner', 'partner', 'investor'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerOption,
                      {
                        backgroundColor: formData.ownership_type === type ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setFormData({ ...formData, ownership_type: type })}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        {
                          color: formData.ownership_type === type ? colors.white : colors.text
                        }
                      ]}
                    >
                      {getOwnershipTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Sahiplik Yüzdesi</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={formData.ownership_percentage}
                onChangeText={(text) => setFormData({ ...formData, ownership_percentage: text })}
                placeholder="Yüzde değeri girin"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {!selectedOwner && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Başlangıç Tarihi</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={formData.start_date}
                  onChangeText={(text) => setFormData({ ...formData, start_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => {
                setVisible(false);
                resetForm();
                setSelectedOwner(null);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={onSubmit}
            >
              <Text style={[styles.submitButtonText, { color: colors.white }]}>
                {selectedOwner ? 'Güncelle' : 'Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Sahipler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kulüp Sahipleri</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {owners.length} sahip bulundu
          </Text>
        </View>

        {owners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz sahip eklenmemiş</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>İlk sahibi eklemek için + butonuna tıklayın</Text>
          </View>
        ) : (
          <View style={styles.ownersContainer}>
            {owners.map(renderOwnerCard)}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>

      {renderModal(modalVisible, setModalVisible, 'Yeni Sahip Ekle', handleAddOwner)}
      {renderModal(editModalVisible, setEditModalVisible, 'Sahiplik Düzenle', handleUpdateOwner)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ownersContainer: {
    padding: 20,
    paddingTop: 10,
  },
  ownerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ownerType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  ownerDate: {
    fontSize: 12,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClubOwnersScreen;