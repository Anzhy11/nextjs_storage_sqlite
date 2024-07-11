"use client";

import { useState, useEffect } from "react";

type File = {
  name: string;
  size: number;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function UploadPage() {
  const [file, setFile] = useState<any>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Preview the image if it's an image file
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const uploadFile = async () => {
    var formdata = new FormData();
    formdata.append("files", file);

    var requestOptions = { method: "POST", body: formdata };

    try {
      const response = await fetch(`${baseUrl}/upImage`, requestOptions);
      const result = await response.json();
      if (result.status === "success") {
        setUploadedFiles([
          ...uploadedFiles,
          { name: result.name, size: result.data },
        ]);
      }
      console.log(result);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  useEffect(() => {
    // Fetch previously uploaded files when the component mounts
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch(`${baseUrl}/profile/uploaded-files`);
        const files = await response.json();
        setUploadedFiles(files);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };
    fetchUploadedFiles();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Your CV</h1>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100"
      />
      <button
        onClick={uploadFile}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Upload
      </button>

      {preview && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Image Preview</h2>
          <div className="border p-4 rounded">
            <img src={preview} alt="Preview" className="max-w-full h-auto" />
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6">Uploaded Files</h2>
      <ul className="list-disc list-inside">
        {uploadedFiles.map((file, index) => (
          <li key={index}>
            <a
              href={`/uploads/${file.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {file.name}
            </a>{" "}
            ({(file.size / 1024).toFixed(2)} KB)
          </li>
        ))}
      </ul>
    </div>
  );
}
