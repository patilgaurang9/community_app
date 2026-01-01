# Events Tab - Visual Implementation Guide

## 🎨 Complete Screen Layout

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌────────────────────────────────────────────┐  ┌───┐ │
│  │ 🔍  Search events, hosts...                │  │ ⚙ │ │  ← Sticky
│  └────────────────────────────────────────────┘  └───┘ │     Header
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                          │
│  Featured Events                                         │
│  ◄─────────────────────────────────────────────────────►│
│  ┌─────────────────────────────────┐                    │
│  │                                 │                    │
│  │   [Background Image]            │                    │
│  │                                 │                    │  Horizontal
│  │   ╔═══════════════════════════╗ │                    │  Scroll
│  │   ║ Conference 2024           ║ │                    │  16:9 Cards
│  │   ║ Wed, Jan 20, 3:00 PM      ║ │                    │
│  │   ╚═══════════════════════════╝ │                    │
│  └─────────────────────────────────┘                    │
│                                                          │
│  Upcoming Events                        + Host Event     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ┌────┐                              ┌────────┐  │  │
│  │  │JAN │  Tech Meetup                 │        │  │  │
│  │  │ 20 │  📍 Silicon Valley           │ [IMG]  │  │  │
│  │  │    │  👤👤👤 12+ going             │        │  │  │
│  │  └────┘                              └────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ┌────┐                              ┌────────┐  │  │
│  │  │FEB │  Networking Event            │        │  │  │
│  │  │ 15 │  📍 Downtown Office          │ [IMG]  │  │  │
│  │  │    │  👤👤👤 25+ going             │        │  │  │
│  │  └────┘                              └────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ┌────┐                              ┌────────┐  │  │
│  │  │MAR │  Workshop: React Native      │        │  │  │
│  │  │ 10 │  📍 Tech Hub                 │ [IMG]  │  │  │
│  │  │    │  👤👤👤 8+ going              │        │  │  │
│  │  └────┘                              └────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│                                              ┌─────┐    │
│                                              │  +  │    │  ← FAB
│                                              └─────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 📏 Component Breakdown

### 1. Sticky Header (Height: ~82px)

```
┌──────────────────────────────────────────────┐
│  Padding: 16px                               │
│  ┌────────────────────────────┐  ┌───────┐  │
│  │ 🔍 Search events, hosts... │  │   ⚙   │  │
│  │                            │  │       │  │
│  │  Flex: 1                   │  │ 50x50 │  │
│  │  Height: 50px              │  │       │  │
│  └────────────────────────────┘  └───────┘  │
│           Gap: 12px                          │
└──────────────────────────────────────────────┘
```

**Search Container:**
- Background: #18181B
- Border: 1px #27272A
- Border Radius: 12px
- Padding: 0 16px
- Icon: search (20px)
- Input: White text, 16px
- Clear icon: close-circle (appears when typing)

**Filter Button:**
- Size: 50x50px
- Background: #18181B
- Border: 1px #27272A
- Border Radius: 12px
- Icon: options-outline (22px)

---

### 2. Featured Events Carousel

```
┌───────────────────────────────────────────────┐
│  Featured Events                   (20px)     │
│  Padding: 0 20px                              │
├───────────────────────────────────────────────┤
│  ◄─ Horizontal Scroll ─►                      │
│  ┌──────────────────────────┐                 │
│  │                          │  16:9            │
│  │  [Background Image]      │  Aspect          │
│  │                          │  Ratio           │
│  │  ┌────────────────────┐  │                 │
│  │  │ Title (22px bold)  │  │                 │
│  │  │ Date & Time (14px) │  │  Gradient       │
│  │  └────────────────────┘  │  Overlay        │
│  └──────────────────────────┘                 │
│         Card Width: Screen - 40px             │
└───────────────────────────────────────────────┘
```

**Card Dimensions:**
- Width: `Dimensions.get('window').width - 40`
- Height: `(width * 9) / 16`
- Border Radius: 16px
- Margin Right: 16px (between cards)

**Overlay:**
- Position: Absolute bottom
- Background: `rgba(0, 0, 0, 0.6)`
- Padding: 20px
- Title: White, 22px, Bold
- Date: #E4E4E7, 14px, Medium

---

### 3. Upcoming Events Card (Detailed)

