import type { NextApiRequest, NextApiResponse } from "next";
import * as models from "../models";
import db from "../db";
import { generateGetStreamToken, updateUserGetStreamToken } from "../models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtOptions } from "./common";
import config from "../config";
import { setTokenCookie } from "../auth-cookies";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userOrEmail, password } = req.body;

  if (req.method === "POST") {
    db.transaction(async (tx) => {
      try {
        const user = await models.fetchUserOrEmail(userOrEmail)(tx);
        if (!user) {
          return res.status(404).end();
        }

        if (!user.getstream_token) {
          const token = await generateGetStreamToken(user);
          await updateUserGetStreamToken(user?.id, token)(tx);
        }

        const loginSuccessful = await bcrypt.compare(password, user.password);
        if (!loginSuccessful) {
          return res.status(404).end();
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, jwtOptions.secretOrKey);
        setTokenCookie(res, token);

        res.send({ id: user.id, display_name: user.display_name });
      } catch (e) {
        new Error(`Failed to fetch user ${userOrEmail}`, { cause: e as Error });
      }
    });
  } else {
    res.status(400).send({ message: "Bad Request" });
  }
}
