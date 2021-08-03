import twilio from "twilio"
import { v4 as uuidv4 } from "uuid"
import {
  CURRENT_URL,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_NOTIFY_SERVICE_SID,
  TWILIO_NUMBER
} from "./config"
import { pluralizer } from "./helpers"

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export const service = client.notify.services(String(TWILIO_NOTIFY_SERVICE_SID))

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
      to: TWILIO_NUMBER
    })),
    ...(await client.messages.list({
      from: TWILIO_NUMBER,
      to: phoneNumber
    }))
  ].sort((a, b) => a.dateSent.getTime() - b.dateSent.getTime())
}

export const createBroadcast = async ({
  identities,
  id,
  message
}: {
  identities: string[]
  id: string
  message: string
}) => {
  console.log({ identities, id, message })
  const msg = await service.notifications.create({
    identity: identities,
    body: message,
    deliveryCallbackUrl: CURRENT_URL + "/api/broadcasts/" + id
  })

  return {
    ...msg.toJSON(),
    id
  }
}

// create a twiml response
export const twimlResponse = async (body = "") => {
  let twiml = new twilio.twiml.MessagingResponse()
  twiml.message(body)
  return twiml.toString()
}
