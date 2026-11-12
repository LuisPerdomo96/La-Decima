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
          version: 1, // ✅ CAMPO OBLIGATORIO QUE FALTABA
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
              header: 'Recompensa', 
              body: String(data.rewardDescription || 'Completa tus sellos para ganar premios')
            },
            {
              header: 'Progreso',
              body: `${Number(data.currentStamps) || 0} de ${Number(data.stampsRequired) || 10} sellos`
            }
          ],
          barcode: {
            type: 'qrCode',
            value: String(data.memberCode),
            alternateText: String(data.memberCode)
          }
        }
      ]
    }
  }

  console.log('=== GOOGLE WALLET PAYLOAD ===')
  console.log(JSON.stringify(jwtPayload, null, 2))
  console.log('=============================')

  try {
    const token = jwt.sign(jwtPayload, PRIVATE_KEY, { algorithm: 'RS256' })
    console.log('✅ JWT firmado exitosamente')
    return token
  } catch (err) {
    console.error('❌ Error firmando JWT:', err)
    throw new Error('Error firmando el pase: ' + (err as Error).message)
  }
}

export function getGoogleWalletSaveUrl(token: string): string {
  return `https://pay.google.com/gp/v/save/${encodeURIComponent(token)}`
}