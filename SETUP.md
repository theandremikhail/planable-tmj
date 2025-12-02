# Planable TMJ - Setup Guide

This guide will help you set up all the required API credentials for social media integrations.

## Table of Contents

1. [Vercel Deployment](#1-vercel-deployment)
2. [Database Setup (Vercel Postgres)](#2-database-setup)
3. [Twitter/X API Setup](#3-twitterx-api-setup)
4. [LinkedIn API Setup](#4-linkedin-api-setup)
5. [Facebook & Instagram API Setup](#5-facebook--instagram-api-setup)
6. [Google Gemini API Setup](#6-google-gemini-api-setup)
7. [Final Configuration](#7-final-configuration)

---

## 1. Vercel Deployment

### Prerequisites
- A [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional)

### Steps

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect the Vite framework

3. **Configure Environment Variables**
   - In your Vercel project settings, go to **Settings > Environment Variables**
   - Add all variables from `.env.example` (we'll fill these in as we set up each service)

4. **Deploy**
   - Click Deploy and note your production URL (e.g., `https://your-app.vercel.app`)
   - Set `NEXT_PUBLIC_APP_URL` to this URL

---

## 2. Database Setup

### Add Vercel Postgres

1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database** > **Postgres**
4. Follow the prompts to create a new Postgres database
5. Vercel will automatically add the database environment variables to your project

### Initialize Database Tables

After deploying, initialize the database by making a POST request:

```bash
curl -X POST https://your-app.vercel.app/api/db/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_CRON_SECRET"}'
```

---

## 3. Twitter/X API Setup

### Create a Twitter Developer Account

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Sign in with your Twitter account
3. Apply for a developer account if you don't have one

### Create a Twitter App

1. Go to the [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click **+ Create Project**
3. Name your project (e.g., "Planable TMJ")
4. Select use case: "Making a bot" or "Building tools for Twitter users"
5. Create an App within the project

### Configure OAuth 2.0

1. In your App settings, go to **User authentication settings**
2. Click **Set up**
3. Configure:
   - **App permissions**: Read and write
   - **Type of App**: Web App
   - **Callback URI**: `https://your-app.vercel.app/api/auth/twitter/callback`
   - **Website URL**: `https://your-app.vercel.app`

4. Save and note your:
   - **Client ID** → `TWITTER_CLIENT_ID`
   - **Client Secret** → `TWITTER_CLIENT_SECRET`

### Required Scopes
The app requests these scopes automatically:
- `tweet.read` - Read tweets
- `tweet.write` - Post tweets
- `users.read` - Read user profile
- `offline.access` - Refresh tokens

---

## 4. LinkedIn API Setup

### Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create app**
3. Fill in:
   - **App name**: Planable TMJ
   - **LinkedIn Page**: Select or create a company page
   - **App logo**: Upload a logo
   - **Legal agreement**: Check the box

### Configure OAuth 2.0

1. Go to the **Auth** tab
2. Under **OAuth 2.0 settings**:
   - Add **Authorized redirect URL**: `https://your-app.vercel.app/api/auth/linkedin/callback`

3. Note your:
   - **Client ID** → `LINKEDIN_CLIENT_ID`
   - **Client Secret** → `LINKEDIN_CLIENT_SECRET`

### Request API Products

1. Go to the **Products** tab
2. Request access to:
   - **Share on LinkedIn** - Required for posting
   - **Sign In with LinkedIn using OpenID Connect** - For authentication

> **Note**: Some products require verification. The basic "Share on LinkedIn" is usually instant.

### Required Scopes
- `openid` - OpenID Connect
- `profile` - User profile
- `email` - User email
- `w_member_social` - Post on behalf of user

---

## 5. Facebook & Instagram API Setup

> **Important**: Instagram uses the Facebook Graph API. You need ONE Facebook App for both platforms.

### Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Business** type
4. Fill in app details:
   - **App name**: Planable TMJ
   - **App contact email**: Your email

### Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web**
4. Enter your website URL: `https://your-app.vercel.app`
5. Go to **Facebook Login > Settings**
6. Add **Valid OAuth Redirect URIs**:
   - `https://your-app.vercel.app/api/auth/facebook/callback`
   - `https://your-app.vercel.app/api/auth/instagram/callback`

### Configure Instagram Basic Display (for Instagram)

1. Click **Add Product**
2. Find **Instagram Basic Display** and click **Set Up**
3. Create a new Instagram App ID
4. Add **Valid OAuth Redirect URIs**:
   - `https://your-app.vercel.app/api/auth/instagram/callback`
5. Add **Deauthorize Callback URL**: `https://your-app.vercel.app/api/auth/instagram/deauthorize`
6. Add **Data Deletion Request URL**: `https://your-app.vercel.app/api/auth/instagram/delete`

### Get Your Credentials

1. Go to **Settings > Basic**
2. Note your:
   - **App ID** → `FACEBOOK_APP_ID`
   - **App Secret** → `FACEBOOK_APP_SECRET`

### Required Permissions

**For Facebook Pages:**
- `pages_show_list` - List pages user manages
- `pages_read_engagement` - Read page content
- `pages_manage_posts` - Create/edit posts

**For Instagram:**
- `instagram_basic` - Read Instagram profile
- `instagram_content_publish` - Publish to Instagram

### App Review (for Production)

For production use beyond test users, you need to submit your app for review:

1. Go to **App Review > Permissions and Features**
2. Request the permissions listed above
3. Provide use case documentation
4. Submit for review (can take 1-5 business days)

### Instagram Business Account Requirement

Instagram posting ONLY works with:
- **Instagram Business Account** or **Instagram Creator Account**
- The account must be connected to a **Facebook Page**

To set this up:
1. Convert your Instagram to a Business/Creator account in the Instagram app
2. Connect it to a Facebook Page you manage

---

## 6. Google Gemini API Setup

### Get an API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key → `GEMINI_API_KEY`

> **Note**: The free tier includes generous limits for development and small-scale production.

---

## 7. Final Configuration

### Environment Variables Checklist

Add all these to your Vercel project:

```env
# App URL (your Vercel deployment URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron Secret (generate with: openssl rand -hex 32)
CRON_SECRET=your_generated_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Facebook/Instagram (same credentials for both)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

### Initialize Database

After adding all environment variables:

```bash
curl -X POST https://your-app.vercel.app/api/db/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_CRON_SECRET"}'
```

### Test the Integration

1. Go to your app: `https://your-app.vercel.app`
2. Open Settings (gear icon in sidebar)
3. Try connecting each social platform
4. Create a test post and try publishing

---

## Troubleshooting

### Common Issues

**"OAuth error" when connecting accounts**
- Verify redirect URIs match exactly (including https://)
- Check that all API credentials are correct
- Ensure your app has the required permissions

**"No Instagram Business account found"**
- Make sure your Instagram is a Business or Creator account
- Connect your Instagram to a Facebook Page
- Use the same Facebook account that owns the Page

**"Token expired" on connected accounts**
- Click the account to reconnect
- This refreshes the access token

**Posts not publishing on schedule**
- Check that Vercel Cron is enabled (Vercel Pro required for cron)
- Verify `CRON_SECRET` is set
- Check the Vercel function logs for errors

### Getting Help

- Check the [Vercel documentation](https://vercel.com/docs)
- Twitter API: [developer.twitter.com/en/docs](https://developer.twitter.com/en/docs)
- LinkedIn API: [learn.microsoft.com/linkedin](https://learn.microsoft.com/en-us/linkedin/)
- Facebook/Instagram API: [developers.facebook.com/docs](https://developers.facebook.com/docs)

---

## API Rate Limits

Be aware of platform rate limits:

| Platform | Limit |
|----------|-------|
| Twitter | 1,500 tweets/month (free tier) |
| LinkedIn | 100 posts/day (user), higher for pages |
| Facebook | Varies by endpoint |
| Instagram | 25 posts/day per account |

---

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore` by default
2. **Rotate secrets regularly** - Especially if exposed
3. **Use HTTPS only** - All OAuth flows require HTTPS
4. **Token storage** - Tokens are stored encrypted in Vercel Postgres
