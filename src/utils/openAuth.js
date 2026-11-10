import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import { APP_KEY, APP_SECRET, RSA_PUBLIC_KEY } from '@/config/openApi'

/**
 * 生成一次性随机串（16~32 位十六进制，nonce 与 submitToken 共用）
 */
export function genRandomHex(len = 16) {
  let s = ''
  while (s.length < len) {
    s += Math.floor(Math.random() * 16).toString(16)
  }
  return s
}

/**
 * HMAC-SHA256 签名
 * 签名串：appKey + "\n" + username + "\n" + timestamp + "\n" + nonce（四段顺序固定）
 * 输出：十六进制小写
 */
export function sign({ username, timestamp, nonce }) {
  const content = [APP_KEY, username, timestamp, nonce].join('\n')
  return CryptoJS.HmacSHA256(content, APP_SECRET).toString(CryptoJS.enc.Hex)
}

/**
 * RSA 公钥加密口令，输出 Base64
 */
export function rsaEncrypt(plain) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(RSA_PUBLIC_KEY)
  return encryptor.encrypt(plain)
}

/**
 * 构建换取令牌请求体（PASSWORD 模式）
 * 文档：POST /api/open/auth/token
 */
export function buildTokenPayload({ username, password }) {
  const timestamp = Date.now()
  const nonce = genRandomHex(16)
  return {
    appKey: APP_KEY,
    grantType: 'password',
    username,
    password: rsaEncrypt(password),
    timestamp,
    nonce,
    sign: sign({ username, timestamp, nonce })
  }
}
