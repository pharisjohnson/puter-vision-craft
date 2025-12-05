import { ArrowLeft, Code, Copy, Check, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Docs = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const iframeCode = `<iframe
  src="${window.location.origin}"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-write"
></iframe>`;

  const puterJsCode = `<!-- Include Puter.js -->
<script src="https://js.puter.com/v2/"></script>

<script>
// Extract text from an image
async function extractText(imageFile) {
  try {
    const text = await puter.ai.img2txt(imageFile);
    console.log('Extracted text:', text);
    return text;
  } catch (error) {
    console.error('OCR failed:', error);
  }
}

// Usage with file input
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const extractedText = await extractText(file);
    document.getElementById('result').textContent = extractedText;
  }
});
</script>`;

  const reactCode = `import { useEffect, useState } from 'react';

// Declare puter types
declare global {
  interface Window {
    puter: {
      ai: {
        img2txt: (file: File | Blob) => Promise<string>;
      };
    };
  }
}

export function useOCR() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const extractText = async (file: File): Promise<string> => {
    if (!isLoaded) throw new Error('Puter.js not loaded');
    return await window.puter.ai.img2txt(file);
  };

  return { extractText, isLoaded };
}

// Usage in component
function MyComponent() {
  const { extractText, isLoaded } = useOCR();
  const [text, setText] = useState('');

  const handleFile = async (file: File) => {
    const result = await extractText(file);
    setText(result);
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={!isLoaded}
      />
      <pre>{text}</pre>
    </div>
  );
}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Scanner
        </Link>

        <h1 className="text-4xl font-bold mb-4 text-[#131A39]">Developer Documentation</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Integrate OCR capabilities into your website or application using one of the methods below.
        </p>

        {/* Method 1: Embed */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold">Method 1: Embed via iFrame</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            The simplest way to add OCR to your website. Just copy and paste the iframe code.
          </p>
          <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
              <span className="text-sm font-medium">HTML</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(iframeCode, 'iframe')}
              >
                {copiedSection === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code>{iframeCode}</code>
            </pre>
          </div>
        </section>

        {/* Method 2: Puter.js Direct */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold">Method 2: Use Puter.js Directly</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            For more control, use the Puter.js library directly. This is what powers our OCR scanner.
          </p>
          <div className="relative bg-card border border-border rounded-lg overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
              <span className="text-sm font-medium">JavaScript</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(puterJsCode, 'puterjs')}
              >
                {copiedSection === 'puterjs' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code>{puterJsCode}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold mb-3">React / TypeScript Example</h3>
          <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
              <span className="text-sm font-medium">TypeScript (React)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(reactCode, 'react')}
              >
                {copiedSection === 'react' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code>{reactCode}</code>
            </pre>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold">Supported Formats</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Input Formats</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• JPEG / JPG</li>
                <li>• PNG</li>
                <li>• GIF</li>
                <li>• BMP</li>
                <li>• WEBP</li>
                <li>• TIFF / TIF</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Output</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Plain text (string)</li>
                <li>• Copy to clipboard</li>
                <li>• Download as TXT</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Important Notes</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• OCR processing happens client-side using Puter.js AI services</li>
            <li>• No API keys required for basic usage</li>
            <li>• Supports 46+ languages automatically</li>
            <li>• For high-volume usage, consider Puter.js rate limits</li>
            <li>• Images are processed in the browser and not stored on any server</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Docs;
