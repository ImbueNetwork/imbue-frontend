import { Response } from "express";
import formidable from "formidable";
import { IncomingMessage } from "http";
import { NextApiRequest, NextApiResponse } from "next";

// import parseForm from "parseForm";
import parseForm from "./promisify";

export const method1 = async (
    req: NextApiRequest | IncomingMessage,
    res: NextApiResponse | Response
) => {
    const form = formidable();

    const { files } = await parseForm(form, req);
    // console.log("🚀 ~ file: upload.ts:18 ~ files:", files.file)

    const file = files.file as any;
    console.log("🚀 ~ file: upload.ts:21 ~ file:", file)
    // console.log("🚀 ~ file: upload.ts:19 ~ file:", file[0].filepath)

    // createReadStream(file.path)
    //     .pipe(createWriteStream(file.name, file.type))
    //     .on("finish", () => {
    //         res.status(200).json("File upload complete");
    //     })
    //     .on("error", (err) => {
    //         console.error(err.message);
    //         res.status(500).json("File upload error: " + err.message);
    //     });
};
