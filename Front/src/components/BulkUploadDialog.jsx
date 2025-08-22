// BulkUploadDialog.jsx
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
import { Upload } from "lucide-react";

export default function BulkUploadDialog() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = () => {
    console.log("Uploading files:", files);
    // Add your backend upload logic here
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 rounded-lg">
          <Upload className="w-4 h-4" />
          <span>Bulk Upload</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl shadow-xl border border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-700 text-xl font-semibold">
            Bulk Upload Submissions
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Upload multiple student submissions at once. Supported formats: PDF, DOCX, ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-400 rounded-xl cursor-pointer hover:bg-green-50 transition"
          >
            <Upload className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-sm text-green-600">
              Click to select or drag & drop files
            </span>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {files.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
              {files.map((file, idx) => (
                <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span>{file.name}</span>
                  <span className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
          >
            Upload Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
