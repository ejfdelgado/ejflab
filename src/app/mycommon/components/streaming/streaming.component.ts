import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  created: (room: string, clientId: any) => void;
  full: (room: string) => void;
  ipaddr: (room: string) => void;
  joined: (room: string, clientId: any) => void;
  log: (array: Array<any>) => void;
}

interface ClientToServerEvents {
  'create or join': (room: string) => void;
}

export class MySocketStreaming {
  isInitiator: boolean | null = null;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
  constructor(room: string) {
    console.log(`Starting MySocketStreaming ${room}`);
    if (room !== '') {
      console.log('Message from client: Asking to join room ' + room);
      this.socket.emit('create or join', room);
    }

    this.socket.on('created', (room, clientId) => {
      this.isInitiator = true;
    });

    this.socket.on('full', (room) => {
      console.log('Message from client: Room ' + room + ' is full :^(');
    });

    this.socket.on('ipaddr', (ipaddr) => {
      console.log('Message from client: Server IP address is ' + ipaddr);
    });

    this.socket.on('joined', (room, clientId) => {
      this.isInitiator = false;
    });

    this.socket.on('log', (array: Array<any>) => {
      console.log.apply(console, array);
    });
  }
}

const mediaStreamConstraints = {
  video: true,
};

const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true,
};

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.css'],
})
export class StreamingComponent implements OnInit {
  // The video element where the stream is displayed
  localVideo: HTMLVideoElement | null = null;
  remoteVideo: HTMLVideoElement | null = null;
  // The local stream that's displayed on the video
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  localPeerConnection: RTCPeerConnection | null = null;
  remotePeerConnection: RTCPeerConnection | null = null;
  startTime: number | null = null;
  constructor() {}

  // Handle success and add the MediaStream to the video element
  gotLocalMediaStream(mediaStream: any) {
    this.localStream = mediaStream;
    if (this.localVideo) {
      this.localVideo.srcObject = mediaStream;
      //callButton.disabled = false;
    }
  }

  // Handle error and log a message to the console with the error message
  handleLocalMediaStreamError(error: Error) {
    console.log(`navigator.getUserMedia error: ${error.toString()}.`);
  }

  getVideoById(id: string): HTMLVideoElement | null {
    const temp = document.getElementById(id);
    if (temp instanceof HTMLVideoElement) {
      return temp;
    }
    return null;
  }

  gotRemoteMediaStream(event: any) {
    const mediaStream = event.stream;
    if (this.remoteVideo) {
      this.remoteVideo.srcObject = mediaStream;
    }
    this.remoteStream = mediaStream;
    console.log('Remote peer connection received remote stream.');
  }

  logVideoLoaded(event: any) {
    const video = event.target;
    console.log(
      `${video.id} videoWidth: ${video.videoWidth}px, ` +
        `videoHeight: ${video.videoHeight}px.`
    );
  }

  logResizedVideo(event: any) {
    this.logVideoLoaded(event);

    if (this.startTime) {
      const elapsedTime = window.performance.now() - this.startTime;
      this.startTime = null;
      console.log(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
    }
  }

  getOtherPeer(peerConnection: any) {
    return peerConnection === this.localPeerConnection
      ? this.remotePeerConnection
      : this.localPeerConnection;
  }

  getPeerName(peerConnection: any) {
    return peerConnection === this.localPeerConnection
      ? 'localPeerConnection'
      : 'remotePeerConnection';
  }

  handleConnectionSuccess(peerConnection: any) {
    console.log(`${this.getPeerName(peerConnection)} addIceCandidate success.`);
  }

  handleConnectionFailure(peerConnection: any, error: any) {
    console.log(
      `${this.getPeerName(peerConnection)} failed to add ICE Candidate:\n` +
        `${error.toString()}.`
    );
  }

  handleConnectionChange(event: any) {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    console.log(
      `${this.getPeerName(peerConnection)} ICE state: ` +
        `${peerConnection.iceConnectionState}.`
    );
  }

  setSessionDescriptionError(error: Error) {
    console.log(`Failed to create session description: ${error.toString()}.`);
  }

  setDescriptionSuccess(peerConnection: any, functionName: string) {
    const peerName = this.getPeerName(peerConnection);
    console.log(`${peerName} ${functionName} complete.`);
  }

  setLocalDescriptionSuccess(peerConnection: any) {
    this.setDescriptionSuccess(peerConnection, 'setLocalDescription');
  }

  setRemoteDescriptionSuccess(peerConnection: any) {
    this.setDescriptionSuccess(peerConnection, 'setRemoteDescription');
  }

  createdOffer(description: any) {
    console.log(`Offer from localPeerConnection:\n${description.sdp}`);

    const setSessionDescriptionErrorThis =
      this.setSessionDescriptionError.bind(this);
    const createdAnswerThis = this.createdAnswer.bind(this);

    console.log('localPeerConnection setLocalDescription start.');
    if (this.localPeerConnection) {
      this.localPeerConnection
        .setLocalDescription(description)
        .then(() => {
          this.setLocalDescriptionSuccess(this.localPeerConnection);
        })
        .catch(setSessionDescriptionErrorThis);
    }

    console.log('remotePeerConnection setRemoteDescription start.');
    if (this.remotePeerConnection) {
      this.remotePeerConnection
        .setRemoteDescription(description)
        .then(() => {
          this.setRemoteDescriptionSuccess(this.remotePeerConnection);
        })
        .catch(setSessionDescriptionErrorThis);
    }

    console.log('remotePeerConnection createAnswer start.');
    if (this.remotePeerConnection) {
      this.remotePeerConnection
        .createAnswer()
        .then(createdAnswerThis)
        .catch(setSessionDescriptionErrorThis);
    }
  }

  createdAnswer(description: any) {
    console.log(`Answer from remotePeerConnection:\n${description.sdp}.`);

    const setSessionDescriptionErrorThis =
      this.setSessionDescriptionError.bind(this);

    console.log('remotePeerConnection setLocalDescription start.');
    if (this.remotePeerConnection) {
      this.remotePeerConnection
        .setLocalDescription(description)
        .then(() => {
          this.setLocalDescriptionSuccess(this.remotePeerConnection);
        })
        .catch(setSessionDescriptionErrorThis);
    }

    console.log('localPeerConnection setRemoteDescription start.');
    if (this.localPeerConnection) {
      this.localPeerConnection
        .setRemoteDescription(description)
        .then(() => {
          this.setRemoteDescriptionSuccess(this.localPeerConnection);
        })
        .catch(setSessionDescriptionErrorThis);
    }
  }

  handleConnection(event: any) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);

