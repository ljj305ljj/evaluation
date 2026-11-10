/**
 * 开放接口（/api/open/**）统一配置
 * 敏感信息集中在此文件，拿到真实 appSecret 后只需修改下方一处
 */
// 服务地址：取自环境变量 VUE_APP_BASE_URL（用于述职报告等直接访问的场景）
// axios 请求的 baseURL 用 VUE_APP_BASE_API，开发环境经 devServer 代理转发到服务地址，避免跨域
// export const OPEN_API_BASE_URL = process.env.VUE_APP_BASE_URL

// 应用标识
export const APP_KEY = 'fjut-eva'

// 签名密钥（由管理员提供：dev-open-secret-2026）
export const APP_SECRET = 'dev-open-secret-2026'

// 口令加密 RSA 公钥（与 Web 登录页一致，来自开放接口文档）
export const RSA_PUBLIC_KEY =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANL378k3RiZHWx5AfJqdH9xRNBmD9wGD2iRe41HdTNF8RUhNnHit5NpMNtGL0NPTSSpPjjI1kJfVorRvaQerUgkCAwEAAQ=='
