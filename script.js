document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext, analyser, microphone;

  function updateCandleCount() {
    const activeCandles = candles.filter(c => !c.classList.contains("out")).length;
    candleCountDisplay.textContent = activeCandles;
    return activeCandles;
  }

  function addCandle(left, top) {
    // ❌ prevent adding more than 17
    if (candles.filter(c => !c.classList.contains("out")).length >= 17) return;

    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    let average = sum / bufferLength;

    // 🔧 Increase mic sensitivity by lowering threshold
    return average > 25; // was 40, now more sensitive
  }

  function blowOutCandles() {
    if (!isBlowing()) return;

    let blownOut = 0;

    candles.forEach(candle => {
      if (!candle.classList.contains("out") && Math.random() > 0.4) {
        candle.classList.add("out");
        blownOut++;

        // 💨 Make candle disappear after 2 seconds
        setTimeout(() => {
          candle.style.transition = "opacity 0.8s";
          candle.style.opacity = "0";
          setTimeout(() => candle.remove(), 800);
        }, 2000);
      }
    });

    if (blownOut > 0) {
      const remaining = updateCandleCount();
      if (remaining === 0) {
        setTimeout(() => {
          window.location.href = "celebration.html";
        }, 1000);
      }
    }
  }

  // 🎤 Mic stays on and keeps checking every 200ms
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        // Keep checking — even after first blow
        setInterval(blowOutCandles, 200);
      })
      .catch(err => console.log("Unable to access microphone:", err));
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});

