# Bot-statistics
[![Discord Bots](https://top.gg/api/widget/749037285621628950.svg)](https://top.gg/bot/749037285621628950)

# Commands
First, add the bot from [here](https://discord.com/api/oauth2/authorize?client_id=749037285621628950&permissions=268790864&redirect_uri=https%3A%2F%2Freggeltbot.zal1000.net&scope=bot), if you haven't added it already

- `r!count` to check how many times you wished morning for everyone on the server

- `r!leaderboard` to get the first 10 people (THIS IS STILL IN DEVELOPMENT)

- `r!cooldown` to get the current server cooldown (THIS IS STILL IN DEVELOPMENT)

- `r!cooldown set HOUR` to set server cooldown (set to 0 to disable cooldown) (THIS IS STILL IN DEVELOPMENT)

- `r!help` to get this list in the discord chat

# Setup-self-hosting
This bot is not created for self-hosting, but if you want to, here's a little tutorial

- Click [here](#GKE-Setup) for [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine) setup

1. Clone repository with `git clone https://github.com/zal1000/reggeltbot`
2. Add `ENV GOOGLE_APPLICATION_CREDENTIALS path/to/serviceAccountKey.js` (replace "path/to/serviceAccountKey.js" with the service account key pl.: "./serviceAccountKey.json")
3. Build docker image with `docker build reggeltbot:latest`

# GKE-Setup
1. Clone repository with `git clone https://github.com/zal1000/reggeltbot`
2. Upload repository to Github/Gitbucket/Google Source Repositories (Make sure to set the ropsitory to private)
- Make sure to disbale the autoscaler and set the replica number to 1
- Install the [gcloud SDK]() if you haven't done it already
3. 
 When the bot deploy as a workload, set `GOOGLE_APPLICATION_CREDENTIALS` enviorment variable to: `/var/secrets/google/key.json`

!!! DO NOT DELETE ENY EXISTING DATA, JUST ADD IT TO THE VALUES TO THE YAML FILE !!!
```
spec:
  template:
    spec:
      containers:
      - env:
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: /var/secrets/google/key.json
      volumes:
      - name: google-cloud-key
        secret:
          secretName: firebase-key
```
!!! DO NOT DELETE ENY EXISTING DATA, JUST ADD IT TO THE VALUES TO THE YAML FILE !!!