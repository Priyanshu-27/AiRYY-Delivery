import ImageCropPicker from 'react-native-image-crop-picker';

const opencamera = async (phoneNumber, type) => {
  try {
    const image = await ImageCropPicker.openCamera({
      mediaType: 'photo',
      compressImageQuality: 0.4,
    });
    
    const path = image.path;
    const name = `${phoneNumber}${type}`;

    return { path, name };
  } catch (error) {
    console.log('Error opening camera:', error);
    return null; // Return null or handle the error accordingly
  }
};

export default opencamera;
