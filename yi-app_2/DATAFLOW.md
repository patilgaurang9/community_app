# Members Tab - Data Flow & State Management

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE DATABASE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐              ┌──────────────────────┐           │
│  │   profiles table     │              │  connections table   │           │
│  ├──────────────────────┤              ├──────────────────────┤           │
│  │ • id                 │              │ • id                 │           │
│  │ • full_name          │              │ • requester_id ────┐ │           │
│  │ • email              │              │ • receiver_id ─────┼─┼─┐         │
│  │ • job_title          │◄─────────────┤ • status          │ │ │         │
│  │ • company            │     FK       │ • created_at      │ │ │         │
│  │ • location           │              └───────────────────┼─┼─┘         │
│  │ • bio                │                                  │ │           │
│  │ • skills[]           │                                  │ │           │
│  │ • tags[]             │◄─────────────────────────────────┘ │           │
│  │ • phone_number       │            Foreign Keys            │           │
│  │ • whatsapp_number    │                                    │           │
│  │ • linkedin_url       │                                    │           │
│  │ • batch              │                                    │           │
│  │ • department         │                                    │           │
│  └──────────────────────┘                                    │           │
│                                                                │           │
└────────────────────────────────────────────────────────────────┼───────────┘
                                                                 │
                                                                 │
                          ┌──────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────────────┐
         │        lib/database.ts (Data Layer)            │
         ├────────────────────────────────────────────────┤
         │                                                │
         │  Profile Queries:                             │
         │  • getAllProfiles()        → Profile[]        │
         │  • getProfile(id)          → Profile          │
         │  • getCurrentUserProfile() → Profile          │
         │                                                │
         │  Connection Queries:                          │
         │  • getConnectionStatus(id) → Status           │
         │  • createConnectionRequest(id) → Result       │
         │  • getUserConnections()    → Connection[]     │
         │  • deleteConnection(id)    → Result           │
         │                                                │
         └────────────────────────────────────────────────┘
                          │
                          │
        ┌─────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌───────────────────────────────┐  ┌──────────────────────────────┐
│  Members Feed Screen          │  │  Member Detail Screen        │
│  app/(tabs)/members.tsx       │  │  app/member/[id].tsx         │
├───────────────────────────────┤  ├──────────────────────────────┤
│                               │  │                              │
│  STATE:                       │  │  STATE:                      │
│  • profiles: Profile[]        │  │  • profile: Profile          │
│  • searchQuery: string        │  │  • connectionStatus: Status  │
│  • activeFilter: FilterType   │  │  • isConnecting: boolean     │
│  • connectionStatuses: Map    │  │  • showFullBio: boolean      │
│  • connectingIds: Set         │  │                              │
│                               │  │  ACTIONS:                    │
│  ACTIONS:                     │  │  • fetchMemberData()         │
│  • fetchProfiles()            │  │  • handleConnect()           │
│  • handleConnect(id)          │  │  • handleCall()              │
│  • handleMemberPress(id)      │  │  • handleWhatsApp()          │
│  • handleRefresh()            │  │  • handleEmail()             │
│                               │  │  • handleLinkedIn()          │
│  DERIVED STATE:               │  │                              │
│  • filteredByFilter           │  │  DERIVED STATE:              │
│  • filteredProfiles           │  │  • connectionButtonText      │
│                               │  │  • isButtonDisabled          │
└───────────────────────────────┘  └──────────────────────────────┘
        │                                     ▲
        │ router.push(/member/[id])           │
        └─────────────────────────────────────┘
                                      router.back()
```

---

## 📊 State Flow: Members Feed

### Initial Load
```
[Component Mount]
        ↓
useEffect(() => fetchProfiles(), [])
        ↓
getAllProfiles() → Supabase query
        ↓
setProfiles(data)
        ↓
for each profile:
  getConnectionStatus(profile.id)
        ↓
setConnectionStatuses(statuses)
        ↓
[Render with data]
```

### Search Flow
```
[User types in search box]
        ↓
setSearchQuery(text)
        ↓
useMemo re-computes filteredProfiles
        ↓
Filters profiles where:
  name.includes(query) ||
  company.includes(query) ||
  skills.includes(query) ||
  tags.includes(query)
        ↓
[Re-render with filtered list]
```

### Filter Flow
```
[User taps filter chip]
        ↓
setActiveFilter(filterType)
        ↓
useMemo re-computes filteredByFilter
        ↓
Switch on filterType:
  'all' → return all
  'same_city' → filter by location
  'batch_2024' → filter by batch
  'engineering' → filter by industry
  'alumni' → filter by tags
        ↓
useMemo applies search on filtered
        ↓
[Re-render with filtered list]
```

### Connect Flow
```
[User taps Connect button]
        ↓
handleConnect(profileId)
        ↓
setConnectingIds(add profileId)  ← Optimistic UI
        ↓
