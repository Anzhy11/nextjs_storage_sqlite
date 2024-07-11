"use client";

import { useEffect, useState } from "react";

type ImageData = {
  id: number; // Include the ID here
  name: string;
  images: string[];
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DisplayNamesAndImages() {
  const [data, setData] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/namesImg`);
        const result: ImageData[] = await response.json();
        console.log(result);

        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteName = async (id: number) => {
    try {
      const response = await fetch(`${baseUrl}/deleteName`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(data.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting name:", error);
    }
  };

  const deleteImage = async (formId: number, imageName: string) => {
    try {
      const response = await fetch(`${baseUrl}/deleteImage`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, imageName }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(
          data.map((item) => {
            if (item.id === formId) {
              return {
                ...item,
                images: item.images.filter((img) => img !== imageName),
              };
            }
            return item;
          })
        );
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Names and Associated Images</h1>
      {data.map((item, index) => (
        <div key={item.id} className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <button
              onClick={() => deleteName(item.id)}
              className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
            >
              Delete Name
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {item.images.length > 0 ? (
              item.images.map((image, idx) => (
                <div key={idx} className="border p-2 rounded relative">
                  <img
                    src={`/uploads/${image}`}
                    alt={`Image ${idx}`}
                    className="max-w-full h-auto"
                  />
                  <button
                    onClick={() => deleteImage(item.id, image)}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No images available</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
