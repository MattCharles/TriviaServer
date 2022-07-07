function delay(delay: number) {
  return new Promise((r) => {
    setTimeout(r, delay);
  });
}
export class Timer {
  paused: boolean = false;
  // seconds
  constructor(public currentTime = 90) {
    this.start();
  }
  async start() {
    let i = 0;
    while (i < this.currentTime) {
      if (this.paused) {
        return;
      }
      await delay(1000);
      this.currentTime = this.currentTime - 1;
      i++;
    }
  }
  async pause() {
    this.paused = true;
  }
  async unpause() {
    this.paused = false;
  }
  async setCurrentTime(seconds: number) {
    this.currentTime = seconds;
  }
}