createConnectionRequest(profileId)
        ↓
Supabase INSERT into connections
        ↓
setConnectionStatuses(update to 'pending')
        ↓
setConnectingIds(remove profileId)
        ↓
[Re-render with updated status]
```

---

## 📊 State Flow: Member Detail

### Initial Load
```
[Component Mount with id param]
        ↓
useEffect(() => fetchMemberData(), [id])
        ↓
┌─────────────────────┬──────────────────────┐
│                     │                      │
getProfile(id)  getConnectionStatus(id)
│                     │                      │
└─────────────────────┴──────────────────────┘
        ↓
setProfile(data) + setConnectionStatus(status)
        ↓
[Render detail view]
```

### Connect Flow
```
[User taps Connect button]
        ↓
handleConnect()
        ↓
setIsConnecting(true)  ← Show loading
        ↓
createConnectionRequest(id)
        ↓
Supabase INSERT into connections
        ↓
Success:
  setConnectionStatus('pending')
  Alert.alert('Success')
        ↓
Failure:
  Alert.alert('Error')
        ↓
setIsConnecting(false)
        ↓
[Re-render with updated button]
```

### Contact Action Flow
```
[User taps action button]
        ↓
handleCall() / handleWhatsApp() / etc.
        ↓
Check if data exists (phone, email, etc)
        ↓
