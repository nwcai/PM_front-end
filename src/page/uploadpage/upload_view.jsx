import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  LinearProgress,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Sidebar from "../../component/sidebar";
import { uploadFile } from "../../service/uploadpage_service";

const FileUploadForm = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon />;
    if (type.includes("pdf") || type.includes("doc") || type.includes("txt")) {
      return <DocumentIcon />;
    }
    return <FileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...newFiles]);
  };

  const handleFileInput = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    if (uploading) return;
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setUploadProgress((prevProgress) => {
      const newProgress = { ...prevProgress };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadFile(files[i], i);
        results.push(result);
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      alert(
        `อัพโหลดสำเร็จ: ${successCount} ไฟล์\nไม่สำเร็จ: ${failCount} ไฟล์`
      );

      if (failCount === 0) {
        setFiles([]);
        setUploadProgress({});
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar title={"Upload Page"} />
      <Card sx={{ width: "100%", m: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <div className="mb-6">
              <Typography variant="h4" className="font-bold text-gray-900">
                Upload File CSV
              </Typography>
            </div>
            <Button
              variant="contained"
              href="https://docs.google.com/spreadsheets/d/1qD0rCwZ1yccYi7ARA86zRoL8zSTkhHybHWqcOMhH3ko/export?format=csv"
              target="_blank"
              rel="noopener noreferrer"
            >
              ดาวน์โหลดไฟล์ CSV
            </Button>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 3,
              textAlign: "center",
              bgcolor: isDragging ? "action.hover" : "background.paper",
              border: "2px dashed",
              borderColor: isDragging ? "primary.main" : "divider",
              cursor: "pointer",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              style={{ display: "none" }}
              id="file-input"
              disabled={uploading}
            />
            <label htmlFor="file-input">
              <UploadIcon
                sx={{ fontSize: 40, color: "action.active", mb: 1 }}
              />
              <Typography variant="h6" gutterBottom>
                ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์
              </Typography>
              <Typography variant="body2" color="text.secondary">
                รองรับไฟล์ทุกประเภท
              </Typography>
            </label>
          </Paper>

          {files.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                ไฟล์ที่เลือก ({files.length})
              </Typography>
              <Stack spacing={1}>
                {files.map((file, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ mr: 1.5 }}>{getFileIcon(file.type)}</Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(file.size)} •{" "}
                          {file.type || "ไม่ระบุประเภท"}
                        </Typography>
                        {uploadProgress[index] > 0 && (
                          <LinearProgress
                            variant="determinate"
                            value={uploadProgress[index]}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      {!uploading && (
                        <IconButton
                          size="small"
                          onClick={() => removeFile(index)}
                          sx={{ ml: 1 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            startIcon={
              uploading ? <CircularProgress size={20} /> : <UploadIcon />
            }
            sx={{ mt: 3 }}
          >
            {uploading
              ? `กำลังอัพโหลด... (${
                  Object.values(uploadProgress).filter((p) => p === 100).length
                }/${files.length})`
              : `อัพโหลดไฟล์ (${files.length})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadForm;
