import * as COS from "ibm-cos-sdk";

const apiKey =
  process.env.COS_API_KEY ?? process.env.apikey ?? "";
const resourceInstanceId =
  process.env.COS_RESOURCE_INSTANCE_ID ??
  process.env.resource_instance_id ??
  "";
const endpoint =
  process.env.COS_S3_ENDPOINT ??
  process.env.COS_ENDPOINT ??
  process.env.endpoint ??
  "s3.us-east.cloud-object-storage.appdomain.cloud";

const bucket =
  process.env.COS_BUCKET ??
  process.env.bucket ??
  "cloud-object-storage-cos-standard-rpf";

const publicBaseUrl =
  process.env.COS_PUBLIC_BASE_URL ??
  process.env.public_base_url ??
  `https://${bucket}.${endpoint}`;

export const cosBucket = bucket;
export const cosPublicBaseUrl = publicBaseUrl;

export const cosClient =
  apiKey && resourceInstanceId
    ? new COS.S3({
        endpoint: new COS.Endpoint(endpoint),
        apiKeyId: apiKey,
        serviceInstanceId: resourceInstanceId,
        ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
        signatureVersion: "iam",
      })
    : null;