Yes: Linking.openURL(scheme://data)
        ↓
  Opens native app:
    • Phone app (tel:)
    • WhatsApp (whatsapp://send)
    • Email app (mailto:)
    • Browser (https://)
        ↓
No: Alert.alert('Not Available')
```

---

## 🎯 Component Hierarchy

```
App Root (_layout.tsx)
  │
  └── AuthProvider (AuthContext)
        │
        ├── Index (Landing)
        ├── Login
        ├── Signup
        │
        └── Tabs Layout (/(tabs)/_layout.tsx)
              │
              ├── Home
              ├── Updates
              ├── Benefits
              │
              └── Members Tab ◄─────────────── YOU ARE HERE
                    │
                    ├── ScreenWrapper
                    │     │
                    │     ├── Header (Title + Count)
                    │     │
                    │     ├── Search Bar
                    │     │     ├── Ionicons (search)
                    │     │     ├── TextInput
                    │     │     └── Ionicons (clear)
                    │     │
                    │     ├── Filter Chips (ScrollView horizontal)
                    │     │     ├── FilterChip (All)
                    │     │     ├── FilterChip (Same City)
                    │     │     ├── FilterChip (Batch 2024)
                    │     │     ├── FilterChip (Engineering)
                    │     │     └── FilterChip (Alumni)
                    │     │
                    │     └── Members List (FlatList)
                    │           └── MemberCard (for each)
                    │                 ├── Avatar
                    │                 ├── Info Section
                    │                 │     ├── Name
                    │                 │     ├── Role @ Company
                    │                 │     └── Tag + Mutual
                    │                 └── Connect Button
                    │
                    └── [Navigation to Member Detail]
                          │
                          └── Member Detail (/member/[id].tsx)
                                │
                                └── ScreenWrapper
                                      ├── Header (Back + Title)
                                      │
                                      └── ScrollView
                                            ├── Identity Header
                                            │     ├── Avatar (large)
                                            │     ├── Name
                                            │     ├── Headline
                                            │     └── Location
                                            │
                                            ├── Action Bar
                                            │     ├── ActionIconButton (Call)
                                            │     ├── ActionIconButton (WhatsApp)
                                            │     ├── ActionIconButton (Email)
                                            │     └── ActionIconButton (LinkedIn)
                                            │
                                            ├── Connection Button
                                            │     └── Button (Connect/Pending/Message)
                                            │
                                            ├── About Section
                                            │     ├── Bio text
                                            │     └── Read more toggle
                                            │
                                            ├── Vitals Grid (2x2)
                                            │     ├── Birthday card
                                            │     ├── Location card
                                            │     ├── Member Since card
                                            │     └── Department card
                                            │
                                            └── Skills & Tags
                                                  ├── Skill chips
                                                  └── Tag chips
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────┐
│              AuthContext (Global)                │
├──────────────────────────────────────────────────┤
│  STATE:                                          │
│  • user: User | null                             │
│  • session: Session | null                       │
│  • isLoading: boolean                            │
│                                                  │
│  EFFECT:                                         │
│  • supabase.auth.getSession()                    │
│  • supabase.auth.onAuthStateChange()             │
└──────────────────────────────────────────────────┘
                    │
                    │ Provides user context
                    ▼
┌──────────────────────────────────────────────────┐
│           Members Feed Component                 │
├──────────────────────────────────────────────────┤
│  const { user } = useAuth()                      │
│                                                  │
│  Uses user.id to:                                │
│  • Exclude own profile from list                 │
│  • Check connection status                       │
│  • Create connection requests                    │
└──────────────────────────────────────────────────┘
```

---

## 💾 Data Persistence

### Profiles (Existing)
```
profiles table
  ↓ RLS policies
Only authenticated users can read
  ↓
getAllProfiles() fetches all except current user
  ↓
Cached in component state
  ↓
Client-side filtering (search + filters)
```

### Connections (New)
```
connections table
  ↓ RLS policies
Users can only see connections they're part of
  ↓
getConnectionStatus(id) checks for row where:
  (requester_id = currentUser AND receiver_id = id) OR
  (requester_id = id AND receiver_id = currentUser)
  ↓
Returns: 'none' | 'pending' | 'connected'
  ↓
Cached in connectionStatuses map
```

---

## 🔄 Optimistic UI Pattern

### Connect Button Flow
```
[User Action]
  ↓
1. Immediately update UI (optimistic)
   setConnectionStatuses({ ...prev, [id]: 'pending' })
   Button shows "Request Sent"
  ↓
2. Make API call
   createConnectionRequest(id)
  ↓
3a. Success: Keep optimistic state
  ↓
3b. Failure: Revert state + show error
   setConnectionStatuses({ ...prev, [id]: 'none' })
   Alert.alert('Error')
```

**Benefits:**
- Instant feedback (no loading spinner)
- Better UX
- Handles network latency gracefully

---

## 🎨 Styling Architecture

```
┌──────────────────────────────────────────┐
│         Design System Constants          │
├──────────────────────────────────────────┤
│  Colors:                                 │
│    • Background: #000000                 │
│    • Surface: #18181B, #27272A, #3F3F46  │
│    • Text: #FFFFFF, #A1A1AA, #71717A     │
│    • Accent: #F59E0B                     │
│    • Status: #10B981, #F59E0B, #3B82F6   │
│                                          │
│  Typography:                             │
│    • Title: 28px bold                    │
│    • Subtitle: 16px regular              │
│    • Body: 14-16px regular               │
│                                          │
│  Spacing:                                │
│    • Base unit: 4px                      │
│    • Scale: 4, 8, 12, 16, 20, 24, 32     │
│                                          │
│  Border Radius:                          │
│    • Chip: 20px                          │
│    • Card: 12px                          │
│    • Button: 8-12px                      │
│    • Avatar: 50% (circle)                │
└──────────────────────────────────────────┘
              │
              │ Applied to
              ▼
┌──────────────────────────────────────────┐
│          Component Styles                │
├──────────────────────────────────────────┤
│  Each component has:                     │
│    const styles = StyleSheet.create({    │
│      container: { ... },                 │
│      text: { ... },                      │
│    })                                    │
│                                          │
│  Follows consistent patterns:           │
│    • Dark theme                          │
│    • High contrast                       │
│    • Accessible touch targets (44px min) │
│    • Safe area handling                  │
└──────────────────────────────────────────┘
```

---

## 🚀 Performance Optimizations

### 1. Client-Side Filtering
```
✅ Fetch once, filter in-memory
❌ NOT: New API call for each filter/search
```

### 2. useMemo for Expensive Computations
```typescript
const filteredProfiles = useMemo(() => {
  // Only re-compute when dependencies change
}, [profiles, searchQuery, activeFilter])
```

### 3. FlatList for Long Lists
```typescript
<FlatList
  data={filteredProfiles}
  keyExtractor={(item) => item.id}
  // Efficient rendering of large lists
/>
```

### 4. Optimistic UI Updates
```typescript
// Update UI before API response
setConnectionStatuses(prev => ({ ...prev, [id]: 'pending' }))
// Then make API call
```

---

## 🔍 Error Handling

### Network Errors
```
API call fails
  ↓
Catch in try/catch
  ↓
Log to console
  ↓
Show user-friendly alert
  ↓
Revert optimistic changes
```

### Missing Data
```
Action requires data (phone, email)
  ↓
Check if data exists
  ↓
No: Disable button + show alert if tapped
Yes: Execute action
```

### Invalid Routes
```
/member/[id] with invalid/missing id
  ↓
getProfile(id) returns null
  ↓
Show error screen with "Go Back" button
```

---

## ✅ Complete Implementation Checklist

- [x] Database schema created
- [x] RLS policies configured
- [x] Profile interface extended
- [x] Connection interface created
- [x] Database helpers implemented
- [x] MemberCard component
- [x] FilterChip component
- [x] ActionIconButton component
- [x] Members feed screen
- [x] Member detail screen
- [x] Search functionality
- [x] Filter functionality
- [x] Connection requests
- [x] Direct contact actions
- [x] Navigation flow
- [x] Error handling
- [x] Loading states
- [x] Empty states
- [x] Pull-to-refresh
- [x] Optimistic UI
- [x] TypeScript types
- [x] Documentation

**All requirements met! 🎉**

