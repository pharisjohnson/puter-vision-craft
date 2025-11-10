import { useState, useCallback, useEffect } from "react";
import { Upload, Link as LinkIcon, Copy, CheckCheck, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    puter: {
      ai: {
        img2txt: (input: string | File) => Promise<string>;
      };
    };
  }
}

export const OCRScanner = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [puterLoaded, setPuterLoaded] = useState(false);

  useEffect(() => {
    // Check if puter is loaded
    const checkPuter = () => {
      if (window.puter && window.puter.ai) {
        console.log("Puter.js loaded successfully");
        setPuterLoaded(true);
      } else {
        console.log("Waiting for Puter.js to load...");
        setTimeout(checkPuter, 100);
      }
    };
    checkPuter();
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        setImageUrl("");
        setPreviewUrl(URL.createObjectURL(file));
        setExtractedText("");
      } else {
        toast.error("Please upload an image file");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl("");
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedText("");
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setPreviewUrl(url);
    setExtractedText("");
  };

  const fileToDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const extractText = async () => {
    if (!imageFile && !imageUrl) {
      toast.error("Please upload an image or enter an image URL");
      return;
    }

    if (!puterLoaded || !window.puter || !window.puter.ai) {
      toast.error("OCR service is still loading. Please wait a moment and try again.");
      return;
    }

    setIsProcessing(true);
    console.log("Starting OCR extraction...", { hasFile: !!imageFile, hasUrl: !!imageUrl });
    
    try {
      let text = "";
      if (imageFile) {
        try {
          console.log("Attempting OCR with File object");
          text = await window.puter.ai.img2txt(imageFile);
        } catch (err1) {
          console.warn("Direct File OCR failed, retrying with Data URL...", err1);
          const dataUrl = await fileToDataURL(imageFile);
          text = await window.puter.ai.img2txt(dataUrl);
        }
      } else {
        const url = imageUrl.trim();
        console.log("Attempting OCR with URL", url);
        text = await window.puter.ai.img2txt(url);
      }

      console.log("OCR result:", text);
      setExtractedText(text || "No text found in image");
      toast.success("Text extracted successfully!");
    } catch (error) {
      console.error("OCR Error details (after retries):", error);
      const errorMessage = typeof error === "string" ? error : (error instanceof Error ? error.message : JSON.stringify(error));
      toast.error(`Failed to extract text: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setImageUrl("");
    setImageFile(null);
    setPreviewUrl("");
    setExtractedText("");
  };

  return (
    <div className="space-y-6">
      {!puterLoaded && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Loading OCR service... Please wait a moment.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="shadow-elegant border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
                dragActive
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center py-12 cursor-pointer"
              >
                <Upload className="w-12 h-12 mb-4 text-primary" />
                <p className="text-lg font-medium mb-1">
                  Drop your image here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WEBP
                </p>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Paste image URL here..."
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewUrl && (
        <Card className="shadow-elegant border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Image Preview</h3>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            <Button
              onClick={extractText}
              disabled={isProcessing || !puterLoaded}
              className="w-full mt-4 gradient-primary shadow-glow"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Extract Text"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {extractedText && (
        <Card className="shadow-elegant border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Extracted Text</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-6 min-h-[200px] max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words font-mono text-base leading-relaxed">
                {extractedText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
