import { useState, useEffect } from "react";
import { X, Image, Cloud, Loader, ShieldAlert, ArrowRight, Eye } from "lucide-react";
import { listDriveImages, downloadDriveImageBase64, DriveFile } from "../lib/googleDrive";

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSelectImage: (base64Data: string) => void;
  onLogin: () => void;
}

export default function DrivePickerModal({
  isOpen,
  onClose,
  accessToken,
  onSelectImage,
  onLogin,
}: DrivePickerModalProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchDriveFiles();
    }
  }, [isOpen, accessToken]);

  const fetchDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const driveImages = await listDriveImages(accessToken);
      setFiles(driveImages);
    } catch (error: any) {
      console.error("Failed to fetch Google Drive files:", error);
      setErrorMsg("Failed to read image list from Google Drive. Please confirm permission scopes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = async (file: DriveFile) => {
    if (!accessToken) return;
    setIsDownloadingId(file.id);
    setErrorMsg("");
    try {
      const base64 = await downloadDriveImageBase64(accessToken, file.id);
      onSelectImage(base64);
      onClose();
    } catch (error: any) {
      console.error("Failed to download image content:", error);
      setErrorMsg("Failed to stream image binary content from Google Drive.");
    } finally {
      setIsDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-[32px] bg-cream border border-sand p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sand mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-700">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-forest font-black text-lg tracking-tight">Google Drive Photo Vault</h3>
              <p className="text-[10px] text-olive font-mono uppercase tracking-wider font-bold">Select high-res files from Google Cloud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-sand/30 rounded-full transition text-olive cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-terracotta/10 border border-terracotta/30 p-3 flex items-start space-x-2 text-terracotta text-xs font-bold">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {!accessToken ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-4">
              <div className="h-14 w-14 rounded-full bg-forest/5 border border-forest/15 flex items-center justify-center text-forest animate-pulse">
                <Cloud className="h-7 w-7 text-forest" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-forest text-sm">Google Account Connection Required</h4>
                <p className="text-xs text-[#706450] leading-relaxed">
                  Authenticate your Google account to authorize reading photographs directly from your cloud storage vaults.
                </p>
              </div>
              <button
                onClick={onLogin}
                className="w-full font-bold text-cream bg-forest hover:bg-forest/90 rounded-full px-6 py-2.5 flex items-center justify-center space-x-2 transition cursor-pointer text-xs"
              >
                <span>Authorize Google Drive</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader className="h-8 w-8 text-forest animate-spin" />
              <p className="font-mono text-[10px] text-olive font-extrabold tracking-wider uppercase">Polling Google drive objects...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-3 bg-sand/30 rounded-full text-olive/50">
                <Image className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-bold text-forest text-xs">No Cloud Images Detected</h4>
                <p className="text-[11px] text-olive/70 mt-1 max-w-xs mx-auto leading-normal">
                  We found no compatible JPEG/PNG files in the root levels of your Drive. Try backing up some photos to Drive first!
                </p>
              </div>
              <button
                onClick={fetchDriveFiles}
                className="font-mono text-[9px] font-bold uppercase tracking-wider text-terracotta border border-terracotta/20 hover:bg-terracotta/5 rounded px-3 py-1 transition cursor-pointer"
              >
                Refresh Cloud Storage
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
              {files.map((file) => {
                const isDownloading = isDownloadingId === file.id;
                return (
                  <button
                    key={file.id}
                    disabled={isDownloadingId !== null}
                    onClick={() => handleSelectFile(file)}
                    className="group relative flex flex-col rounded-2xl border border-sand bg-warm-beige/10 hover:border-forest/50 hover:bg-cream text-left transition overflow-hidden p-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {/* Thumbnail representation */}
                    <div className="relative h-28 w-full bg-sand/30 rounded-xl overflow-hidden mb-2 border border-sand/40">
                      {file.thumbnailLink ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-olive/40 bg-sand/10">
                          <Image className="h-6 w-6" />
                        </div>
                      )}

                      {/* Download spinner overlay */}
                      {isDownloading && (
                        <div className="absolute inset-0 bg-forest/80 backdrop-blur-xs flex flex-col items-center justify-center text-cream space-y-1.5 p-2">
                          <Loader className="h-5 w-5 text-cream animate-spin" />
                          <span className="text-[8px] font-mono tracking-wider text-center">Fetching base64...</span>
                        </div>
                      )}
                      
                      {!isDownloading && (
                        <div className="absolute inset-0 bg-forest/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-cream transition duration-200">
                          <Eye className="h-5 w-5 text-terracotta" />
                        </div>
                      )}
                    </div>

                    <div className="px-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-forest truncate leading-tight group-hover:text-terracotta transition">
                        {file.name}
                      </p>
                      {file.createdTime && (
                        <span className="text-[8px] font-mono font-bold text-olive/60 uppercase block mt-0.5">
                          {new Date(file.createdTime).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-sand flex items-center justify-between text-olive/60 font-mono text-[9px] font-bold uppercase tracking-wider">
          <span>Target project: sunny-analyst-cnmq3</span>
          {accessToken && (
            <button
              onClick={fetchDriveFiles}
              className="text-forest hover:text-terracotta transition cursor-pointer flex items-center space-x-1"
            >
              <Loader className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>Force Sync</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
