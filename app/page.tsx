"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type File = {
  name: string;
  size: number;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  const handleFileChange = (e: any) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);

    // Preview the images if they are image files
    const previewsArray: any = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles[i] && selectedFiles[i].type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previewsArray.push(reader.result as string);
          if (previewsArray.length === selectedFiles.length) {
            setPreviews(previewsArray);
          }
        };
        reader.readAsDataURL(selectedFiles[i]);
      }
    }
  };

  const uploadFiles = async () => {
    var formdata = new FormData();
    formdata.append("name", name);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formdata.append("files", files[i]);
      }
    }

    var requestOptions = { method: "POST", body: formdata };

    try {
      const response = await fetch(`${baseUrl}/upImage`, requestOptions);
      const result = await response.json();
      if (result.status === "success") {
        setUploadedFiles([...uploadedFiles, ...result.files]);
      }
      console.log(result);
    } catch (error) {
      console.error("Error uploading files:", error);
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
      <h1 className="text-2xl font-bold mb-4">Upload Your Files</h1>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={handleNameChange}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 text-black"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="files"
          className="block text-sm font-medium text-gray-700"
        >
          Upload Files
        </label>
        <input
          type="file"
          id="files"
          name="files"
          multiple
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
      </div>
      <button
        onClick={uploadFiles}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Submit
      </button>

      <br />
      <Link
        href="/name-images"
        className=" inline-flex mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Check db
      </Link>

      {previews.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Image Previews</h2>
          <div className="grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="border p-4 rounded">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6">Uploaded Files</h2>
      <ul className="list-disc list-inside">
        {uploadedFiles.map((file, index) => (
          <li key={index}>
            <Link
              href={`/uploads/${file.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {file.name}
            </Link>{" "}
            ({(file.size / 1024).toFixed(2)} KB)
          </li>
        ))}
      </ul>
    </div>
  );
}
