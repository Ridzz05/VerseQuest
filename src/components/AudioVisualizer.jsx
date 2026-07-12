import React, { useEffect, useRef } from "react";

export const AudioVisualizer = ({ isListening, mood, onVolumeChange }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  // Map mood to custom visualizer colors
  const moodColors = {
    happy: { primary: "#fbbf24", secondary: "#f59e0b", glow: "rgba(251, 191, 36, 0.4)" }, // Warm Amber/Gold
    calm: { primary: "#38bdf8", secondary: "#0ea5e9", glow: "rgba(56, 189, 248, 0.4)" },  // Cool Sky Blue
    nostalgic: { primary: "#a78bfa", secondary: "#8b5cf6", glow: "rgba(167, 139, 250, 0.4)" }, // Dreamy Violet
    melancholic: { primary: "#f472b6", secondary: "#ec4899", glow: "rgba(244, 114, 182, 0.4)" } // Soft Pink/Indigo
  };

  const colors = moodColors[mood] || moodColors.calm;

  // Keep latest values available inside the animation loop without re-binding.
  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const onVolumeChangeRef = useRef(onVolumeChange);
  onVolumeChangeRef.current = onVolumeChange;

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || wrapRef.current?.clientWidth || 300;
    const height = canvas.clientHeight || wrapRef.current?.clientHeight || 160;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sizeRef.current = { width, height };

    if (!isListening) {
      drawFlatLine(canvas, ctx);
    }
  };

  useEffect(() => {
    resizeCanvas();

    const observer = new ResizeObserver(() => resizeCanvas());
    if (wrapRef.current) observer.observe(wrapRef.current);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isListening) {
      startAudio();
    } else {
      stopAudio();
    }

    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, mood]);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      draw();
    } catch (err) {
      console.error("Error accessing microphone for visualizer:", err);
    }
  };

  const stopAudio = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      drawFlatLine(canvas, ctx);
    }
  };

  const drawFlatLine = (canvas, ctx) => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return;
    ctx.strokeStyle = colorsRef.current.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = sizeRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray || !width || !height) return;

    animationRef.current = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "rgba(10, 10, 18, 0.2)"; // Semi-transparent black for motion trail
    ctx.fillRect(0, 0, width, height);

    // Calculate average volume to report back to the Avatar component
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const averageVolume = sum / dataArray.length;
    if (onVolumeChangeRef.current) {
      onVolumeChangeRef.current(averageVolume);
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 4;

    // Draw glowing back circle
    ctx.shadowBlur = 15;
    ctx.shadowColor = colorsRef.current.primary;
    ctx.strokeStyle = colorsRef.current.primary;
    ctx.lineWidth = 2;

    ctx.beginPath();
    const points = dataArray.length;
    for (let i = 0; i < points; i++) {
      const value = dataArray[i] / 255.0;
      const angle = (i / points) * Math.PI * 2;
      const offset = value * 45; // amplitude offset
      const r = baseRadius + offset;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Draw inner design elements
    ctx.shadowBlur = 0; // Reset shadow for inside
    ctx.fillStyle = colorsRef.current.glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius - 10, 0, Math.PI * 2);
    ctx.fill();

    // Secondary waveform layer for depth
    ctx.strokeStyle = colorsRef.current.secondary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const value = dataArray[(i + 10) % points] / 255.0; // Phase shift
      const angle = (i / points) * Math.PI * 2;
      const offset = value * 30;
      const r = baseRadius - 20 + offset;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0a0a12 0%, #121224 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      />
    </div>
  );
};
export default AudioVisualizer;
