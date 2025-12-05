# Scribbi - AI-Augmented Writing Platform

A web-based writing platform with dramaturgical assistance using a "transfer paper" metaphor where AI analysis appears as receipt overlays.

## Features

### Main Writing Space
- Clean, distraction-free document editor
- Real-time autosave (every 3 seconds)
- Minimal, focused interface
- Desktop-optimized design

### "Done for Now" Feature
- Click the prominent "Done for Now" button when you pause writing
- Triggers AI analysis of your recent writing
- Generates a receipt overlay with:
  - Dramaturgical questions (Why, How, What-if, Sensory)
  - Identified themes
  - A poetic haiku

### Receipt Overlay System
- Semi-transparent overlays that appear like receipt paper
- Can be pinned or dismissed
- Monospaced font for authentic receipt feel
- Timestamped and tied to specific writing moments

### Toggle View for Past Receipts
- Click the "Receipts" button in the toolbar
- Shows/hides all past receipt annotations
- Each receipt appears at its original position

### Sidebar Panels

**Character Lore**
- Auto-extracted character database
- Names, traits, mention counts
- Click a character to highlight all mentions in the document

**Timeline View**
- Auto-built chronological timeline
- Key events extracted from narrative
- Toggle between Story order and Chronological order

**Document Library**
- Multiple documents per project (coming soon)
- Document organization and search

### Theme Options
- **Coffee & Cream** (default): Warm browns, creams, latte tones
- **Classic Black & White**: Crisp contrast
- Switch themes via Settings panel

## Usage

1. Open `scribbi.html` in a modern web browser
2. Start writing in the main editor
3. Click "Done for Now" when you want AI analysis
4. Review the receipt overlay with questions and observations
5. Pin receipts you want to keep, dismiss others
6. Toggle "Receipts" view to see all past annotations
7. Check the sidebar for auto-extracted characters and timeline events
8. Switch themes via the Settings icon

## Technical Notes

- All data is stored in browser localStorage
- Character and timeline extraction runs automatically in the background
- Receipt generation uses mock AI analysis (ready for API integration)
- No external dependencies - pure HTML/CSS/JavaScript

## Future Enhancements

- Real AI API integration for receipt generation
- Multiple document management
- Export/import functionality
- Collaborative features
- Advanced text analysis

