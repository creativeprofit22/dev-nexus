/**
 * useFlowExport Hook
 * Export flow diagrams to PNG, SVG, or PDF formats
 */

import { useCallback, useState } from "react";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import type { ReactFlowInstance } from "@xyflow/react";

export type ExportFormat = "png" | "svg" | "pdf";

interface ExportOptions {
  filename?: string;
  backgroundColor?: string;
  quality?: number;
}

interface UseFlowExportReturn {
  exportFlow: (format: ExportFormat, options?: ExportOptions) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

/**
 * Hook for exporting ReactFlow diagrams to various formats
 * @param reactFlowInstance - The ReactFlow instance from onInit
 * @param containerRef - Ref to the ReactFlow container element
 */
export function useFlowExport(
  reactFlowInstance: ReactFlowInstance | null,
  containerRef: React.RefObject<HTMLDivElement | null>
): UseFlowExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportFlow = useCallback(
    async (format: ExportFormat, options: ExportOptions = {}) => {
      if (!reactFlowInstance || !containerRef.current) {
        setError("Flow not ready for export");
        return;
      }

      const {
        filename = `flow-export-${Date.now()}`,
        backgroundColor = "#0f1115",
        quality = 1,
      } = options;

      setIsExporting(true);
      setError(null);

      try {
        // Get the ReactFlow viewport element
        const flowElement = containerRef.current.querySelector(
          ".react-flow__viewport"
        ) as HTMLElement;

        if (!flowElement) {
          throw new Error("Could not find flow viewport element");
        }

        // Fit view before export to ensure all nodes are visible
        reactFlowInstance.fitView({ padding: 0.2 });

        // Wait for fitView animation to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the bounds of all nodes
        const nodes = reactFlowInstance.getNodes();
        if (nodes.length === 0) {
          throw new Error("No nodes to export");
        }

        // Common options for html-to-image
        const imageOptions = {
          backgroundColor,
          quality,
          pixelRatio: 2,
          filter: (node: HTMLElement) => {
            // Exclude controls, minimap, and panels from export
            const className = node.className || "";
            if (typeof className === "string") {
              return (
                !className.includes("react-flow__controls") &&
                !className.includes("react-flow__minimap") &&
                !className.includes("react-flow__panel")
              );
            }
            return true;
          },
        };

        switch (format) {
          case "png": {
            const dataUrl = await toPng(flowElement, imageOptions);
            downloadDataUrl(dataUrl, `${filename}.png`);
            break;
          }

          case "svg": {
            const dataUrl = await toSvg(flowElement, imageOptions);
            downloadDataUrl(dataUrl, `${filename}.svg`);
            break;
          }

          case "pdf": {
            const dataUrl = await toPng(flowElement, {
              ...imageOptions,
              pixelRatio: 3, // Higher quality for PDF
            });

            // Create PDF with appropriate dimensions
            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });

            // Calculate PDF dimensions (landscape A4 by default)
            const pdfWidth = 297; // A4 landscape width in mm
            const pdfHeight = 210; // A4 landscape height in mm

            const imgRatio = img.width / img.height;
            const pdfRatio = pdfWidth / pdfHeight;

            let finalWidth = pdfWidth;
            let finalHeight = pdfHeight;
            let offsetX = 0;
            let offsetY = 0;

            if (imgRatio > pdfRatio) {
              // Image is wider - fit to width
              finalHeight = pdfWidth / imgRatio;
              offsetY = (pdfHeight - finalHeight) / 2;
            } else {
              // Image is taller - fit to height
              finalWidth = pdfHeight * imgRatio;
              offsetX = (pdfWidth - finalWidth) / 2;
            }

            const pdf = new jsPDF({
              orientation: "landscape",
              unit: "mm",
              format: "a4",
            });

            // Add background
            pdf.setFillColor(backgroundColor);
            pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

            // Add the flow image
            pdf.addImage(
              dataUrl,
              "PNG",
              offsetX,
              offsetY,
              finalWidth,
              finalHeight
            );

            pdf.save(`${filename}.pdf`);
            break;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed";
        setError(message);
        console.error("Flow export failed:", err);
      } finally {
        setIsExporting(false);
      }
    },
    [reactFlowInstance, containerRef]
  );

  return { exportFlow, isExporting, error };
}

/**
 * Helper to trigger download from data URL
 */
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
