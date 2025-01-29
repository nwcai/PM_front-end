import axios from 'axios';

export const uploadFile = async (file, index, setUploadProgress) => {
  if (!file) {
    console.error('No file provided for upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({
            ...prev,
            [index]: progress,
          }));
        }
      },
    });

    console.log('Upload successful:', response.data);
    return response.data;  // Optional: Return the response data if needed
  } catch (error) {
    console.error('Upload failed:', error);
    // Optionally, handle the error state (e.g., show an alert or update UI)
  }
};
