"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, SwitchCamera, Upload } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
      setPermissionDenied(false);
    } catch {
      setPermissionDenied(true);
      setCameraReady(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedUrl(URL.createObjectURL(blob));
          streamRef.current?.getTracks().forEach((t) => t.stop());
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setCapturedUrl(URL.createObjectURL(file));
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const retake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedBlob(null);
    setCapturedUrl(null);
    startCamera(facingMode);
  };

  const confirm = async () => {
    if (!capturedBlob) return;

    const formData = new FormData();
    formData.append("image", capturedBlob, "fridge.jpg");

    try {
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (data.ingredients) {
        sessionStorage.setItem("scan_ingredients", JSON.stringify(data.ingredients));
        router.push("/scan/review");
      }
    } catch {
      // TODO: toast error
    }
  };

  if (capturedUrl) {
    return (
      <div className="flex h-dvh flex-col bg-black">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.push("/")} className="text-white" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-white">Review photo</span>
          <div className="w-6" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <img src={capturedUrl} alt="Captured fridge" className="max-h-full max-w-full object-contain" />
        </div>

        <div className="flex gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
          <button
            onClick={retake}
            className="flex-1 rounded-full border border-white/30 py-3 text-sm font-medium text-white"
          >
            Retake
          </button>
          <button
            onClick={confirm}
            className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-black"
          >
            Looks good
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/")} className="text-white" aria-label="Close">
          <X className="h-6 w-6" />
        </button>
        <span className="text-sm font-medium text-white">Scan your fridge</span>
        <div className="w-6" />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {permissionDenied ? (
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <Camera className="h-12 w-12 text-white/50" />
            <p className="text-sm text-white/70">
              Camera access denied. You can upload a photo instead.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              <Upload className="h-4 w-4" />
              Upload photo
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {cameraReady && (
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <p className="rounded-full bg-black/50 px-4 py-1.5 text-xs text-white/80">
              Point at your fridge or ingredients
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white"
          aria-label="Upload photo"
        >
          <Upload className="h-5 w-5" />
        </button>

        {cameraReady && (
          <button
            onClick={capture}
            className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-transparent"
            aria-label="Take photo"
          >
            <div className="h-14 w-14 rounded-full bg-white" />
          </button>
        )}

        {cameraReady && (
          <button
            onClick={() => setFacingMode((f) => (f === "environment" ? "user" : "environment"))}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white"
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
