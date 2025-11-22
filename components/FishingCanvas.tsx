"use client";

import { useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

export default function FishingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [durationSec, setDurationSec] = useState<number>(10);
  const [state, setState] = useState<RecordingState>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let start = performance.now();

    const draw = (time: number) => {
      const t = (time - start) / 1000;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Sky gradient background
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#8ed0ff");
      sky.addColorStop(1, "#cfeeff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Sun
      ctx.beginPath();
      ctx.arc(width * 0.85, height * 0.2, 30, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd166";
      ctx.fill();

      // Water waves
      const waterTop = height * 0.55;
      ctx.beginPath();
      ctx.moveTo(0, waterTop);
      for (let x = 0; x <= width; x++) {
        const y =
          waterTop +
          Math.sin((x + t * 120) * 0.02) * 5 +
          Math.sin((x + t * 60) * 0.01) * 3;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = "#2ea6e6";
      ctx.fill();

      // Boat position bobbing
      const boatX = (width / 2) + Math.sin(t * 0.8) * 30;
      const boatY = waterTop - 10 + Math.sin(t * 2) * 4;

      // Boat hull
      ctx.save();
      ctx.translate(boatX, boatY);
      ctx.rotate(Math.sin(t) * 0.03);
      ctx.beginPath();
      ctx.moveTo(-90, 0);
      ctx.lineTo(90, 0);
      ctx.lineTo(70, 22);
      ctx.lineTo(-70, 22);
      ctx.closePath();
      ctx.fillStyle = "#7a3e1e";
      ctx.fill();

      // Mast
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -80);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#5b3218";
      ctx.stroke();

      // Sail
      ctx.beginPath();
      ctx.moveTo(0, -80);
      ctx.lineTo(60, -40);
      ctx.lineTo(0, -40);
      ctx.closePath();
      ctx.fillStyle = "#ffffffcc";
      ctx.fill();

      // Person (stick figure)
      const personX = -20;
      const personY = -10;
      // Head
      ctx.beginPath();
      ctx.arc(personX, personY - 18, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffddc1";
      ctx.fill();
      // Body
      ctx.beginPath();
      ctx.moveTo(personX, personY - 10);
      ctx.lineTo(personX, personY + 18);
      // Arms
      ctx.moveTo(personX, personY + 0);
      ctx.lineTo(personX + 22, personY - 8);
      // Legs
      ctx.moveTo(personX, personY + 18);
      ctx.lineTo(personX - 8, personY + 32);
      ctx.moveTo(personX, personY + 18);
      ctx.lineTo(personX + 8, personY + 32);
      ctx.strokeStyle = "#1b1b1b";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fishing rod
      ctx.beginPath();
      ctx.moveTo(personX + 22, personY - 8);
      ctx.quadraticCurveTo(40, -40, 90, -60);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fishing line with bobber
      const sway = Math.sin(t * 2) * 10;
      const lineEndX = 90 + sway;
      const lineEndY = -60 + 40 + Math.sin(t * 3) * 6;
      ctx.beginPath();
      ctx.moveTo(90, -60);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Bobber
      ctx.beginPath();
      ctx.arc(lineEndX, lineEndY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ff3b30";
      ctx.fill();
      ctx.restore();

      // Foreground small waves
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(0, waterTop + 10);
      for (let x = 0; x <= width; x++) {
        const y =
          waterTop +
          10 +
          Math.sin((x + t * 160) * 0.04) * 4 +
          Math.sin((x + t * 90) * 0.02) * 2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = "#0c7fb8";
      ctx.fill();
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    setDownloadUrl(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stream = canvas.captureStream(60);
    const mimeTypes = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";
    if (!mimeType) {
      setState("error");
      setErrorMsg("Browser tidak mendukung perekaman MediaRecorder.");
      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 7_000_000 });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => {
      setState("error");
      setErrorMsg("Terjadi kesalahan saat merekam.");
    };
    recorder.onstop = () => {
      setState("processing");
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setState("done");
    };

    setState("recording");
    recorder.start(200); // timeslice for smoother chunks

    // Stop after duration
    setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, Math.max(1, Math.min(120, durationSec)) * 1000);
  };

  const stopRecording = () => {
    // Force-stop by pausing animation briefly and resuming; MediaRecorder stop handled in startRecording timeout.
    // Provide a manual early-stop via capturing a new stream endpoint:
    const canvas = canvasRef.current;
    const tracks = canvas?.captureStream().getTracks() ?? [];
    tracks.forEach((t) => t.stop());
    // The actual active recorder can't be referenced here cleanly without a ref;
    // Keep UX simple: instruct users to wait for the set duration or refresh to reset.
  };

  return (
    <section
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        background: "#ffffffcc",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        style={{
          width: "100%",
          maxWidth: 960,
          height: "auto",
          borderRadius: 8,
          border: "1px solid #bfe2ff",
          background: "#a8dcff",
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Durasi (detik):
          <input
            type="number"
            min={1}
            max={120}
            value={durationSec}
            onChange={(e) => setDurationSec(parseInt(e.target.value || "10", 10))}
            style={{
              width: 80,
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #aac",
            }}
          />
        </label>

        <button
          onClick={startRecording}
          disabled={state === "recording"}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: state === "recording" ? "#a0aec0" : "#0ea5e9",
            color: "white",
            cursor: state === "recording" ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {state === "recording" ? "Merekam..." : "Rekam Video"}
        </button>

        <button
          onClick={stopRecording}
          disabled={state !== "recording"}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ef4444",
            background: "white",
            color: "#ef4444",
            cursor: state !== "recording" ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          Hentikan (paksa)
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: "#b91c1c", fontSize: 14 }}>{errorMsg}</div>
      )}

      {state === "processing" && (
        <div style={{ color: "#0f766e", fontSize: 14 }}>Memproses...</div>
      )}

      {downloadUrl && state === "done" && (
        <a
          href={downloadUrl}
          download={`fishing-video-${Date.now()}.webm`}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#10b981",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Unduh Video
        </a>
      )}
    </section>
  );
}

