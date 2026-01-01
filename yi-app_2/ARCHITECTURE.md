# Members Tab - Component Architecture

## 📁 File Structure

```
yi-app_2/
├── app/
│   ├── (tabs)/
│   │   └── members.tsx              ← Main Members Feed Screen
│   └── member/
│       └── [id].tsx                 ← Dynamic Member Detail Screen
├── components/
│   ├── MemberCard.tsx               ← Reusable member list item
│   ├── FilterChip.tsx               ← Reusable filter chip
│   ├── ActionIconButton.tsx         ← Circular action button
│   ├── ScreenWrapper.tsx            (existing)
│   └── ui/
│       ├── Button.tsx               (existing)
│       └── Input.tsx                (existing)
├── lib/
│   ├── database.ts                  ← Extended with connection helpers
│   ├── supabase.ts                  (existing)
│   └── AuthContext.tsx              (existing)
└── supabase/
    └── connections_table.sql        ← Database schema
```

---

## 🎯 Screen 1: Members Feed (`app/(tabs)/members.tsx`)

### Component Tree
```
<ScreenWrapper>
  <View> (Header)
    <Text> Members
    <Text> N members
  
  <View> (Search Bar)
    <Ionicons> search icon
    <TextInput> Search input
    <Ionicons> clear icon (conditional)
  
  <ScrollView> (Filter Chips - horizontal)
    <FilterChip> All
    <FilterChip> Same City
    <FilterChip> Batch 2024
    <FilterChip> Engineering
    <FilterChip> Alumni
  
  <FlatList> (Members List)
    <MemberCard> (for each profile)
      <View> Avatar
      <View> Info
        <Text> Name
        <Text> Role @ Company
        <View> Tag + Mutual Connections
      <TouchableOpacity> Connect Button
```

### Key Features
- **Search**: Client-side filter across name, company, job title, skills, tags
- **Filters**: All, Same City, Batch 2024, Engineering, Alumni
- **State Management**:
  - `profiles` - All member profiles
  - `searchQuery` - Search input text
  - `activeFilter` - Current filter selection
  - `connectionStatuses` - Map of profile IDs to connection status
  - `connectingIds` - Set of IDs currently being connected

### Data Flow
```
useEffect → getAllProfiles() → Supabase
  ↓
Set profiles + fetch connection statuses for each
  ↓
Apply filters (activeFilter + searchQuery)
  ↓
Render filtered list
```

---

## 🎯 Screen 2: Member Detail (`app/member/[id].tsx`)

### Component Tree
```
<ScreenWrapper>
  <View> (Header)
    <TouchableOpacity> Back button
    <Text> Profile
  
  <ScrollView>
    <View> (Identity Header)
      <View> Large Avatar
      <Text> Full Name
      <Text> Role @ Company
      <View> Location
    
    <View> (Action Bar)
      <ActionIconButton> Call
      <ActionIconButton> WhatsApp
      <ActionIconButton> Email
      <ActionIconButton> LinkedIn
    
    <Button> Connect / Request Sent / Message
    
    <View> (About Section)
      <Text> Bio
      <TouchableOpacity> Read more (conditional)
    
    <View> (Vitals Grid 2x2)
      <View> Birthday card
      <View> Location card
      <View> Member Since card
      <View> Department card
    
    <View> (Skills & Tags)
      <View> Skill chip (multiple)
      <View> Tag chip (multiple)
```

### Key Features
- **Dynamic Route**: Receives member ID via `useLocalSearchParams()`
- **External Linking**: Uses `Linking.openURL()` for:
  - `tel:` for calls
  - `whatsapp://send?phone=` for WhatsApp
  - `mailto:` for email
  - Direct URL for LinkedIn
- **Conditional Rendering**:
  - Disable action buttons if data missing
  - Show/hide "Read more" based on bio length
  - Handle missing profile gracefully

### Data Flow
```
useEffect → getProfile(id) + getConnectionStatus(id)
  ↓
Set profile + connectionStatus
  ↓
Render detail view
  ↓
User taps Connect → createConnectionRequest()
  ↓
Update local state → Show "Request Sent"
```

---

## 🗄️ Database Layer (`lib/database.ts`)

### Interfaces
```typescript
Profile {
  id, full_name, email, location, job_title, company, industry,
  dob, phone_number, bio, skills[], tags[], linkedin_url,
  whatsapp_number, member_since, batch, department, avatar_url,
  created_at, updated_at
}

Connection {
  id, requester_id, receiver_id, status, created_at
}
```

### Functions Added
```typescript
getAllProfiles()              → Profile[]
getConnectionStatus(userId)   → 'none' | 'pending' | 'connected'
createConnectionRequest(id)   → { success, error? }
getUserConnections()          → Connection[]
deleteConnection(id)          → { success, error? }
```

---

## 🎨 Reusable Components

### 1. MemberCard
**Props:**
- `profile: Profile`
- `connectionStatus: 'none' | 'pending' | 'connected'`
- `onPress: () => void` - Navigate to detail
- `onConnect: () => void` - Send connection request
- `isConnecting?: boolean` - Loading state

