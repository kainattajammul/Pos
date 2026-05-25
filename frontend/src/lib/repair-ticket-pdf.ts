import type { RepairTicketSnapshot } from "@/lib/repair-ticket-snapshot";
import {
  formatLabelDate,
  formatReceiptDateTime,
} from "@/lib/repair-ticket-snapshot";

export type RepairTicketPdfKind = "thermal" | "label";

function drawStoreLogo(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  size: number,
) {
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(x, y, size, size, 2, 2, "F");
  doc.setFillColor(15, 118, 110);
  doc.circle(x + size / 2, y + size / 2, size * 0.22, "F");
}

async function renderBarcodeDataUrl(value: string): Promise<string> {
  const JsBarcode = (await import("jsbarcode")).default;
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 1.4,
    height: 48,
    displayValue: false,
    margin: 0,
  });
  return canvas.toDataURL("image/png");
}

export async function generateRepairTicketPdf(
  snapshot: RepairTicketSnapshot,
  kind: RepairTicketPdfKind,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  if (kind === "thermal") {
    return generateThermalPdf(jsPDF, snapshot);
  }
  return generateLabelPdf(jsPDF, snapshot);
}

function generateThermalPdf(
  jsPDF: typeof import("jspdf").jsPDF,
  snapshot: RepairTicketSnapshot,
): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 160],
  });

  const centerX = 40;
  let y = 10;

  drawStoreLogo(doc, centerX - 6, y, 12);
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(snapshot.storeName, centerX, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  const addressLines = doc.splitTextToSize(snapshot.storeAddress, 68);
  doc.text(addressLines, centerX, y, { align: "center" });
  y += addressLines.length * 3.5 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(snapshot.customerName, centerX, y, { align: "center" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text(`Date: ${formatReceiptDateTime(snapshot.createdAt)}`, centerX, y, {
    align: "center",
  });
  y += 5;
  doc.text(`Ticket #: ${snapshot.ticketId}`, centerX, y, { align: "center" });
  y += 6;

  doc.setDrawColor(229, 231, 235);
  doc.line(8, y, 72, y);
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(snapshot.deviceTitle, centerX, y, { align: "center" });
  y += 4;
  const serviceLines = doc.splitTextToSize(snapshot.serviceName, 68);
  doc.text(serviceLines, centerX, y, { align: "center" });
  y += serviceLines.length * 3.5 + 3;

  doc.text(
    `${snapshot.imeiSerialLabel}: ${snapshot.imeiSerialValue}`,
    centerX,
    y,
    { align: "center" },
  );
  y += 5;
  doc.text(`Total: $${snapshot.repairCharges}`, centerX, y, { align: "center" });

  return doc.output("blob");
}

async function generateLabelPdf(
  jsPDF: typeof import("jspdf").jsPDF,
  snapshot: RepairTicketSnapshot,
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [101.6, 50.8],
  });

  const barcodeUrl = await renderBarcodeDataUrl(snapshot.imeiSerialValue);

  doc.setFillColor(16, 185, 129);
  doc.roundedRect(4, 4, 8, 8, 1, 1, "F");
  doc.setFillColor(15, 118, 110);
  doc.circle(8, 8, 1.8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(`Ticket ${snapshot.ticketId}`, 88, 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(formatLabelDate(snapshot.createdAt), 88, 13, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(snapshot.deviceTitle, 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const serviceLines = doc.splitTextToSize(snapshot.serviceName, 82);
  doc.text(serviceLines, 14, 28);

  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 33, 52, 9, 1, 1, "S");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Customer", 16, 36.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(snapshot.customerName, 16, 40.5);

  doc.addImage(barcodeUrl, "PNG", 14, 42, 70, 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(55, 65, 81);
  doc.text(
    `${snapshot.imeiSerialLabel}: ${snapshot.imeiSerialValue}`,
    45,
    49,
    { align: "center" },
  );

  const noteLines = doc.splitTextToSize(snapshot.diagnosticNote, 30);
  doc.setFontSize(6);
  doc.text(noteLines, 88, 38, { align: "right" });

  return doc.output("blob");
}

export function getRepairTicketPdfFilename(
  snapshot: RepairTicketSnapshot,
  kind: RepairTicketPdfKind,
): string {
  const slug = snapshot.ticketId.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return kind === "thermal"
    ? `thermal-receipt-${slug}.pdf`
    : `repair-label-${slug}.pdf`;
}
