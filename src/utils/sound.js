export function playFeedbackSound(correct, enabled = true) {
  if (!enabled || typeof window === 'undefined') return
  const AudioContext = window.AudioContext ?? window.webkitAudioContext
  if (!AudioContext) return
  try {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = correct ? 660 : 220
    gain.gain.setValueAtTime(0.05, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.16)
    oscillator.onended = () => context.close()
  } catch (error) {
    console.warn('Efek suara tidak dapat diputar pada perangkat ini.', error)
  }
}
