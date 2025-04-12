declare module 'react-native-sound' {
  export interface SoundOptions {
    mainBundle?: boolean;
    audioOnly?: boolean;
    document?: boolean;
    asset?: boolean;
    base64?: boolean;
  }

  export default class Sound {
    static setCategory(category: string, mixWithOthers?: boolean): void;
    static MAIN_BUNDLE: number;
    static DOCUMENT: number;
    static LIBRARY: number;
    static CACHES: number;

    constructor(
      filename: string | number,
      onError?: (error: Error | null) => void,
      options?: SoundOptions,
    );

    play(onComplete?: (success: boolean) => void): void;
    pause(): void;
    stop(): void;
    reset(): void;
    release(): void;
    getDuration(): number;
    setVolume(value: number): void;
    setNumberOfLoops(loops: number): void;
    getCurrentTime(callback: (seconds: number) => void): void;
    setCurrentTime(seconds: number): void;
    isPlaying(): boolean;
  }
}
