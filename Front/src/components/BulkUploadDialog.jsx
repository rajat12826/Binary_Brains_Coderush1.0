import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

export default function UploadDialog() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleUpload = () => {
    if (!file) return;
    console.log("Uploading file:", file);
    // Add your backend upload logic here
    setFile(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 rounded-lg">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-white rounded-2xl shadow-xl border border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-700 text-xl font-semibold">
            Upload Submission
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Upload a single student submission. Supported formats: PDF, DOCX, ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-400 rounded-xl cursor-pointer hover:bg-green-50 transition"
          >
            <Upload className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-sm text-green-600">
              Click to select or drag & drop file
            </span>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 text-sm font-medium">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={!file}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
          >
            Upload File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
