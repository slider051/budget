export type OpsAlertSeverity = "critical" | "error" | "warn";

export interface OpsAlertInput {
  readonly severity: OpsAlertSeverity;
  readonly source: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

interface SendOpsAlertOptions {
  readonly fetcher?: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
}

function getWebhookUrl(): string | null {
  const raw = process.env.OPS_ALERT_WEBHOOK_URL;
  if (!raw) return null;
  const url = raw.trim();
  return url.length > 0 ? url : null;
}

function getIsoTimestamp(): string {
  return new Date().toISOString();
}

export function buildOpsAlertMessage(input: OpsAlertInput): string {
  const severity = input.severity.toUpperCase();
  const lines = [
    `[${severity}] ${input.source}`,
    input.message,
    `time=${getIsoTimestamp()}`,
  ];

  if (input.details && Object.keys(input.details).length > 0) {
    lines.push(`details=${JSON.stringify(input.details)}`);
  }

  return lines.join("\n");
}

export async function sendOpsAlert(
  input: OpsAlertInput,
  options: SendOpsAlertOptions = {},
): Promise<boolean> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) return false;

  const fetcher = options.fetcher ?? fetch;
  const message = buildOpsAlertMessage(input);
  const payload = {
    text: message,
    content: message,
  };

  try {
    const response = await fetcher(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[ops-alert] webhook failed", {
        source: input.source,
        severity: input.severity,
        status: response.status,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("[ops-alert] webhook request error", {
      source: input.source,
      severity: input.severity,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}
