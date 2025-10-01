import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { InView } from "react-intersection-observer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker setup
import { WorkerMessageHandler } from "pdfjs-dist/build/pdf.worker.min.mjs";

const workerBlob = new Blob(
  [
    `import { WorkerMessageHandler } from 'pdfjs-dist/build/pdf.worker.min.mjs'; 
     export default WorkerMessageHandler;`
  ],
  { type: "application/javascript" }
);

pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

// Komponen loading dengan animasi
const LoadingSpinner = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "20px"
  }}>
    <div style={{
      width: "60px",
      height: "60px",
      border: "4px solid #e0e0e0",
      borderTop: "4px solid #3b82f6",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <p style={{
      color: "#666",
      fontSize: "16px",
      margin: 0,
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      Memuat...
    </p>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Skeleton placeholder untuk page
const PagePlaceholder = () => (
  <div style={{
    width: "800px",
    height: "1000px",
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    borderRadius: "8px",
    animation: "shimmer 1.5s infinite",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  }}>
    <style>
      {`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}
    </style>
  </div>
);

function PDFViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(800);

  React.useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        // Mobile: padding 16px di setiap sisi
        setPageWidth(screenWidth - 32);
      } else if (screenWidth < 900) {
        // Tablet: padding 24px di setiap sisi
        setPageWidth(Math.min(screenWidth - 48, 800));
      } else {
        // Desktop: maksimal 800px
        setPageWidth(800);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  // Hitung tinggi placeholder berdasarkan aspect ratio A4 (1.414)
  const placeholderHeight = Math.round(pageWidth * 1.414);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "#f8f9fa",
      padding: window.innerWidth < 640 ? "12px 0" : "20px 0"
    }}>
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        loading={<LoadingSpinner />}
        error={
          <div style={{
            padding: window.innerWidth < 640 ? "20px" : "40px",
            textAlign: "center",
            color: "#dc2626",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}>
            <p style={{
              fontSize: window.innerWidth < 640 ? "16px" : "18px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              Gagal memuat
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Pastikan file tersedia
            </p>
          </div>
        }
      >
        {!isLoading && Array.from(new Array(numPages || 0), (_, i) => (
          <div
            key={i}
            style={{
              marginBottom: window.innerWidth < 640 ? "12px" : "20px",
              display: "flex",
              justifyContent: "center",
              width: "100%",
              padding: "0 16px"
            }}
          >
            <InView triggerOnce rootMargin="300px">
              {({ inView, ref }) => (
                <div
                  ref={ref}
                  style={{
                    boxShadow: inView ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                    borderRadius: window.innerWidth < 640 ? "4px" : "8px",
                    overflow: "hidden",
                    transition: "box-shadow 0.3s ease",
                    maxWidth: "100%"
                  }}
                >
                  {inView ? (
                    <Page
                      pageNumber={i + 1}
                      width={pageWidth}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      loading={
                        <div style={{
                          width: `${pageWidth}px`,
                          height: `${placeholderHeight}px`,
                          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                          backgroundSize: "200% 100%",
                          borderRadius: window.innerWidth < 640 ? "4px" : "8px",
                          animation: "shimmer 1.5s infinite",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                        }} />
                      }
                    />
                  ) : (
                    <div style={{
                      width: `${pageWidth}px`,
                      height: `${placeholderHeight}px`,
                      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      borderRadius: window.innerWidth < 640 ? "4px" : "8px",
                      animation: "shimmer 1.5s infinite",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }} />
                  )}
                </div>
              )}
            </InView>
          </div>
        ))}
      </Document>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "Portofolio Caesar";
  }, []);
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      overflowY: "auto",
      scrollBehavior: "smooth"
    }}>
      <PDFViewer file="/pdfs/Caesar_porto_merged.pdf" />
    </div>
  );
}