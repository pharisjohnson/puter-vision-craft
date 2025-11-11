import { OCRScanner } from "@/components/OCRScanner";
import { ScanText } from "lucide-react";
import heroImage from "@/assets/ocr-hero-phone.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary shadow-glow">
              <ScanText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Free OCR Scanner</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-12 text-center space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-elegant mb-6">
            <img
              src={heroImage}
              alt="OCR Scanner - Extract text from images"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60 flex items-end justify-center pb-6">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">Extract Text from Images</h2>
                <p className="text-lg opacity-90">Free, unlimited OCR powered by AI</p>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload images or paste URLs to instantly extract text using advanced optical character recognition.
            Perfect for digitizing documents, receipts, business cards, and handwritten notes.
          </p>
        </div>

        <OCRScanner />

        <footer className="mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <a
              href="https://noonstudio.africa/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Noon Studio Africa
            </a>
            {" "}• Free & Unlimited
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
