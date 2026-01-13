type BackboardSearchItem = {
  id: string;
  score?: number;
  data?: Record<string, unknown>;
};

type BackboardSearchResponse = {
  items: BackboardSearchItem[];
};

type BackboardUpsertPayload = {
  id: string;
  type: "organization" | "event";
  text: string;
  metadata?: Record<string, unknown>;
};

const apiKey = process.env.BACKBOARD_API_KEY ?? "";
const baseUrl = process.env.BACKBOARD_BASE_URL ?? "";
const assistantId = process.env.BACKBOARD_ASSISTANT_ID ?? "";
const threadId = process.env.BACKBOARD_THREAD_ID ?? "";
const chatThreadId = process.env.BACKBOARD_CHAT_THREAD_ID ?? "";
const assistantName =
  process.env.BACKBOARD_ASSISTANT_NAME ?? "Cultura RAG";
const systemPrompt =
  process.env.BACKBOARD_SYSTEM_PROMPT ??
  "Answer only using the uploaded documents. If the answer is not in the documents, say you don't have that information yet.";
const chatGuardPrompt =
  process.env.BACKBOARD_CHAT_GUARD_PROMPT ?? systemPrompt;
const embeddingProvider = process.env.BACKBOARD_EMBEDDING_PROVIDER ?? "";
const embeddingModelName = process.env.BACKBOARD_EMBEDDING_MODEL_NAME ?? "";
const embeddingDimsRaw = process.env.BACKBOARD_EMBEDDING_DIMS ?? "";

const hasBackboardSearch = Boolean(apiKey && baseUrl);
const hasBackboardUpsert = Boolean(apiKey && baseUrl);

const normalizeRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

const extractId = (value: Record<string, unknown>) => {
  const candidate =
    value.id ??
    value.document_id ??
    value.doc_id ??
    value._id ??
    value.key;
  return typeof candidate === "string" ? candidate : "";
};

const extractData = (value: Record<string, unknown>) =>
  normalizeRecord(value.data) ??
  normalizeRecord(value.metadata) ??
  normalizeRecord(value.payload) ??
  normalizeRecord(value.document);

const toSearchItems = (payload: unknown): BackboardSearchItem[] => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === "string") {
          return { id: item };
        }
        const record = normalizeRecord(item);
        if (!record) return null;
        const id = extractId(record);
        const score =
          typeof record.score === "number" ? record.score : undefined;
        const data = extractData(record);
        return id ? { id, score, data } : null;
      })
      .filter((item): item is BackboardSearchItem => Boolean(item));
  }

  const record = normalizeRecord(payload);
  if (!record) return [];

  const candidates =
    record.results ??
    record.items ??
    record.data ??
    record.hits ??
    record.matches ??
    [];

  return toSearchItems(candidates);
};

export const isBackboardSearchEnabled = () => hasBackboardSearch;

let cachedThreadId = threadId;
let cachedChatThreadId = chatThreadId;
let cachedAssistantId = assistantId;
let threadPromise: Promise<string> | null = null;
let chatThreadPromise: Promise<string> | null = null;

const buildEmbeddingConfig = () => {
  const embeddingDims = Number(embeddingDimsRaw);
  return {
    ...(embeddingProvider ? { embedding_provider: embeddingProvider } : null),
    ...(embeddingModelName
      ? { embedding_model_name: embeddingModelName }
      : null),
    ...(Number.isFinite(embeddingDims) && embeddingDims > 0
      ? { embedding_dims: embeddingDims }
      : null),
  };
};

const getOrCreateThread = async () => {
  if (cachedThreadId) {
    return cachedThreadId;
  }

  if (threadPromise) {
    return threadPromise;
  }

  threadPromise = (async () => {
    let currentAssistantId = cachedAssistantId;

    if (!currentAssistantId) {
      const assistantResponse = await fetch(`${baseUrl}/assistants`, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: assistantName,
          system_prompt: systemPrompt,
          ...buildEmbeddingConfig(),
        }),
      });

      if (!assistantResponse.ok) {
        throw new Error("Failed to create Backboard assistant.");
      }

      const assistantData =
        (await assistantResponse.json()) as Record<string, unknown>;
      const createdId =
        typeof assistantData.assistant_id === "string"
          ? assistantData.assistant_id
          : "";

      if (!createdId) {
        throw new Error("Backboard assistant id missing.");
      }

      currentAssistantId = createdId;
      cachedAssistantId = createdId;
    }

    const threadResponse = await fetch(
      `${baseUrl}/assistants/${currentAssistantId}/threads`,
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!threadResponse.ok) {
      throw new Error("Failed to create Backboard thread.");
    }

    const threadData =
      (await threadResponse.json()) as Record<string, unknown>;
    const createdThreadId =
      typeof threadData.thread_id === "string" ? threadData.thread_id : "";

    if (!createdThreadId) {
      throw new Error("Backboard thread id missing.");
    }

    cachedThreadId = createdThreadId;
    cachedAssistantId = currentAssistantId;
    return createdThreadId;
  })();

  return threadPromise;
};

const getOrCreateChatThread = async () => {
  if (cachedChatThreadId) {
    return cachedChatThreadId;
  }

  if (chatThreadPromise) {
    return chatThreadPromise;
  }

  chatThreadPromise = (async () => {
    const currentAssistantId = await getOrCreateAssistantId();

    const threadResponse = await fetch(
      `${baseUrl}/assistants/${currentAssistantId}/threads`,
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!threadResponse.ok) {
      throw new Error("Failed to create Backboard chat thread.");
    }

    const threadData =
      (await threadResponse.json()) as Record<string, unknown>;
    const createdThreadId =
      typeof threadData.thread_id === "string" ? threadData.thread_id : "";

    if (!createdThreadId) {
      throw new Error("Backboard chat thread id missing.");
    }

    cachedChatThreadId = createdThreadId;
    return createdThreadId;
  })();

  return chatThreadPromise;
};

