"use client";

import { useEffect, useRef, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { PatPalProfile, UserProfile } from "@/types";

interface Props {
  callType: "audio" | "video";
  channelName: string;
  remoteUser: PatPalProfile | UserProfile;
  onClose: () => void;
}

export default function CallModal({ callType, channelName, remoteUser, onClose }: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

    const init = async () => {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
          remoteVideoTrack.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
          remoteAudioTrack.play();
        }
      });

      // Join channel with null token (use Agora token server in production)
      await client.join(appId, channelName, null, null);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      let videoTrack: ICameraVideoTrack | null = null;

      if (callType === "video") {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        await client.publish([audioTrack, videoTrack]);
      } else {
        await client.publish([audioTrack]);
      }

      if (isMounted) {
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        setConnected(true);
      }
    };

    init().catch(console.error);

    return () => {
      isMounted = false;
      localAudioTrack?.close();
      localVideoTrack?.close();
      clientRef.current?.leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = async () => {
    if (!localAudioTrack) return;
    await localAudioTrack.setMuted(!muted);
    setMuted(!muted);
  };

  const toggleCamera = async () => {
    if (!localVideoTrack) return;
    await localVideoTrack.setMuted(!cameraOff);
    setCameraOff(!cameraOff);
  };

  const endCall = async () => {
    localAudioTrack?.close();
    localVideoTrack?.close();
    await clientRef.current?.leave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Remote video / avatar */}
      <div className="flex-1 relative flex items-center justify-center">
        {callType === "video" ? (
          <div ref={remoteVideoRef} className="w-full h-full" />
        ) : (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold">
              {remoteUser.displayName?.charAt(0).toUpperCase()}
            </div>
            <p className="text-xl font-semibold">{remoteUser.displayName}</p>
            <p className="text-gray-400 text-sm">
              {connected ? "Connected" : "Connecting..."}
            </p>
          </div>
        )}

        {/* Local video (pip) */}
        {callType === "video" && (
          <div
            ref={localVideoRef}
            className="absolute bottom-4 right-4 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden border-2 border-white"
          />
        )}
      </div>

      {/* Controls */}
      <div className="pb-10 pt-6 flex items-center justify-center gap-6 bg-gray-900">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
            muted ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          {muted ? "🔇" : "🎤"}
        </button>

        {callType === "video" && (
          <button
            onClick={toggleCamera}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
              cameraOff ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {cameraOff ? "📵" : "📷"}
          </button>
        )}

        <button
          onClick={endCall}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-2xl text-white transition-colors"
        >
          📵
        </button>
      </div>
    </div>
  );
}
