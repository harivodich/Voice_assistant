import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export const convertWebmToWav = (input, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("wav")
      .on("end", resolve)
      .on("error", reject)
      .save(output);
  });
};
