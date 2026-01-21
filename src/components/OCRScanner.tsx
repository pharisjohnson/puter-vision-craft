import { useState, useCallback, useEffect } from "react";
import { Upload, Link as LinkIcon, Copy, CheckCheck, Loader2, X, AlertCircle, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trackOCREvent } from "@/lib/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare global {
  interface Window {
    puter: {
      ai: {
        img2txt: (input: string | File) => Promise<string>;
      };
    };
  }
}

type ImageData = {
  id: string;
  file?: File;
  url?: string;
  previewUrl: string;
  extractedText: string;
  isProcessing: boolean;
  name: string;
};

export const OCRScanner = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
      if (files.length === 0) {
        toast.error("Please upload image files only");
        return;
      }
      addImages(files);
    }
  }, []);

  const addImages = (files: File[]) => {
    const newImages: ImageData[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      extractedText: "",
      isProcessing: false,
      name: file.name,
    }));
    setImages(prev => [...prev, ...newImages]);
    trackOCREvent.imageUploaded(files.length, 'file');
    toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImageFromUrl = (url: string) => {
    if (!url.trim()) return;
    const newImage: ImageData = {
      id: crypto.randomUUID(),
      url: url.trim(),
      previewUrl: url.trim(),
      extractedText: "",
      isProcessing: false,
      name: "Image from URL",
    };
    setImages(prev => [...prev, newImage]);
    trackOCREvent.imageUploaded(1, 'url');
    toast.success("Added image from URL");
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const fileToDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const extractTextFromImage = async (imageData: ImageData): Promise<string> => {
    if (!puterLoaded || !window.puter || !window.puter.ai) {
      throw new Error("OCR service not ready");
    }

    let text = "";
    if (imageData.file) {
      try {
        console.log("Attempting OCR with File object:", imageData.name);
        text = await window.puter.ai.img2txt(imageData.file);
      } catch (err1) {
        console.warn("Direct File OCR failed, retrying with Data URL...", err1);
        const dataUrl = await fileToDataURL(imageData.file);
        text = await window.puter.ai.img2txt(dataUrl);
      }
    } else if (imageData.url) {
      console.log("Attempting OCR with URL", imageData.url);
      text = await window.puter.ai.img2txt(imageData.url);
    }
    return text || "No text found in image";
  };

  const extractAllText = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    if (!puterLoaded || !window.puter || !window.puter.ai) {
      toast.error("OCR service is still loading. Please wait a moment and try again.");
      return;
    }

    const totalImages = images.length;
    let completed = 0;

    for (const image of images) {
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, isProcessing: true } : img
      ));

      try {
        const text = await extractTextFromImage(image);
        setImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, extractedText: text, isProcessing: false } : img
        ));
        completed++;
        toast.success(`Processed ${completed}/${totalImages}`);
      } catch (error) {
        console.error("OCR Error for", image.name, error);
        const errorMessage = typeof error === "string" ? error : (error instanceof Error ? error.message : "Unknown error");
        setImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, extractedText: `Error: ${errorMessage}`, isProcessing: false } : img
        ));
      }
    }

    trackOCREvent.textExtracted(images.length, true);
    toast.success("All images processed!");
  };

  const getAllExtractedText = () => {
    return images
      .filter(img => img.extractedText)
      .map(img => `=== ${img.name} ===\n\n${img.extractedText}`)
      .join("\n\n---\n\n");
  };

  const copyAllToClipboard = () => {
    const allText = getAllExtractedText();
    if (!allText) {
      toast.error("No text to copy");
      return;
    }
    navigator.clipboard.writeText(allText);
    setCopied(true);
    trackOCREvent.textCopied(allText.length);
    toast.success("All text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAllAsText = () => {
    const allText = getAllExtractedText();
    if (!allText) {
      toast.error("No text to download");
      return;
    }
    const blob = new Blob([allText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-results-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackOCREvent.textDownloaded(allText.length);
    toast.success("Downloaded successfully!");
  };

  const clearAll = () => {
    setImages([]);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>100% Free OCR</strong> - No signup required! Just upload an image and extract text instantly. 
          {!puterLoaded && " Loading OCR service..."}
        </AlertDescription>
      </Alert>
      
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
                multiple
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
                  Drop multiple images here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WEBP • Upload multiple files at once
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
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addImageFromUrl(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling?.querySelector("input") as HTMLInputElement;
                  if (input) {
                    addImageFromUrl(input.value);
                    input.value = "";
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card className="shadow-elegant border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Images ({images.length})</h3>
                <p className="text-sm text-muted-foreground">Ready to extract text</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={extractAllText}
                  disabled={!puterLoaded || images.some(img => img.isProcessing)}
                  className="gradient-primary shadow-glow"
                >
                  {images.some(img => img.isProcessing) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Extract All Text"
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="relative rounded-lg overflow-hidden bg-muted border border-border">
                    <img
                      src={image.previewUrl}
                      alt={image.name}
                      className="w-full h-48 object-cover"
                    />
                    {image.isProcessing && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 truncate">{image.name}</p>
                  {image.extractedText && !image.isProcessing && (
                    <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/20">
                      <p className="text-xs text-muted-foreground line-clamp-2">{image.extractedText}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {images.some(img => img.extractedText) && (
        <Card className="shadow-elegant border-primary/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary mb-1">✓ Text Extracted Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  {images.filter(img => img.extractedText).length} of {images.length} images processed
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2 gradient-primary shadow-glow">
                    {copied ? (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={copyAllToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAllAsText}>
                    <Download className="w-4 h-4 mr-2" />
                    Download as TXT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 min-h-[200px] max-h-[600px] overflow-y-auto shadow-inner">
              <pre className="whitespace-pre-wrap break-words font-mono text-base leading-relaxed text-foreground">
                {getAllExtractedText()}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
