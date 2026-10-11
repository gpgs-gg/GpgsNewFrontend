import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

let ffmpegLoaded = false;
let ffmpegLoadingPromise = null;

const loadFFmpeg = async () => {
  if (ffmpegLoaded) {
    return;
  }

  if (ffmpegLoadingPromise) {
    return ffmpegLoadingPromise;
  }

  ffmpegLoadingPromise = (async () => {
    try {
      console.log("Loading FFmpeg...");

      const baseURL =
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

      const coreURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        "text/javascript",
      );

      const wasmURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      );

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      ffmpegLoaded = true;

      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("FFmpeg load error:", error);

      ffmpegLoadingPromise = null;
      ffmpegLoaded = false;

      throw new Error(
        "Unable to load video compressor. Please check your internet connection.",
      );
    }
  })();

  return ffmpegLoadingPromise;
};

export const compressImage = async (file, onProgress) => {
  const options = {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    initialQuality: 0.2,
    fileType: "image/jpeg",
    onProgress: (progress) => {
      onProgress?.(progress);
    },
  };

  return await imageCompression(file, options);
};

export const compressVideo = async (file, onProgress) => {
  await loadFFmpeg();

  const timestamp = Date.now();

  const inputExtension = file.name.split(".").pop()?.toLowerCase() || "mp4";

  const inputName = `input-${timestamp}.${inputExtension}`;
  const outputName = `output-${timestamp}.mp4`;

  // FFmpeg progress listener
  const progressHandler = ({ progress }) => {
    const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));

    onProgress?.(percent);
  };

  ffmpeg.on("progress", progressHandler);

  try {
    console.log("1. Writing video to FFmpeg:", file.name);

    const inputData = await fetchFile(file);

    await ffmpeg.writeFile(inputName, inputData);

    console.log("2. Video written to FFmpeg");
    console.log("3. Starting compression...");

    onProgress?.(0);

    await ffmpeg.exec([
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "28",
      "-vf",
      "scale=min(1280\\,iw):-2",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      "-movflags",
      "+faststart",
      outputName,
    ]);

    onProgress?.(100);

    console.log("4. FFmpeg compression completed");

    const data = await ffmpeg.readFile(outputName);

    console.log("5. Output read from FFmpeg");

    const compressedBlob = new Blob([data], {
      type: "video/mp4",
    });

    const compressedFile = new File(
      [compressedBlob],
      `${file.name.replace(/\.[^/.]+$/, "")}.mp4`,
      {
        type: "video/mp4",
        lastModified: Date.now(),
      },
    );

    console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    console.log(
      `Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
    );

    const reducedBy =
      file.size > 0 ? ((file.size - compressedFile.size) / file.size) * 100 : 0;

    console.log(`Reduced By: ${reducedBy.toFixed(2)}%`);

    return compressedFile;
  } catch (error) {
    console.error("FFmpeg compression error:", error);
    throw error;
  } finally {
    // Remove FFmpeg progress listener
    ffmpeg.off("progress", progressHandler);

    try {
      await ffmpeg.deleteFile(inputName);
    } catch (error) {
      console.warn("Could not delete input file", error);
    }

    try {
      await ffmpeg.deleteFile(outputName);
    } catch (error) {
      console.warn("Could not delete output file", error);
    }
  }
};

export const compressAttachment = async (file, onProgress) => {
  if (file.type.startsWith("image/")) {
    return await compressImage(file, onProgress);
  }

  if (file.type.startsWith("video/")) {
    // Don't compress videos <= 10 MB
    if (file.size <= 1 * 1024 * 1024) {
      console.log("Video is smaller than 1 MB. Skipping compression.");
      onProgress?.(100);
      return file;
    }

    return await compressVideo(file, onProgress);
  }
  onProgress?.(100);
  return file;
};
// import imageCompression from "browser-image-compression";

// export const compressImage = async (file) => {
//   const options = {
//     maxSizeMB: 0.05,
//     maxWidthOrHeight: 800,
//     useWebWorker: true,
//     initialQuality: 0.2,
//     fileType: "image/jpeg",
//   };

//   return await imageCompression(file, options);
// };

// export const compressAttachment = async (file) => {
//   if (file.type.startsWith("image/")) {
//     return await compressImage(file);
//   }

//   return file;
// };