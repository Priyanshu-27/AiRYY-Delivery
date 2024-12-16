import RNFS from 'react-native-fs';
const Delete_Images = async (file) => {
  try {
  
    const pattern = /\/([\w-]+)\.jpg$/;

    const newUrl = file.replace(pattern, '');
    console.log("CAlled",newUrl);
    RNFS.readdir(newUrl)
      .then(files => {
        // Filter files with .jpg extension
        const jpgFiles = files.filter(file => file.endsWith('.jpg'));

        // Delete each .jpg file
        jpgFiles.forEach(file => {
          const filePath = `${newUrl}/${file}`;

          // Delete the file
          RNFS.unlink(filePath)
            .then(() => {
              console.log(`File ${file} deleted successfully`);
            })
            .catch(error => {
              console.log(`Error deleting file ${file}:`, error);
            });
        });

        if (jpgFiles.length === 0) {
          console.log('No .jpg files found to delete');
          Alert.alert(`Error`, `Try Capture the Image`);
        }
      })
      .catch(error => {
        console.log('Error reading directory:', error);
      });
  } catch (error) {
    console.log('Error Deleting Images', error);
    return null; // Return null or handle the error accordingly
  }
};

export default Delete_Images;
