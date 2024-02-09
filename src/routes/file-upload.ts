import { Router, Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        let destination = 'public';

        if (req.query.destination) {
            destination += req.query.destination;
        }

        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        cb(null, destination);
    },
    filename: (req: Request, file, cb) => {
        const ext = file.originalname.split('.').pop()
        cb(null, Date.now() + '.' + ext);
    },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: File upload operations
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags:
 *       - File Upload
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: file
 *         in: formData
 *         required: true
 *         type: file
 *         description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         schema:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: URL of the uploaded file
 */
router.post('/', upload.single('file'), (req: Request, res: Response) => {
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file?.path}`

    res.status(200).send({ url: fileUrl });
});

export default router;
