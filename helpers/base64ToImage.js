import fs from 'fs';

class Base64ToImage {
  constructor() {}

  convert(base64String, outputPath) {
    try {
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

      const buffer = Buffer.from(base64Data, 'base64');

      fs.writeFileSync(outputPath, buffer);

      console.log('File created successfully:', outputPath);
    } catch (error) {
      console.error('Error writing file:', error);
    }
  }
}

export default Base64ToImage;
