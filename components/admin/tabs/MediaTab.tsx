"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Copy, Check, File, Image as ImageIcon, Video, FileText, Trash2, RefreshCw } from "lucide-react";

interface UploadedFile {
  name: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

export default function MediaTab() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/admin/upload");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to load files", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
      } else {
        await fetchFiles();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch {
      setUploadError("Network error while uploading asset");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
      return <ImageIcon size={20} className="text-blue-500" />;
    }
    if (["mp4", "webm"].includes(ext || "")) {
      return <Video size={20} className="text-amber-500" />;
    }
    if (ext === "pdf") {
      return <FileText size={20} className="text-red-500" />;
    }
    return <File size={20} className="text-steel" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Media & Asset Uploader</CardTitle>
            <CardDescription>
              Upload product photos, demo walk-around videos, and brochures.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            className="gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw size={14} /> Refresh Library
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Dropzone / Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-paper/60 p-8 text-center transition-all hover:border-gold hover:bg-gold/5"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept="image/*,video/mp4,video/webm,.pdf"
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink transition-transform group-hover:scale-110 group-hover:bg-gold/20">
              <Upload size={22} className="text-ink" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">
              {isUploading ? "Uploading file to server..." : "Click to select and upload an asset"}
            </p>
            <p className="mt-1 text-xs text-steel">
              Supports JPEG, PNG, WebP, MP4, WebM, and PDF brochures (max 50MB)
            </p>
            {uploadError && (
              <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Asset Gallery / File List */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-steel">
              Uploaded Files ({files.length})
            </h3>

            {files.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink/10 p-8 text-center text-xs text-steel">
                No files uploaded yet. Upload your first product media above!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex flex-col justify-between rounded-xl border border-ink/10 bg-white p-3 shadow-xs hover:border-ink/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink/5">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-steel">
                          {formatBytes(file.sizeBytes)} •{" "}
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-2">
                      <span className="truncate text-[11px] font-mono text-steel max-w-37.5">
                        {file.url}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(file.url)} className="h-7 gap-1 text-[11px]" >
                        {copiedUrl === file.url ? (
                          <Fragment>
                            <Check size={12} className="text-emerald-600" /> Copied
                          </Fragment>
                        ) : (
                          <Fragment>
                            <Copy size={12} /> Copy URL
                          </Fragment>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
