"use client";

import { motion } from "motion/react";
import { formatBytes } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useState, useEffect, useRef, Fragment } from "react";
import { getMediaAssets, deleteAsset } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Upload, Copy, Check, Image as FileText, Trash2, RefreshCw, Loader2, ArrowLeftRight, FolderOpen, Info } from "lucide-react";

interface UploadedFile {
  name: string;
  publicId?: string;
  resourceType?: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

interface CardAction {
  publicId: string;
  kind: "replace" | "delete";
  progress: number;
}

/** Shared XHR upload so both the main dropzone and the per-card replace flow get real upload progress (fetch() can't report upload progress). */
function uploadWithProgress(formData: FormData, onProgress: (percent: number) => void): Promise<{ url: string; publicId: string; resourceType: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || "Upload failed"));
      } catch {
        reject(new Error("Invalid response from server"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading asset"));
    xhr.send(formData);
  });
}

export default function MediaTab() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [cardAction, setCardAction] = useState<CardAction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [fileToReplace, setFileToReplace] = useState<UploadedFile | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const data = await getMediaAssets();
      setFiles((data.files as UploadedFile[]) || []);
    } catch (err) {
      console.error("Failed to load files", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => { await fetchFiles() };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      const errMsg = `File size (${formatBytes(selected.size)}) exceeds maximum allowed limit of 5 MB`;
      setUploadError(errMsg);
      toast.error(errMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(selected.name);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selected);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success("Asset uploaded successfully!");
          await fetchFiles();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setUploadError(data.error || "Upload failed");
          toast.error(data.error || "Upload failed");
        }
      } catch {
        setUploadError("Invalid response from server");
        toast.error("Invalid response from server");
      } finally {
        setIsUploading(false);
        setUploadingFileName(null);
        setUploadProgress(0);
      }
    };

    xhr.onerror = () => {
      setUploadError("Network error while uploading asset");
      toast.error("Network error while uploading asset");
      setIsUploading(false);
      setUploadingFileName(null);
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const handleReplaceClick = (file: UploadedFile) => {
    setFileToReplace(file);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || !fileToReplace || !fileToReplace.publicId) return;

    if (selected.size > MAX_FILE_SIZE) {
      toast.error(`Replacement file size (${formatBytes(selected.size)}) exceeds maximum limit of 5 MB.`);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
      return;
    }

    const publicId = fileToReplace.publicId;
    setCardAction({ publicId, kind: "replace", progress: 0 });
    const formData = new FormData();
    formData.append("file", selected);
    formData.append("publicId", publicId);
    if (fileToReplace.resourceType) {
      formData.append("resourceType", fileToReplace.resourceType);
    }

    try {
      await uploadWithProgress(formData, (percent) => setCardAction({ publicId, kind: "replace", progress: percent }));
      toast.success("Asset replaced successfully!");
      await fetchFiles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to replace asset");
    } finally {
      setCardAction(null);
      setFileToReplace(null);
    }
  };

  const handleDeleteAsset = async (file: UploadedFile) => {
    if (!file.publicId) {
      toast.error("Cannot delete file: Missing public ID");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    setCardAction({ publicId: file.publicId, kind: "delete", progress: 0 });
    try {
      await deleteAsset(file.publicId, file.resourceType || "image");
      toast.success("Asset deleted successfully!");
      await fetchFiles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting asset");
    } finally {
      setCardAction(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.info("Copied URL to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const isImage = (url: string, fileName: string) => {
    const ext = (fileName || url).split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
  };

  const isVideo = (url: string, fileName: string) => {
    const ext = (fileName || url).split(".").pop()?.toLowerCase();
    return ["mp4", "webm"].includes(ext || "");
  };

  const getMediaTypeLabel = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) return "IMAGE";
    if (["mp4", "webm"].includes(ext || "")) return "VIDEO";
    if (ext === "pdf") return "PDF";
    return "FILE";
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        onChange={handleReplaceUpload}
        accept="image/*,video/mp4,video/webm,.pdf"
        className="hidden"
      />

      <Card className="border-ink/8 shadow-xs bg-white">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-ink text-xl font-bold">Media & Asset Studio</CardTitle>
            <CardDescription className="text-steel text-xs mt-1">
              Upload, manage, copy links, replace, and remove product photos, videos, and PDF brochures.
            </CardDescription>
          </div>
          <Tooltip content="Sync latest media assets from server" side="bottom">
            <Button variant="outline" size="sm" onClick={fetchFiles} className="gap-1.5 self-start sm:self-auto border-ink/10 hover:bg-ink/5 text-ink cursor-pointer">
              <RefreshCw size={14} /> Refresh Library
            </Button>
          </Tooltip>
        </CardHeader>

        <CardContent className="space-y-6">
          <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-8 text-center ${isUploading ? "border-gold/50 bg-gold/5 cursor-wait" : "border-ink/15 bg-transparent cursor-pointer hover:border-gold hover:bg-gold/5"}`} >
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} accept="image/*,video/mp4,video/webm,.pdf" className="hidden" disabled={isUploading} />

            {isUploading ? (
              <div className="w-full max-w-md space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold-deep mx-auto">
                  <Loader2 size={24} className="animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink px-1">
                    <span className="truncate max-w-60 text-left">{uploadingFileName || "Uploading file..."}</span>
                    <span className="text-gold-deep font-bold">{uploadProgress === 100 ? "Processing..." : `${uploadProgress}%`}</span>
                  </div>
                  <div className="w-full bg-ink/10 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gold h-full rounded-full transition-all duration-150 ease-out shadow-xs"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-steel">
                    {uploadProgress === 100 ? "Finalizing Cloudinary optimization..." : `Uploading asset (${uploadProgress}%)...`}
                  </p>
                </div>
              </div>
            ) : (
              <Fragment>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink transition-transform group-hover:scale-110 group-hover:bg-gold/20">
                  <Upload size={22} className="text-ink" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">
                  Click to select and upload an asset
                </p>
                <p className="mt-1 text-xs text-steel">
                  Supports JPEG, PNG, WebP, MP4, WebM, and PDF brochures (max 5 MB)
                </p>
              </Fragment>
            )}
            {uploadError && (<p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>)}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-steel flex items-center justify-between">
              <span>Uploaded Assets ({files.length})</span>
              {loadingFiles && (
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-steel normal-case">
                  <Loader2 size={12} className="animate-spin text-gold-deep" /> Syncing assets...
                </span>
              )}
            </h3>

            {loadingFiles ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-col justify-between rounded-2xl border border-ink/8 bg-white p-3.5 shadow-xs space-y-3 animate-pulse" >
                    <div className="h-44 w-full rounded-xl bg-ink/10" />
                    <div className="flex justify-between items-center px-1">
                      <div className="h-3 w-16 rounded bg-ink/10" />
                      <div className="h-3 w-16 rounded bg-ink/10" />
                    </div>
                    <div className="h-8.5 w-full rounded-xl bg-ink/10" />
                  </div>
                ))}
              </div>
            ) : files.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/50 p-10 text-center shadow-xs space-y-3"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep border border-gold/30 shadow-xs"
                >
                  <FolderOpen size={30} />
                </motion.div>

                <div className="max-w-md space-y-1">
                  <h4 className="text-base font-bold text-ink">No Media Assets Found</h4>
                  <p className="text-xs text-steel leading-relaxed">
                    Your Cloudinary media library is currently empty. Upload high-res equipment photos, demo walk-around videos, or PDF product brochures above to populate your asset store.
                  </p>
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 h-9 gap-2 text-xs font-semibold bg-gold hover:bg-gold-deep text-ink shadow-xs border border-gold/40 cursor-pointer px-4"
                >
                  <Upload size={14} /> Upload First Asset
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => {
                  const isReplacing = !!cardAction && cardAction.publicId === file.publicId && cardAction.kind === "replace";
                  const isDeleting = !!cardAction && cardAction.publicId === file.publicId && cardAction.kind === "delete";
                  const isBusy = isReplacing || isDeleting;
                  return (
                    <div
                      key={file.publicId || file.url}
                      className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-3.5 shadow-xs hover:border-ink/20 transition-all space-y-3" >
                      <div className="relative w-full h-44 rounded-xl bg-ink/5 border border-ink/8 flex items-center justify-center group">
                        <div className="absolute inset-0 rounded-xl overflow-hidden flex items-center justify-center">
                          {isImage(file.url, file.name) ? (
                            <img src={file.url} alt="Media preview" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                          ) : isVideo(file.url, file.name) ? (
                            <video src={file.url} controls
                              preload="metadata"
                              className="w-full h-full object-cover bg-black"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center gap-2 text-red-600">
                              <FileText size={36} />
                              <span className="text-xs font-bold uppercase tracking-wider">PDF Document</span>
                            </div>
                          )}
                        </div>
                        {isBusy && (
                          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/70 backdrop-blur-sm">
                            <Loader2 size={22} className="animate-spin text-white" />
                            <span className="text-xs font-semibold text-white">
                              {isReplacing ? (cardAction!.progress === 100 ? "Processing…" : `Replacing… ${cardAction!.progress}%`) : "Deleting…"}
                            </span>
                            {isReplacing && (
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                                <div className="h-full rounded-full bg-gold transition-all duration-150 ease-out" style={{ width: `${cardAction!.progress}%` }} />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                          {getMediaTypeLabel(file.name)}
                        </div>
                        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-black/65 backdrop-blur-md p-1 rounded-xl shadow-md border border-white/10">
                          <Tooltip content="Replace File" side="bottom">
                            <button
                              onClick={() => handleReplaceClick(file)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <ArrowLeftRight size={13} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete Asset" side="bottom">
                            <button
                              onClick={() => handleDeleteAsset(file)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </Tooltip>
                        </div>
                        <div className="absolute bottom-1 left-2.5 z-20" >
                          <Tooltip content={
                            <div className="space-y-1 text-xs">
                              <div><span className="font-medium">Size:</span>{" "}{formatBytes(file.sizeBytes)}</div>
                              <div><span className="font-medium">Created:</span>{" "}{new Date(file.createdAt).toLocaleDateString()}</div>
                            </div>} side="bottom">
                            <button type="button" className="p-1 rounded-md text-steel hover:text-white hover:bg-white/10 transition-colors cursor-pointer" aria-label="File information">
                              <Info size={13} className="text-stone-800 hover:text-stone-900" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-ink/8 flex justify-end">
                        <Tooltip content="Copy asset URL to clipboard" side="top">
                          <Button size="sm" onClick={() => copyToClipboard(file.url)}
                            className="w-auto h-8.5 gap-1.5 text-xs font-semibold bg-gold hover:bg-gold-deep text-ink border border-gold/40 shadow-xs cursor-pointer px-3"                          >
                            {copiedUrl === file.url ? (
                              <Fragment>
                                <Check size={13} className="text-emerald-700 font-bold" /> Copied URL!
                              </Fragment>
                            ) : (
                              <Fragment>
                                <Copy size={13} /> Copy URL
                              </Fragment>
                            )}
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
