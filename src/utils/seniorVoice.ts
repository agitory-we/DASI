// 어르신 사장님 맞춤형 음성 안내 (Web Speech API)
export function speakSeniorVoice(message: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    // 이전 음성 중단 후 새로운 음성 출력
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // 어르신이 알아듣기 쉽도록 살짝 여유 있는 속도
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('[SeniorVoice] Speech synthesis not supported or blocked:', e);
  }
}
