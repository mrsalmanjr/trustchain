/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function downloadDummyPdf(fileName: string, title?: string) {
  const docTitle = title || fileName.replace(/\.pdf$/i, "");
  const cleanName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 400 >>
stream
BT
/F1 18 Tf
50 720 Td
(TrustChain SLA Verification Document) Tj
0 -35 Td
/F1 14 Tf
(${docTitle}) Tj
0 -30 Td
/F1 10 Tf
(Document Name: ${cleanName}) Tj
0 -20 Td
(Status: Official SLA Verified & Anchored to Decentralized Ledger) Tj
0 -20 Td
(Audit Protocol: TrustChain Cryptographic Verification Engine) Tj
0 -20 Td
(Issuing Authority: TrustChain Platform Audit Board) Tj
0 -20 Td
(Timestamp: ${new Date().toISOString()}) Tj
0 -30 Td
/F1 9 Tf
(This is an official dummy PDF proof generated for SLA compliance verification.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000248 00000 n 
0000000319 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
770
%%EOF`;

  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
