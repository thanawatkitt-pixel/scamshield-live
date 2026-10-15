const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://scamshield-live-api.onrender.com";

export async function scanMessage(message: string) {
  const res = await fetch(`${API_URL}/api/scan/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export async function scanLink(url: string) {
  const res = await fetch(`${API_URL}/api/scan/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export async function scanVoiceTranscript(transcript: string) {
  const res = await fetch(`${API_URL}/api/scan/voice/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export async function startCounterScam(scamType: string = "general") {
  const res = await fetch(
    `${API_URL}/api/counter-scam/start?scam_type=${encodeURIComponent(scamType)}`,
    { method: "POST" }
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export async function counterScamTurn(data: {
  session_id: string;
  scam_type: string;
  scammer_message: string;
  conversation_history: Array<{ speaker: string; text: string }>;
  extracted_info?: Record<string, string>;
  info_still_needed?: string[];
}) {
  const res = await fetch(`${API_URL}/api/counter-scam/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}
