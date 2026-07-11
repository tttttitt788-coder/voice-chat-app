import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function base64UrlEncode(data: Uint8Array): Promise<string> {
  const bytes = Array.from(data).map(b => String.fromCharCode(b)).join("");
  const base64 = btoa(bytes);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function base64UrlEncodeString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  return base64UrlEncode(encoder.encode(str));
}

async function createHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function signHmac(key: CryptoKey, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { roomName, participantIdentity, participantName } = await req.json();

    const apiKey = Deno.env.get("LIVEKIT_API_KEY");
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in Supabase secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;

    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      iss: apiKey,
      sub: participantIdentity,
      iat: now,
      exp,
      nbf: now,
      video: { roomJoin: true, room: roomName, canPublish: true, canSubscribe: true },
      sid: crypto.randomUUID(),
    };

    const headerB64 = await base64UrlEncodeString(JSON.stringify(header));
    const payloadB64 = await base64UrlEncodeString(JSON.stringify(payload));
    const signingInput = `${headerB64}.${payloadB64}`;

    const hmacKey = await createHmacKey(apiSecret);
    const signature = await signHmac(hmacKey, signingInput);

    const token = `${signingInput}.${signature}`;

    return new Response(
      JSON.stringify({ token, url: `wss://voicechat-${apiKey}.livekit.cloud` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
