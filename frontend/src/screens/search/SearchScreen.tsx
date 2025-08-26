import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONTS } from '../../constants';
import { userService } from '../../services';
import { urlService } from '../../config/api';

interface Colors {
  background: string;
  text: string;
  surface: string;
  border: string;
  textSecondary: string;
  primary: string;
}

interface SearchTab {
  id: string;
  label: string;
  icon: string;
}

interface SearchResult {
  id: number | string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  verified?: boolean;
  type: string;
  content?: string;
  members?: string;
  count?: string;
  location?: string;
  likes?: number;
  comments?: number;
  capacity?: string;
}

interface User {
  user_id?: number;
  id?: number;
  first_name?: string;
  last_name?: string;
  user_name: string;
  email: string;
  profile_picture?: string;
  role?: string;
}

interface UserSearchResponse {
  success: boolean;
  data?: User[];
  message?: string;
}

interface MockResults {
  users: SearchResult[];
  clubs: SearchResult[];
  federations: SearchResult[];
  posts: SearchResult[];
  areas: SearchResult[];
  tags: SearchResult[];
}

interface ExamplePost {
  id: number;
  image?: string;
  content?: string;
  likes: number;
  isVertical?: boolean;
  isTextOnly?: boolean;
  isBig?: boolean;
  isHorizontal?: boolean;
}

