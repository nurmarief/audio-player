const imageEl = document.getElementById('audio-img');
const titleEl = document.getElementById('audio-title');
const artistEl = document.getElementById('audio-artist');
const audioEl = document.getElementById('audio');
const progressBarContainerEl = document.getElementById('audio-progress-bar-container');
const progressBarEl = document.getElementById('audio-progress-bar');
const currentAudioPlayTimeEl = document.getElementById('audio-current-play-time');
const totalAudioDurationEl = document.getElementById('audio-total-duration');
const prevBtnEl = document.getElementById('audio-prev-btn');
const playBtnEl = document.getElementById('audio-play-btn');
const nextBtnEl = document.getElementById('audio-next-btn');

const audios = [
  {
    name: 'audio-1',
    displayName: 'Audio One',
    artist: 'Artist One'
  },
  {
    name: 'audio-2',
    displayName: 'Audio Two',
    artist: 'Artist Two'
  },
  {
    name: 'audio-3',
    displayName: 'Audio Three',
    artist: 'Artist Three'
  }
];

const PLAY_BTN_EL_STATE = {
  PLAY: 'play',
  PAUSE: 'pause',
}

const CHANGE_AUDIO = {
  NEXT: 'next',
  PREV: 'prev',
}

let isPlaying = false;
let audioIndex = 0;

function togglePlayBtnElStateUI() {
  const currentState = isPlaying ? PLAY_BTN_EL_STATE.PAUSE : PLAY_BTN_EL_STATE.PLAY;
  const formerState = isPlaying ? PLAY_BTN_EL_STATE.PLAY : PLAY_BTN_EL_STATE.PAUSE;
  playBtnEl.classList.replace(`fa-${formerState}`, `fa-${currentState}`);
  playBtnEl.setAttribute('title', `${currentState}`);
}

function toggleAudio() {
  isPlaying ? audioEl.pause() : audioEl.play();
  isPlaying = !isPlaying;
  togglePlayBtnElStateUI();
}

function loadAudio(audio) {
  titleEl.textContent = audio.displayName;
  artistEl.textContent = audio.artist;
  audioEl.src = `music/${audio.name}.mp3`;
  imageEl.src = `img/${audio.name}.jpg`;
  updateAudioCurrentPlayTimeUI({ currentMinutes: 0, currentSeconds: '00' });
  updateProgressBarWidthUI({ duration: 0, currentTime: 0 });
  // waiting for audioEl duration to update, to update total audio duration
  setTimeout(() => {
    const { duration } = audioEl;
    const { mainDurationInMinutes, remainderDurationInSeconds } = calculateAudioTotalPlayTime(duration);
    updateTotalAudioDurationUI({ mainDurationInMinutes, remainderDurationInSeconds });
  }, 500);

}

function checkForAudioListLoop() {
  if (audioIndex < 0) {
    audioIndex = audios.length - 1;
  } else if (audioIndex > audios.length - 1) {
    audioIndex = 0;
  }
}

function continueToPlayAudio() {
  isPlaying ? audioEl.play() : audioEl.pause();
}

function changeAudio(direction) {
  direction === CHANGE_AUDIO.NEXT ? audioIndex++ : audioIndex--;
  checkForAudioListLoop();
  loadAudio(audios[audioIndex]);
  continueToPlayAudio();
}

function updateProgressBarWidthUI({ duration, currentTime }) {
  const progressPercent = (currentTime / duration) * 100;
  progressBarEl.style.width = `${progressPercent}%`;
}

function calculateAudioTotalPlayTime(duration) {
  const mainDurationInMinutes = Math.floor(duration / 60);
  let remainderDurationInSeconds = Math.floor(duration % 60);
  if (remainderDurationInSeconds < 10) {
    remainderDurationInSeconds = `0${remainderDurationInSeconds}`;
  }
  const audioTotalPlayTime = {
    mainDurationInMinutes,
    remainderDurationInSeconds
  }
  return audioTotalPlayTime;
}

function updateTotalAudioDurationUI({
  mainDurationInMinutes,
  remainderDurationInSeconds
}) {
  totalAudioDurationEl.textContent = `${mainDurationInMinutes}:${remainderDurationInSeconds}`;
}

function calculateAudioCurrentPlayTime({ currentTime }) {
  const currentMinutes = Math.floor(currentTime / 60);
  let currentSeconds = Math.floor(currentTime % 60);
  if (currentSeconds < 10) {
    currentSeconds = `0${currentSeconds}`;
  }
  const formattedCurrentTime = {
    currentMinutes,
    currentSeconds,
  }
  return formattedCurrentTime;
}

function updateAudioCurrentPlayTimeUI({ currentMinutes, currentSeconds }) {
  currentAudioPlayTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
}

function calculateAudioNewCurrentTimeWhenProgressBarClicked({ offsetX, progressBarWidth, totalAudioDuration }) {
  const newCurrentTime = (offsetX / progressBarWidth) * totalAudioDuration;
  return newCurrentTime;
}

function updateAudioElCurrentTime({ newCurrentTime }) {
  audioEl.currentTime = newCurrentTime;
}

// Handler functions
function playBtnElClickHandler() {
  toggleAudio();
}

function prevBtnElClickHandler() {
  changeAudio(CHANGE_AUDIO.PREV);
}

function nextBtnElClickHandler() {
  changeAudio(CHANGE_AUDIO.NEXT);
}

function progressBarContainerClickHandler(e) {
  const progressBarWidth = this.clientWidth;
  const offsetX = e.offsetX;
  const { duration: totalAudioDuration } = audioEl;
  const newCurrentTime = calculateAudioNewCurrentTimeWhenProgressBarClicked({ offsetX, progressBarWidth, totalAudioDuration });
  updateAudioElCurrentTime({ newCurrentTime });
}

function audioElTimeupdateHandler(e) {
  const { duration, currentTime } = e.srcElement;
  updateProgressBarWidthUI({ duration, currentTime });
  const { currentMinutes, currentSeconds } = calculateAudioCurrentPlayTime({ currentTime });
  updateAudioCurrentPlayTimeUI({ currentMinutes, currentSeconds });
}

function audioElEndedHandler() {
  changeAudio(CHANGE_AUDIO.NEXT);
}

// On load
loadAudio(audios[audioIndex]);
playBtnEl.addEventListener('click', playBtnElClickHandler);
prevBtnEl.addEventListener('click', prevBtnElClickHandler);
nextBtnEl.addEventListener('click', nextBtnElClickHandler);
progressBarContainerEl.addEventListener('click', progressBarContainerClickHandler);
audioEl.addEventListener('timeupdate', audioElTimeupdateHandler);
audioEl.addEventListener('ended', audioElEndedHandler);
