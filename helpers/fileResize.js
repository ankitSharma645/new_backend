import sharp from "sharp";

export class ImageResizer {
    async resizeImage(imagePath, outputPath, width, height) {
        try {
            await sharp(imagePath)
                .resize(width, height)
                .toFile(outputPath);
            return outputPath;
        } catch (error) {
            console.error('Error resizing image:', error);
            throw error;
        }
    }
}

