import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head lang="en">
        <title>Imbue API Documentation</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
