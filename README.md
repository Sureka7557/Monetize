# Monetize 💳

Monetize is a modern subscription management app built with React Native, Expo, Clerk Authentication, and PostHog Analytics. It helps users track recurring subscriptions, monitor spending, and gain insights into subscription usage.

## Features

### Authentication

* Secure Sign Up and Sign In with Clerk
* Email verification
* Password recovery
* Session management

### Subscription Management

* Add subscriptions
* View subscription details
* Track upcoming renewals
* Categorize subscriptions
* Monitor monthly costs

### Insights Dashboard

* Subscription analytics
* Spending overview
* Category breakdown
* Monthly trends
* Usage insights

### Analytics

* PostHog integration
* User sign up tracking
* User sign in tracking
* Subscription creation tracking
* Subscription view tracking
* Screen analytics

## Tech Stack

* React Native
* Expo SDK 54
* Expo Router
* TypeScript
* Clerk Authentication
* PostHog Analytics
* React Native Chart Kit

## Installation

Clone the repository:

```bash
git clone https://github.com/Sureka7557/Monetize.git
cd Monetize
```

Install dependencies:

```bash
npm install
```

or

```bash
bun install
```

Create a `.env` file:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Start the development server:

```bash
npx expo start
```

## Project Structure

```text
app/
├── (auth)/
│   ├── sign-in.tsx
│   └── sign-up.tsx
│
├── (tabs)/
│   ├── index.tsx
│   ├── subscriptions.tsx
│   ├── insights.tsx
│   └── settings.tsx
│
components/
constants/
assets/
lib/
```

## Analytics Events

Tracked with PostHog:

* Application Opened
* Sign Up Completed
* Sign In Completed
* Sign Out
* Subscription Created
* Subscription Viewed

## Screens

* Home
* Subscriptions
* Insights
* Settings
* Sign In
* Sign Up

## Future Enhancements

* Subscription editing
* Subscription deletion
* Push notifications
* Budget tracking
* Spending forecasts
* Multi-currency support
* Cloud sync

## License

This project is for educational and portfolio purposes.

## Author

**Sureka**