const getOrCreateAssistantId = async () => {
  if (cachedAssistantId) {
    return cachedAssistantId;
  }

  const assistantResponse = await fetch(`${baseUrl}/assistants`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: assistantName,
      system_prompt: systemPrompt,
      ...buildEmbeddingConfig(),
    }),
  });

  if (!assistantResponse.ok) {
    throw new Error("Failed to create Backboard assistant.");
  }

  const assistantData =
    (await assistantResponse.json()) as Record<string, unknown>;
  const createdId =
    typeof assistantData.assistant_id === "string"
      ? assistantData.assistant_id
      : "";

  if (!createdId) {
    throw new Error("Backboard assistant id missing.");
  }

  cachedAssistantId = createdId;
  return createdId;
};

export async function searchBackboard(params: {
  query: string;
  limit?: number;
  filters?: Record<string, unknown>;
}): Promise<BackboardSearchResponse> {
  if (!hasBackboardSearch) {
    return { items: [] };
  }

  let activeThreadId: string;
  try {
    activeThreadId = await getOrCreateThread();
  } catch {
    return { items: [] };
  }

  const { query, limit = 25, filters } = params;
  const filterLabel =
    filters && typeof filters.type === "string"
      ? `type:${filters.type}`
      : "";
  const content = filterLabel ? `${filterLabel}\n${query}` : query;

  const body = new URLSearchParams({
    content,
    stream: "false",
    memory: "Auto",
    limit: String(limit),
  });

  const response = await fetch(`${baseUrl}/threads/${activeThreadId}/messages`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return { items: [] };
  }

  const data = (await response.json()) as Record<string, unknown>;
  const replyContent = typeof data.content === "string" ? data.content : "";

  if (!replyContent) {
    return { items: toSearchItems(data) };
  }

  try {
    const parsed = JSON.parse(replyContent) as unknown;
    return { items: toSearchItems(parsed) };
  } catch {
    return { items: [] };
  }
}

export async function upsertBackboardDocument(payload: BackboardUpsertPayload) {
  if (!hasBackboardUpsert) {
    return { ok: false, skipped: true };
  }

  let activeThreadId: string;
  try {
    activeThreadId = await getOrCreateThread();
  } catch {
    return { ok: false };
  }

  const response = await fetch(`${baseUrl}/threads/${activeThreadId}/documents`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: payload.text,
      metadata: {
        ...payload.metadata,
        id: payload.id,
        type: payload.type,
      },
    }),
  });

  if (!response.ok) {
    return { ok: false };
  }

  return { ok: true };
}

export async function addBackboardMemory(params: {
  content: string;
  metadata?: Record<string, unknown>;
}) {
  if (!hasBackboardUpsert) {
    return { ok: false, skipped: true };
  }

  let activeAssistantId: string;
  try {
    activeAssistantId = await getOrCreateAssistantId();
  } catch {
    return { ok: false };
  }

  const response = await fetch(
    `${baseUrl}/assistants/${activeAssistantId}/memories`,
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: params.content,
        metadata: params.metadata,
      }),
    }
  );

  if (!response.ok) {
    return { ok: false };
  }

  return { ok: true };
}

export async function uploadBackboardDocument(file: File) {
  if (!hasBackboardUpsert) {
    return { ok: false, error: "Backboard not configured." };
  }

  let activeThreadId: string;
  try {
    activeThreadId = await getOrCreateThread();
  } catch {
    return { ok: false, error: "Unable to create Backboard thread." };
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch(
    `${baseUrl}/threads/${activeThreadId}/documents`,
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      error: `Backboard responded ${response.status}: ${body}`,
    };
  }

  return { ok: true };
}

export async function uploadBackboardAssistantDocument(params: {
  filename: string;
  content: string;
}) {
  if (!hasBackboardUpsert) {
    return { ok: false, error: "Backboard not configured." };
  }

  let activeAssistantId: string;
  try {
    activeAssistantId = await getOrCreateAssistantId();
  } catch {
    return { ok: false, error: "Unable to create Backboard assistant." };
  }

  const blob = new Blob([params.content], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", blob, params.filename);

  const response = await fetch(
    `${baseUrl}/assistants/${activeAssistantId}/documents`,
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      error: `Backboard responded ${response.status}: ${body}`,
    };
  }

  return { ok: true };
}

export async function sendBackboardChatMessage(params: { message: string }) {
  if (!hasBackboardSearch) {
    return { ok: false, reply: "", error: "Backboard not configured." };
  }

  let activeThreadId: string;
  try {
    activeThreadId = await getOrCreateChatThread();
  } catch {
    return { ok: false, reply: "", error: "Unable to create chat thread." };
  }

  const body = new URLSearchParams({
    content: `${chatGuardPrompt}\n\n${params.message}`,
    stream: "false",
    memory: "Auto",
  });

  const response = await fetch(
    `${baseUrl}/threads/${activeThreadId}/messages`,
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      reply: "",
      error: `Backboard responded ${response.status}: ${body}`,
    };
  }

  const data = (await response.json()) as Record<string, unknown>;
  const reply = typeof data.content === "string" ? data.content : "";

  return { ok: true, reply };
}
