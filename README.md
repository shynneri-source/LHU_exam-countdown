# LHU Countdown - Exam Timer

[🇻🇳 View Vietnamese README](README-vi.md)

---

## ✨ Features

- 🎬 **Pre-exam phase ("Phát đề")**: Set a pre-exam time range (from ... to ...) before the main exam. This phase is included in the progress bar and timeline.
- 📝 **Smart configuration form**: Enter subject, exam time, pre-exam time, and custom stages.
- ⏳ **Animated countdown clock**: Shows days, hours, minutes, seconds with smooth transitions.
- 📊 **Progress bar & timeline**: All phases (including pre-exam) are shown and spaced evenly, no overlap, and update in real time.
- 🔄 **Stage management**: Auto-switch between exam stages, with clear visual cues.
- 🖥️ **Fullscreen layout**: Optimized for large screens and projectors.
- 💾 **Data persistence**: Auto-save and restore configuration (localStorage).
- ⌨️ **Keyboard shortcuts**: Quick controls (Pause/Resume, Reset, Fullscreen).
- 📱 **Responsive**: Works on all devices (desktop, tablet, mobile).

---

## 🎆 Animation Showcase

| Animation Type         | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| ✨ Fade-in             | Smoothly reveals all main sections when loaded                               |
| 💡 Glow               | Subject name and current stage glow with a soft animated light               |
| 💥 Pulse              | Logo and countdown numbers pulse for emphasis                                |
| 🌈 Shimmer            | Progress bar has a moving shimmer/shine effect                               |
| 🟣 Floating Particles  | Animated particles float in the background for a dynamic look                |
| 🔄 Stage Transition   | Animated transitions when switching between stages                           |
| 🎉 Celebration        | Confetti/celebration animation when time is up                               |
| 🕒 Number Flip        | Countdown numbers animate/flip when changing                                 |
| 🟩 Progress Markers   | Animated markers for each stage on the progress bar                          |

---

## 🖼️ Demo Screenshot

![LHU Countdown Demo](demo.jpg)

*Above: Example of the animated countdown interface with progress bar, timeline, and vibrant effects.*

---

## 🖼️ Interface Overview

- **Header:** LHU logo and title
- **Date:** Shows current date
- **Subject name:** Current exam subject
- **Countdown clock:** 4 time blocks (days, hours, minutes, seconds)
- **Progress bar:** Shows progress and current stage, with animated markers
- **Timeline:** All phases (including pre-exam) are shown, spaced evenly
- **Controls:** Pause, reset, fullscreen

---

## 🚀 How to Use

1. Open `index.html` in your browser.
2. Enter subject name.
3. Select exam start and end time.
4. (Optional) Click **Set pre-exam time** and enter the **from** and **to** time for the pre-exam phase.
5. Add/edit exam stages as needed (e.g. "Do exam", "Review", "Submit").
6. Click **Start Countdown**.
7. Use keyboard shortcuts:
   - `Space`: Pause/Resume
   - `R`: Reset
   - `F`: Fullscreen

### Notes

- The pre-exam phase will be shown as the first stage in the progress bar and timeline.
- Timeline is always spaced evenly, no overlap, even with many stages.
- For the logo image, avoid special characters in the filename (e.g. use `LHU-ASU-ENG1.png` instead of `LHU&ASU-ENG1@.png`).

---

## 📁 File Structure

```
clock_2/
├── index.html      # Main HTML file
├── styles.css      # CSS with animations and layout
├── script.js       # JavaScript logic
├── LHU-ASU-ENG1.png # Logo image (rename if needed)
├── README.md       # English guide (this file)
└── README-vi.md    # Vietnamese guide
```

---

## 🔧 System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supports CSS Grid & Flexbox
- JavaScript enabled
- Internet connection (for Font Awesome icons)

---

## 🚦 Quick Start

1. Download all files
2. Open `index.html` in your browser
3. Configure exam info, pre-exam time, and stages
4. Start the countdown!

---

**LHU Countdown** – Your animated, interactive exam timer companion! 🎓⏰

---

> For Vietnamese instructions, [click here](README-vi.md)