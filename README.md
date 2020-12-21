# Bot-statistics
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/901967bd048b414c9f265d6e5f711f53)](https://app.codacy.com/gh/zal1000/reggeltbot?utm_source=github.com&utm_medium=referral&utm_content=zal1000/reggeltbot&utm_campaign=Badge_Grade)
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
- If you already have a firebase project you can skip to `step 3`
2. Go to the [firebase console](https://console.firebase.google.com/) and create a new project
- If you already have a google cloud project you can import it 

3. Enable the realtie database and cloud firestore
4. Go to the project settings > Service account > Generate new private key

- Add 
```Dockerfile
ENV GOOGLE_APPLICATION_CREDENTIALS path/to/serviceAccountKey.json
```
- Build docker image with 
```bash
docker build reggeltbot:latest
``` 


# GKE-Setup
1. Clone repository with 
```bash
git clone https://github.com/zal1000/reggeltbot
```
2. Upload repository to Github/Gitbucket/Google Source Repositories (Make sure to set the repsitory to private)
- Make sure to disbale the autoscaler and set the replica number to 1
- Install the [gcloud SDK](https://cloud.google.com/sdk/docs/quickstart) if you haven't done it already
3. 
 When the bot deployed as a workload, set `GOOGLE_APPLICATION_CREDENTIALS` enviorment variable to: `/var/secrets/google/key.json` in the YAML file

!!! DO NOT DELETE ENY EXISTING DATA, JUST ADD IT TO THE VALUES TO THE YAML FILE !!!
```yaml
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

