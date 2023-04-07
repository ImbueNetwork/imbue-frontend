// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query
  console.log(slug)

  res.status(200).json({ name: 'John Doe' })
}
