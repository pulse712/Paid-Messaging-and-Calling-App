import { NextRequest, NextResponse } from "next/server";

// In production, generate a proper Agora RTC token using the Agora token server
// For MVP testing, returning null allows joining without a token (only safe in development)
// Replace this with Agora token generation in production: https://docs.agora.io/en/video-calling/get-started/authentication-workflow

export async function POST(req: NextRequest) {
  const { channelName } = await req.json();

  if (!channelName) {
    return NextResponse.json({ error: "Channel name required" }, { status: 400 });
  }

  // TODO: Generate signed token using AGORA_APP_CERTIFICATE for production
  // const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, expireTime)
  return NextResponse.json({ token: null, channelName });
}
