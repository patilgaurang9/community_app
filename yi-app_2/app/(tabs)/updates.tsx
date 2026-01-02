import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';

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

export default function Updates() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. You can ask me:\n\n• General questions\n• Find members by company, industry, or field\n• Search for events (recent, upcoming, or by date)\n• Discover offers and benefits\n\nHow can I help you today?",
      timestamp: new Date()
    }
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
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // ✅ UPDATED IP ADDRESS HERE
      const response = await fetch('http://192.168.31.185:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content
        })
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
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I cannot connect to the server. Please ensure your phone is on the same Wi-Fi as your computer (192.168.31.185).',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberCard = (member: MemberData) => (
    <TouchableOpacity 
      key={member.id} 
      style={styles.memberCard}
      onPress={() => router.push(`/member/${member.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{member.full_name ? member.full_name.charAt(0).toUpperCase() : '?'}</Text>
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
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons name="calendar" size={20} color="#3B82F6" />
        </View>
        <View style={styles.eventHeaderText}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.category && <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#71717A" />
      </View>
      {event.description && <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>}
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    const hasData = !isUser && item.data && item.data.length > 0;

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.assistantBubble,
          hasData && styles.assistantBubbleWithData
        ]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
          
          {/* Render data cards if available */}
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

  const quickQuestions = [
    "Find members in tech industry",
    "Show upcoming events",
    "What offers are available?",
    "Find members at Microsoft"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <ScreenWrapper style={styles.screenWrapper}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />

          {/* Quick Questions */}
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Try asking:</Text>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#A1A1AA" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
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
              size={20} 
              color={inputText.trim() && !isLoading ? '#FFFFFF' : '#71717A'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  assistantBubble: {
    backgroundColor: '#1F1F23',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  assistantBubbleWithData: {
    maxWidth: '95%',
    width: '95%',
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: '#E4E4E7',
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 8,
  },
  userTimestamp: {
    marginRight: 8,
    marginLeft: 0,
  },
  dataContainer: {
    marginTop: 16,
    gap: 12,
    width: '100%',
  },
  // Member Card Styles
  memberCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 14,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
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
    color: '#D4D4D8',
    fontSize: 13,
    flex: 1,
  },
  // Event Card Styles
  eventCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventDescription: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  // Offer Card Styles
  offerCard: {
    backgroundColor: '#1A1A1D',
    borderRadius: 12,
    padding: 14,
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
    fontWeight: '600',
    flex: 1,
  },
  offerDescription: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  quickQuestionsContainer: {
    marginTop: 20,
  },
  quickQuestionsTitle: {
    color: '#A1A1AA',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  quickQuestionButton: {
    backgroundColor: '#1F1F23',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  quickQuestionText: {
    color: '#E4E4E7',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    backgroundColor: '#0A0A0B',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1F1F23',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#27272A',
    shadowOpacity: 0,
  },
});