**Features:**
- Avatar with initials fallback
- Name, role, company
- Primary tag (first from tags array)
- Mocked mutual connections
- Connect button with 3 states

---

### 2. FilterChip
**Props:**
- `label: string`
- `isActive: boolean`
- `onPress: () => void`

**Styling:**
- Inactive: Gray background
- Active: White background, black text

---

### 3. ActionIconButton
**Props:**
- `iconName: keyof typeof Ionicons.glyphMap`
- `onPress: () => void`
- `disabled?: boolean`

**Features:**
- Circular button (56x56)
- Ionicon with 24px size
- Disabled state (grayed out)

---

## 🔄 Navigation Flow

```
┌─────────────────────────────────────────┐
│  Members Feed                           │
│  (/(tabs)/members)                      │
│                                         │
│  [Search Bar]                           │
│  [Filter Chips]                         │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ MemberCard                       │  │
│  │  [Avatar] Name                   │  │
│  │           Role @ Company         │  │
│  │           #Tag • 12 Mutual      │  │────Tap Card───┐
│  │                    [Connect] │  │  │              │
│  └──────────────────────────────────┘  │              │
│  ┌──────────────────────────────────┐  │              │
│  │ MemberCard                       │  │              │
│  └──────────────────────────────────┘  │              │
└─────────────────────────────────────────┘              │
                                                         │
                                                         ▼
                              ┌─────────────────────────────────────────┐
                              │  Member Detail                          │
                              │  (/member/[id])                         │
                              │                                         │
                              │       [← Back]     Profile              │
                              │                                         │
                              │          [Large Avatar]                 │
                              │          Full Name                      │
                              │          Role @ Company                 │
                              │          📍 Location                     │
                              │                                         │
                              │     📞   💬   ✉️   🔗                  │
                              │                                         │
                              │     [Connect / Request Sent]            │
                              │                                         │
                              │     About                               │
                              │     Bio text... Read more               │
                              │                                         │
                              │     Details                             │
                              │     [Birthday]  [Location]              │
                              │     [Member Since] [Department]         │
                              │                                         │
                              │     Skills & Interests                  │
                              │     [Tag] [Tag] [Tag]                  │
                              └─────────────────────────────────────────┘
```

---

## 🔐 Database Schema

### Table: `connections`

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'connected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_self_connections 
    CHECK (requester_id != receiver_id),
  
  CONSTRAINT unique_connection 
    UNIQUE (LEAST(requester_id, receiver_id), 
            GREATEST(requester_id, receiver_id))
);
```

**Key Constraints:**
- ✅ Prevent self-connections
- ✅ Only ONE row per user pair (bidirectional uniqueness)
- ✅ Cascade delete when profile is deleted
- ✅ RLS policies for privacy

---

## 🚀 Usage Example

### 1. Setup Database
```bash
# In Supabase SQL Editor, run:
# supabase/connections_table.sql
```

### 2. Run App
```bash
cd yi-app_2
npm start
```

### 3. Test Flow
1. Open Members tab
2. See list of all members (excluding self)
3. Use search: Type "engineer"
4. Use filter: Tap "Engineering"
5. Tap a member card → Navigate to detail
6. View profile details
7. Tap "Connect" → Changes to "Request Sent"
8. Tap WhatsApp icon → Opens WhatsApp (if number exists)
9. Tap back button → Return to Members list

---

## 📊 State Management

### Members Feed State
```typescript
profiles: Profile[]                                    // All profiles from DB
searchQuery: string                                    // Search input
activeFilter: FilterType                               // Current filter
connectionStatuses: Record<string, ConnectionStatus>   // Map of statuses
connectingIds: Set<string>                            // Currently connecting
```

### Member Detail State
```typescript
profile: Profile | null                                // Current profile
connectionStatus: ConnectionStatus                     // Connection state
isConnecting: boolean                                  // Request in progress
showFullBio: boolean                                   // Bio expanded/collapsed
```

---

## 🎨 Design System

### Colors
```typescript
Background:     #000000 (black)
Surface:        #18181B
Border:         #27272A, #3F3F46
Text Primary:   #FFFFFF
Text Secondary: #A1A1AA
Text Tertiary:  #71717A

Accent:         #F59E0B (amber - tags)
Success:        #10B981 (green - connected)
Warning:        #F59E0B (amber - pending)
Info:           #3B82F6 (blue)
Purple:         #8B5CF6
```

### Typography
```typescript
Title:      28px, bold
Subtitle:   16px, regular
Name:       16-28px, bold
Body:       14-16px, regular
Caption:    12-14px, regular
```

### Spacing
```typescript
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  20px
2xl: 24px
3xl: 32px
```

---

## ✅ Complete Implementation

All components, screens, and database logic have been implemented according to specifications. The Members tab is fully functional with:
- ✅ Search and filters
- ✅ Connection requests
- ✅ Master-detail navigation
- ✅ External contact actions
- ✅ Optimistic UI updates
- ✅ Error handling
- ✅ Loading states
- ✅ Pull-to-refresh

