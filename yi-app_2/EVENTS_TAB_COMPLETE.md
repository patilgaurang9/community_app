# ✅ Events Tab (Home Feed) - Complete Implementation

## 🎯 Overview

The Events tab has been completely implemented as the Home Feed with featured hero carousel, upcoming events list, search, and filter functionality.

---

## 📐 LAYOUT STRUCTURE

```
┌──────────────────────────────────────────────────────┐
│  [ 🔍 Search events, hosts...    ] [ ⚙️ ]           │  ← Sticky Header
├──────────────────────────────────────────────────────┤
│  Featured Events                                     │
│  ◄─ [Large Hero Card] [Hero Card] [Hero Card] ─►   │  ← Horizontal Scroll
│                                                      │
│  Upcoming Events                        + Host Event │
│  ┌──────────────────────────────────────────────┐  │
│  │ JAN    Event Title                 [Image]   │  │
│  │ 20     Location                              │  │
│  │        👤👤👤 12+ going                      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ FEB    Another Event               [Image]   │  │
│  │ 15     Venue Name                            │  │
│  │        👤👤👤 25+ going                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│                                          [  +  ]    │  ← FAB
└──────────────────────────────────────────────────────┘
```

---

## 1️⃣ STICKY HEADER

### Components
**Search Bar (Flex: 1)**
- Rounded text input
- Placeholder: "Search events, hosts..."
- Real-time local filtering
- Clear button (X) when typing

**Filter Button (Square)**
- Icon: Options/Sliders
- Behavior: Shows alert (placeholder)
- Future: Date range filtering

### Styling
```css
Background: #18181B
Border: #27272A
Height: 50px
Gap: 12px
```

---

## 2️⃣ FEATURED EVENTS (Hero Carousel)

### Layout
- Horizontal ScrollView
- Only shows events where `is_featured = true`
- Aspect Ratio: 16:9
- Full-width cards with margin

### Card Design
```
┌─────────────────────────────────┐
│                                 │
│   [Full Background Image]       │
│                                 │
│   ┌─────────────────────────┐  │
│   │ Event Title (Bold)      │  │  ← Gradient Overlay
│   │ Date & Time             │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘
```

### Features
- Image background or placeholder
- Dark gradient overlay (rgba(0,0,0,0.6))
- White title text (22px, bold)
- Date at bottom left
- Tappable → Navigate to `/event/[id]`

---

## 3️⃣ UPCOMING EVENTS (Main Feed)

### Section Header
- Left: "Upcoming Events" (title)
- Right: "+ Host Event" (button)

### Event Card Structure
```
┌────────────────────────────────────────┐
│  ┌────┐  Event Title         ┌──────┐ │
│  │JAN │  📍 Location          │Image │ │
│  │ 20 │  👤👤👤 12+ going      │      │ │
│  └────┘                        └──────┘ │
└────────────────────────────────────────┘
```

### Components

**Left: Date Badge (60px wide)**
```css
Background: #27272A
Border Radius: 8px
Month: Uppercase, Amber (#F59E0B), 12px
Day: White, 24px, Bold
```

**Center: Event Info (Flex: 1)**
- Title: White, 16px, Semi-bold
- Location: Icon + Text, Gray
- Social Proof: Avatar stack + "N+ going"

**Right: Thumbnail (80x80px)**
- Square with rounded corners
- Image or placeholder icon

### Social Proof
- 3 overlapping circular avatars
- Person icons as placeholders
- Text: "{count}+ going"

---

## 4️⃣ DATA LOGIC

### Tables
**events**
```typescript
{
  id: UUID
  title: string
  description?: string
  category?: string
  start_time: timestamp
  end_time: timestamp
  location?: string
  image_url?: string
  is_featured: boolean
  host_id?: UUID
}
```

**event_rsvps**
```typescript
{
  id: UUID
  event_id: UUID (FK)
  user_id: UUID (FK)
  status: 'going' | 'interested' | 'not_going'
}
```

### Data Flow
```
1. Fetch all events from 'events' table
   ↓
2. Fetch all RSVPs where status = 'going'
   ↓
3. Count RSVPs per event
   ↓
4. Attach rsvp_count to each event
   ↓
5. Filter out past events (end_time < now)
   ↓
6. Split into featured and regular
   ↓
7. Apply search filter if query exists
   ↓
8. Render
```

### Filtering Logic
```typescript
// Past events excluded
const now = new Date();
events.filter(event => new Date(event.end_time) > now)

// Featured events
events.filter(event => event.is_featured)

// Search filter
events.filter(event => 
  event.title.includes(query) || 
  event.category.includes(query)
)
```

---

## 5️⃣ INTERACTIONS

### Event Card Tap
```typescript
onPress={() => router.push(`/event/${eventId}`)}
```
Navigates to `/event/[id]` detail screen

### Search
- Real-time local filtering
- Searches: Title, Category
- Case-insensitive
- Clear button appears when typing

### Filter Button
- Placeholder: Shows alert
- Future: Date range picker

### Host Event Button
- Location: Section header (top right)
- Also available as: FAB (bottom right)
- Placeholder: Shows alert
- Future: Create event form

### Pull to Refresh
- Standard iOS/Android pattern
- Refetches events and RSVPs
- Updates counts

---

## 6️⃣ FLOATING ACTION BUTTON (FAB)

### Design
```css
Position: Absolute bottom-right
Size: 56x56px
Background: #FFFFFF (white)
Icon: Plus (+), 28px, Black
Border Radius: 28px (circle)
Shadow: Elevated
```