const SearchScreen: React.FC = () => {
  const { colors }: { colors: Colors } = useTheme();
  
  // Merkezi URL servisi kullanılıyor
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const searchTabs: SearchTab[] = [
    { id: 'all', label: 'Tümü', icon: 'grid' },
    { id: 'users', label: 'Kullanıcılar', icon: 'user' },
    { id: 'clubs', label: 'Kulüpler', icon: 'shield' },
    { id: 'federations', label: 'Federasyonlar', icon: 'building' },
    { id: 'posts', label: 'Paylaşımlar', icon: 'image' },
    { id: 'areas', label: 'Paylaşım Alanları', icon: 'building' },
    { id: 'tags', label: 'Etiketler', icon: 'hash' },
  ];

  // Mock data for future implementation
  const mockResults: MockResults = {
    users: [
      { id: 1, name: 'Ahmet Yılmaz', username: '@ahmetyilmaz', avatar: null, verified: true, type: 'user' },
      { id: 2, name: 'Mehmet Kaya', username: '@mehmetkaya', avatar: null, verified: false, type: 'user' },
    ],
    clubs: [
      { id: 1, name: 'Fenerbahçe SK', username: '@fenerbahce', avatar: null, verified: true, members: '2.1M', type: 'club' },
      { id: 2, name: 'Galatasaray SK', username: '@galatasaray', avatar: null, verified: true, members: '1.8M', type: 'club' },
    ],
    federations: [
      { id: 1, name: 'Türkiye Futbol Federasyonu', username: '@tff', avatar: null, verified: true, type: 'federation' },
    ],
    posts: [
      { id: 1, content: 'Harika bir maç!', name: 'Ahmet Yılmaz', likes: 45, comments: 12, type: 'post' },
      { id: 2, content: 'Bugün antrenman günü', name: 'Mehmet Kaya', likes: 23, comments: 5, type: 'post' },
    ],
    areas: [
      { id: 1, name: 'Atatürk Olimpiyat Stadı', location: 'İstanbul', type: 'area', capacity: '76,092' },
      { id: 2, name: 'Şükrü Saracoğlu Stadyumu', location: 'İstanbul', type: 'area', capacity: '50,530' },
    ],
    tags: [
      { id: 1, name: '#futbol', count: '1.2M', type: 'tag' },
      { id: 2, name: '#basketbol', count: '850K', type: 'tag' },
    ]
  };

  // Example posts for Instagram-like grid
  const examplePosts: ExamplePost[] = [
    {
      id: 1,
      image: 'https://picsum.photos/400/800',
      likes: 1234,
      isVertical: true,
    },
    {
      id: 2,
      content: 'Bugün harika bir antrenman yaptık! Takım ruhu çok güçlü 💪 #futbol #antrenman #takım',
      likes: 856,
      isTextOnly: true,
      isHorizontal: true,
    },
    {
      id: 3,
      image: 'https://picsum.photos/400/400',
      likes: 567,
    },
    {
      id: 4,
      image: 'https://picsum.photos/401/401',
      likes: 234,
    },
    {
      id: 5,
      image: 'https://picsum.photos/402/402',
      likes: 789,
    },
    {
      id: 6,
      image: 'https://picsum.photos/403/403',
      likes: 345,
    },
    {
      id: 7,
      image: 'https://picsum.photos/404/404',
      likes: 678,
    },
    {
      id: 8,
      image: 'https://picsum.photos/800/800',
      likes: 2345,
      isBig: true,
    },
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const handleSearch = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (activeTab === 'users') {
        // Real user search API call
        const response: UserSearchResponse = await userService.searchUsers(searchQuery);
        if (response.success && response.data && response.data.users) {
          const formattedUsers: SearchResult[] = response.data.users.map(user => ({
            id: user.user_id || user.id || 0,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name,
            username: `@${user.user_name}`,
            email: user.email,
            avatar: user.profile_picture && user.profile_picture !== 'default.jpg' ? 
              urlService.getAvatarUrl(user.profile_picture) : null,
            verified: user.role === 'admin',
            type: 'user'
          }));
          setSearchResults(formattedUsers);
        } else {
          setSearchResults([]);
        }
      } else if (activeTab === 'all') {
        // Search all categories
        const userResponse: UserSearchResponse = await userService.searchUsers(searchQuery);
        let allResults: SearchResult[] = [];
        
        if (userResponse.success && userResponse.data && userResponse.data.users) {
          const formattedUsers: SearchResult[] = userResponse.data.users.map(user => ({
            id: user.user_id || user.id || 0,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name,
            username: `@${user.user_name}`,
            email: user.email,
            avatar: user.profile_picture && user.profile_picture !== 'default.jpg' ? 
              urlService.getAvatarUrl(user.profile_picture) : null,
            verified: user.role === 'admin',
            type: 'user'
          }));
          allResults = [...allResults, ...formattedUsers];
        }
        
        // Add mock data for other categories (for future implementation)
        const filteredMockResults: SearchResult[] = Object.keys(mockResults)
          .filter(key => key !== 'users')
          .reduce((acc: SearchResult[], key: string) => {
            const categoryKey = key as keyof MockResults;
            const filtered = mockResults[categoryKey].filter(item => 
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.content?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(item => ({ ...item, type: key.slice(0, -1) }));
            return [...acc, ...filtered];
          }, []);
        
        allResults = [...allResults, ...filteredMockResults];
        setSearchResults(allResults);
      } else {
        // Mock data for other categories
        const categoryKey = activeTab as keyof MockResults;
        const categoryData = mockResults[categoryKey] || [];
        const filtered = categoryData.filter(item => 
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(item => ({ ...item, type: activeTab.slice(0, -1) }));
        setSearchResults(filtered);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = (): void => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Icon renderers
  const renderSearchIcon = (): JSX.Element => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const renderClearIcon = (): JSX.Element => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const renderTabIcon = (iconType: string): JSX.Element | null => {
    const iconProps = {
      width: 16,
      height: 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: activeTab === searchTabs.find(tab => tab.icon === iconType)?.id ? colors.background : colors.text,
      strokeWidth: 2,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const
    };

    switch (iconType) {
      case 'grid':
        return (
          <Svg {...iconProps}>
            <Path d="M3 3H10V10H3V3Z" />
            <Path d="M14 3H21V10H14V3Z" />
            <Path d="M14 14H21V21H14V14Z" />
            <Path d="M3 14H10V21H3V14Z" />
          </Svg>
        );
      case 'user':
        return (
          <Svg {...iconProps}>
            <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
            <Circle cx={12} cy={7} r={4} />
          </Svg>
        );
      case 'shield':
        return (
          <Svg {...iconProps}>
            <Path d="M12 22S8 18 8 12V7L12 5L16 7V12C16 18 12 22 12 22Z" />
          </Svg>
        );
      case 'building':
        return (
          <Svg {...iconProps}>
            <Path d="M6 22V4C6 3.44772 6.44772 3 7 3H17C17.5523 3 18 3.44772 18 4V22H6Z" />
            <Path d="M10 6H14" />
            <Path d="M10 10H14" />
            <Path d="M10 14H14" />
          </Svg>
        );
      case 'image':
        return (
          <Svg {...iconProps}>
            <Path d="M14.5 4H20.5C21.0523 4 21.5 4.44772 21.5 5V19C21.5 19.5523 21.0523 20 20.5 20H4.5C3.94772 20 3.5 19.5523 3.5 19V5C3.5 4.44772 3.94772 4 4.5 4H10.5" />
            <Path d="M9 9H9.01" />
            <Path d="M15 13L12 16L9 13L6 16" />
          </Svg>
        );
      case 'hash':
        return (
          <Svg {...iconProps}>
            <Path d="M4 9H20" />
            <Path d="M4 15H20" />
            <Path d="M10 3L8 21" />
            <Path d="M16 3L14 21" />
          </Svg>
        );
      default:
        return null;
    }
  };

  const renderResultItem: ListRenderItem<SearchResult> = ({ item }) => {
    const styles = createStyles(colors);
    
    return (
      <TouchableOpacity style={styles.resultItem}>
        <View style={styles.resultContent}>
          {/* Avatar/Icon */}
          <View style={styles.avatarContainer}>
            {item.avatar && typeof item.avatar === 'string' && item.avatar.trim() !== '' ? (
              <Image 
                source={{ uri: item.avatar }} 
                style={styles.avatar}
                onError={() => {
                  console.log('Avatar yüklenemedi:', item.avatar);
                }}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {item.name ? item.name.charAt(0).toUpperCase() : '#'}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.resultInfo}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultName, { color: colors.text }]}>
                {item.name || item.content}
              </Text>
              {item.verified && (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill={colors.primary}>
                  <Path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                </Svg>
              )}
            </View>
            
            {item.username && (
              <Text style={[styles.resultUsername, { color: colors.textSecondary }]}>
                {item.username}
              </Text>
            )}
            
            {item.members && (
              <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                {item.members} üye
              </Text>
            )}
            
            {item.count && (
              <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                {item.count} paylaşım
              </Text>
            )}
            
            {item.location && (
              <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                {item.location} • {item.type}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Instagram-like grid for featured posts
  const renderExamplePosts = (): JSX.Element => {
    const styles = createStyles(colors);
    
    const renderGridItem = (post: ExamplePost, index: number): JSX.Element => {
      const isVertical = post.isVertical;
      const isTextOnly = post.isTextOnly;
      const isBig = post.isBig;
      const isHorizontal = post.isHorizontal;
      const containerWidth = SIZES.width - SIZES.padding * 2;
      const baseItemWidth = (containerWidth - 2) / 3;
      
      let itemWidth: number, itemHeight: number;
      
      if (isBig) {
        itemWidth = baseItemWidth * 2 + 1;
        itemHeight = baseItemWidth * 2 + 1;
      } else if (isHorizontal) {
        itemWidth = baseItemWidth * 2 + 1;
        itemHeight = baseItemWidth;
      } else if (isVertical) {
        itemWidth = baseItemWidth;
        itemHeight = baseItemWidth * 2 + 1;
      } else {
        itemWidth = baseItemWidth;
        itemHeight = baseItemWidth;
      }
      
      return (
        <TouchableOpacity
          key={post.id}
          style={[
            styles.gridItem,
            {
              width: itemWidth,
              height: itemHeight,
              backgroundColor: isTextOnly ? colors.primary : colors.surface,
              marginBottom: 2,
            }
          ]}
        >
          {isTextOnly ? (
            <View style={styles.textOnlyContainer}>
              <Text style={[styles.textOnlyContent, { color: 'white' }]} numberOfLines={6}>
                {post.content}
              </Text>
              <View style={[styles.gridStats, { position: 'absolute', bottom: 8, left: 8 }]}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="white">
                  <Path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" />
                </Svg>
                <Text style={styles.gridStatsText}>{post.likes}</Text>
              </View>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: post.image }}
                style={styles.gridImage}
                resizeMode="cover"
              />
              <View style={styles.gridOverlay}>
                <View style={styles.gridStats}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="white">
                    <Path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" />
                  </Svg>
                  <Text style={styles.gridStatsText}>{post.likes}</Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      );
    };
    
    return (
      <View style={styles.recentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Öne Çıkanlar</Text>
        <View style={styles.gridContainer}>
          {examplePosts.map((post, index) => renderGridItem(post, index))}
        </View>
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.searchIcon}>
            {renderSearchIcon()}
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Ara"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              {renderClearIcon()}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Tabs */}
      {searchQuery.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {searchTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={styles.tabContent}>
                {renderTabIcon(tab.icon)}
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab.id ? colors.background : colors.text,
                    }
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {searchQuery.length === 0 ? (
          <>
            {renderExamplePosts()}
          </>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Aranıyor...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke={colors.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sonuç bulunamadı</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Farklı anahtar kelimeler deneyin</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    paddingHorizontal: SIZES.base,
    height: 48,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    ...FONTS.body,
    height: '100%',
  },
  clearButton: {
    padding: SIZES.base / 2,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  tab: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginRight: SIZES.base,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  tabContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  tabText: {
    ...FONTS.body,
    fontWeight: '600' as const,
    marginLeft: SIZES.base / 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingTop: SIZES.padding * 3,
  },
  loadingText: {
    ...FONTS.h4,
    fontWeight: '500' as const,
    marginTop: SIZES.base,
  },
  resultsList: {
    paddingTop: SIZES.base,
  },
  resultItem: {
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  resultContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  avatarContainer: {
    marginRight: SIZES.base,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatarText: {
    ...FONTS.h3,
    fontWeight: '600' as const,
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  resultName: {
    ...FONTS.h4,
    fontWeight: '700' as const,
    marginRight: SIZES.base / 2,
  },
  resultUsername: {
    ...FONTS.body,
    fontWeight: '400' as const,
    marginTop: 2,
  },
  resultMeta: {
    ...FONTS.body,
    fontWeight: '400' as const,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingTop: SIZES.padding * 3,
  },
  emptyText: {
    ...FONTS.h2,
    fontWeight: '700' as const,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    ...FONTS.h4,
    fontWeight: '400' as const,
    marginTop: SIZES.base / 2,
  },
  sectionTitle: {
    ...FONTS.h2,
    fontWeight: '700' as const,
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.base,
  },
  recentContainer: {
    marginTop: SIZES.padding,
  },
  // Instagram-like grid styles
  gridContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  gridItem: {
    borderRadius: SIZES.base / 2,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end' as const,
    alignItems: 'flex-start' as const,
    padding: 8,
  },
  gridStats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  gridStatsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  textOnlyContainer: {
    flex: 1,
    padding: SIZES.base,
    justifyContent: 'space-between' as const,
  },
  textOnlyContent: {
    ...FONTS.body,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
});

export default SearchScreen;