import FishingCanvas from "../components/FishingCanvas";

export default function Page() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px",
        gap: "16px",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
        Fishing Video Generator
      </h1>
      <p style={{ margin: 0, color: "#17445f", textAlign: "center" }}>
        Buat video orang yang memancing menaiki perahu. Klik tombol rekam untuk
        menghasilkan video WebM yang dapat diunduh.
      </p>
      <FishingCanvas />
      <div style={{ fontSize: 12, color: "#345", opacity: 0.8 }}>
        Tips: Gunakan Chrome/Edge terbaru untuk kualitas rekaman terbaik.
      </div>
    </main>
  );
}

