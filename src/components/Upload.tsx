import { useState, type DragEvent } from "react";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ["text/csv", "application/json", "text/plain", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

export default function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(csv|json|txt|xlsx)$/i)) {
      return `Unsupported file type: ${file.type || "unknown"}. Please use CSV, JSON, TXT, or XLSX.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.`;
    }
    return null;
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const newUploads: UploadFile[] = Array.from(newFiles)
      .filter((f) => {
        const error = validateFile(f);
        if (error) {
          setFiles((prev) => [...prev, { id: Date.now().toString() + Math.random(), name: f.name, size: f.size, status: "error", progress: 0, error }]);
          return false;
        }
        return true;
      })
      .map((f) => ({
        id: Date.now().toString() + Math.random(),
        name: f.name,
        size: f.size,
        status: "pending" as const,
        progress: 0,
      }));

    setFiles((prev) => [...prev, ...newUploads]);

    newUploads.forEach((uf) => {
      simulateUpload(uf.id);
    });
  };

  const simulateUpload = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 0 } : f)));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "success", progress: 100 } : f))
        );
      } else {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: Math.round(progress) } : f)));
      }
    }, 200);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
  };

  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "uploading").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-zone-icon">
          <UploadCloud size={28} />
        </div>
        <div className="upload-zone-text">Drag and drop files here, or click to browse</div>
        <div className="upload-zone-hint">Supports CSV, JSON, TXT, and XLSX up to 50MB</div>
        <input
          type="file"
          multiple
          accept=".csv,.json,.txt,.xlsx"
          onChange={handleInput}
          style={{ display: "none" }}
          id="file-input"
        />
        <label htmlFor="file-input" style={{ marginTop: 16, cursor: "pointer" }}>
          <span className="btn btn-lg" style={{ display: "inline-flex", cursor: "pointer" }}>
            Choose Files
          </span>
        </label>
      </div>

      {(pendingCount > 0 || successCount > 0 || errorCount > 0) && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Uploads</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {successCount} done {pendingCount > 0 && `· ${pendingCount} in progress`} {errorCount > 0 && `· ${errorCount} failed`}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {files.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <File size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                    {formatSize(f.size)}
                  </div>
                  {f.status === "uploading" && (
                    <div className="upload-progress" style={{ marginTop: 6 }}>
                      <div className="upload-progress-bar">
                        <div className="upload-progress-fill" style={{ width: `${f.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {f.status === "error" && f.error && (
                    <div style={{ fontSize: 11.5, color: "var(--accent-red)", marginTop: 4 }}>{f.error}</div>
                  )}
                </div>
                <div style={{ flexShrink: 0 }}>
                  {f.status === "success" && <CheckCircle2 size={18} color="var(--accent-mint)" />}
                  {f.status === "error" && <AlertCircle size={18} color="var(--accent-red)" />}
                  {f.status === "uploading" && <Loader2 size={18} className="spin" color="var(--accent)" />}
                  {f.status === "pending" && <Loader2 size={18} className="spin" color="var(--text-dim)" />}
                </div>
                {f.status !== "uploading" && (
                  <button className="icon-btn" onClick={() => removeFile(f.id)} aria-label="Remove file" style={{ width: 28, height: 28 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}