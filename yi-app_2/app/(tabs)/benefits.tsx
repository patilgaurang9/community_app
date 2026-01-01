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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';

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
      {/* Left: Logo */}
      <View style={styles.offerLogoContainer}>
        {item.logo_url ? (
          <Image source={{ uri: item.logo_url }} style={styles.offerLogo} resizeMode="contain" />
        ) : (
          <View style={[styles.offerLogo, styles.placeholderLogo]}>
            <Ionicons name="storefront-outline" size={24} color="#52525B" />
          </View>
        )}
      </View>

      {/* Center: Title & Description */}
      <View style={styles.offerInfo}>
        <Text style={styles.offerTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.offerDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>

      {/* Right: Copy Code Button */}
      {item.code ? (
        <TouchableOpacity
          style={[
            styles.copyButton,
            copiedCodeId === item.id && styles.copyButtonCopied,
          ]}
          onPress={() => handleCopyCode(item.code!, item.id)}
        >
          <Text style={styles.copyButtonText}>
            {copiedCodeId === item.id ? 'Copied' : 'Copy Code'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.copyButtonDisabled}>
          <Text style={styles.copyButtonTextDisabled}>No Code</Text>
        </View>
      )}
    </View>
  );

  // Render Partners Grid Item
  const renderPartnerItem = ({ item }: { item: Benefit }) => (
    <TouchableOpacity
      style={styles.partnerCard}
      onPress={() => handlePartnerPress(item)}
      activeOpacity={0.8}
    >
      {/* Logo */}
      <View style={styles.partnerLogoContainer}>
        {item.logo_url ? (
          <Image source={{ uri: item.logo_url }} style={styles.partnerLogo} resizeMode="contain" />
        ) : (
          <View style={[styles.partnerLogo, styles.placeholderLogo]}>
            <Ionicons name="business-outline" size={32} color="#52525B" />
          </View>
        )}
      </View>

      {/* Organization Name */}
      <Text style={styles.partnerName} numberOfLines={2}>
        {item.organization_name || item.title}
      </Text>

      {/* MOU Badge */}
      <View style={styles.mouBadge}>
        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
        <Text style={styles.mouText}>MOU Signed</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading benefits...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      {/* Segmented Control Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, activeView === 'offers' && styles.toggleOptionActive]}
          onPress={() => setActiveView('offers')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, activeView === 'offers' && styles.toggleTextActive]}>
            Offers 🎁
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, activeView === 'partners' && styles.toggleOptionActive]}
          onPress={() => setActiveView('partners')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, activeView === 'partners' && styles.toggleTextActive]}>
            Partners 🤝
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeView === 'offers' ? (
        offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyTitle}>No Offers Available</Text>
            <Text style={styles.emptyText}>Check back soon for exclusive offers</Text>
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
            <Text style={styles.emptyIcon}>🤝</Text>
            <Text style={styles.emptyTitle}>No Partners Available</Text>
            <Text style={styles.emptyText}>Check back soon for partner information</Text>
          </View>
        ) : (
          <FlatList
            key={activeView}
            data={partners}
            renderItem={renderPartnerItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.partnersGrid}
            columnWrapperStyle={styles.partnersRow}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* Partner Details Modal */}
      <Modal
        visible={selectedPartner !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPartner(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {selectedPartner && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedPartner.organization_name || selectedPartner.title}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setSelectedPartner(null)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  {selectedPartner.logo_url && (
                    <Image source={{ uri: selectedPartner.logo_url }} style={styles.modalLogo} resizeMode="contain" />
                  )}
                  {selectedPartner.description && (
                    <Text style={styles.modalDescription}>{selectedPartner.description}</Text>
                  )}
                  {!selectedPartner.description && (
                    <Text style={styles.modalDescription}>
                      Partnership details coming soon. Contact us for more information.
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('AI Assistant', 'AI Assistant coming soon!')}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={24} color="#000000" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginTop: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#27272A',
  },
  toggleText: {
    color: '#71717A',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  offersList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 16,
  },
  offerLogoContainer: {
    width: 50,
    height: 50,
  },
  offerLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderLogo: {
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  offerDescription: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
  },
  copyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  copyButtonCopied: {
    backgroundColor: '#3F3F46',
  },
  copyButtonDisabled: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#27272A',
  },
  copyButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  copyButtonTextDisabled: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '600',
  },
  partnersGrid: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  partnersRow: {
    justifyContent: 'space-between',
    gap: 20,
  },
  partnerCard: {
    width: PARTNER_CARD_WIDTH,
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    minHeight: 180,
  },
  partnerLogoContainer: {
    width: 80,
    height: 80,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerLogo: {
    width: 80,
    height: 80,
  },
  partnerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 36,
  },
  mouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#27272A',
  },
  mouText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#18181B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalDescription: {
    color: '#D4D4D8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
