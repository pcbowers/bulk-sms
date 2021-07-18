import twilio from "twilio"
import { v4 as uuidv4 } from "uuid"
import { pluralizer } from "./helpers"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const service = client.notify.services(
  process.env.TWILIO_NOTIFY_SERVICE_SID
)

export const deleteBinding = async (id) => {
  return await service.bindings(id).remove()
}

export const deleteBindings = pluralizer(deleteBinding)

export const createBinding = async (phoneNumber) => {
  return await service.bindings.create({
    identity: uuidv4(),
    bindingType: "sms",
    address: phoneNumber
  })
}

export const createBindings = pluralizer(createBinding)

export const updateBinding = async ({ id, phoneNumber }) => {
  return await service.bindings.create({
    identity: id,
    bindingType: "sms",
    address: phoneNumber
  })
}

export const updateBindings = pluralizer(updateBinding)

export const getBinding = async (id) => {
  return await service.bindings(id).fetch()
}

export const getBindings = async () => {
  return await service.bindings.list()
}

export const getPhoneNumber = async (id) => {
  return (await getBinding(id)).address
}

export const getText = async (id) => {
  return await client.messages(id).fetch()
}

export const getTexts = async (id) => {
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
  ].sort((a, b) => Date.parse(a.dateSent) - Date.parse(b.dateSent))
}

export const createBroadcast = async ({ identities, message = "" }) => {
  const id = uuidv4()

  await service.notifications.create({
    identity: identities,
    body: message,
    deliveryCallbackUrl: process.env.NEXTAUTH_URL + "/api/messages/" + id
  })

  msg.id = id
  return msg
}

// create a twiml response
export const twimlResponse = async (body = "") => {
  let twiml = new twilio.twiml.MessagingResponse()
  twiml.message(body)
  return twiml.toString()
}
