export const metadata = {
  title: "Fishing Video Generator",
  description: "Generate a video of a person fishing on a boat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
          background: "linear-gradient(#8ed0ff, #e6f5ff)",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}

