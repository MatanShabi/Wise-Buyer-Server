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

router.post('/', upload.single('file'), (req: Request, res: Response) => {
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file?.path}`

    res.status(200).send({ url: fileUrl });
});

export default router;
