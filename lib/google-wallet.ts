import jwt from 'jsonwebtoken'

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023223507'
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID || 'la-decima-loyalty'
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || ''
const PRIVATE_KEY = process.env.GOOGLE_WALLET_PRIVATE_KEY
  ?.replace(/\\n/g, '\n')
  .replace(/"/g, '')
  .trim() || ''

export interface WalletPassData {
  memberId: string
  memberName: string
  memberCode: string
  clubName: string
  currentStamps: number
  stampsRequired: number
  rewardDescription: string
  primaryColor: string
}

export function generateGoogleWalletJWT(data: WalletPassData) {
  const now = Math.floor(Date.now() / 1000)

  const loyaltyObject = {
    id: `${ISSUER_ID}.${data.memberId}`,
    classId: `${ISSUER_ID}.${CLASS_ID}`,
    state: 'active',
    version: 1,
    accountId: String(data.memberCode),
    accountName: String(data.memberName),
    cardTitle: {
      defaultValue: { language: 'es', value: String(data.clubName) }
    },
    header: {
      defaultValue: { language: 'es', value: 'Club de Lealtad' }
    },
    subheader: {
      defaultValue: { language: 'es', value: String(data.memberName) }
    },
    loyaltyPoints: {
      label: { defaultValue: { language: 'es', value: 'Sellos' } },
      balance: { int: Number(data.currentStamps) || 0 }
    },
    textModulesData: [
      {
        id: 'reward_module_1', // ✅ ESTE 'id' ERA EL QUE FALTABA Y CAUSABA EL ERROR
        header: 'Recompensa',
        body: String(data.rewardDescription || 'Completa tus sellos para ganar premios')
      }
    ],
    barcode: {
      type: 'qrCode',
      value: String(data.memberCode),
      alternateText: String(data.memberCode)
    }
  }

  const jwtPayload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    // ✅ Agregamos localhost para que puedas probar sin errores de origen
    origins: ['https://la-decima.vercel.app', 'http://localhost:3000'],
    typ: 'savetowallet',
    iat: now,
    payload: {
      loyaltyObjects: [loyaltyObject]
    }
  }

  return {
    unsignedPayload: jwtPayload,
    token: jwt.sign(jwtPayload, PRIVATE_KEY, { algorithm: 'RS256' })
  }
}

export function getGoogleWalletSaveUrl(token: string): string {
  return `https://pay.google.com/gp/v/save/${encodeURIComponent(token)}`
}