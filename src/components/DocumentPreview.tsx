import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileText,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { SOPDocumentContent, SOPFileAttachment } from '../types/sop';
import { dataUrlToBlobUrl, formatDateShort, formatFileSize } from '../utils/storage';
import { AxisLogo } from './AxisLogo';

interface DocumentPreviewProps {
  sopId?: string;
  sopName: string;
  version: number;
  category: string;
  subCategory: string;
  uploadedByName?: string;
  file: SOPFileAttachment;
  documentContent?: SOPDocumentContent;
  heightClass?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  sopId = 'NEW-SOP',
  sopName,
  version,
  category,
  subCategory,
  uploadedByName = 'Axis Bank RetailOps Author',
  file,
  documentContent,
  heightClass = 'h-[560px]',
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.extension === 'pdf' && file.dataUrl) {
      const url = dataUrlToBlobUrl(file.dataUrl);
      setBlobUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
    setBlobUrl(null);
    return undefined;
  }, [file.dataUrl, file.extension]);

  const handleDownload = () => {
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.fileName;
      a.click();
      return;
    }

    const summaryText = [
      `AXIS BANK LIMITED - RETAILOPS GRAP SOP DOCUMENT`,
      `=================================================`,
      `SOP ID      : ${sopId}`,
      `Title       : ${sopName}`,
      `Version     : v${version}`,
      `Category    : ${category} / ${subCategory}`,
      `File        : ${file.fileName}`,
      `Uploaded By : ${uploadedByName}`,
      ``,
      documentContent
        ? `Objective: ${documentContent.objective}\n\nScope: ${documentContent.scope}\n\n` +
          documentContent.sections
            .map((s) => `${s.heading}\n${s.paragraphs.join('\n')}`)
            .join('\n\n')
        : 'RetailOps Standard Operating Procedure Document.',
    ].join('\n');

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName.replace(/\.(pdf|docx?)$/i, '.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  const fallbackDocSections = useMemo(() => {
    if (documentContent) return documentContent;
    return {
      documentCode: `AXB/RET/SOP/${sopId}`,
      effectiveDate: formatDateShort(file.uploadedAt),
      ownerUnit: category || 'Retail Operations',
      classification: 'Internal – Controlled SOP',
      objective: `Standardized operational procedure governing "${sopName || 'Untitled SOP'}" under ${
        category || 'RetailOps'
      } (${subCategory || 'General'}).`,
      scope:
        'Applicable to all Axis Bank Retail Branch Operations, Central Processing Hubs, and authorized Maker/Checker personnel.',
      sections: [
        {
          heading: '1. Uploaded Document Package Summary',
          paragraphs: [
            `This Microsoft Word (${file.extension.toUpperCase()}) document has been attached to the GRAP SOP Management repository. Use the Download button in the toolbar to inspect the local Word file, or review the structured control summary below.`,
          ],
          bullets: [
            `Original Filename: ${file.fileName}`,
            `File Size: ${formatFileSize(file.fileSize)}`,
            `Uploaded Timestamp: ${formatDateShort(file.uploadedAt)}`,
            `Document Format Check: Validated (.${file.extension})`,
          ],
        },
        {
          heading: '2. GRAP Governance & Maker-Checker Compliance',
          paragraphs: [
            'All operational changes contained in this SOP require formal Reviewer sign-off prior to publication on the Axis Bank RetailOps GRAP Knowledge Base.',
          ],
        },
      ],
    } satisfies SOPDocumentContent;
  }, [documentContent, sopId, sopName, category, subCategory, file]);

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-100 overflow-hidden">
      {/* Enterprise Document Viewer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3.5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#F9EFF3] text-[#97144D]">
            {file.extension === 'pdf' ? (
              <FileText className="h-4 w-4" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-800">{file.fileName}</p>
            <p className="text-[11px] text-slate-500 tabular-nums">
              .{file.extension.toUpperCase()} · {formatFileSize(file.fileSize)} · Version v{version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!blobUrl && (
            <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-1 py-0.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 15))}
                className="rounded p-1 text-slate-600 hover:bg-white hover:text-slate-900"
                title="Zoom Out"
                aria-label="Zoom out document preview"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-semibold text-slate-700 tabular-nums">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(130, z + 15))}
                className="rounded p-1 text-slate-600 hover:bg-white hover:text-slate-900"
                title="Zoom In"
                aria-label="Zoom in document preview"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#97144D] hover:text-[#97144D] transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Viewer Canvas */}
      <div className={`${heightClass} w-full overflow-auto bg-[#E8ECF1]`}>
        {blobUrl ? (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=0`}
            title={file.fileName}
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="p-4 sm:p-6 flex justify-center">
            <div
              className="w-full max-w-[760px] bg-white shadow-md border border-slate-200 rounded-sm transition-transform origin-top"
              style={{
                transform: `scale(${zoom / 100})`,
                marginBottom: zoom > 100 ? `${(zoom - 100) * 4}px` : undefined,
              }}
            >
              {/* Official Axis Bank SOP Document Header */}
              <div className="border-b-4 border-[#97144D] px-4 sm:px-6 py-5 bg-gradient-to-r from-white via-white to-[#F9EFF3]/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <AxisLogo variant="burgundy" size="md" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#97144D]">
                        Axis Bank Limited · Retail Operations (GRAP)
                      </p>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug mt-0.5">
                        {sopName || 'Standard Operating Procedure'}
                      </h4>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-flex max-w-full flex-wrap items-center gap-1 rounded bg-[#F9EFF3] px-2 py-0.5 text-[11px] font-bold text-[#97144D] border border-[#97144D]/20 break-words">
                      <ShieldCheck className="h-3 w-3" />
                      {fallbackDocSections.classification}
                    </span>
                    <p className="mt-1 break-all text-[11px] font-semibold text-slate-500 font-mono-tabular">
                      Doc ID: {fallbackDocSections.documentCode}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">
                      SOP Reference
                    </span>
                    <span className="font-bold text-slate-800 font-mono-tabular">
                      {sopId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">
                      Version
                    </span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      v{version}.0
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">
                      Category / Unit
                    </span>
                    <span className="font-bold text-slate-800">
                      {category || 'RetailOps'} · {subCategory || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">
                      Effective / Uploaded
                    </span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {fallbackDocSections.effectiveDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Body */}
              <div className="px-6 py-5 space-y-5 text-[13px] text-slate-700 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50/60 p-3.5">
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#97144D] mb-1">
                      Objective
                    </h5>
                    <p className="text-xs text-slate-700">
                      {fallbackDocSections.objective}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#97144D] mb-1">
                      Scope &amp; Applicability
                    </h5>
                    <p className="text-xs text-slate-700">
                      {fallbackDocSections.scope}
                    </p>
                  </div>
                </div>

                {fallbackDocSections.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h5 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">
                      {section.heading}
                    </h5>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-[13px] text-slate-700">
                        {p}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="list-disc pl-5 space-y-1 text-xs sm:text-[13px] text-slate-700">
                        {section.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {section.table && (
                      <div className="overflow-x-auto mt-2">
                        <table className="w-full border-collapse border border-slate-300 text-xs">
                          <thead>
                            <tr className="bg-[#97144D] text-white">
                              {section.table.headers.map((h, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="border border-[#7A0F3D] px-2.5 py-1.5 text-left font-bold"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={
                                  rIdx % 2 === 0 ? 'bg-white' : 'bg-[#F9EFF3]/40'
                                }
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="border border-slate-200 px-2.5 py-1.5 text-slate-700"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}

                {/* Page Footer */}
                <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Axis Bank Ltd. · Confidential RetailOps GRAP Repository</span>
                  <span className="tabular-nums">
                    Page 1 of 1 · Author: {uploadedByName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
