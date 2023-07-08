import express from "express";
import ptp from "pdf-to-printer";
import fs from "fs";
import path, { dirname } from "path";
import needle from "needle";
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from "url";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4500;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.get('/test-print', async (req, res) => {
    try {
        ptp.print("assets/sample.pdf")
            .then((resolved) => {
                res.json({
                    success: true,
                    data: resolved
                });
            })
            .catch((rejected) => {
                res.json({
                    success: false,
                    data: rejected
                });
            });
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get('/test-print-env', async (req, res) => {
    try {
        let options = null;

        if (req.body.options) {
            options = req.body.options;
        }

        if (process.env.PREFERRED_PRINTER) {
            if (options) {
                if (!options.printer) {
                    options.printer = process.env.PREFERRED_PRINTER;
                }
            } else {
                options = {
                    printer: process.env.PREFERRED_PRINTER
                }
            }
        }

        ptp.print("assets/sample.pdf", options)
            .then((resolved) => {
                res.json({
                    success: true,
                    data: resolved
                });
            })
            .catch((rejected) => {
                res.json({
                    success: false,
                    data: rejected
                });
            });
    } catch (error) {
        res.status(500).json({ error });
    }
});



app.get('/printer-list', (req, res) => {
    ptp.getPrinters()
        .then((resolved) => {
            res.json({
                success: true,
                data: resolved
            });
        })
        .catch((rejected) => {
            console.log('reject');
            console.log(rejected);
        });
});

app.get('/printer-default', (req, res) => {
    ptp.getDefaultPrinter()
        .then((resolved) => {
            res.json({
                success: true,
                data: resolved
            });
        })
        .catch((rejected) => {
            console.log('reject');
            console.log(rejected);
        });
});

app.post('/print-url', async (req, res) => {
    try {
        let options = null;

        if (req.body.options) {
            options = req.body.options;
        }

        if (!req.body.url) {
            res.status(500).json({
                success: false,
                message: 'URL not specified.'
            });
            return;
        }

        const apiRes = await needle('get', req.body.url);

        const bodyBuffer = apiRes.body;

        const uint = new Uint8Array(bodyBuffer);
        let bodyBytes = [];
        uint.forEach(byte => {
            bodyBytes.push(byte.toString(16));
        });
        const bodyHex = bodyBytes.join('').toUpperCase();

        if (bodyHex.startsWith('255044462D')) {
            const tmpFilePath = path.join(`tmp/${Math.random().toString(36).substring(7)}.pdf`);

            fs.writeFileSync(tmpFilePath, apiRes.body, 'binary');
            
            if (options) {
                await ptp.print(tmpFilePath, options)
                    .then((resolved) => {
                        res.json({
                            success: true,
                            data: resolved
                        });
                    })
                    .catch((rejected) => {
                        res.json({
                            success: false,
                            data: rejected
                        });
                    });
                } else {
                    await ptp.print(tmpFilePath)
                        .then((resolved) => {
                            res.json({
                                success: true,
                                data: resolved
                            });
                        })
                        .catch((rejected) => {
                            res.json({
                                success: false,
                                data: rejected
                            });
                        });
                }

            fs.unlinkSync(tmpFilePath);
            
        } else {
            throw {
                message: 'invalid file.',
            };
        }
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.post('/print-antrean', async (req, res) => {
    try {
        const options = {
            // printer: "HP Laser MFP 131 133 135-138 [DESKTOP-6AO0OMC](Mobility)",
            printer: "BP-LITE 80L",
            scale: "fit",
        };

        const apiRes = await needle('get', `http://192.168.101.8/api-simrs/public/Farmasi/Farmasi/CetakAntreanFarmasiMiniBySerialantre/${req.body.serialantre}`);

        const bodyBuffer = apiRes.body;

        const uint = new Uint8Array(bodyBuffer);
        let bodyBytes = [];
        uint.forEach(byte => {
            bodyBytes.push(byte.toString(16));
        });
        const bodyHex = bodyBytes.join('').toUpperCase();

        if (bodyHex.startsWith('255044462D')) {
            const tmpFilePath = path.join(`tmp/${Math.random().toString(36).substring(7)}.pdf`);

            fs.writeFileSync(tmpFilePath, apiRes.body, 'binary');
            
            await ptp.print(tmpFilePath, options)
                .then((resolved) => {
                    res.json({
                        success: true,
                        data: resolved
                    });
                })
                .catch((rejected) => {
                    res.json({
                        success: false,
                        data: rejected
                    });
                });

            fs.unlinkSync(tmpFilePath);
            
        } else {
            throw {
                message: 'invalid file.',
            };
        }
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get('/env', (req, res) => {
   console.log(process.env);
   res.json({ message: 'OK.', PREFERRED_PRINTER: process.env.PREFERRED_PRINTER });
});

app.post('/print-url-env', async (req, res) => {
    try {
        let options = null;

        if (req.body.options) {
            options = req.body.options;
        }

        if (process.env.PREFERRED_PRINTER) {
            if (options) {
                if (!options.printer) {
                    options.printer = process.env.PREFERRED_PRINTER;
                }
            } else {
                options = {
                    printer: process.env.PREFERRED_PRINTER
                }
            }
        }

        if (!req.body.url) {
            res.status(500).json({
                success: false,
                message: 'URL not specified.'
            });
            return;
        }

        const apiRes = await needle('get', req.body.url);

        const bodyBuffer = apiRes.body;

        const uint = new Uint8Array(bodyBuffer);
        let bodyBytes = [];
        uint.forEach(byte => {
            bodyBytes.push(byte.toString(16));
        });
        const bodyHex = bodyBytes.join('').toUpperCase();

        if (bodyHex.startsWith('255044462D')) {
            const tmpFilePath = path.join(`tmp/${Math.random().toString(36).substring(7)}.pdf`);

            fs.writeFileSync(tmpFilePath, apiRes.body, 'binary');
            
            if (options) {
                await ptp.print(tmpFilePath, options)
                    .then((resolved) => {
                        res.json({
                            success: true,
                            data: resolved
                        });
                    })
                    .catch((rejected) => {
                        res.json({
                            success: false,
                            data: rejected
                        });
                    });
                } else {
                    await ptp.print(tmpFilePath)
                        .then((resolved) => {
                            res.json({
                                success: true,
                                data: resolved
                            });
                        })
                        .catch((rejected) => {
                            res.json({
                                success: false,
                                data: rejected
                            });
                        });
                }

            fs.unlinkSync(tmpFilePath);
            
        } else {
            throw {
                message: 'invalid file.',
            };
        }
    } catch (error) {
        res.status(500).json({ error });
    }
});

// app.post('', express.raw({ type: 'application/pdf' }), async(req, res) => {

//     const options = {};
//     if (req.query.printer) {
//         options.printer = req.query.printer;
//     }
//     const tmpFilePath = path.join(`./tmp/${Math.random().toString(36).substr(7)}.pdf`);

//     fs.writeFileSync(tmpFilePath, req.body, 'binary');
//     await ptp.print(tmpFilePath, options);
//     fs.unlinkSync(tmpFilePath);

//     res.status(204);
//     res.send();
// });

app.listen(port, () => {
    console.log(`Pie Print Server is listening on port ${port}`)
});