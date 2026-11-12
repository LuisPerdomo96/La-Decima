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

export function generateGoogleWalletJWT(data: WalletPassData): string {
  const now = Math.floor(Date.now() / 1000)

  const jwtPayload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    origins: ['https://la-decima.vercel.app'],
    typ: 'savetowallet',
    iat: now,
    payload: {
      loyaltyObjects: [
        {
          id: `${ISSUER_ID}.${data.memberId}`,
          classId: `${ISSUER_ID}.${CLASS_ID}`,
          state: 'active',
          accountId: data.memberCode,
          accountName: data.memberName,
          cardTitle: {
            defaultValue: { language: 'es', value: data.clubName }
          },
          header: {
            defaultValue: { language: 'es', value: 'Club de Lealtad' }
          },
          subheader: {
            defaultValue: { language: 'es', value: data.memberName }
          },
          loyaltyPoints: {
            label: { defaultValue: { language: 'es', value: 'Sellos' } },
            balance: { int: data.currentStamps }
          },
          textModulesData: [
            { header: 'Recompensa', body: data.rewardDescription, id: 'reward' },
            {
              header: 'Progreso',
              body: `${data.currentStamps} de ${data.stampsRequired} sellos`,
              id: 'progress'
            }
          ],
          barcode: {
            type: 'qrCode',
            value: data.memberCode,
            alternateText: data.memberCode
          }
        }
      ]
    }
  }

  return jwt.sign(jwtPayload, PRIVATE_KEY, { algorithm: 'RS256' })
}

export function getGoogleWalletSaveUrl(token: string): string {
  return `https://pay.google.com/gp/v/save/${encodeURIComponent(token)}`
}