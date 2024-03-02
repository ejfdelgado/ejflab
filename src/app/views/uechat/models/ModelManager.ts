import { SimpleObj } from 'srcJs/SimpleObj';

export abstract class ModelManager {
  popupsMap: any = {};
  modelState: any = {};
  isActive: boolean = false;
  abstract getSpeechToText(): void;
  abstract getSocketId(): string | null;
  abstract callStopGame(): void;
  abstract callStartGame(): void;

  abstract listenAvatarChanges(
    avatar: string,
    prop: string,
    val: any,
    isMe: boolean
  ): void;

  registerPopUp(key: string, value: any) {
    this.popupsMap[key] = value;
  }
  forceClose(callback: string) {
    if (callback in this.popupsMap) {
      try {
        this.popupsMap[callback].close();
      } catch (err) {}
      delete this.popupsMap[callback];
    }
  }

  resetMe() {
    console.log('Reset ModelManager');
    this.popupsMap = {};
  }

  receiveStateChanged(key: string, content: string) {
    //console.log(`[${key}]`);
    const parsed = JSON.parse(content);
    if (parsed.key == '') {
      this.modelState = parsed.val;
    } else {
      // Se escribe solo el punto que dice key
      this.modelState = Object.assign(
        {},
        SimpleObj.recreate(this.modelState, parsed.key, parsed.val, true)
      );
      if (parsed.key.startsWith('st.voice')) {
        this.getSpeechToText();
      }
      if (parsed.key.startsWith('popupcheck')) {
        const callback = /^popupcheck\.(.+)$/.exec(parsed.key);
        if (callback != null) {
          this.forceClose(callback[1]);
        }
      }
    }

    if (parsed.key.startsWith('avatar.')) {
      const socketId = this.getSocketId();
      this.listenAvatarChanges(
        parsed.avatar,
        parsed.prop,
        parsed.val,
        parsed.avatar == socketId
      );
      return;
    }
    if (this.modelState.st) {
      if (this.modelState.st.current == null && this.isActive) {
        this.callStopGame();
        this.isActive = false;
      } else if (this.modelState.st.current !== null && !this.isActive) {
        this.callStartGame();
        this.isActive = true;
      }
    }
  }
}
