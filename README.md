# Social Support Application with AI Assistance

## Overview
A React Native application that guides users through a multi-step social support request. It includes a wizard flow, local draft persistence, AI-assisted writing for situation descriptions, and English/Arabic localization with RTL handling.

## Technology Stack
- React Native (CLI)
- Redux Toolkit
- AsyncStorage
- OpenAI API
- iOS & Android

## Setup Instructions
1. Node: v18+
2. Install dependencies:
   ```bash
   npm install
   ```
3. iOS pods:
   ```bash
   cd ios && pod install && cd ..
   ```
4. Android: ensure Android SDK and emulator/device are configured.

## Running the App
- iOS:
  ```bash
  npx react-native run-ios
  ```
- Android:
  ```bash
  npx react-native run-android
  ```

## Environment Variables
Create a `.env` file at the project root:
```bash
OPENAI_API_KEY=your_api_key_here
```
Do not commit real keys.

## App Flow Summary
- Step 1: Personal Information
- Step 2: Family & Financial Info
- Step 3: Situation Description with AI
- Confirmation screen

## Localization & RTL
- English and Arabic translations
- RTL is enabled when Arabic is selected

## Notes / Assumptions
- Submission uses a mock API call
- No backend services are included
