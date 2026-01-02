import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  category?: string;
  data?: any[];
  timestamp: Date;
}

interface MemberData {
  id: string;
  full_name: string;
  company?: string;
  job_title?: string;
  industry?: string;
  location?: string;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location_name?: string;
  category?: string;
}

interface OfferData {
  id: string;
  title: string;
  description?: string;
  code?: string;
  expiration_date?: string;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatModal({ visible, onClose }: ChatModalProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hi! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (visible) {
      scrollToBottom();
    }
  }, [messages, visible]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch('http://192.168.29.172:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        category: data.category,
        data: data.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberCard = (member: MemberData) => (
    <TouchableOpacity 
      key={member.id} 
      style={styles.memberCard}
      onPress={() => {
        onClose();
        router.push(`/member/${member.id}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{member.full_name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.memberName}>{member.full_name}</Text>
          {member.job_title && <Text style={styles.memberJobTitle}>{member.job_title}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#71717A" />
      </View>
      <View style={styles.cardDetails}>
        {member.company && (
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color="#71717A" />
            <Text style={styles.detailText}>{member.company}</Text>
          </View>
        )}
        {member.industry && (
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={14} color="#71717A" />
            <Text style={styles.detailText}>{member.industry}</Text>
          </View>
        )}
        {member.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#71717A" />
            <Text style={styles.detailText}>{member.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEventCard = (event: EventData) => (
    <TouchableOpacity 
      key={event.id} 
      style={styles.eventCard}
      onPress={() => {
        onClose();
        router.push(`/event/${event.id}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons name="calendar" size={22} color="#F97316" />
        </View>
        <View style={styles.eventHeaderText}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.category && <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#71717A" />
      </View>
      {event.description && <Text style={styles.eventDescription}>{event.description}</Text>}
      <View style={styles.eventDetails}>
        {event.start_time && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#71717A" />
            <Text style={styles.detailText}>
              {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        )}
        {event.location_name && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#71717A" />
            <Text style={styles.detailText}>{event.location_name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderOfferCard = (offer: OfferData) => (
    <View key={offer.id} style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.offerIconContainer}>
          <Ionicons name="pricetag" size={20} color="#10B981" />
        </View>
        <Text style={styles.offerTitle}>{offer.title}</Text>
      </View>
      {offer.description && <Text style={styles.offerDescription}>{offer.description}</Text>}
      {offer.code && (
        <View style={styles.promoCodeContainer}>
          <View style={styles.promoCodeBox}>
            <Text style={styles.promoCodeLabel}>PROMO CODE</Text>
            <Text style={styles.promoCode}>{offer.code}</Text>
          </View>
          <Ionicons name="copy-outline" size={18} color="#71717A" />
        </View>
      )}
      {offer.expiration_date && (
        <View style={styles.expirationContainer}>
          <Ionicons name="time-outline" size={12} color="#EF4444" />
          <Text style={styles.expirationText}>
            Expires {new Date(offer.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      )}
    </View>
  );

  const renderMessage = (item: Message) => {
    const isUser = item.type === 'user';
    const hasData = !isUser && item.data && item.data.length > 0;
    
    return (
      <View
        key={item.id}
        style={[styles.messageContainer, isUser && styles.userMessageContainer]}
      >
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.assistantBubble,
          hasData && styles.assistantBubbleWithData
        ]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
          
          {hasData && item.data && (
            <View style={styles.dataContainer}>
              {item.category === 'members' && item.data.map(renderMemberCard)}
              {item.category === 'events' && item.data.map(renderEventCard)}
              {item.category === 'offers' && item.data.map(renderOfferCard)}
            </View>
          )}
        </View>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="sparkles" size={20} color="#F97316" />
              </View>
              <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={28} color="#71717A" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(renderMessage)}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#F97316" size="small" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask me anything..."
                placeholderTextColor="#71717A"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={inputText.trim() && !isLoading ? '#FFFFFF' : '#71717A'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#27272A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#422D1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  assistantBubble: {
    backgroundColor: '#18181B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  assistantBubbleWithData: {
    maxWidth: '100%',
    width: '100%',
  },
  userBubble: {
    backgroundColor: '#F97316',
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: '#E4E4E7',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timestamp: {
    color: '#52525B',
    fontSize: 11,
    marginTop: 6,
    marginLeft: 8,
    fontWeight: '500',
  },
  userTimestamp: {
    marginRight: 8,
    marginLeft: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#27272A',
    shadowOpacity: 0,
  },
  dataContainer: {
    marginTop: 14,
    gap: 10,
    width: '100%',
  },
  // Member Card Styles
  memberCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  cardHeaderText: {
    flex: 1,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberJobTitle: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  // Event Card Styles
  eventCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  eventIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#422D1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F97316',
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventDescription: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  // Offer Card Styles
  offerCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  offerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#052E1C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  offerDescription: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  promoCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  promoCodeBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#27272A',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0A0A0A',
  },
  promoCodeLabel: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  promoCode: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expirationText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
