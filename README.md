# 🚀 React FireStrap

**React FireStrap** is a Firebase-first UI & logic toolkit for quickly building data-driven web apps using React and Firebase Realtime Database.

---

## 🔧 Initial Setup Guide

To fully use React FireStrap, you need to configure a Firebase project with **Realtime Database** and **Google Authentication**. Additional integrations like ChatGPT, SerpApi, Dropbox, etc., are supported but optional.

---

## 🟢 Required Setup

### 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps
3. Go to **Project Settings → Add App → Web**
4. Copy the Firebase config values and add them to your `.env` file:

```env
REACT_APP_FIREBASE_APIKEY=XXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=XXXX.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=XXXX
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=000000000000
REACT_APP_FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:XXXXXXXX
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

### 2. Enable Realtime Database

1. In the Firebase Console, go to **Build → Realtime Database**
2. Click **Create Database** and choose a location (e.g., *Europe - West*)
3. Add the following line to your `.env` file:

```env
REACT_APP_FIREBASE_DATABASE_URL=https://[PROJECT_ID]-default-rtdb.[REGION].firebasedatabase.app
```

---

### 3. Enable Google Authentication

1. Go to **Build → Authentication → Sign-in method**
2. Enable **Google** as a provider
3. Copy the **Web Client ID** and add it to your `.env` file:

```env
REACT_APP_GOOGLE_CLIENT_ID=000000000000-XXXXXXXXXXXX.apps.googleusercontent.com
```

---

### 4. Configure OAuth Client in Google Cloud Console (Required)

To make Google Sign-In work in development and production:

1. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Select the Firebase project you created
3. Navigate to **OAuth 2.0 Client IDs**
4. Add the following redirect URIs:

#### Development Redirect URIs

```
https://localhost
https://localhost:3000
```

#### Production Redirect URIs

```
https://[PROJECT_ID].web.app
https://[PROJECT_ID].firebaseapp.com
```

---

## 🟡 Optional Integrations

React FireStrap supports these optional services if your app requires advanced capabilities:

---

### 🔹 Firebase Hosting *(optional)*

For deploying your app to Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

---

### 🔹 Firebase Storage *(optional)*

To upload and manage files:

1. Enable **Build → Storage**
2. Add to `.env`:

```env
REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
```

---

### 🔹 OpenAI ChatGPT *(optional)*

1. Get your API key from [OpenAI](https://platform.openai.com/)
2. Add to `.env`:

```env
REACT_APP_OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXX
```

---

### 🔹 SerpApi *(optional)*

1. Sign up and get your key from [SerpApi](https://serpapi.com/)
2. Add to `.env`:

```env
REACT_APP_SERPAPI_API_KEY=XXXXXXXXXXXXXXXX
```

---

### 🔹 Dropbox API *(optional)*

1. Create an app on [Dropbox Developer Console](https://www.dropbox.com/developers/apps)
2. Generate an access token
3. Add to `.env`:

```env
REACT_APP_DROPBOX_ACCESS_TOKEN=sl.AAAAAAAAAAAA
```

---

### 🔹 DeepSeek API *(optional)*

1. Register at [DeepSeek](https://platform.deepseek.com/)
2. Add to `.env`:

```env
REACT_APP_DEEPSEEK_API_KEY=sk-XXXXXXXXXXXXXXXX
```

---

### 🔹 Gemini API by Google *(optional)*

1. Visit [MakerSuite](https://makersuite.google.com/app) or [AI Studio](https://aistudio.google.com/app/apikey)
2. Generate your API key and add to `.env`:

```env
REACT_APP_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXX
```

---

## ✅ Final `.env` Example

```env
REACT_APP_FIREBASE_APIKEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_DATABASE_URL=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...               # Optional
REACT_APP_GOOGLE_CLIENT_ID=...

REACT_APP_OPENAI_API_KEY=...                        # Optional
REACT_APP_SERPAPI_API_KEY=...                       # Optional
REACT_APP_DROPBOX_ACCESS_TOKEN=...                  # Optional
REACT_APP_DEEPSEEK_API_KEY=...                      # Optional
REACT_APP_GEMINI_API_KEY=...                        # Optional
```

---

## 📊 Component Architecture

### 📁 Project Structure

```
src/
└── components/
    ├── blocks/         # UI blocks like menus, brand, breadcrumbs, notifications
    ├── ui/
    │   ├── fields/     # Form fields like Input, Select, Upload
    │   └── ...         # Other UI parts: Card, Table, Alert, Modal, etc.
    ├── widgets/        # High-level functional components (Form, Grid, ImageEditor)
    ├── sections/       # Full layout sections (e.g., Topbar, Footer)
    └── index.ts        # Aggregated export of all components
```

You can import any component centrally:

```tsx
import { Form, Grid, Card, Input, Modal } from 'react-firestrap';
```

---

## 📚 More Info

For a complete walkthrough of API integrations, see [`ai-project-setup-guide.md`](./ai-project-setup-guide.md)

If you have questions or need help setting up, feel free to open an issue or contribute!
