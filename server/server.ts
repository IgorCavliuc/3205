import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 5000;

app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

let currentRequest: NodeJS.Timeout | null = null;
interface Entry {
    email: string;
    number: string;
    // Add more properties if needed
}

app.post('/search', (req: Request, res: Response) => {
    if (currentRequest) {
        clearTimeout(currentRequest);
    }

    currentRequest = setTimeout(() => {
        const data: Entry[] = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

        const { email, number } = req.body;

        const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const numberPattern = /^\d{6}$/;

        if (email && !emailPattern.test(email)) {
            res.status(400).json({ email: 'Invalid email format' });
            return;
        }

        if (number && !numberPattern.test(number)) {
            res.status(400).json({ number: 'Invalid number format' });
            return;
        }

        const results = data.filter(
            (entry) =>
                (!email || entry.email === email) &&
                (!number || entry.number === number.replace(/-/g, ''))
        );

        if (results.length > 0) {
            res.json(results);
        } else {
            res.json([{ email: "not found", number: "not found" }]);
        }
    }, 5000);
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
