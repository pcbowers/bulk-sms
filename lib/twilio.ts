import twilio from "twilio"
import { v4 as uuidv4 } from "uuid"
import { pluralizer } from "./export"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const service = client.notify.services(
  String(process.env.TWILIO_NOTIFY_SERVICE_SID)
)

export const deleteBinding = async (id: string) => {
  return await service.bindings(id).remove()
}

export const deleteBindings = pluralizer(deleteBinding)

export const createBinding = async (phoneNumber: string) => {
  const binding = await service.bindings.create({
    identity: uuidv4(),
    bindingType: "sms",
    address: phoneNumber
  })

  return {
    twilioBindingId: binding.sid,
    twilioIdentity: binding.identity,
    phoneNumber
  }
}

export const createBindings = pluralizer(createBinding)

export const getBinding = async (id: string) => {
  return await service.bindings(id).fetch()
}

export const getBindings = async () => {
  return await service.bindings.list()
}

export const getPhoneNumber = async (id: string) => {
  return (await getBinding(id)).address
}

export const getText = async (id: string) => {
  return await client.messages(id).fetch()
}

export const getTexts = async (id: string) => {
  const phoneNumber = await getPhoneNumber(id)
  return [
    ...(await client.messages.list({
      from: phoneNumber,
      to: process.env.TWILIO_NUMBER
    })),
    ...(await client.messages.list({
      from: process.env.TWILIO_NUMBER,
      to: phoneNumber
    }))
  ].sort((a, b) => a.dateSent.getTime() - b.dateSent.getTime())
}

export const createBroadcast = async ({
  identities,
  message = ""
}: {
  identities: string[]
  message?: string
}) => {
  const id = uuidv4()

  const msg = await service.notifications.create({
    identity: identities,
    body: message,
    deliveryCallbackUrl: process.env.NEXTAUTH_URL + "/api/messages/" + id
  })

  return {
    ...msg,
    id
  }
}

// create a twiml response
export const twimlResponse = async (body = "") => {
  let twiml = new twilio.twiml.MessagingResponse()
  twiml.message(body)
  return twiml.toString()
}
