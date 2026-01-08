# Bilingual Professional Descriptions

## Overview

Professional profiles now support bilingual descriptions (English/French). The system automatically displays the appropriate language based on the user's language toggle.

## How It Works

### Database Schema

- **`description`**: English description (required)
- **`descriptionFr`**: French description (optional)

### Display Logic

1. When French language is selected → Shows `descriptionFr` if available, otherwise falls back to `description`
2. When English language is selected → Always shows `description`

## For Professionals

### Adding French Translations

Currently, professionals enter their descriptions in the registration/edit form. To add French translations, you have two options:

#### Option 1: Admin Manual Update (Current)
An admin can manually add French translations directly in the database:

```javascript
// Example: Update a professional with French description
db.professionals.updateOne(
  { slug: 'professional-slug' },
  { 
    $set: { 
      descriptionFr: 'Votre description en français ici...' 
    } 
  }
);
```

#### Option 2: Professional Dashboard UI (Future Enhancement)
A form field for French description can be added to the professional edit page:

```tsx
{/* In the edit form */}
<textarea
  name="descriptionFr"
  placeholder="Description (French)"
  value={formData.descriptionFr || ''}
  onChange={handleChange}
/>
```

## Technical Implementation

### Localization Utility

**File**: `/utils/localization.ts`

```typescript
getLocalizedDescription(professional, language)
// Returns: French description if available and language is 'fr', otherwise English
```

### Usage in Components

```tsx
import { getLocalizedDescription } from '@/utils/localization';
import { useLanguage } from '@/hooks/useLanguage';

const { language } = useLanguage();
const localizedDescription = getLocalizedDescription(professional, language);
```

## Benefits

✅ **Seamless UX**: Content automatically adapts to user's language preference  
✅ **Gradual Adoption**: Existing profiles work without changes (English fallback)  
✅ **No External APIs**: No translation API costs or rate limits  
✅ **Professional Control**: Professionals can craft their own messaging in both languages  
✅ **SEO Friendly**: Proper localized content for both languages

## Next Steps

To fully enable bilingual descriptions across the platform:

1. **Update Registration Form**: Add French description field to professional registration
2. **Update Edit Form**: Add French description field to professional dashboard edit page
3. **Update API Routes**: Ensure API endpoints accept and save `descriptionFr` field
4. **Update Search**: Consider searching both description fields based on language
5. **Update Directory Cards**: Apply localization to preview snippets

## Example Migration Script

For bulk adding French translations (if you have translations available):

```javascript
// migrate-french-descriptions.js
const professionals = [
  { slug: 'dj-sampson', descriptionFr: 'DJ professionnel avec 10 ans d\'expérience...' },
  { slug: 'event-hall-deluxe', descriptionFr: 'Salle d\'événements moderne avec...' },
];

for (const prof of professionals) {
  await db.collection('professionals').updateOne(
    { slug: prof.slug },
    { $set: { descriptionFr: prof.descriptionFr } }
  );
}
```

## Testing

Test bilingual descriptions by:
1. Navigate to a professional profile
2. Toggle language (EN ↔ FR)
3. Verify description changes if French translation exists
4. Verify fallback to English if no French translation

---

**Status**: ✅ Implemented and deployed  
**Version**: 1.0  
**Date**: January 8, 2026
