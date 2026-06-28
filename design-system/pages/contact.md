# Contact — "The Relay" (page design)

> Overrides `design-system/MASTER.md`. The **final** stop of the space journey: after the Projects worlds, the
> traveller reaches the comms **satellite relay** and *opens a channel home*. Status: **approved, to build.**
> Decision log (locked with the user 2026-06-28):
> - **Reach-out:** a **working contact form** (Web3Forms, no backend) **+ direct links** (email, GitHub, LinkedIn) **+ CV download**.
> - **Feel:** **themed but calm** — a spacey backdrop (satellite cutout + drifting CSS starfield, light animation, **no WebGL**) with a clear, low-friction contact foreground. No 3D scene (deliberately simpler than the pinned journey).
> - **Extras chosen:** CV/résumé download only. **Not** included: availability badge, location, AI-chatbot prompt.

## Concept
You've crossed the whole system (Hero → About → Skills → Experience → Projects). Contact is the **relay station**: the
`satellite-relay-cutout.png` drifts in a calm starfield emitting a soft "signal" pulse, and a glass **comms console**
foreground lets visitors send a transmission (form) or hail directly (links). It's the emotional + functional close —
the Experience beacon already foreshadows it ("→ 2026 / Open for new missions — let's talk" → `#contact`).

## Layout
`<section id="contact">` rendered **after `<Projects/>`** in `App.tsx` (a normal scrolled section, **not** pinned).
- **Backdrop:** dark space (`#05030f` base + radial glow, matching Projects), a reused **`.about-starfield`** field with
  an always-on twinkle (`.contact-twinkle`), and the **satellite cutout** floating off to one side
  (`.contact-satellite` bob) with one or two expanding **`.signal-ring`** pulses from the dish.
- **Header (placeholder):** eyebrow `Transmit // Contact` + headline *"Open a channel"*. The user will supply a shared
  header style for all sections later → keep the header markup simple + easy to restyle.
- **Console:** one dark glass card (`bg-[#0a0814]/80`, `backdrop-blur-xl`, cyan/magenta edge, rounded-3xl, scroll-reveal
  via `.proj-reveal`). **Two columns desktop / stacked mobile:**
  - **Left — invite + links:** one line ("Got a project or a role? Send a transmission."), then **Email · GitHub ·
    LinkedIn** as tidy rows (lucide icons) + a **Download CV** button (→ `PROFILE.cv`, the existing Drive link).
  - **Right — the form:** Name, Email, Message → **"Send transmission →"**.
- **Footer:** `© 2026 Low Chee Fei` + **"↑ Back to launch"** (smooth-scroll to top/Hero) + repeated socials.

## Form — Web3Forms (no backend)
- `fetch('https://api.web3forms.com/submit', { method:'POST', body: FormData })` with `access_key` = `WEB3FORMS_KEY`
  (a clearly-marked placeholder constant the user pastes their free key into; UI works without it, just won't send).
- Spam: hidden `botcheck` honeypot. Validation: `required` + `type=email`.
- States (`useState`): `idle → sending → success | error`. Success: *"📡 Transmission received — I'll get back to you
  soon."* Error: inline message + `mailto:` fallback. Themed dark-glass inputs, cyan focus rings, disabled while sending.

## Theming / a11y / perf
- Palette: `#05030f`/`#0a0814` dark, accents cyan `#22D3EE` + magenta `#FF2BD6` (consistent with the journey).
- **No WebGL** — pure HTML/CSS, so it's fast + can't crash. Scroll-reveal reuses `.proj-reveal`.
- Labeled inputs, `aria-live` on the form status, `prefers-reduced-motion` disables float/twinkle/pulse.

## Needs from the user
1. **Web3Forms access key** (free, ~2 min at web3forms.com) → replace the placeholder. 2. CV confirmed = the existing
   Google-Drive link (`PROFILE.cv`).

## Build notes
- New CSS in `style.css`: `.contact-twinkle`, `@keyframes satelliteFloat` (`.contact-satellite`), `@keyframes
  signalPulse` (`.signal-ring`), all reduced-motion-guarded. Reuse `.about-starfield` background.
- Add `cv` to `PROFILE` in `constants.ts` (the Drive link, currently a local const in `Hero.tsx`).
- Replace the old pop-theme `Contact.tsx`; mount `<Contact/>` after `<Projects/>` in `App.tsx`.
- Header is intentionally a simple placeholder pending the shared section-header style.
