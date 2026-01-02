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
      content: "👋 Hi! I'm your AI assistant.\n\nI can help you with:\n• General questions\n• Find members by company, industry, or field\n• Search for events (recent, upcoming, or by date)\n• Discover offers and benefits\n\nWhat would you like to explore today?",
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
      // Replace with your backend URL
      const response = await fetch('http://192.168.29.172:5000/api/chat', {
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
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
      onPress={() => router.push(`/event/${event.id}`)}
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
    backgroundColor: '#000000',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
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
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
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
    color: '#D4D4D8',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
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
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  eventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#422D1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventDescription: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
    fontWeight: '500',
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
    marginBottom: 10,
    gap: 12,
  },
  offerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#052E1C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
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
    marginTop: 24,
  },
  quickQuestionsTitle: {
    color: '#71717A',
    fontSize: 14,
    marginBottom: 14,
    fontWeight: '600',
  },
  quickQuestionButton: {
    backgroundColor: '#18181B',
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
    fontWeight: '500',
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
});


