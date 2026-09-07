/**
 * WorkNest WebRTC & Media Engine
 * Implements real browser-native peer connections, active speaker audio analysis,
 * screen sharing, device selection, and connection health monitoring.
 */

import { MeetingSignal } from '../types';
import { sendMeetingSignal } from './firestoreService';

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface PeerConnectionWrapper {
  peerId: string;
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

export class WorkNestMeetingEngine {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private meetingId: string;
  private currentUserId: string;
  private audioContext: AudioContext | null = null;
  private audioAnalysers: Map<string, AnalyserNode> = new Map();
  private activeSpeakerCheckInterval: any = null;

  public onRemoteStreamAdded?: (peerId: string, stream: MediaStream) => void;
  public onRemoteStreamRemoved?: (peerId: string) => void;
  public onActiveSpeakerChange?: (speakerUserId: string | null) => void;
  public onConnectionQualityChange?: (peerId: string, quality: 'excellent' | 'good' | 'poor' | 'reconnecting') => void;
  public onScreenShareEnded?: () => void;

  constructor(meetingId: string, currentUserId: string) {
    this.meetingId = meetingId;
    this.currentUserId = currentUserId;
  }

  // 1. Media Acquisition
  public async getMediaDevices(): Promise<{ audioInputs: DeviceInfo[]; videoInputs: DeviceInfo[]; audioOutputs: DeviceInfo[] }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.substring(0, 5)}`, kind: d.kind })),
        videoInputs: devices.filter(d => d.kind === 'videoinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.substring(0, 5)}`, kind: d.kind })),
        audioOutputs: devices.filter(d => d.kind === 'audiooutput').map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.substring(0, 5)}`, kind: d.kind }))
      };
    } catch (e) {
      console.warn('Could not enumerate media devices:', e);
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }
  }

  public async startLocalMedia(audio: boolean = true, video: boolean = true, audioDeviceId?: string, videoDeviceId?: string): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audio ? (audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true) : false,
        video: video ? (videoDeviceId ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 1280 }, height: { ideal: 720 } }) : false
      };

      // Stop previous tracks if any
      this.stopLocalMedia();

      if (!audio && !video) {
        // Create an empty dummy media stream if user starts with both disabled
        this.localStream = new MediaStream();
        return this.localStream;
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.setupAudioAnalyser('local', this.localStream);
      this.startActiveSpeakerDetection();
      return this.localStream;
    } catch (err: any) {
      console.warn('getUserMedia failed, trying audio-only fallback:', err);
      if (video) {
        // Fallback to audio only if camera is unavailable/denied
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          this.setupAudioAnalyser('local', this.localStream);
          this.startActiveSpeakerDetection();
          return this.localStream;
        } catch (audioErr) {
          throw audioErr;
        }
      }
      throw err;
    }
  }

  public setAudioEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  public setVideoEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // 2. Screen Sharing
  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported by your browser.');
      }

      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Listen for when the user clicks browser "Stop sharing" chrome
      const videoTrack = this.screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopScreenShare();
          if (this.onScreenShareEnded) this.onScreenShareEnded();
        };
      }

      // Replace track on all existing peer connections
      this.peerConnections.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        }
      });

      return this.screenStream;
    } catch (err) {
      console.warn('Screen sharing error:', err);
      return null;
    }
  }

  public stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }

    // Restore original camera track
    if (this.localStream) {
      const camTrack = this.localStream.getVideoTracks()[0] || null;
      this.peerConnections.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(camTrack);
        }
      });
    }
  }

  // 3. WebRTC Peer Connections & Signaling Handshake
  public async initiateConnectionToPeer(peerId: string) {
    if (this.peerConnections.has(peerId)) return;

    const pc = this.createPeerConnection(peerId);
    this.peerConnections.set(peerId, pc);

    // Add local tracks
    const activeStream = this.screenStream || this.localStream;
    if (activeStream) {
      activeStream.getTracks().forEach(track => pc.addTrack(track, activeStream));
    }

    // Create Offer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendMeetingSignal({
        meetingId: this.meetingId,
        from: this.currentUserId,
        to: peerId,
        type: 'offer',
        payload: { sdp: offer.sdp, type: offer.type }
      });
    } catch (e) {
      console.warn('Error creating offer for peer:', peerId, e);
    }
  }

  public async handleIncomingSignal(signal: MeetingSignal) {
    if (signal.meetingId !== this.meetingId || signal.to !== this.currentUserId) return;

    const peerId = signal.from;

    if (signal.type === 'offer') {
      let pc = this.peerConnections.get(peerId);
      if (!pc) {
        pc = this.createPeerConnection(peerId);
        this.peerConnections.set(peerId, pc);
        
        const activeStream = this.screenStream || this.localStream;
        if (activeStream) {
          activeStream.getTracks().forEach(track => pc!.addTrack(track, activeStream));
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendMeetingSignal({
        meetingId: this.meetingId,
        from: this.currentUserId,
        to: peerId,
        type: 'answer',
        payload: { sdp: answer.sdp, type: answer.type }
      });
    } else if (signal.type === 'answer') {
      const pc = this.peerConnections.get(peerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
      }
    } else if (signal.type === 'ice-candidate') {
      const pc = this.peerConnections.get(peerId);
      if (pc && signal.payload) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        } catch (err) {
          console.warn('Failed to add ICE candidate:', err);
        }
      }
    }
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMeetingSignal({
          meetingId: this.meetingId,
          from: this.currentUserId,
          to: peerId,
          type: 'ice-candidate',
          payload: event.candidate.toJSON()
        });
      }
    };

    pc.ontrack = (event) => {
      let remoteStream = this.remoteStreams.get(peerId);
      if (!remoteStream) {
        remoteStream = new MediaStream();
        this.remoteStreams.set(peerId, remoteStream);
      }
      event.streams[0].getTracks().forEach(track => {
        if (!remoteStream!.getTracks().some(t => t.id === track.id)) {
          remoteStream!.addTrack(track);
        }
      });

      this.setupAudioAnalyser(peerId, remoteStream);

      if (this.onRemoteStreamAdded) {
        this.onRemoteStreamAdded(peerId, remoteStream);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      let quality: 'excellent' | 'good' | 'poor' | 'reconnecting' = 'good';

      if (state === 'connected') quality = 'excellent';
      else if (state === 'connecting') quality = 'good';
      else if (state === 'disconnected') quality = 'reconnecting';
      else if (state === 'failed') quality = 'poor';

      if (this.onConnectionQualityChange) {
        this.onConnectionQualityChange(peerId, quality);
      }
    };

    return pc;
  }

  // 4. Active Speaker Audio Level Detection
  private setupAudioAnalyser(id: string, stream: MediaStream) {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }

      if (!this.audioContext || stream.getAudioTracks().length === 0) return;

      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      this.audioAnalysers.set(id, analyser);
    } catch (e) {
      console.warn('Could not setup audio analyser:', e);
    }
  }

  private startActiveSpeakerDetection() {
    if (this.activeSpeakerCheckInterval) return;

    this.activeSpeakerCheckInterval = setInterval(() => {
      let highestVolume = 15; // Noise floor threshold
      let dominantSpeaker: string | null = null;

      this.audioAnalysers.forEach((analyser, id) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;

        if (avg > highestVolume) {
          highestVolume = avg;
          dominantSpeaker = id === 'local' ? this.currentUserId : id;
        }
      });

      if (this.onActiveSpeakerChange) {
        this.onActiveSpeakerChange(dominantSpeaker);
      }
    }, 400);
  }

  public getRemoteStream(peerId: string): MediaStream | undefined {
    return this.remoteStreams.get(peerId);
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public cleanup() {
    if (this.activeSpeakerCheckInterval) {
      clearInterval(this.activeSpeakerCheckInterval);
      this.activeSpeakerCheckInterval = null;
    }

    this.stopLocalMedia();
    this.stopScreenShare();

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.audioAnalysers.clear();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
  }
}
