This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Amazon Bedrock RAG (Knowledge Base)
This app uses Amazon Bedrock Knowledge Bases for the chatbot.

### One-time AWS setup (console)
1) Enable Bedrock in `us-east-1`.
2) Create an S3 bucket for knowledge base documents (e.g. `cultura-rag-docs`).
3) Upload your seed document (txt/pdf/csv) to that bucket.
4) Create a **Knowledge Base** in Bedrock:
   - Data source: your S3 bucket.
   - Embeddings model: use the default or `amazon.titan-embed-text-v2`.
   - Vector store: use the managed option.
5) Run the ingestion job and wait for it to complete.
6) Copy the **Knowledge Base ID** and the **Model ARN** you want for responses.

### Env vars
Add these to your `.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=... # optional

BEDROCK_KB_ID=... # Knowledge Base ID
BEDROCK_MODEL_ID=arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0

# Optional:
BEDROCK_MAX_RESULTS=5
BEDROCK_PROMPT_TEMPLATE=You are a community finder. Use the knowledge base only. When asked for a club or organization, respond with: "Organization: <name> — Tags: <tag1, tag2, ...>". If no matches, say: "Sorry, there doesn't seem to be clubs like that right now. Check again later or make one!"
```

### Updating the chatbot knowledge
When you add or change organizations/events, update the source document in S3 and re-run the ingestion job for the knowledge base.

## Chatbase widget (optional alternative)
This app can also use the Chatbase widget on `/chat`.

Env vars:
```
NEXT_PUBLIC_CHATBASE_CHATBOT_ID=your_chatbase_id
NEXT_PUBLIC_CHATBASE_DOMAIN=www.chatbase.co
CHATBOT_IDENTITY_SECRET=your_chatbase_identity_secret
```

Install dependency:
```bash
npm install
```

## IBM Cloud Object Storage uploads
This app supports public image uploads for profiles and events via IBM COS.

Required env vars:
- `COS_API_KEY` (or `apikey`)
- `COS_RESOURCE_INSTANCE_ID` (or `resource_instance_id`)
- `COS_S3_ENDPOINT` (e.g. `s3.us-east.cloud-object-storage.appdomain.cloud`)
- `COS_BUCKET` (your bucket name)

Optional:
- `COS_PUBLIC_BASE_URL` (defaults to `https://{bucket}.{endpoint}`)

Database columns:
```sql
alter table public.individual_profiles add column if not exists avatar_url text;
alter table public.organizations add column if not exists logo_url text;
```

Install dependency:
```bash
npm install
```
