import { createCipheriv, createDecipheriv, randomBytes } from "crypto"
import { contact, ExtendedRequest } from "./export"

/**
 * =====================================================================
 * =====================================================================
 *
 * Generic Functions:
 * - encrypt()
 * - decrypt()
 * - pluralizer()
 *
 * =====================================================================
 * =====================================================================
 */

const algorithm = "aes-256-ctr"
const secretKey = "1c227d77-a6bf-40de-ac68-3cda668c"
const iv = randomBytes(16)

interface EncryptOptions {
  separator?: string
}

/**
 * encrypt any given object
 * @param obj any object you want to encrypt
 * @param options.separator separator between iv and encryption. default: "_"
 * @returns string with encrypted obj
 */
export const encrypt = (obj: any, options: EncryptOptions = {}) => {
  // destructure options
  const { separator = "_" } = options

  const cipher = createCipheriv(algorithm, secretKey, iv)

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(obj)),
    cipher.final()
  ])

  return `${iv.toString("hex")}${separator}${encrypted.toString("hex")}`
}

interface DecryptOptions {
  separator?: string
}

/**
 * Decrypts any encrypted object from the encrypt function
 * @param hash an encrypted object
 * @param options.separator separator between iv and encryption within hash. default: "_"
 * @returns decrypted object
 */
export const decrypt = (hash: string, options: DecryptOptions = {}) => {
  // destructure options
  const { separator = "_" } = options

  // extract properties
  const [iv, content] = hash.split(separator)

  const decipher = createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  )

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final()
  ])

  return JSON.parse(decrpyted.toString()) as any
}

/**
 * Allows a single async function to be called on a list of items
 * @param func an async function that accepts one element
 * @returns an async function that accepts an array of values and passes each element to the above function
 */
export const pluralizer = (func: Function) => {
  return async (elements: Array<Object>) => {
    // loop over elements and await all promise returns
    return await Promise.all(
      elements.map(async (element) => {
        return await func(element)
      })
    )
  }
}

export const checkAdminStatus = async (
  twilioBindingIds: string[],
  req: ExtendedRequest
) => {
  const potentialAdmins = (
    await contact.get.many({
      "twilioBindingId[in]": twilioBindingIds
    })()
  )
    .filter((contact) => contact.admin)
    .map((contact) => contact.email)

  const allAdmins = await contact.get.many({
    admin: true
  })()

  if (potentialAdmins.includes(req.user?.email))
    throw Error(`you cannot remove yourself, you are an admin.`)

  if (allAdmins.length - potentialAdmins.length < 1)
    throw Error(`there must be at least one admin.`)
}
