import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';

const pcConfig = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
      credential: '',
    },
  ],
};

const roomName = 'foo';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  created: (room: string, clientId: any) => void;
  full: (room: string) => void;
  ipaddr: (room: string) => void;
  join: (room: string) => void;
  joined: (room: string, clientId: any) => void;
  log: (array: Array<any>) => void;
  message: (message: any) => void;
}

interface ClientToServerEvents {
  'create or join': (room: string) => void;
  message: (message: any) => void;
}

export class MySocketStreaming {
  pc: RTCPeerConnection;
  isChannelReady: boolean = false;
  isInitiator: boolean = false;
  isStarted: boolean = false;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

  setPC(pc: RTCPeerConnection) {
    this.pc = pc;
  }

  constructor(
    room: string,
    maybeStart: Function,
    doAnswer: Function,
    handleRemoteHangup: Function
  ) {
    console.log(`Starting MySocketStreaming ${room}`);
    if (room !== '') {
      console.log('Message from client: Asking to join room ' + room);
      this.socket.emit('create or join', room);
    }

    this.socket.on('created', (room, clientId) => {
      this.isInitiator = true;
    });

    this.socket.on('full', (room) => {
      console.log('Room ' + room + ' is full');
    });

    this.socket.on('ipaddr', (ipaddr) => {
      console.log('Message from client: Server IP address is ' + ipaddr);
    });

    this.socket.on('join', (room: string) => {
      console.log('Another peer made a request to join room ' + room);
      console.log('This peer is the initiator of room ' + room + '!');
      this.isChannelReady = true;
      console.log(`this.isChannelReady = ${this.isChannelReady}`);
    });

    this.socket.on('joined', (room, clientId) => {
      console.log('joined: ' + room);
      //this.isInitiator = false;
      this.isChannelReady = true;
      console.log(`this.isChannelReady = ${this.isChannelReady}`);
    });

    this.socket.on('log', (array: Array<any>) => {
      console.log.apply(console, array);
    });

    this.socket.on('message', (message: any) => {
      console.log('Client received message:', message);
      if (message === 'got user media') {
        maybeStart();
      } else if (message.type === 'offer') {
        if (!this.isInitiator && !this.isStarted) {
          maybeStart();
        }
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'answer' && this.isStarted) {
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && this.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate,
        });
        this.pc.addIceCandidate(candidate);
      } else if (message === 'bye' && this.isStarted) {
        handleRemoteHangup();
      }
    });
  }

  sendMessage(message: any) {
    console.log('Client sending message: ', message);
    this.socket.emit('message', message);
  }
}

const constraints = {
  video: true,
  audio: false,
};

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.css'],
})
export class StreamingComponent implements OnInit {
  mySocketStream: MySocketStreaming;
  // The video element where the stream is displayed
  pc: RTCPeerConnection | null = null;
  localVideo: HTMLVideoElement;
  remoteVideo: HTMLVideoElement;
  // The local stream that's displayed on the video
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | null = null;
  localPeerConnection: RTCPeerConnection | null = null;
  remotePeerConnection: RTCPeerConnection | null = null;
  startTime: number | null = null;
  turnReady: boolean = false;
  constructor() {}

  getVideoById(id: string): HTMLVideoElement {
    const temp = document.getElementById(id);
    if (temp instanceof HTMLVideoElement) {
      return temp;
    }
    throw new Error(`Error de código: falta el elemento con id ${id}`);
  }

  gotStream(stream: MediaStream) {
    console.log('Adding local stream.');
    this.localStream = stream;
    this.localVideo.srcObject = stream;
    this.mySocketStream.sendMessage('got user media');
    if (this.mySocketStream.isInitiator) {
      this.maybeStart();
    }
  }

