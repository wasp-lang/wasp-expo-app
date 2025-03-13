# Wasp Expo


https://github.com/user-attachments/assets/de6501fd-7c0a-4d43-8930-15a1fd64c20a


This is an example project using Wasp alongside an Expo mobile app. We want to demonstrate that users
can authenticate with the Wasp backend from a 3rd party client. Also, we would like to use the Wasp server
API from the Expo app.

## How does auth work?

The Expo app uses the `expo-auth-session` library to authenticate with the Wasp backend.
The user is redirected to the Wasp login page, where they can log in or sign up.
After the user logs in, they are redirected back to the Expo app with the session ID. The Expo app can use this session ID to authenticate with the Wasp backend.

The main piece of this logic can be found in the `expo-app/hooks/wasp.ts` file and in the `wasp-app/auth` dir.

## Env variables for development

### Wasp app

While developing locally, you might find it useful to set up the following environment variables:

In `wasp-app/.env.server`:

```
WASP_WEB_CLIENT_URL=http://192.168.0.6.nip.io:3000
WASP_SERVER_URL=http://192.168.0.6.nip.io:3000
```

where `192.168.0.6` is your local IP address. You can find it by running `ifconfig` on macOS/Linux or `ipconfig` on Windows to get the local IP.

In `wasp-app/.env.client`:

```
REACT_APP_API_URL=http://192.168.0.6.nip.io:3001
```

### Expo app

You MUST set the env vars for the Expo app in `expo-app/.env.local`:

```
EXPO_PUBLIC_WASP_SERVER_URL=http://192.168.0.6.nip.io:3001
EXPO_PUBLIC_WASP_CLIENT_URL=http://192.168.0.6.nip.io:3000
```

## Running the apps

### Expo app

Go into the Expo app folder, install deps and start the app:

```bash
cd expo-app
npm install
# Starts the Expo app in an iOS simulator
npm run ios
```

### Wasp app

Go into the Wasp app folder, start the DB:

```bash
cd wasp-app
wasp start db
```

In another terminal, migrate the database schema and start the Wasp app:

```bash
cd wasp-app
# Migrate the database schema if you haven't already
wasp db migrate-dev
wasp start
```