### Behavior
- Tappable
- Shows "Host Event" alert
- Future: Navigate to create event form

---

## 7️⃣ EMPTY STATES

### No Events
```
📅
No Events Found

Check back soon for upcoming events
```

### No Search Results
```
📅
No Events Found

Try adjusting your search
```

---

## 8️⃣ DATE FORMATTING

### Date Badge
```typescript
Month: Short uppercase (JAN, FEB, MAR)
Day: Numeric (1, 15, 28)
```

### Featured Card Date
```typescript
Format: "Wed, Jan 20, 3:00 PM"
Example: "Fri, Feb 15, 6:30 PM"
```

### Implementation
```typescript
const formatDateBadge = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { 
    month: 'short' 
  }).toUpperCase();
  const day = date.getDate();
  return { month, day };
};
```

---

## 9️⃣ STYLING SPECIFICATIONS

### Colors
```css
Background:        #000000
Card Surface:      #18181B
Card Border:       #27272A
Date Badge BG:     #27272A
Date Month Color:  #F59E0B (amber)
Text Primary:      #FFFFFF
Text Secondary:    #A1A1AA
Text Tertiary:     #71717A
Avatar BG:         #3F3F46
```

### Typography
```css
Featured Title:    22px, Bold, White
Section Title:     20px, Bold, White
Event Title:       16px, Semi-bold, White
Location Text:     13px, Regular, Gray
Social Proof:      12px, Medium, Gray
Date Month:        12px, Bold, Amber
Date Day:          24px, Bold, White
```

### Spacing
```css
Card Padding:      16px
Card Margin:       12px bottom
Section Margin:    24px
Header Padding:    16px
```

---

## 🔟 ASSETS & ICONS

### Icons Used (Ionicons)
```
search           → Search bar
close-circle     → Clear search
options-outline  → Filter button
calendar         → Event placeholder
location-outline → Location pin
person           → Avatar placeholder
image-outline    → Thumbnail placeholder
add              → FAB icon
arrow-back       → Back button
```

### Image Handling
```typescript
// If image_url exists
<Image source={{ uri: event.image_url }} />

// Fallback placeholder
<View style={placeholderStyle}>
  <Ionicons name="calendar" />
</View>
```

---

## 📋 SQL SETUP

### Location
File: `yi-app_2/supabase/events_tables.sql`

### Tables Created
1. **events** - Event information
2. **event_rsvps** - RSVP tracking

### Features
- Proper foreign keys
- RLS policies
- Indexes for performance
- Unique RSVP constraint
- Cascade delete

### Run in Supabase
```sql
-- Copy contents of events_tables.sql
-- Paste in Supabase SQL Editor
-- Click "Run"
```

---

## 🔄 COMPLETE USER FLOW

### Scenario 1: Browse Featured Events
```
1. Open app → Home (Events) tab
2. See "Featured Events" carousel
3. Swipe horizontally to browse
4. Tap featured card
5. Navigate to event detail
```

### Scenario 2: Browse Upcoming Events
```
1. Scroll down past featured section
2. See "Upcoming Events" list
3. Tap event card
4. Navigate to event detail
```

### Scenario 3: Search Events
```
1. Tap search bar
2. Type "networking"
3. List filters in real-time
4. See matching events only
5. Tap X to clear search
6. See all events again
```

### Scenario 4: Host Event
```
1. Tap "+ Host Event" in header
   OR
   Tap FAB (+ button)
2. See "Create event" alert
3. (Future: Navigate to create form)
```

### Scenario 5: Filter by Date
```
1. Tap filter button (sliders icon)
2. See "Date Filter" alert
3. (Future: Select date range)
4. List updates with filtered events
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────┐
│        SUPABASE DATABASE            │
│  • events table                     │
│  • event_rsvps table                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      FETCH ON COMPONENT MOUNT       │
│  1. SELECT * FROM events            │
│  2. SELECT * FROM event_rsvps       │
│     WHERE status = 'going'          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     PROCESS DATA (useMemo)          │
│  1. Count RSVPs per event           │
│  2. Attach counts to events         │
│  3. Filter past events              │
│  4. Split: featured / regular       │
│  5. Apply search filter             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│           RENDER UI                 │
│  • Featured carousel                │
│  • Upcoming events list             │
│  • Empty states                     │
└─────────────────────────────────────┘
```

---

## ✅ IMPLEMENTATION COMPLETE

### Files Created
1. ✅ `app/(tabs)/home.tsx` - Complete Events tab
2. ✅ `app/event/[id].tsx` - Event detail placeholder
3. ✅ `supabase/events_tables.sql` - Database schema

### Features Implemented
1. ✅ Sticky header with search + filter
2. ✅ Featured events hero carousel (16:9)
3. ✅ Upcoming events vertical list
4. ✅ Event card with date badge, info, thumbnail
5. ✅ Social proof (avatars + count)
6. ✅ Real-time search filtering
7. ✅ Pull-to-refresh
8. ✅ Navigation to event detail
9. ✅ Floating Action Button (FAB)
10. ✅ Host Event button
11. ✅ Empty states
12. ✅ Past events excluded
13. ✅ RSVP counts attached
14. ✅ Responsive design
15. ✅ Expo Go compatible

### Ready to Use
- Run SQL in Supabase
- Add sample events with `is_featured = true`
- Add sample RSVPs
- App will display events automatically

**Events tab (Home Feed) complete! 🎉**

