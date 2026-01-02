import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';
import FloatingChatButton from '../../components/FloatingChatButton';

const { width } = Dimensions.get('window');
const PARTNER_CARD_WIDTH = (width - 60) / 2; // 20px padding each side + 20px gap

interface Benefit {
  id: string;
  title: string;
  description?: string;
  type: 'offer' | 'partner';
  code?: string;
  logo_url?: string;
  organization_name?: string;
  expiration_date?: string;
  is_active?: boolean;
}

type ViewType = 'offers' | 'partners';

export default function Benefits() {
  const [isLoading, setIsLoading] = useState(true);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('offers');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Benefit | null>(null);

  // Fetch all benefits
  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBenefits(data || []);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      Alert.alert('Error', 'Failed to load benefits');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter benefits locally
  const offers = useMemo(() => {
    return benefits.filter((b) => b.type === 'offer');
  }, [benefits]);

  const partners = useMemo(() => {
    return benefits.filter((b) => b.type === 'partner');
  }, [benefits]);

  // Copy code handler
  const handleCopyCode = async (code: string, benefitId: string) => {
    try {
      await Clipboard.setStringAsync(code);
      setCopiedCodeId(benefitId);
      
      // Show toast-like feedback
      setTimeout(() => {
        setCopiedCodeId(null);
      }, 2000);

      Alert.alert('Success', 'Code Copied!');
    } catch (error) {
      console.error('Error copying code:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  // Handle partner card press
  const handlePartnerPress = (partner: Benefit) => {
    setSelectedPartner(partner);
  };

  // Render Offers List Item
  const renderOfferItem = ({ item }: { item: Benefit }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.offerIconContainer}>
          <Ionicons name="pricetag" size={20} color="#10B981" />
        </View>
        <Text style={styles.offerTitle}>{item.title}</Text>
      </View>
      {item.description && <Text style={styles.offerDescription}>{item.description}</Text>}
      {item.code && (
        <View style={styles.promoCodeContainer}>
          <View style={styles.promoCodeBox}>
            <Text style={styles.promoCodeLabel}>PROMO CODE</Text>
            <Text style={styles.promoCode}>{item.code}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleCopyCode(item.code!, item.id)}
            style={styles.copyIconButton}
          >
            <Ionicons 
              name={copiedCodeId === item.id ? "checkmark-circle" : "copy-outline"} 
              size={20} 
              color={copiedCodeId === item.id ? "#10B981" : "#71717A"} 
            />
          </TouchableOpacity>
        </View>
      )}
      {item.expiration_date && (
        <View style={styles.expirationContainer}>
          <Ionicons name="time-outline" size={12} color="#EF4444" />
          <Text style={styles.expirationText}>
            Expires {new Date(item.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      )}
    </View>
  );

  // Render Partners Grid Item
  const renderPartnerItem = ({ item }: { item: Benefit }) => {
    const partnerName = item.organization_name || item.title;
    const initials = partnerName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    
    return (
      <TouchableOpacity
        style={styles.partnerCardList}
        onPress={() => handlePartnerPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.partnerCardContent}>
          {/* Full Width Logo Placeholder */}
          <View style={styles.partnerLogoPlaceholder}>
            <View style={styles.partnerInitialsCircle}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.partnerInfo}>
            <View style={styles.partnerHeaderRow}>
              <Text style={styles.partnerNameList} numberOfLines={1}>
                {partnerName}
              </Text>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
            
            {item.description && (
              <Text style={styles.partnerDescriptionList} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Valid Until Date */}
            {item.expiration_date && (
              <View style={styles.validUntilRow}>
                <Ionicons name="calendar-outline" size={14} color="#71717A" />
                <Text style={styles.validUntilText}>
                  Valid until {new Date(item.expiration_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
            )}

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsLabel}>Benefits:</Text>
              <Text style={styles.benefitsText} numberOfLines={2}>
                {item.title || 'Exclusive discounts and priority services for all Yi members'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading benefits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Benefits Hub</Text>
            <Text style={styles.headerSubtitle}>
              {activeView === 'offers' ? 'Exclusive deals & discounts' : 'Our trusted partners'}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons 
              name={activeView === 'offers' ? "gift" : "people"} 
              size={28} 
              color="#F97316" 
            />
          </View>
        </View>
      </View>

      {/* Segmented Control Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, activeView === 'offers' && styles.toggleOptionActive]}
          onPress={() => setActiveView('offers')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="gift" 
            size={18} 
            color={activeView === 'offers' ? '#F97316' : '#71717A'} 
          />
          <Text style={[styles.toggleText, activeView === 'offers' && styles.toggleTextActive]}>
            Offers
          </Text>
          {offers.length > 0 && (
            <View style={[styles.countBadge, activeView === 'offers' && styles.countBadgeActive]}>
              <Text style={[styles.countBadgeText, activeView === 'offers' && styles.countBadgeTextActive]}>
                {offers.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, activeView === 'partners' && styles.toggleOptionActive]}
          onPress={() => setActiveView('partners')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="people" 
            size={18} 
            color={activeView === 'partners' ? '#F97316' : '#71717A'} 
          />
          <Text style={[styles.toggleText, activeView === 'partners' && styles.toggleTextActive]}>
            Partners
          </Text>
          {partners.length > 0 && (
            <View style={[styles.countBadge, activeView === 'partners' && styles.countBadgeActive]}>
              <Text style={[styles.countBadgeText, activeView === 'partners' && styles.countBadgeTextActive]}>
                {partners.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeView === 'offers' ? (
        offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="gift-outline" size={64} color="#F97316" />
            </View>
            <Text style={styles.emptyTitle}>No Offers Yet</Text>
            <Text style={styles.emptyText}>Stay tuned for exclusive deals and discounts coming your way soon!</Text>
          </View>
        ) : (
          <FlatList
            key={activeView}
            data={offers}
            renderItem={renderOfferItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.offersList}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        partners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={64} color="#F97316" />
            </View>
            <Text style={styles.emptyTitle}>No Partners Yet</Text>
            <Text style={styles.emptyText}>We're building partnerships to bring you more value. Check back soon!</Text>
          </View>
        ) : (
          <FlatList
            key={activeView}
            data={partners}
            renderItem={renderPartnerItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.partnersList}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* Partner Details Modal */}
      <Modal
        visible={selectedPartner !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPartner(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {selectedPartner && (
              <>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedPartner(null)}
                >
                  <Ionicons name="close-circle" size={32} color="#71717A" />
                </TouchableOpacity>
                
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <View style={styles.modalLogoContainer}>
                    <View style={[styles.modalLogo, styles.placeholderPartnerLogoSquare]}>
                      <Text style={styles.initialsTextLarge}>
                        {(selectedPartner.organization_name || selectedPartner.title)
                          .split(' ')
                          .map(word => word[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.modalTitle}>{selectedPartner.organization_name || selectedPartner.title}</Text>
                  
                  <View style={styles.modalMouBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                    <Text style={styles.modalMouText}>Official MOU Partner</Text>
                  </View>
                  
                  {selectedPartner.description ? (
                    <Text style={styles.modalDescription}>{selectedPartner.description}</Text>
                  ) : (
                    <Text style={styles.modalDescription}>
                      We're proud to partner with this organization to bring exclusive benefits to our community members. More details coming soon!
                    </Text>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedPartner(null);
                      Alert.alert('Contact', 'For partnership inquiries, please contact us.');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Learn More</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#A1A1AA',
    fontSize: 15,
    fontWeight: '500',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#422D1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toggleOptionActive: {
    backgroundColor: '#27272A',
  },
  toggleText: {
    color: '#71717A',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: '#422D1E',
  },
  countBadgeText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: '#F97316',
  },
  offersList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  offerCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  offerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.2,
  },
  offerDescription: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
    fontWeight: '500',
  },
  promoCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
    borderStyle: 'dashed',
  },
  promoCodeBox: {
    flex: 1,
  },
  promoCodeLabel: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  promoCode: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  copyIconButton: {
    padding: 4,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expirationText: {
    color: '#EF4444',
    fontSize: 11,
  },
  partnersGrid: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  partnersRow: {
    justifyContent: 'space-between',
    gap: 14,
  },
  partnersList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  partnerCardList: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  partnerCardContent: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  partnerLogoPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#27272A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  partnerInitialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  partnerLogoSquare: {
    width: 56,
    height: 56,
  },
  partnerLogoImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  placeholderPartnerLogoSquare: {
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  initialsText: {
    color: '#A1A1AA',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  initialsTextLarge: {
    color: '#A1A1AA',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  partnerNameList: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#052E1C',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  partnerDescriptionList: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  validUntilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  validUntilText: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '500',
  },
  benefitsSection: {
    marginTop: 4,
  },
  benefitsLabel: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  benefitsText: {
    color: '#D4D4D8',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  partnerCard: {
    width: PARTNER_CARD_WIDTH,
    marginBottom: 14,
  },
  partnerCardGradient: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'space-between',
  },
  partnerLogoContainer: {
    width: 90,
    height: 90,
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  partnerLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  placeholderPartnerLogo: {
    backgroundColor: '#422D1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  partnerName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 40,
    letterSpacing: -0.2,
  },
  mouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#052E1C',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  mouText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#27272A',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyText: {
    color: '#71717A',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: '#27272A',
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  modalLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  modalLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  modalMouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#052E1C',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  modalMouText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  modalDescription: {
    color: '#D4D4D8',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F97316',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