      if (otherPeer) {
        otherPeer
          .addIceCandidate(newIceCandidate)
          .then(() => {
            this.handleConnectionSuccess(peerConnection);
          })
          .catch((error) => {
            this.handleConnectionFailure(peerConnection, error);
          });

        console.log(
          `${this.getPeerName(peerConnection)} ICE candidate:\n` +
            `${event.candidate.candidate}.`
        );
      }
    }
  }

  startAction() {
    //startButton.disabled = true;
    const handleLocalMediaStreamErrorThis =
      this.handleLocalMediaStreamError.bind(this);
    const gotLocalMediaStreamThis = this.gotLocalMediaStream.bind(this);
    navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .then(gotLocalMediaStreamThis)
      .catch(handleLocalMediaStreamErrorThis);
    console.log('Requesting local stream.');

    const temp = new MySocketStreaming('prueba');
  }

  hangupAction() {
    if (this.localPeerConnection) {
      this.localPeerConnection.close();
    }
    if (this.remotePeerConnection) {
      this.remotePeerConnection.close();
    }
    this.localPeerConnection = null;
    this.remotePeerConnection = null;
    //this.hangupButton.disabled = true;
    //this.callButton.disabled = false;
    console.log('Ending call.');
  }

  callAction() {
    //callButton.disabled = true;
    //hangupButton.disabled = false;

    const handleConnectionThis = this.handleConnection.bind(this);
    const handleConnectionChangeThis = this.handleConnectionChange.bind(this);
    const gotRemoteMediaStreamThis = this.gotRemoteMediaStream.bind(this);
    const createdOfferThis = this.createdOffer.bind(this);
    const setSessionDescriptionErrorThis =
      this.setSessionDescriptionError.bind(this);

    console.log('Starting call.');
    this.startTime = window.performance.now();

    // Get local media stream tracks.
    let videoTracks;
    let audioTracks;
    if (this.localStream) {
      videoTracks = this.localStream.getVideoTracks();
      audioTracks = this.localStream.getAudioTracks();
    }

    if (videoTracks) {
      if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}.`);
      }
    }
    if (audioTracks) {
      if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}.`);
      }
    }

    let servers: RTCConfiguration | undefined; // Allows for RTC server configuration.

    // Create peer connections and add behavior.
    this.localPeerConnection = new RTCPeerConnection(servers);
    console.log('Created local peer connection object localPeerConnection.');

    this.localPeerConnection.addEventListener(
      'icecandidate',
      handleConnectionThis
    );
    this.localPeerConnection.addEventListener(
      'iceconnectionstatechange',
      handleConnectionChangeThis
    );

    this.remotePeerConnection = new RTCPeerConnection(servers);
    console.log('Created remote peer connection object remotePeerConnection.');

    this.remotePeerConnection.addEventListener(
      'icecandidate',
      handleConnectionThis
    );
    this.remotePeerConnection.addEventListener(
      'iceconnectionstatechange',
      handleConnectionChangeThis
    );
    this.remotePeerConnection.addEventListener(
      'addstream',
      gotRemoteMediaStreamThis
    );

    // Add local stream to connection and create offer to connect.
    if (this.localStream && videoTracks) {
      this.localPeerConnection.addTrack(videoTracks[0], this.localStream); //TODO está bien?
      console.log('Added local stream to localPeerConnection.');
    }

    console.log('localPeerConnection createOffer start.');
    this.localPeerConnection
      .createOffer(offerOptions)
      .then(createdOfferThis)
      .catch(setSessionDescriptionErrorThis);
  }

  ngOnInit(): void {
    const logVideoLoadedThis = this.logVideoLoaded.bind(this);
    const logResizedVideoThis = this.logResizedVideo.bind(this);
    this.localVideo = this.getVideoById('localVideo');
    this.remoteVideo = this.getVideoById('remoteVideo');

    if (this.localVideo) {
      this.localVideo.addEventListener('loadedmetadata', logVideoLoadedThis);
    }
    if (this.remoteVideo) {
      this.remoteVideo.addEventListener('loadedmetadata', logVideoLoadedThis);
      this.remoteVideo.addEventListener('onresize', logResizedVideoThis);
    }

    // In this codelab, you  only stream video, not audio (video: true).

    // Initialize media stream
    const gotLocalMediaStreamThis = this.gotLocalMediaStream.bind(this);
    const handleLocalMediaStreamErrorThis =
      this.handleLocalMediaStreamError.bind(this);
    navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .then(gotLocalMediaStreamThis)
      .catch(handleLocalMediaStreamErrorThis);
  }
}
