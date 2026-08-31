## Monkey Tracker — how to build with these components

Monkey Tracker is a consent-first presence-sharing app for two people. The tone
is affectionate, absurd, warm, storybook — never productivity, dashboard, or
location-monitoring.

### These are React Native components rendered through react-native-web

There is **no provider and no root wrapper**. Import a component and render it;
it styles itself. Do not wrap anything in a ThemeProvider — none ships.

### There are no CSS classes and no CSS custom properties

Styling is React Native `StyleSheet` objects compiled into `_ds_bundle.js`.
`styles.css` is a runtime stub — it is not the source of the look, and reading
it will teach you nothing. **Do not invent utility classes** (`bg-surface`,
`text-body`); none exist and none will resolve.

Style your own layout glue with inline `style` objects and the literal hex
values below. Give the page `background: #F6F1E7`.

| Role | Value | Use |
|---|---|---|
| ink | `#25251F` | primary text |
| muted | `#716E63` | secondary text, meta lines |
| paper | `#F6F1E7` | page background |
| card | `#FFFDF8` | card / surface background |
| moss | `#52715A` | eyebrow labels, accents |
| mossDark | `#36513F` | primary buttons, selected state, active nav |
| lime | `#DCE9B2` | the illustrated stage panel |
| peach | `#F2B38F` | warm accent |
| yellow | `#F6D66B` | sun, highlights |
| lilac | `#CEC5ED` | timeline icon tiles |
| line | `#DDD6C8` | borders, dividers |
| danger | `#A94D42` | destructive text only |

Shape: cards use `borderRadius` 20–28 with a `1px solid #DDD6C8` border; pills
and chips use `borderRadius: 999`. Shadows are soft and low-opacity
(`0 5px 12px rgba(42,49,40,0.09)`). Type is system sans; weights run heavy
(`700`–`900`) for titles, `10–12px` uppercase with wide letter-spacing for
eyebrow labels.

### The components

- **`Chip`** — `label`, `selected?`, `onPress`. The single selection primitive.
  Selected is a filled `#36513F` pill with white text; unselected is a
  `#FFFDF8` outline pill. Used in rows for activity, mood, and availability.
- **`MonkeyAvatar`** — `activity`, `accent` (fur hex), `skin?`, `size?`,
  `pose?`, `accessory?`. Composes a monkey from fur color, face tone, and an
  activity prop. `accent` takes one of six fur hexes: `#996744` Cocoa,
  `#7C5540` Truffle, `#C07A62` Cinnamon, `#5F7562` Moss, `#77B9E8` Blueberry,
  `#F49ABB` Bubblegum.
- **`BottomNavigation`** — `active: 'home' | 'history'`, `onHome`, `onUpdate`,
  `onHistory`. Absolutely positioned to the bottom of its container, so give
  the parent `position: relative` and at least 120px of height. The centre
  Update button deliberately overhangs the bar.

Read each component's `.d.ts` and `.prompt.md` for the exact contract.

### Product rules that override visual instinct

- Never shame or pressure someone for not sharing. No streaks, no "last posted
  N days ago", no decaying or sad character.
- Location is optional and off by default. Never make it central, and never
  imply an update requires it.
- Always show sharing precision and expiration plainly.
- **Expired means unknown.** Never let a stale status look current, and render
  the unknown state as calm and neutral — never sad or absent.
- Not an emergency or location-proof service: no maps-as-hero, pins, radar, or
  alert iconography.

### Idiomatic example

```jsx
<div style={{ background: '#F6F1E7', padding: 20, minHeight: '100%' }}>
  <div style={{
    background: '#FFFDF8', border: '1px solid #DDD6C8', borderRadius: 20,
    padding: 16, boxShadow: '0 5px 12px rgba(42,49,40,0.09)',
  }}>
    <div style={{ fontSize: 10, letterSpacing: 2, color: '#52715A', fontWeight: 900 }}>
      PRIVATE TO YOUR TROOP
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
      <Chip label="Studying" onPress={() => {}} />
      <Chip label="Gaming" selected onPress={() => {}} />
    </div>
  </div>
</div>
```
