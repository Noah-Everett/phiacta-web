import {
  Folder, File, FileText, FileCode, FileJson,
  FileSpreadsheet, FileImage, FileArchive, FileType,
} from "lucide-react";

export default function FileIcon({ name, type }: { name: string; type: string }) {
  if (type === "dir") return <Folder className="h-4 w-4 shrink-0 text-blue-500" />;
  const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
  switch (ext) {
    case ".md": case ".tex": case ".txt":
      return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case ".py": case ".js": case ".ts": case ".tsx": case ".jsx":
    case ".rs": case ".go": case ".java": case ".c": case ".cpp": case ".h":
    case ".sh": case ".css": case ".html": case ".lean":
      return <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case ".json":
      return <FileJson className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case ".csv": case ".tsv":
      return <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case ".png": case ".jpg": case ".jpeg": case ".gif": case ".svg": case ".webp":
      return <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case ".zip": case ".tar": case ".gz": case ".bz2":
      return <FileArchive className="h-4 w-4 shrink-0 text-muted-foreground" />;
    case ".yaml": case ".yml": case ".toml": case ".ini": case ".cfg":
      return <FileType className="h-4 w-4 shrink-0 text-muted-foreground" />;
    default:
      return <File className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
}
