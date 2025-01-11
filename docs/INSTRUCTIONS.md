## Instruction set 1
Core Design Philosophy:
"Guide anxious users to calmness through progressive disclosure and minimal cognitive load"

Key UX Principles:
1. Single Point of Focus
2. Progressive Calming
3. Ambient Awareness
4. Guided Recovery

Detailed Design Strategy:

1. Initial Load Experience
- Replace static welcome message with a gentle pulse animation that matches natural resting heart rate (60-100 bpm)
- Fade in elements progressively, starting with just the breathing circle
- Use subtle motion to draw attention to the circle (key focal point)
- Keep concurrent users number small and in peripheral vision
- Remove all buttons initially - let users just breathe

2. Interaction States:
```
Arrival State (0-5s):
- Single breathing circle
- Gentle pulse animation
- No text, no options
- Extremely low cognitive load

Engagement State (5-15s):
- Fade in minimal guidance text
- Continue breathing guidance
- Introduce pattern options through subtle UI hints

Active State (15s+):
- Full interface becomes available
- Additional controls appear when needed
- Maintain focus on breathing
```

3. Visual Hierarchy:
- Primary: Breathing circle (80% of visual weight)
- Secondary: Pattern selection 
- Tertiary: Timer and audio controls
- Quaternary: Community presence (concurrent users)

4. Color Psychology:
- Primary: Soft lavender (#E6E6FA) - clinically proven to reduce anxiety
- Secondary: Cool sage (#9DC183) - grounding
- Accent: Pale blue (#B0C4DE) - trust and stability
- All colors at 50-70% opacity
- Use color temperature to indicate breathing state

5. Motion Design:
- Base all animations on 4-second cycles (matches natural breathing)
- Use exponential easing for circle scaling (matches natural lung expansion)
- Transition timing: 400ms for UI, 2000ms for breathing
- Reduce motion based on user preference
- No sudden movements or sharp transitions

6. Typography:
- Primary: Spectral (serif) for warmth and humanity
- Secondary: Inter (sans-serif) for clarity
- Size scale: 1.2 ratio for harmony
- Line height: 1.6 for comfortable reading
- No text animations during breathing

7. Space and Layout:
- 60% vertical space for breathing circle
- 16px base unit for spacing
- Golden ratio for major layout divisions
- Maintain consistent optical margins
- Use negative space to create focus

8. Sound Design:
- 40hz base frequency (proven anxiety reduction)
- Binaural beats option (432hz)
- Nature sounds mixed at -20db
- Fade in/out over 2000ms
- Optional voice guidance at -10db

9. Micro-Interactions:
- Buttons illuminate on hover (200ms fade)
- Pattern selection expands smoothly
- Timer appears through fade + scale
- Audio toggles morph between states
- User count updates every 30s

10. Content Strategy:
- Replace "You're not alone" with "We're here with you"
- Use present-tense, active voice
- Keep instructions under 8 words
- Progressive disclosure of technique details
- Success stories appear after 3 breaths

11. Accessibility:
- Screen reader-optimized state announcements
- High contrast mode available but not default
- Keyboard controls with visible focus states
- Haptic feedback for mobile users
- Reduced motion preferences respected

12. Progressive Enhancement:
- Core breathing guide works without JS
- Enhanced features load after initial calming
- Offline support with service worker
- Fallback breathing pattern always available
- Save user preferences to localStorage

---