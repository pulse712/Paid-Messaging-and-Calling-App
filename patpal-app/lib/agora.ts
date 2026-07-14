import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

export const createAgoraClient = (): IAgoraRTCClient => {
  return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
};

export const createLocalTracks = async (
  video = true
): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack | null]> => {
  if (video) {
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    return [audioTrack, videoTrack];
  } else {
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    return [audioTrack, null];
  }
};

export const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
