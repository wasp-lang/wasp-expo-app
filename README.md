# Wasp Expo

This is an example project using Wasp alongside an Expo mobile app. We want to demonstrate that users
can authenticate with the Wasp backend from a 3rd party client. Also, we would like to use the Wasp server
API from the Expo app.

## Brainstorming

Ways to implement auth with the current Wasp:

1. Use internal Wasp's server endpoints directly
   - store the session ID and put in the header of every request
2. Use Wasp's custom API endpoints which recreate the signup and login logic
   - store the session ID and put in the header of every request
3. Use webviews where users authenticate with Wasp and redirect to the app upon success
   - the app picks up some sort of one time token and uses it to get the session ID
   - store the session ID and put in the header of every request
