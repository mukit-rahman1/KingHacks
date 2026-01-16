import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

type BedrockChatResult = {
  ok: boolean;
  reply: string;
  error?: string;
};

const getBedrockClient = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  return new BedrockAgentRuntimeClient({
    region,
    credentials:
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey, sessionToken }
        : undefined,
  });
};

const getPromptTemplate = () => {
  const prompt = process.env.BEDROCK_PROMPT_TEMPLATE;
  return typeof prompt === "string" && prompt.trim() ? prompt.trim() : "";
};

const getMaxResults = () => {
  const raw = process.env.BEDROCK_MAX_RESULTS;
  const parsed = raw ? Number.parseInt(raw, 10) : 5;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
};

export async function sendBedrockChatMessage(params: {
  message: string;
}): Promise<BedrockChatResult> {
  const knowledgeBaseId = process.env.BEDROCK_KB_ID;
  const modelArn = process.env.BEDROCK_MODEL_ID;

  if (!knowledgeBaseId || !modelArn) {
    return {
      ok: false,
      reply: "",
      error: "Bedrock knowledge base is not configured.",
    };
  }

  const client = getBedrockClient();
  const promptTemplate = getPromptTemplate();
  const maxResults = getMaxResults();

  try {
    const command = new RetrieveAndGenerateCommand({
      input: { text: params.message },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          knowledgeBaseId,
          modelArn,
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: maxResults,
            },
          },
          generationConfiguration: promptTemplate
            ? {
                promptTemplate: {
                  textPromptTemplate: promptTemplate,
                },
              }
            : undefined,
        },
      },
    });

    const response = await client.send(command);
    const reply = response.output?.text?.trim() ?? "";
    return { ok: Boolean(reply), reply, error: reply ? undefined : "No reply." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bedrock request failed.";
    return { ok: false, reply: "", error: message };
  }
}
