import { removeTokenCookie } from "./common"

export default async function logout(req, res) {
  removeTokenCookie(res)
  res.writeHead(302, { Location: '/' })
  res.end()
}
