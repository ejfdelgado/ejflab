import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ModalService } from 'src/services/modal.service';
import { MyConstants } from 'srcJs/MyConstants';

// https://developers.google.com/codelabs/webrtc-web#5
// https://jameshfisher.com/2017/01/17/webrtc-datachannel-reliability/

const pcConfig = {
  ordered: true,
  maxPacketLifeTime: null,
  maxRetransmits: null,
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'stun:stun1.l.google.com:19302',
    },
    {
      urls: 'stun:stun2.l.google.com:19302',
    },
    {
      urls: 'stun:stun3.l.google.com:19302',
    },
    {
      urls: 'stun:stun4.l.google.com:19302',
    },
    {
      urls: 'stun:stun1.voiceeclipse.net:3478',
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
  byeresponse: (clientId: any) => void;
}

interface ClientToServerEvents {
  'create or join': (room: string) => void;
  message: (message: any) => void;
  bye: (room: string) => void;
}

export class MySocketStreaming {
  room: string;
  maybeStart: Function;
  doAnswer: Function;
  handleRemoteHangup: Function;
  pc: RTCPeerConnection;
  isWebSocketOk: boolean = false; //si el websocket está ok
  isChannelReady: boolean = false; // si se hizo el join
  isInitiator: boolean = false; //si fue quien creó la sala
  isStarted: boolean = false; //si está transmitiendo webrtc
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    MyConstants.SRV_ROOT
  );

  setPC(pc: RTCPeerConnection) {
    this.pc = pc;
  }

  async configure() {
    return new Promise<void>((resolve) => {
      this.socket.on('disconnect', () => {
        this.isWebSocketOk = false;
      });
      this.socket.on('connect', () => {
        this.isWebSocketOk = true;
        this.socket.emit('create or join', this.room);

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
          console.log(`join ${room}`);
          this.isChannelReady = true;
        });

        this.socket.on('joined', (room, clientId) => {
          console.log(`joined ${room} ${clientId}`);
          //this.isInitiator = false;
          this.isChannelReady = true;
        });

        this.socket.on('log', (array: Array<any>) => {
          //console.log.apply(console, array);
        });

        this.socket.on('message', (message: any) => {
          //console.log('Client received message:', message);
          if (message === 'got user media') {
            console.log(`Received: got user media`);
            this.maybeStart();
          } else if (message.type === 'offer') {
            console.log(`Received: offer`);
            if (!this.isInitiator && !this.isStarted) {
              this.maybeStart();
            }
            this.pc.setRemoteDescription(new RTCSessionDescription(message));
            this.doAnswer();
          } else if (this.isStarted && message.type === 'answer') {
            console.log(`Received: answer`);
            this.pc.setRemoteDescription(new RTCSessionDescription(message));
          } else if (this.isStarted && message.type === 'candidate') {
            console.log(`Received: candidate`);
            var candidate = new RTCIceCandidate({
              sdpMLineIndex: message.label,
              candidate: message.candidate,
            });
            this.pc.addIceCandidate(candidate);
          }
        });

        this.socket.on('byeresponse', (whoId: string) => {
          if (this.isStarted) {
            this.handleRemoteHangup();
          }
        });
      });
      resolve();
    });
  }

  constructor(
    room: string,
    maybeStart: Function,
    doAnswer: Function,
    handleRemoteHangup: Function
  ) {
    this.room = room;
    this.maybeStart = maybeStart;
    this.doAnswer = doAnswer;
    this.handleRemoteHangup = handleRemoteHangup;
  }

  sendMessage(message: any) {
    //console.log('Client sending message: ', message);
    this.socket.emit('message', message);
  }

  sayBye() {
    this.socket.emit('bye', this.room);
    this.socket;
    this.socket.close();
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
  mySocketStream: MySocketStreaming | null = null;
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
  constructor(private modalService: ModalService) {}

  getVideoById(id: string): HTMLVideoElement {
    const temp = document.getElementById(id);
    if (temp instanceof HTMLVideoElement) {
      return temp;
    }
    throw new Error(`Error de código: falta el elemento con id ${id}`);
  }

  gotStream(stream: MediaStream) {
    this.localStream = stream;
    this.localVideo.srcObject = stream;
  }

  gotStreamSend() {
    if (this.localStream && this.mySocketStream) {
      this.mySocketStream.sendMessage('got user media');
      if (this.mySocketStream.isInitiator) {
        this.maybeStart();
      }
    }
  }

  maybeStart() {
    console.log(
      'maybeStart()\n',
      `isStarted(${this.mySocketStream?.isStarted}) ==? false.\n`,
      `isChannelReady(${this.mySocketStream?.isChannelReady}) ==? true.\n`,
      `(typeof this.localStream !== 'undefined')(${
        typeof this.localStream !== 'undefined'
      }) ==? true`
    );
    if (
      this.mySocketStream &&
      !this.mySocketStream.isStarted &&
      this.mySocketStream.isChannelReady &&
      typeof this.localStream !== 'undefined'
    ) {
      const handleIceCandidateThis = this.handleIceCandidate.bind(this);
      const handleRemoteStreamAddedThis =
        this.handleRemoteStreamAdded.bind(this);
      const handleRemoteStreamRemovedThis =
        this.handleRemoteStreamRemoved.bind(this);
      try {
        this.pc = new RTCPeerConnection(pcConfig);
        this.mySocketStream.setPC(this.pc);
        // Events for webrtc
        this.pc.addEventListener('icecandidate', handleIceCandidateThis);
        this.pc.addEventListener('addstream', handleRemoteStreamAddedThis);
        this.pc.addEventListener('removestream', handleRemoteStreamRemovedThis);
      } catch (e: any) {
        this.modalService.error(
          new Error('Cannot create RTCPeerConnection object. ' + e.message)
        );
        return;
      }
      if (this.pc) {
        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length > 0) {
          this.pc.addTrack(videoTracks[0], this.localStream);
        }
      }
      this.mySocketStream.isStarted = true;
      if (this.mySocketStream.isInitiator) {
        this.doCall();
      }
    }
  }

  handleIceCandidate(event: any) {
    //console.log('icecandidate event: ', event);
    if (this.mySocketStream) {
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
  }

  doCall() {
    console.log('doCall()');
    const setLocalAndSendMessageThis = this.setLocalAndSendMessage.bind(this);
    if (this.pc) {
      this.pc
        .createOffer()
        .then(setLocalAndSendMessageThis)
        .catch((event) => {
          console.log('createOffer() error: ', event);
        });
    }
  }

  doAnswer() {
    console.log('doAnswer()');
    const setLocalAndSendMessageThis = this.setLocalAndSendMessage.bind(this);
    if (this.pc) {
      this.pc
        .createAnswer()
        .then(setLocalAndSendMessageThis, (error: Error) => {
          console.log(
            'Failed to create session description: ' + error.toString()
          );
        });
    }
  }

  setLocalAndSendMessage(sessionDescription: any) {
    if (this.mySocketStream && this.pc) {
      this.pc.setLocalDescription(sessionDescription);
      //console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.mySocketStream.sendMessage(sessionDescription);
    }
  }

  handleRemoteStreamAdded(event: any) {
    console.log('handleRemoteStreamAdded()');
    this.remoteStream = event.stream;
    this.remoteVideo.srcObject = this.remoteStream;
  }

  handleRemoteStreamRemoved(event: any) {
    console.log('handleRemoteStreamRemoved()');
  }

  hangup() {
    console.log('hangup()');
    if (this.mySocketStream) {
      this.stop();
      this.mySocketStream.sayBye();
    }
  }

  handleRemoteHangup() {
    console.log('handleRemoteHangup()');
    if (this.mySocketStream) {
      this.stop();
      //this.mySocketStream.isInitiator = false;
    }
  }

  stop() {
    console.log('stop()');
    if (this.mySocketStream) {
      this.mySocketStream.isStarted = false;
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.localVideo = this.getVideoById('localVideo');
    this.remoteVideo = this.getVideoById('remoteVideo');

    window.onbeforeunload = () => {
      this.leaveRoom();
    };
  }

  async startAll() {
    const promesas = [];

    promesas.push(this.joinRoom());
    promesas.push(this.getLocalMedia());

    await Promise.all(promesas);

    this.gotStreamSend();
  }

  async getLocalMedia() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((media) => {
          this.gotStream(media);
          resolve(media);
        })
        .catch(function (e) {
          reject(e);
        });
    });
  }

  async joinRoom() {
    try {
      const maybeStartThis = this.maybeStart.bind(this);
      const doAnswerThis = this.doAnswer.bind(this);
      const handleRemoteHangupThis = this.handleRemoteHangup.bind(this);

      this.mySocketStream = new MySocketStreaming(
        roomName,
        maybeStartThis,
        doAnswerThis,
        handleRemoteHangupThis
      );
      await this.mySocketStream.configure();
    } catch (error) {}
    return;
  }

  leaveRoom() {
    if (this.mySocketStream) {
      this.mySocketStream.sayBye();
    }
  }
}
