import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ModalService } from 'src/services/modal.service';
import { MyConstants } from 'srcJs/MyConstants';

// https://developers.google.com/codelabs/webrtc-web#5
// https://jameshfisher.com/2017/01/17/webrtc-datachannel-reliability/

const pcConfig = {
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
          console.log.apply(console, array);
        });

        this.socket.on('message', (message: any) => {
          console.log('Client received message:', message);
          if (message === 'got user media') {
            this.maybeStart();
          } else if (message.type === 'offer') {
            if (!this.isInitiator && !this.isStarted) {
              this.maybeStart();
            }
            this.pc.setRemoteDescription(new RTCSessionDescription(message));
            this.doAnswer();
          } else if (message.type === 'answer' && this.isStarted) {
            this.pc.setRemoteDescription(new RTCSessionDescription(message));
          } else if (message.type === 'candidate' && this.isStarted) {
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
    console.log('Client sending message: ', message);
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
    console.log(`gotStreamSend ...`);
    if (this.localStream && this.mySocketStream) {
      console.log(`gotStreamSend 1 ok`);
      this.mySocketStream.sendMessage('got user media');
      if (this.mySocketStream.isInitiator) {
        console.log(`gotStreamSend 2 ok`);
        this.maybeStart();
      }
    }
  }

  maybeStart() {
    console.log(
      '>>>>>>> maybeStart() ',
      `isStarted = ${this.mySocketStream?.isStarted} ==? false. `,
      `isChannelReady =${this.mySocketStream?.isChannelReady} ==? true. `,
      this.localStream
    );
    if (
      this.mySocketStream &&
      !this.mySocketStream.isStarted &&
      typeof this.localStream !== 'undefined' &&
      this.mySocketStream.isChannelReady
    ) {
      console.log('>>>>>> creating peer connection');
      const handleIceCandidateThis = this.handleIceCandidate.bind(this);
      const handleRemoteStreamAddedThis =
        this.handleRemoteStreamAdded.bind(this);
      const handleRemoteStreamRemovedThis =
        this.handleRemoteStreamRemoved.bind(this);
      try {
        this.pc = new RTCPeerConnection(pcConfig);
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

  handleIceCandidate(event: any) {
    console.log('icecandidate event: ', event);
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
    if (this.mySocketStream && this.pc) {
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
    if (this.mySocketStream) {
      this.stop();
      this.mySocketStream.sayBye();
    }
  }

  handleRemoteHangup() {
    console.log('Session terminated.');
    if (this.mySocketStream) {
      this.stop();
      this.mySocketStream.isInitiator = false;
    }
  }

  stop() {
    if (this.mySocketStream) {
      this.mySocketStream.isStarted = false;
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
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
            //credential: turnServer.password,
          });
          this.turnReady = true;
        }
      };
      xhr.open('GET', turnURL, true);
      xhr.send();
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

    console.log('hola');
    await Promise.all(promesas);

    console.log('gotStreamSend?');
    this.gotStreamSend();
  }

  async getLocalMedia() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((media) => {
          this.gotStream(media);
          console.log(`getLocalMedia resolved`);
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
      console.log('configure started');
      await this.mySocketStream.configure();
      console.log('configure ended');
    } catch (error) {}
    return;
  }

  leaveRoom() {
    if (this.mySocketStream) {
      this.mySocketStream.sayBye();
    }
  }
}
