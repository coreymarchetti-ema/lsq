# lsq
"Little String Quartet" Github branch creation app

This app grabs all repositories from whatever Github org you point it to and lists them out on the page.
The user selects as many as are required, provides a Jira key and a description, and clicks a button.
Whammo blammo, we get some branches created in Github!

_(Actually it's a two step process so we can verify what will be created first, but you get the idea)_

The ideal setup has you linking to this tool from Jira so we can bring along a Jira key as a query param and populate the page on load.
I decided to not carry over the ticket name, but that's doable if we wanted.

To run this app yourself you need a few things in place:
1. Define an Oauth App through the Github settings menu ("Developer Settings"). It needs a name (arbitrary), homepage URL (http://localhost:3000), and Oauth callback URL (http://localhost:3000/auth/oauth-callback).
2. Save off the client ID and client secret for the Oauth App in a .env file in /backend (as CLIENT_ID and CLIENT_SECRET)
3. From /src, run `docker-compose up`
4. Profit :dollar:

The client is at localhost:8080 and the server is at localhost:3000.

Some gotchas:
* The server code has my account (coreymarchetti-ema) hardcoded as the owner whose repos we'll go looking for. That's an easy manual change for ya.
* This tool can only grab public repos. I haven't dug too deep into how to authorize it to grab private repos too but it can be done.
