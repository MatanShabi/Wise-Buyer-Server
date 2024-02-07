import axios from 'axios';
import fs from 'fs';

// Function to create a directory
export function createDirectory(directoryName: string) {
    fs.mkdirSync(directoryName, { recursive: true });
}

export async function handleUserProfileImg(userId: string, firstName: string, lastName: string, profileImgPath:string){
    profileImgPath += '/profile.png';
    return generateProfilePicture(`${firstName} ${lastName}`, profileImgPath);
}

async function generateProfilePicture(fullname: string, filePath: string): Promise<void> {
    let apiUrl = 'https://ui-avatars.com/api/'
    apiUrl += `?name=${encodeURIComponent(fullname)}&size=200&color=fff&rounded=true`
    const randomBackgroundColor = generateRandomColor();
    apiUrl += `&background=${encodeURIComponent(randomBackgroundColor)}`;
    const response = await axios.get(apiUrl, { responseType: 'stream' });

    await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);
        response.data.pipe(fileStream);
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });
}

function generateRandomColor(): string {
    const random = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + '0'.repeat(6 - random.length) + random;
}