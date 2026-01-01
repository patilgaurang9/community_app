# Filter System - Tag-Based Logic

## ✅ Current Implementation

**All filters now work on the `tags` array in the profile.**

---

## 🏷️ How It Works

### Filter Logic
```typescript
const filteredByFilters = useMemo(() => {
  if (activeFilters.length === 0) {
    return profiles; // Show all if no filters selected
  }

  return profiles.filter((profile) => {
    return activeFilters.every((filter) => {
      const tags = profile.tags || [];
      
      switch (filter) {
        case 'same_city':
          return tags.includes('Same City');
        case 'batch_2024':
          return tags.includes('Batch 2024');
        case 'engineering':
          return tags.includes('Engineering');
        case 'alumni':
          return tags.includes('Alumni');
      }
    });
  });
}, [profiles, activeFilters]);
```

---

## 📊 Filter → Tag Mapping

| Filter Button | Checks for Tag | Example Profile |
|--------------|----------------|-----------------|
| **Same City** | `'Same City'` | `tags: ['Same City', 'Tech']` |
| **Batch 2024** | `'Batch 2024'` | `tags: ['Batch 2024', 'Alumni']` |
| **Engineering** | `'Engineering'` | `tags: ['Engineering', 'Tech']` |
| **Alumni** | `'Alumni'` | `tags: ['Alumni', 'Batch 2024']` |

---

## 🎯 Filter Behavior

### Single Filter
```typescript
User selects: "Engineering"
Result: Shows all profiles where tags.includes('Engineering')

Example matches:
✅ tags: ['Engineering', 'Tech']
✅ tags: ['Engineering']
✅ tags: ['Alumni', 'Engineering', 'Batch 2024']
❌ tags: ['Tech', 'Alumni']
```

### Multiple Filters (AND Logic)
```typescript
User selects: "Engineering" + "Batch 2024"
Result: Shows profiles where BOTH tags exist

Example matches:
✅ tags: ['Engineering', 'Batch 2024', 'Tech']
✅ tags: ['Batch 2024', 'Engineering']
❌ tags: ['Engineering', 'Tech']  // Missing 'Batch 2024'
❌ tags: ['Batch 2024', 'Alumni']  // Missing 'Engineering'
```

---

## 📝 Profile Data Structure

```typescript
interface Profile {
  id: string;
  full_name: string;
  email: string;
  // ... other fields
  tags?: string[];  // ← This is what filters check
}
```

### Example Profile with Tags
```typescript
{
  id: '123',
  full_name: 'John Doe',
  job_title: 'Software Engineer',
  company: 'TechCorp',
  tags: ['Engineering', 'Tech', 'Batch 2024']  // ← Filters check this
}
```

---

## 🔄 Complete Flow

```
1. User opens filter modal
   ↓
2. User selects "Engineering" chip
   ↓
3. User taps "Apply Filters"
   ↓
4. activeFilters = ['engineering']
   ↓
5. Filter logic runs:
   profiles.filter(profile => {
     return profile.tags?.includes('Engineering')
   })
   ↓
6. List shows only profiles with 'Engineering' tag
```

---

## ✅ Benefits of Tag-Based Filtering

### 1. **Flexible**
- Tags can be updated without code changes
- Easy to add new filter options
- Tags can be assigned dynamically

### 2. **Simple**
- Clear, straightforward logic
- Easy to understand and debug
- One source of truth (tags array)

### 3. **Scalable**
- Add new filters by just checking for new tags
- No complex field combinations
- Easy to manage in database

---

## 🎨 Tag Examples in UI

### Member Card Display
```
┌─────────────────────────────────────┐
│ [👤] John Doe                       │
│      Software Engineer @ TechCorp   │
│      #Engineering                   │  ← Shows first tag
└─────────────────────────────────────┘
```

The card shows the first tag, but filters check ALL tags.

---

## 🔧 How to Add New Filters

### Step 1: Add to FilterModal
```typescript
// components/FilterModal.tsx
const FILTER_OPTIONS = [
  { value: 'same_city', label: 'Same City' },
  { value: 'batch_2024', label: 'Batch 2024' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'new_filter', label: 'New Filter' },  // ← Add here
];
```

### Step 2: Add to Filter Logic
```typescript
// app/(tabs)/members.tsx
case 'new_filter':
  return tags.includes('New Filter');  // ← Add case
```

### Step 3: Update Type
```typescript
// components/FilterModal.tsx
export type FilterType = 
  | 'same_city' 
  | 'batch_2024' 
  | 'engineering' 
  | 'alumni'
  | 'new_filter';  // ← Add type
```

**That's it!** 🎉

---

## 📊 Before vs After

### ❌ Before (Mixed Logic)
```typescript
case 'same_city':
  return profile.location?.includes('bangalore');  // ← location field

case 'batch_2024':
  return profile.batch === '2024';  // ← batch field

case 'engineering':
  return profile.industry?.includes('engineering');  // ← industry field

case 'alumni':
  return profile.tags?.includes('Alumni');  // ← tags field
```
**Problem:** Checking different fields = inconsistent, hard to maintain

### ✅ After (Tag-Based)
```typescript
const tags = profile.tags || [];

case 'same_city':
  return tags.includes('Same City');  // ← tags

case 'batch_2024':
  return tags.includes('Batch 2024');  // ← tags

case 'engineering':
  return tags.includes('Engineering');  // ← tags

case 'alumni':
  return tags.includes('Alumni');  // ← tags
```
**Solution:** All filters check tags = consistent, easy to maintain

---

## ✅ Summary

**Now:** All filters work on the `tags` array
**Before:** Filters checked location, batch, industry, tags (mixed)

**To make a profile show up in a filter:**
Just add the corresponding tag to the profile's `tags` array!

Example:
```sql
UPDATE profiles 
SET tags = ARRAY['Engineering', 'Batch 2024', 'Alumni']
WHERE id = 'user-id';
```

**Simple, consistent, and scalable! 🚀**

