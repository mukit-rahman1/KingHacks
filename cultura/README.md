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
