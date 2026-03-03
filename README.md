MindBreath App 🌬️

MindBreath is a React Native mobile application designed to help users relax, focus, and sleep better using guided breathing exercises. Track your mindfulness journey, monitor your progress, and cultivate healthy mental wellness habits.

🌟 Features

Mode-Based Breathing: Choose Calm, Focus, or Sleep mode.

Session Insights: Track duration, tips, streaks, and mood.

Statistics Dashboard: Weekly progress, daily focus score, and streaks.

Quick Start Buttons: Start any session in one tap.

Share Achievements: Share session completions with friends.

Smooth UI/UX: Dark gradients, blur effects, and subtle animations.

🖼 Screenshots
Welcome Screen	Mode Selection	Session Complete

	
	
Stats Screen

🗺 Navigation Flow

<img width="2147" height="280" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/88cc7b30-6951-41c1-b9d1-bc60358261ed" />



Navigation Explanation:

WelcomeScreen → ModeScreen: User selects session type.

ModeScreen → BreatheScreen: Start guided breathing session.

BreatheScreen → SessionCompleteScreen: Show session results and tips.

SessionCompleteScreen → StatsScreen: View detailed statistics.

Loops back to ModeScreen for new sessions.

🛠 Tech Stack
Category	Tools
Framework	React Native + Expo
Language	TypeScript
Navigation	React Navigation
State & Storage	AsyncStorage
UI Components	Expo LinearGradient, BlurView
Icons	Feather, Ionicons, MaterialCommunityIcons
Haptics	Expo Haptics
Animations	Animated API, Expo LinearGradient
📂 Project Structure
MindBreathApp/
├── assets/                # Images, icons, screenshots
├── components/            # Reusable components
│   └── ModeSelector.tsx
├── lib/                   # Helper functions (stats management)
│   └── stats.ts
├── screens/               # All screens
│   ├── WelcomeScreen.tsx
│   ├── ModeScreen.tsx
│   ├── BreatheScreen.tsx
│   ├── SessionCompleteScreen.tsx
│   └── StatsScreen.tsx
├── App.tsx                # Root with navigation
├── package.json
└── tsconfig.json
🚀 Getting Started
Prerequisites

Node.js >= 18

npm or yarn

Expo CLI globally

npm install -g expo-cli
Installation
git clone https://github.com/izharahmaad/MindBreathApp.git
cd MindBreathApp
npm install
# or
yarn install

Start the app:

expo start

Open in Expo Go on your mobile device or simulator.

🎯 Usage

Welcome Screen – Tap “Let’s Calm” to start.

Mode Selection – Choose Calm, Focus, or Sleep.

Breathe Session – Follow the guided breathing animation.

Session Complete – View session summary and tips.

Stats Screen – Track streaks, focus, and weekly activity.

🔮 Future Enhancements

Push daily notifications for mindfulness reminders.

Enable custom session durations.

Add leaderboards or social sharing.

Light/Dark mode toggle.

🤝 Contributing

Contributions are welcome:

Fork the repository

Create a branch: git checkout -b feature-name

Commit your changes: git commit -m "Add feature"

Push to the branch: git push origin feature-name

Open a Pull Request