```
┌──────────────────────────────────────────────────┐
│  Padding: 16px                                   │
│  Background: #18181B                             │
│  Border: 1px #27272A                             │
│  Border Radius: 12px                             │
│  ┌────────────────────────────────────────────┐  │
│  │  ┌──────┐  ┌─────────────────┐  ┌──────┐  │  │
│  │  │ Date │  │   Event Info    │  │ Img  │  │  │
│  │  │Badge │  │                 │  │ 80x  │  │  │
│  │  │ 60px │  │   Flex: 1       │  │ 80px │  │  │
│  │  │      │  │                 │  │      │  │  │
│  │  └──────┘  └─────────────────┘  └──────┘  │  │
│  │                                            │  │
│  │  Margin: 0 16px 12px 0                    │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

#### Date Badge (60x auto)
```
┌────────┐
│  JAN   │  ← Month (12px, Bold, #F59E0B)
│        │
│   20   │  ← Day (24px, Bold, #FFFFFF)
│        │
└────────┘
Background: #27272A
Padding: 8px vertical
Border Radius: 8px
Centered content
```

#### Event Info (Flex: 1)
```
┌─────────────────────────────┐
│ Tech Meetup                 │  ← Title (16px, Semi-bold, White)
│                             │     2 lines max
│ 📍 Silicon Valley           │  ← Location (13px, #A1A1AA)
│                             │     Icon: location-outline (14px)
│ 👤👤👤 12+ going              │  ← Social Proof
│ ▲▲▲ Avatar Stack            │     Avatars: 24x24px, overlap -8px
│                             │     Text: 12px, #71717A
└─────────────────────────────┘
```

#### Thumbnail (80x80px)
```
┌────────┐
│        │
│ [IMG]  │  Square
│        │  Border Radius: 8px
│        │  Or placeholder icon
└────────┘
```

---

### 4. Social Proof Avatars (Detailed)

```
┌──────────────────────────────┐
│  👤 👤 👤  12+ going          │
│  ▲  ▲  ▲                     │
│  │  │  └── Avatar 3 (z: 1)  │
│  │  └───── Avatar 2 (z: 2)  │
│  └──────── Avatar 1 (z: 3)  │
│                               │
│  Overlap: -8px margin        │
│  Size: 24x24px               │
│  Background: #3F3F46         │
│  Border: 2px #18181B         │
│  Icon: person (12px)         │
└──────────────────────────────┘
```

**Implementation:**
```tsx
<View style={styles.avatarStack}>
  <View style={[styles.avatar, { zIndex: 3 }]} />
  <View style={[styles.avatar, { marginLeft: -8, zIndex: 2 }]} />
  <View style={[styles.avatar, { marginLeft: -8, zIndex: 1 }]} />
</View>
<Text>{count}+ going</Text>
```

---

### 5. Floating Action Button (FAB)

```
                    ┌─────────┐
                    │    +    │  ← Icon: add (28px, black)
                    │         │     Size: 56x56px
                    │         │     Background: #FFFFFF
                    └─────────┘     Border Radius: 28px (circle)
                                    Shadow: Elevated
                                    Position: Absolute
                                    Right: 20px
                                    Bottom: 20px
```

---

## 🎨 Color Specifications

### Background Colors
```css
Screen:           #000000 (pure black)
Card:             #18181B (dark zinc)
Date Badge:       #27272A (medium zinc)
Avatar:           #3F3F46 (gray)
FAB:              #FFFFFF (white)
Featured Overlay: rgba(0, 0, 0, 0.6) (60% black)
```

### Text Colors
```css
Primary:          #FFFFFF (white)
Secondary:        #E4E4E7 (light gray)
Muted:            #A1A1AA (gray)
Tertiary:         #71717A (darker gray)
Accent:           #F59E0B (amber - for date month)
```

### Border Colors
```css
Card Border:      #27272A
Input Border:     #27272A
Avatar Border:    #18181B (matches card bg)
```

---

## 📐 Spacing System

```
Screen Padding:    20px horizontal
Card Padding:      16px
Card Margin:       12px bottom
Section Margin:    24px bottom
Header Padding:    16px
Gap (Search/Filter): 12px
Avatar Overlap:    -8px
```

---

## 🔤 Typography Scale

```css
Featured Title:    22px, Bold (700), White
Section Title:     20px, Bold (700), White
Event Title:       16px, Semi-bold (600), White
Location:          13px, Regular (400), #A1A1AA
Social Proof:      12px, Medium (500), #71717A
Date Month:        12px, Bold (700), #F59E0B
Date Day:          24px, Bold (700), White
Featured Date:     14px, Medium (500), #E4E4E7
```

---

## 🖼️ Image Handling

### Featured Card Image
```tsx
if (event.image_url) {
  <Image 
    source={{ uri: event.image_url }} 
    style={{ width: '100%', height: '100%' }}
    resizeMode="cover"
  />
} else {
  <View style={placeholderStyle}>
    <Ionicons name="calendar" size={48} color="#52525B" />
  </View>
}
```

### Thumbnail Image
```tsx
if (event.image_url) {
  <Image 
    source={{ uri: event.image_url }} 
    style={{ width: 80, height: 80, borderRadius: 8 }}
    resizeMode="cover"
  />
} else {
  <View style={placeholderStyle}>
    <Ionicons name="image-outline" size={24} color="#52525B" />
  </View>
}
```

---

## 🎯 Interactive States

### Tap Targets
```
Search Input:     50px height (minimum 44px)
Filter Button:    50x50px (minimum 44x44px)
Event Card:       Full card tappable
Featured Card:    Full card tappable
FAB:              56x56px (minimum 44x44px)
Host Event Text:  Tappable text button
```

### Active Opacity
```tsx
Event Card:       activeOpacity={0.7}
Featured Card:    activeOpacity={0.9}
FAB:              activeOpacity={0.8}
```

---

## 📱 Responsive Behavior

### Featured Card Width
```typescript
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px padding each side
const CARD_HEIGHT = (CARD_WIDTH * 9) / 16; // 16:9 aspect ratio
```

### Scrolling
```
Horizontal (Featured): showsHorizontalScrollIndicator={false}
Vertical (Main):       showsVerticalScrollIndicator={false}
```

### Pull to Refresh
```tsx
<RefreshControl
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
  tintColor="#FFFFFF"  // iOS
  colors={["#FFFFFF"]}  // Android
/>
```

---

## ✅ Visual Checklist

Layout:
- [x] Sticky header at top
- [x] Search bar + filter button (same row)
- [x] Featured carousel (horizontal)
- [x] Upcoming list (vertical)
- [x] FAB at bottom right

Featured Cards:
- [x] 16:9 aspect ratio
- [x] Full background image
- [x] Dark gradient overlay
- [x] Title bold white
- [x] Date at bottom left

Event Cards:
- [x] Row layout
- [x] Date badge (left)
- [x] Event info (center)
- [x] Thumbnail (right)
- [x] Social proof with avatars

Visual Polish:
- [x] Rounded corners everywhere
- [x] Consistent spacing
- [x] Dark theme colors
- [x] Subtle borders
- [x] Elevated FAB shadow
- [x] Smooth scrolling

**All visual specifications met! 🎨**