  maybeStart() {
    console.log(
      '>>>>>>> maybeStart() ',
      `isStarted = ${this.mySocketStream.isStarted} ==? false. `,
      `isChannelReady =${this.mySocketStream.isChannelReady} ==? true. `,
      this.localStream
    );
    if (
      !this.mySocketStream.isStarted &&
      typeof this.localStream !== 'undefined' &&
      this.mySocketStream.isChannelReady
    ) {
      console.log('>>>>>> creating peer connection');
      this.createPeerConnection();
      if (this.pc) {
        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length > 0) {
          this.pc.addTrack(videoTracks[0], this.localStream);
        }
      }
      this.mySocketStream.isStarted = true;
      console.log('isInitiator', this.mySocketStream.isInitiator);
      if (this.mySocketStream.isInitiator) {
        this.doCall();
      }
    }
  }

  createPeerConnection() {
    const handleIceCandidateThis = this.handleIceCandidate.bind(this);
    const handleRemoteStreamAddedThis = this.handleRemoteStreamAdded.bind(this);
    const handleRemoteStreamRemovedThis =
      this.handleRemoteStreamRemoved.bind(this);
    try {
      this.pc = new RTCPeerConnection();
      this.mySocketStream.setPC(this.pc);
      this.pc.onicecandidate = handleIceCandidateThis;
      this.pc.addEventListener('addstream', handleRemoteStreamAddedThis);
      this.pc.addEventListener('removestream', handleRemoteStreamRemovedThis);
      console.log('Created RTCPeerConnnection');
    } catch (e: any) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }

  handleIceCandidate(event: any) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      this.mySocketStream.sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      console.log('End of candidates.');
    }
  }

  handleCreateOfferError(event: any) {
    console.log('createOffer() error: ', event);
  }

  doCall() {
    console.log('Sending offer to peer');
    const setLocalAndSendMessageThis = this.setLocalAndSendMessage.bind(this);
    const handleCreateOfferErrorThis = this.handleCreateOfferError.bind(this);
    if (this.pc) {
      this.pc
        .createOffer()
        .then(setLocalAndSendMessageThis)
        .catch(handleCreateOfferErrorThis);
    }
  }

  doAnswer() {
    console.log('Sending answer to peer.');
    const setLocalAndSendMessageThis = this.setLocalAndSendMessage.bind(this);
    const onCreateSessionDescriptionErrorThis =
      this.onCreateSessionDescriptionError.bind(this);
    if (this.pc) {
      this.pc
        .createAnswer()
        .then(setLocalAndSendMessageThis, onCreateSessionDescriptionErrorThis);
    }
  }

  setLocalAndSendMessage(sessionDescription: any) {
    if (this.pc) {
      this.pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.mySocketStream.sendMessage(sessionDescription);
    }
  }

  onCreateSessionDescriptionError(error: Error) {
    console.log('Failed to create session description: ' + error.toString());
  }

  handleRemoteStreamAdded(event: any) {
    console.log('Remote stream added.');
    this.remoteStream = event.stream;
    this.remoteVideo.srcObject = this.remoteStream;
  }

  handleRemoteStreamRemoved(event: any) {
    console.log('Remote stream removed. Event: ', event);
  }

  hangup() {
    console.log('Hanging up.');
    this.stop();
    this.mySocketStream.sendMessage('bye');
  }

  handleRemoteHangup() {
    console.log('Session terminated.');
    this.stop();
    this.mySocketStream.isInitiator = false;
  }

  stop() {
    this.mySocketStream.isStarted = false;
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }

  requestTurn(turnURL: string) {
    var turnExists = false;
    for (var i in pcConfig.iceServers) {
      if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
        turnExists = true;
        this.turnReady = true;
        break;
      }
    }
    if (!turnExists) {
      console.log('Getting TURN server from ', turnURL);
      // No TURN server. Get one from computeengineondemand.appspot.com:
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var turnServer = JSON.parse(xhr.responseText);
          console.log('Got TURN server: ', turnServer);
          pcConfig.iceServers.push({
            urls: 'turn:' + turnServer.username + '@' + turnServer.turn,
            credential: turnServer.password,
          });
          this.turnReady = true;
        }
      };
      xhr.open('GET', turnURL, true);
      xhr.send();
    }
  }

  ngOnInit(): void {
    const maybeStartThis = this.maybeStart.bind(this);
    const doAnswerThis = this.doAnswer.bind(this);
    const handleRemoteHangupThis = this.handleRemoteHangup.bind(this);

    this.mySocketStream = new MySocketStreaming(
      roomName,
      maybeStartThis,
      doAnswerThis,
      handleRemoteHangupThis
    );

    const gotStreamThis = this.gotStream.bind(this);
    this.localVideo = this.getVideoById('localVideo');
    this.remoteVideo = this.getVideoById('remoteVideo');

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStreamThis)
      .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
      });

    /*
    if (location.hostname !== 'localhost') {
      this.requestTurn(
        'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
      );
    }
    */

    window.onbeforeunload = () => {
      this.mySocketStream.sendMessage('bye');
    };
  }
}
