// import axios from 'axios';
// import * as fs from 'fs';

// // Function to download and save avatar
// async function downloadAvatar(username: string, filePath: string): Promise<void> {
//     try {
//         let apiUrl = 'https://ui-avatars.com/api/'
//         apiUrl += `?name=${encodeURIComponent(username)}&size=200&color=fff&rounded=true`
//         const randomBackgroundColor = generateRandomColor();
//         apiUrl += `&background=${encodeURIComponent(randomBackgroundColor)}`;
//         const response = await axios.get(apiUrl, { responseType: 'stream' });

//         // Using a promise to wait for the stream to finish writing to the file
//         await new Promise((resolve, reject) => {
//             const fileStream = fs.createWriteStream(filePath);
//             response.data.pipe(fileStream);
//             fileStream.on('finish', resolve);
//             fileStream.on('error', reject);
//         });

//         console.log(`Avatar saved to ${filePath}`);
//     } catch (error) {
//         console.error('Error downloading avatar:', error.message);
//     }
// }

// function generateRandomColor(): string {
//     const random = Math.floor(Math.random() * 16777215).toString(16);
//     return '#' + '0'.repeat(6 - random.length) + random;
//   }

// // Example usage
// const username = 'John Doe';
// const filePath = 'avatar.png';

// downloadAvatar(username, filePath);