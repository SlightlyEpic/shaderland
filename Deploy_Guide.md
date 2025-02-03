# Deployment Guide

In order to deploy shaderland, you'll have to set up:
- An Auth0 application
- A MongoDB instance (This guide uses MongoDB Atlas)
- A Groq AI application
- A host for your Next.js app (This guide uses Vercel)

1. Clone the shaderland git repository and cd into it
  `git clone https://github.com/SlightlyEpic/shaderland.git && cd shaderland`  
  
2. Copy .env.example into .env
  `cp .env.example .env`

3. Setting up a Mongo Atlas cluster:
    - Sign up on https://cloud.mongodb.com and create a cluster
    - Whitelist `0.0.0.0` to allow connections from the shaderland server
    - Copy the connection URI and paste it into the `DATABASE_URL` field of the .env file

4. Setting up an Auth0 application:
    - Create an account on Auth0
    - Go to Dashboard > Applications
    - Click "Create an Application" and select "Regular Web Applications"
    - Select Next.js as technology
    - (Optional) Create a sample user if prompted to
    - Inside application settings, set:
        - Application Login URI - `https://<your-domain-here>`
        - Allowed Callback URLs - `https://<your-domain-here>/api/auth/callback`
        - Allowed Logout URLs - `https://<your-domain-here>`
        - Allowed Web Origins - `https://<your-domain-here>`
    - Click save changes and scroll to the top
    - Copy "Domain" and paste into `AUTH0_ISSUER_BASE_URL` in .env
    - Copy Client ID and Client Secret and paste into `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` respectively
    - Set `AUTH0_BASE_URL` to `https://<your-domain-here>`
    - Run `openssl rand -hex 32` and copy the output into `AUTH0_SECRET` in .env

5. Creating a Groq AI application
    - Create an account on https://groq.com/
    - Click "Dev Console" and in the sidebar click API Keys
    - Create a new API key and paste it in `GROQ_API_KEY` in the .env file
6. Set `NODE_ENV` to `production` in the .env
7. Setting up vercel
    - Create a new vercel project and import your cloned repository (or my repository directly since its public)
    - Go into environment variables for the project and paste your .env
    - Start a new deployment
    - Your own shaderland instance should be up and running!
