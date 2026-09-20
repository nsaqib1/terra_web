"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Camera,
  Check,
  Crop,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { mediaApi } from "@/lib/api/media";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"
).replace(/\/+$/, "");

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string | null;
  onAvatarUpdated: (newAvatarUrl: string | null) => void;
  userDisplayName?: string;
}

type FilterPreset = "normal" | "warm" | "vivid" | "mono" | "cool";

interface FilterSettings {
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  saturation: number; // -50 to 50
  preset: FilterPreset;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  preset: "normal",
};

export function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onAvatarUpdated,
  userDisplayName = "User",
}: AvatarUploadModalProps) {
  const { setUser } = useAuth();

  // Selected image source (Data URL or Object URL)
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("avatar.webp");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Transform states
  const [zoom, setZoom] = useState<number>(1);
  const [minZoom, setMinZoom] = useState<number>(1);
  const [maxZoom] = useState<number>(4);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [fineAngle, setFineAngle] = useState<number>(0); // -45 to 45
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter adjustments
  const [activeTab, setActiveTab] = useState<"crop" | "adjust">("crop");
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  // Status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drag interaction states
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // DOM & canvas refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Size of crop area inside container
  const CROP_SIZE = 280;

  // Reset transforms when new image is loaded
  const resetTransforms = useCallback(() => {
    setZoom(1);
    setMinZoom(1);
    setRotation(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
    setPan({ x: 0, y: 0 });
    setFilters(DEFAULT_FILTERS);
    setActiveTab("crop");
    setErrorMessage(null);
  }, []);

  // Handle file input selection
  const processFile = useCallback(
    (file: File) => {
      setErrorMessage(null);
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (JPEG, PNG, WebP, etc.)");
        return;
      }

      // 15MB maximum client limit
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 15MB.");
        return;
      }

      setImageFileName(file.name.replace(/\.[^/.]+$/, "") + ".webp");

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          imageElementRef.current = img;
          setImageSrc(result);
          resetTransforms();
        };
        img.onerror = () => {
          setErrorMessage("Failed to load image file.");
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    },
    [resetTransforms],
  );

  // Handle global paste event for quick screenshots/copies
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, processFile]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      resetTransforms();
      setErrorMessage(null);
    }
  }, [isOpen, resetTransforms]);

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setZoom((prev) => Math.min(maxZoom, Math.max(minZoom, prev + delta)));
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCanvas(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    panStartPos.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCanvas) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setPan({
      x: panStartPos.current.x + dx,
      y: panStartPos.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // Touch pan & pinch zoom handlers
  const touchStartRef = useRef<{
    x: number;
    y: number;
    dist: number;
    zoom: number;
  }>({ x: 0, y: 0, dist: 0, zoom: 1 });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDraggingCanvas(true);
      dragStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      panStartPos.current = { ...pan };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist,
        zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDraggingCanvas) {
      const dx = e.touches[0].clientX - dragStartPos.current.x;
      const dy = e.touches[0].clientY - dragStartPos.current.y;
      setPan({
        x: panStartPos.current.x + dx,
        y: panStartPos.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scale = dist / touchStartRef.current.dist;
      setZoom(
        Math.min(
          maxZoom,
          Math.max(minZoom, touchStartRef.current.zoom * scale),
        ),
      );
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingCanvas(false);
  };

  // Calculate CSS filter string based on adjustments
  const getFilterCSS = (f: FilterSettings) => {
    let b = 100 + f.brightness;
    let c = 100 + f.contrast;
    let s = 100 + f.saturation;

    if (f.preset === "warm") {
      b += 5;
      c += 5;
      s += 15;
    } else if (f.preset === "vivid") {
      c += 15;
      s += 35;
    } else if (f.preset === "mono") {
      s = 0;
      c += 15;
    } else if (f.preset === "cool") {
      b += 5;
      s -= 10;
    }

    return `brightness(${Math.max(0, b)}%) contrast(${Math.max(0, c)}%) saturate(${Math.max(0, s)}%)`;
  };

  // Live render onto main interactive canvas
  useEffect(() => {
    if (!imageSrc || !imageElementRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageElementRef.current;
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    ctx.save();

    // Center transform point
    ctx.translate(CROP_SIZE / 2 + pan.x, CROP_SIZE / 2 + pan.y);

    // Rotation (90deg step + fine angle)
    const totalAngle = ((rotation + fineAngle) * Math.PI) / 180;
    ctx.rotate(totalAngle);

    // Flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply Zoom
    ctx.scale(zoom, zoom);

    // Apply image filters
    ctx.filter = getFilterCSS(filters);

    // Draw image centered
    const baseScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
    const renderWidth = img.width * baseScale;
    const renderHeight = img.height * baseScale;

    ctx.drawImage(
      img,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight,
    );

    ctx.restore();

    // Also draw live circle preview in preview canvas
    if (previewCanvasRef.current) {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas.getContext("2d");
      if (pCtx) {
        pCanvas.width = 160;
        pCanvas.height = 160;
        pCtx.clearRect(0, 0, 160, 160);
        pCtx.save();
        pCtx.beginPath();
        pCtx.arc(80, 80, 80, 0, Math.PI * 2);
        pCtx.closePath();
        pCtx.clip();
        pCtx.drawImage(canvas, 0, 0, 160, 160);
        pCtx.restore();
      }
    }
  }, [
    imageSrc,
    zoom,
    rotation,
    fineAngle,
    flipH,
    flipV,
    pan,
    filters,
    CROP_SIZE,
  ]);

  // Export high resolution 512x512 canvas blob
  const generateCroppedBlob = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = imageElementRef.current;
      if (!img) {
        reject(new Error("No image loaded"));
        return;
      }

      const OUTPUT_SIZE = 512;
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = OUTPUT_SIZE;
      exportCanvas.height = OUTPUT_SIZE;
      const ctx = exportCanvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Scale pan from viewport size (CROP_SIZE) to OUTPUT_SIZE
      const scaleMultiplier = OUTPUT_SIZE / CROP_SIZE;

      ctx.save();
      ctx.translate(
        OUTPUT_SIZE / 2 + pan.x * scaleMultiplier,
        OUTPUT_SIZE / 2 + pan.y * scaleMultiplier,
      );

      const totalAngle = ((rotation + fineAngle) * Math.PI) / 180;
      ctx.rotate(totalAngle);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.scale(zoom, zoom);
      ctx.filter = getFilterCSS(filters);

      const baseScale =
        Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height);
      const renderWidth = img.width * baseScale;
      const renderHeight = img.height * baseScale;

      ctx.drawImage(
        img,
        -renderWidth / 2,
        -renderHeight / 2,
        renderWidth,
        renderHeight,
      );

      ctx.restore();

      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to export image"));
          }
        },
        "image/webp",
        0.92,
      );
    });
  };

  // Upload and save profile picture
  const handleSaveAndUpload = async () => {
    if (!imageSrc) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. Generate crisp high-res WebP blob from canvas
      const croppedBlob = await generateCroppedBlob();
      const croppedFile = new File([croppedBlob], imageFileName, {
        type: "image/webp",
      });

      // 2. Upload to media storage
      const uploadedMedia = await mediaApi.upload(croppedFile);

      // 3. Construct direct media URL
      const newAvatarUrl = `${API_BASE}/media/${uploadedMedia.id}`;

      // 4. Update user profile
      const updated = await usersApi.updateProfile({
        avatarUrl: newAvatarUrl,
      });

      // 5. Update global AuthContext user
      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatarUrl: updated.user.avatarUrl,
            }
          : null,
      );

      // 6. Notify parent component
      onAvatarUpdated(updated.user.avatarUrl);

      onClose();
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setErrorMessage(
        err?.message ||
          "Failed to upload and update profile picture. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;
    setIsRemoving(true);
    setErrorMessage(null);

    try {
      const updated = await usersApi.updateProfile({
        avatarUrl: null,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatarUrl: null,
            }
          : null,
      );

      onAvatarUpdated(null);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to remove profile picture. Please try again.",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSaving && !isRemoving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-modal-title"
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-brand-sand-dark bg-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-brand-sand-dark/60 px-6 py-4 bg-brand-cream/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-desert-dark/10 text-brand-desert-dark">
              <Camera size={18} />
            </div>
            <div>
              <h2
                id="avatar-modal-title"
                className="text-base font-bold text-brand-brown-950"
              >
                Profile Picture
              </h2>
              <p className="text-xs text-brand-brown-600">
                Crop, rotate, and style your avatar photo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isRemoving}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-brand-brown-600 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {!imageSrc ? (
            /* Upload dropzone screen */
            <div className="space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDraggingOver
                    ? "border-brand-desert-dark bg-brand-desert/10 scale-[1.01]"
                    : "border-brand-sand-dark bg-brand-cream/30 hover:border-brand-desert hover:bg-brand-cream/60"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-900 group-hover:scale-110 group-hover:bg-brand-desert-light transition-all duration-300 shadow-xs">
                  <UploadCloud size={30} className="text-brand-desert-dark" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-brand-brown-950">
                  Upload a new photo
                </h3>
                <p className="mt-1 text-xs text-brand-brown-600 max-w-sm">
                  Drag and drop your image here, or{" "}
                  <span className="font-semibold text-brand-desert-dark underline">
                    browse files
                  </span>
                </p>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground bg-white/80 px-3 py-1.5 rounded-full border border-brand-sand-dark/60">
                  <span>Supports JPEG, PNG, WebP, GIF</span>
                  <span>•</span>
                  <span>Max 15MB</span>
                  <span>•</span>
                  <span>Ctrl+V to paste</span>
                </div>
              </div>

              {/* Current avatar preview & removal */}
              {currentAvatarUrl && (
                <div className="flex items-center justify-between rounded-2xl border border-brand-sand-dark/70 bg-brand-sand/30 p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentAvatarUrl}
                      alt={userDisplayName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-brand-brown-900">
                        Current Profile Picture
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Active on your public profile & posts
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveAvatar}
                    disabled={isRemoving}
                    className="h-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-semibold gap-1.5"
                  >
                    {isRemoving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Interactive Crop & Edit Screen */
            <div className="space-y-5">
              {/* Tabs: Crop & Transform vs Adjustments */}
              <div className="flex items-center gap-1 rounded-xl bg-brand-sand/50 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("crop")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                    activeTab === "crop"
                      ? "bg-white text-brand-brown-950 shadow-xs"
                      : "text-brand-brown-700 hover:text-brand-brown-950"
                  }`}
                >
                  <Crop size={14} />
                  Position & Crop
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("adjust")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                    activeTab === "adjust"
                      ? "bg-white text-brand-brown-950 shadow-xs"
                      : "text-brand-brown-700 hover:text-brand-brown-950"
                  }`}
                >
                  <Sliders size={14} />
                  Lighting & Filters
                </button>
              </div>

              {/* Main Workspace: Editor Canvas + Live Previews */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-5 items-start">
                {/* Left: Interactive Canvas Viewport */}
                <div className="flex flex-col items-center">
                  <div
                    className="relative overflow-hidden rounded-2xl border-2 border-brand-sand-dark bg-stone-900 shadow-inner select-none cursor-grab active:cursor-grabbing touch-none"
                    style={{ width: CROP_SIZE, height: CROP_SIZE }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Canvas */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 block w-full h-full pointer-events-none"
                    />

                    {/* Circular Mask Overlay with Rule-of-Thirds Grid */}
                    <div className="pointer-events-none absolute inset-0">
                      <svg
                        className="w-full h-full"
                        viewBox={`0 0 ${CROP_SIZE} ${CROP_SIZE}`}
                      >
                        <defs>
                          <mask id="avatar-circle-mask">
                            <rect
                              width={CROP_SIZE}
                              height={CROP_SIZE}
                              fill="white"
                            />
                            <circle
                              cx={CROP_SIZE / 2}
                              cy={CROP_SIZE / 2}
                              r={CROP_SIZE / 2 - 4}
                              fill="black"
                            />
                          </mask>
                        </defs>
                        <rect
                          width={CROP_SIZE}
                          height={CROP_SIZE}
                          fill="rgba(0, 0, 0, 0.55)"
                          mask="url(#avatar-circle-mask)"
                        />
                        <circle
                          cx={CROP_SIZE / 2}
                          cy={CROP_SIZE / 2}
                          r={CROP_SIZE / 2 - 4}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.75)"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />

                        {/* Grid lines inside circle */}
                        <line
                          x1={CROP_SIZE / 3}
                          y1="0"
                          x2={CROP_SIZE / 3}
                          y2={CROP_SIZE}
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth="1"
                        />
                        <line
                          x1={(CROP_SIZE * 2) / 3}
                          y1="0"
                          x2={(CROP_SIZE * 2) / 3}
                          y2={CROP_SIZE}
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1={CROP_SIZE / 3}
                          x2={CROP_SIZE}
                          y2={CROP_SIZE / 3}
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1={(CROP_SIZE * 2) / 3}
                          x2={CROP_SIZE}
                          y2={(CROP_SIZE * 2) / 3}
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>

                    {/* Hint badge */}
                    <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-xs">
                      Drag to reposition • Scroll to zoom
                    </div>
                  </div>
                </div>

                {/* Right: Live Preview Panel in Real Dimensions */}
                <div className="flex flex-col items-center justify-between rounded-2xl border border-brand-sand-dark/60 bg-brand-cream/40 p-4 h-full">
                  <div className="w-full text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-700">
                      Live Preview
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      How you appear across Terramids
                    </p>
                  </div>

                  <div className="my-3 flex flex-col items-center gap-3">
                    {/* Large 80px preview */}
                    <div className="relative">
                      <canvas
                        ref={previewCanvasRef}
                        className="h-20 w-20 rounded-full border-2 border-white shadow-md object-cover bg-white"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert text-[9px] font-bold text-brand-brown-950 shadow-xs">
                        80
                      </span>
                    </div>

                    {/* Small preview comparison */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex flex-col items-center">
                        <div
                          className="h-10 w-10 overflow-hidden rounded-full border border-white shadow-xs bg-white"
                          style={{
                            backgroundImage: `url(${imageSrc})`,
                          }}
                        >
                          <canvas
                            className="h-full w-full object-cover"
                            ref={(el) => {
                              if (el && previewCanvasRef.current) {
                                const ctx = el.getContext("2d");
                                el.width = 40;
                                el.height = 40;
                                ctx?.drawImage(
                                  previewCanvasRef.current,
                                  0,
                                  0,
                                  40,
                                  40,
                                );
                              }
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1">
                          40px
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 overflow-hidden rounded-full border border-white shadow-xs bg-white">
                          <canvas
                            className="h-full w-full object-cover"
                            ref={(el) => {
                              if (el && previewCanvasRef.current) {
                                const ctx = el.getContext("2d");
                                el.width = 24;
                                el.height = 24;
                                ctx?.drawImage(
                                  previewCanvasRef.current,
                                  0,
                                  0,
                                  24,
                                  24,
                                );
                              }
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1">
                          24px
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-center text-[11px] font-semibold text-brand-desert-dark hover:underline"
                  >
                    Choose another photo
                  </button>
                </div>
              </div>

              {/* Controls Tab 1: Crop, Zoom, Rotate, Flip */}
              {activeTab === "crop" && (
                <div className="space-y-4 rounded-2xl border border-brand-sand-dark/60 bg-brand-cream/20 p-4">
                  {/* Zoom Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-brown-800">
                      <span className="flex items-center gap-1.5">
                        <Maximize2 size={13} className="text-brand-brown-600" />
                        Zoom Level
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {zoom.toFixed(2)}x
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setZoom((prev) =>
                            Math.max(minZoom, Number((prev - 0.1).toFixed(2))),
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-sand-dark bg-white text-brand-brown-700 hover:bg-brand-sand transition-colors"
                      >
                        <Minus size={13} />
                      </button>

                      <input
                        type="range"
                        min={minZoom}
                        max={maxZoom}
                        step={0.02}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-brand-sand-dark accent-brand-desert-dark"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setZoom((prev) =>
                            Math.min(maxZoom, Number((prev + 0.1).toFixed(2))),
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-sand-dark bg-white text-brand-brown-700 hover:bg-brand-sand transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Transformation buttons & Fine angle */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-brand-sand-dark/50">
                    <div className="flex items-center gap-1.5">
                      {/* Rotate CCW */}
                      <button
                        type="button"
                        onClick={() =>
                          setRotation((prev) => (prev - 90 + 360) % 360)
                        }
                        title="Rotate 90° Left"
                        className="flex items-center gap-1 rounded-xl border border-brand-sand-dark bg-white px-3 py-1.5 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand transition-colors shadow-2xs"
                      >
                        <RotateCcw size={13} />
                        -90°
                      </button>

                      {/* Rotate CW */}
                      <button
                        type="button"
                        onClick={() =>
                          setRotation((prev) => (prev + 90) % 360)
                        }
                        title="Rotate 90° Right"
                        className="flex items-center gap-1 rounded-xl border border-brand-sand-dark bg-white px-3 py-1.5 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand transition-colors shadow-2xs"
                      >
                        <RotateCw size={13} />
                        +90°
                      </button>

                      {/* Flip H */}
                      <button
                        type="button"
                        onClick={() => setFlipH((prev) => !prev)}
                        title="Flip Horizontal"
                        className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs ${
                          flipH
                            ? "border-brand-desert-dark bg-brand-desert/20 text-brand-brown-950"
                            : "border-brand-sand-dark bg-white text-brand-brown-800 hover:bg-brand-sand"
                        }`}
                      >
                        <FlipHorizontal size={13} />
                        Flip H
                      </button>

                      {/* Flip V */}
                      <button
                        type="button"
                        onClick={() => setFlipV((prev) => !prev)}
                        title="Flip Vertical"
                        className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs ${
                          flipV
                            ? "border-brand-desert-dark bg-brand-desert/20 text-brand-brown-950"
                            : "border-brand-sand-dark bg-white text-brand-brown-800 hover:bg-brand-sand"
                        }`}
                      >
                        <FlipVertical size={13} />
                        Flip V
                      </button>
                    </div>

                    {/* Reset button */}
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setRotation(0);
                        setFineAngle(0);
                        setFlipH(false);
                        setFlipV(false);
                        setPan({ x: 0, y: 0 });
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-brown-600 hover:text-brand-brown-950"
                    >
                      <RefreshCcw size={12} />
                      Reset
                    </button>
                  </div>

                  {/* Fine tilt adjustment slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                      <span>Fine Tilt Adjustment</span>
                      <span className="font-mono">{fineAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={-45}
                      max={45}
                      step={1}
                      value={fineAngle}
                      onChange={(e) => setFineAngle(parseInt(e.target.value))}
                      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-brand-sand-dark accent-brand-desert-dark"
                    />
                  </div>
                </div>
              )}

              {/* Controls Tab 2: Lighting & Filter Presets */}
              {activeTab === "adjust" && (
                <div className="space-y-4 rounded-2xl border border-brand-sand-dark/60 bg-brand-cream/20 p-4">
                  {/* Presets */}
                  <div>
                    <label className="text-xs font-bold text-brand-brown-900 block mb-2">
                      Color Filter Presets
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: "normal", label: "Original" },
                        { id: "warm", label: "Desert Warm" },
                        { id: "vivid", label: "Vivid Glow" },
                        { id: "mono", label: "B&W Film" },
                        { id: "cool", label: "Cool Air" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setFilters((f) => ({
                              ...f,
                              preset: p.id as FilterPreset,
                            }))
                          }
                          className={`flex flex-col items-center rounded-xl border p-2 text-center transition-all ${
                            filters.preset === p.id
                              ? "border-brand-desert-dark bg-brand-desert/20 text-brand-brown-950 font-bold shadow-xs"
                              : "border-brand-sand-dark bg-white text-brand-brown-700 hover:bg-brand-sand text-xs font-medium"
                          }`}
                        >
                          <Sparkles
                            size={12}
                            className={
                              filters.preset === p.id
                                ? "text-brand-desert-dark"
                                : "text-muted-foreground"
                            }
                          />
                          <span className="text-[10px] mt-1 line-clamp-1">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders: Brightness, Contrast, Saturation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-sand-dark/50">
                    {/* Brightness */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-brand-brown-800">
                        <span>Brightness</span>
                        <span className="font-mono">
                          {filters.brightness > 0
                            ? `+${filters.brightness}`
                            : filters.brightness}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={filters.brightness}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            brightness: parseInt(e.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-brand-sand-dark accent-brand-desert-dark"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-brand-brown-800">
                        <span>Contrast</span>
                        <span className="font-mono">
                          {filters.contrast > 0
                            ? `+${filters.contrast}`
                            : filters.contrast}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={filters.contrast}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            contrast: parseInt(e.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-brand-sand-dark accent-brand-desert-dark"
                      />
                    </div>

                    {/* Saturation */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-brand-brown-800">
                        <span>Saturation</span>
                        <span className="font-mono">
                          {filters.saturation > 0
                            ? `+${filters.saturation}`
                            : filters.saturation}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={filters.saturation}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            saturation: parseInt(e.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-brand-sand-dark accent-brand-desert-dark"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="text-[11px] font-semibold text-brand-brown-600 hover:text-brand-brown-950"
                    >
                      Reset Adjustments
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-brand-sand-dark/60 bg-brand-cream/30 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (imageSrc) {
                setImageSrc(null);
                resetTransforms();
              } else {
                onClose();
              }
            }}
            disabled={isSaving || isRemoving}
            className="h-10 rounded-xl border-brand-sand-dark bg-white text-xs font-bold text-brand-brown-800 hover:bg-brand-sand"
          >
            {imageSrc ? "Back" : "Cancel"}
          </Button>

          {imageSrc && (
            <Button
              type="button"
              onClick={handleSaveAndUpload}
              disabled={isSaving || isRemoving}
              className="h-10 rounded-xl bg-brand-brown-950 px-6 text-xs font-bold text-white shadow-md hover:bg-brand-brown-800 transition-all gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  Saving Avatar...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Apply & Save Photo
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
