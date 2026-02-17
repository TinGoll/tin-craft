/* eslint-disable @typescript-eslint/explicit-function-return-type */
import sound from '../assets/click_button.m4a'
class SoundManager {
  private clickAudio: HTMLAudioElement

  constructor() {
    this.clickAudio = new Audio(sound)
    this.clickAudio.preload = 'auto'
  }

  playClick(volume = 1) {
    this.clickAudio.currentTime = 0
    this.clickAudio.volume = volume
    this.clickAudio.play().catch(() => {})
  }
}

export const soundManager = new SoundManager()
