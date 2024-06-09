import React from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    pdf_url
  )}&embedded=true`;

  return (
    <iframe
      src={googleDocsUrl}
      className="w-full h-full"
      title="PDF Viewer"
      frameBorder="0"
    ></iframe>
  );
};

export default PDFViewer;
