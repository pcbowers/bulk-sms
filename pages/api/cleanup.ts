/* eslint-disable no-redeclare */
import nextConnect from "next-connect"
import { BindingInstance } from "twilio/lib/rest/notify/v1/service/binding"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/middlewares"
import { binding, contact, ContactDocument } from "../../lib/models"

interface ExtendedParams {
  problem: string
  problems: string[]
}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication())
handler.use(withDatabase)
handler.use(
  withQueryCleanse<ExtendedParams>({
    problem: "string",
    problems: "string[]"
  })
)

const PROBLEMS = ["mismatch", "missing_binding", "missing_contact"]
type Problem = "mismatch" | "missing_binding" | "missing_contact"

type MissingCleanUp<P> = P extends "missing_binding"
  ? {
      contact: {
        twilioBindingId?: string
        phoneNumber?: string
        _id: string
      }
      binding: null
      type: P
    }
  : {
      contact: null
      binding: {
        twilioBindingId: string
        twilioIdentity: string
        phoneNumber: string
      }
      type: P
    }

type CleanUp<P> = P extends "mismatch"
  ? {
      contact: {
        twilioBindingId?: string
        phoneNumber?: string
        _id: string
      }
      binding: {
        twilioBindingId: string
        twilioIdentity: string
        phoneNumber: string
      }
      type: P
    }
  : MissingCleanUp<P>

async function cleanUpProblems<P extends "mismatch">(
  problems: ["mismatch"]
): Promise<CleanUp<"mismatch">[]>
async function cleanUpProblems<P extends "missing_binding">(
  problems: ["missing_binding"]
): Promise<CleanUp<"missing_binding">[]>
async function cleanUpProblems<P extends "missing_contact">(
  problems: ["missing_contact"]
): Promise<CleanUp<"missing_contact">[]>
async function cleanUpProblems<P extends Problem>(
  problems: Problem[]
): Promise<CleanUp<Problem>[]>
async function cleanUpProblems<P extends Problem>(
  problems: Problem[] = []
): Promise<CleanUp<Problem>[]> {
  const bindings = await binding.get.all()
  const contacts = await contact.get.all()
  let data: CleanUp<Problem>[] = []

  // if no problems are listed, return empty array
  if (!problems.length) return []

  // get binding information
  const bindingsInfo = bindings.reduce((acc, binding) => {
    return {
      ...acc,
      [binding.identity]: {
        twilioBindingId: binding.sid,
        twilioIdentity: binding.identity,
        phoneNumber: binding.address
      }
    }
  }, {} as { [key: string]: { twilioBindingId: string; phoneNumber: string } })

  // get contact information
  const contactsInfo = contacts.reduce((acc, contact) => {
    return {
      ...acc,
      [contact.twilioIdentity]: {
        twilioBindingId: contact.twilioBindingId,
        phoneNumber: contact.phoneNumber,
        _id: contact._id
      }
    }
  }, {} as { [key: string]: { twilioBindingId: string; phoneNumber: string; _id: string } })

  if (problems.includes("mismatch")) {
    // see if contacts exist with improper bindingId and phoneNumber
    const mismatches = Object.keys(bindingsInfo)
      .filter((identity) => {
        const currBinding = bindingsInfo[identity]
        const currContact = identity in contactsInfo && contactsInfo[identity]
        return (
          currContact &&
          (currBinding.twilioBindingId !== currContact.twilioBindingId ||
            currBinding.phoneNumber !== currContact.phoneNumber)
        )
      })
      .reduce((acc, identity) => {
        const cntct = contactsInfo[identity]
        return [
          ...acc,
          {
            contact: {
              ...(cntct.twilioBindingId !== undefined && {
                twilioBindingId: cntct.twilioBindingId
              }),
              ...(cntct.phoneNumber !== undefined && {
                phoneNumber: cntct.phoneNumber
              }),
              _id: cntct._id
            },
            binding: bindingsInfo[identity],
            type: "mismatch"
          } as CleanUp<"mismatch">
        ]
      }, [] as CleanUp<"mismatch">[])

    data = [...data, ...mismatches]
  }

  if (problems.includes("missing_contact")) {
    // see if missing contacts exist and return them appropriately
    const missingContacts = Object.keys(bindingsInfo)
      .filter((value) => {
        return !(value in contactsInfo)
      })
      .reduce((acc, identity) => {
        return [
          ...acc,
          {
            contact: null,
            binding: bindingsInfo[identity],
            type: "missing_contact"
          } as CleanUp<"missing_contact">
        ]
      }, [] as CleanUp<"missing_contact">[])

    data = [...data, ...missingContacts]
  }

  if (problems.includes("missing_binding")) {
    // see if missing bindings exist and return them appropriately
    const missingBindings = Object.keys(contactsInfo)
      .filter((value) => {
        return !(value in bindingsInfo)
      })
      .reduce((acc, identity) => {
        const cntct = contactsInfo[identity]
        return [
          ...acc,
          {
            contact: {
              ...(cntct.twilioBindingId !== undefined && {
                twilioBindingId: cntct.twilioBindingId
              }),
              ...(cntct.phoneNumber !== undefined && {
                phoneNumber: cntct.phoneNumber
              }),
              _id: cntct._id
            },
            binding: null,
            type: "missing_binding"
          } as CleanUp<"missing_binding">
        ]
      }, [] as CleanUp<"missing_binding">[])

    data = [...data, ...missingBindings]
  }

  return data
}

const checkProblems = (problems: string[]) => {
  if (problems.some((type) => !PROBLEMS.includes(type)))
    throw Error(
      `${problems.join(
        ","
      )} problems must only include the following: 'mismatch', 'missing_binding', 'missing_contact'`
    )

  return problems as Problem[]
}

handler.get(async (req, res) => {
  let data: CleanUp<Problem>[]

  const { problems = PROBLEMS } = req.query

  try {
    data = await cleanUpProblems<Problem>(checkProblems(problems))

    return res.status(400).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data: {
    createdContacts: number
    updatedContacts: number
    deletedContacts: number
    createdBindings: number
    data: (ContactDocument | null)[]
  }

  let createdContacts = 0
  let updatedContacts = 0
  let deletedContacts = 0
  let createdBindings = 0

  const { problem = "mismatch" } = req.query

  try {
    if (problem === "mismatch") {
      const mismatches = await cleanUpProblems<"mismatch">(["mismatch"])

      // updates contact with the binding information
      data = {
        data: await Promise.all(
          mismatches.map(async (mismatch) => {
            updatedContacts += 1
            return await contact.update.one.id(mismatch.contact._id, {
              twilioBindingId: mismatch.binding.twilioBindingId,
              phoneNumber: mismatch.binding.phoneNumber
            })
          })
        ),
        createdContacts,
        updatedContacts,
        deletedContacts,
        createdBindings
      }
    } else if (problem === "missing_binding") {
      const missingBindings = await cleanUpProblems<"missing_binding">([
        "missing_binding"
      ])

      // updates the contact, creates a new binding and updates the contact, or deletes the contact
      // dependent on the contact information
      data = {
        data: await Promise.all(
          missingBindings.map(async (missingBinding) => {
            const { phoneNumber, twilioBindingId, _id } = missingBinding.contact

            if (twilioBindingId !== undefined) {
              // check if binding exists
              let twilioData: BindingInstance | false = false
              try {
                twilioData = await binding.get.one(twilioBindingId)
              } catch (error) {
                twilioData = false
              }

              // update the contact
              if (twilioData) {
                updatedContacts += 1
                return await contact.update.one.id(_id, {
                  twilioBindingId: twilioData.sid,
                  phoneNumber: twilioData.address,
                  twilioIdentity: twilioData.identity
                })
              }
            }

            if (phoneNumber !== undefined) {
              // create a new binding (twilioBindingId must not have existed or is malformed)
              let twilioData:
                | {
                    twilioBindingId: string
                    phoneNumber: string
                    twilioIdentity: string
                  }
                | false = false
              try {
                twilioData = await binding.create.one(phoneNumber)
              } catch (e) {
                twilioData = false
              }

              // update the contact
              if (twilioData) {
                createdBindings += 1
                updatedContacts += 1
                return await contact.update.one.id(_id, twilioData)
              }
            }

            // delete the contact as the phoneNumber and twilioBindingId never returned
            deletedContacts += 1
            return await contact.delete.one.id(_id)
          })
        ),
        createdContacts,
        updatedContacts,
        deletedContacts,
        createdBindings
      }
    } else if (problem === "missing_contact") {
      const missingContacts = await cleanUpProblems<"missing_contact">([
        "missing_contact"
      ])

      // either creates a new contact or updates the contact if a matching phone number can be found
      data = {
        data: await Promise.all(
          missingContacts.map(async (missingContact) => {
            // get the bindings phoneNumber and twilioBindingId
            const { phoneNumber, twilioBindingId } = missingContact.binding

            // see if contact exists with phoneNumber and/or twilioBindingId
            const cntct = await contact.get.one.query({
              phoneNumber,
              twilioBindingId
            })({ union: true })

            if (cntct === null) {
              // create the contact
              createdContacts += 1
              return await contact.create.one({
                ...missingContact.binding
              })
            } else {
              // update the contact
              updatedContacts += 1
              return await contact.update.one.query({ phoneNumber })({
                ...missingContact.binding
              })
            }
          })
        ),
        createdContacts,
        updatedContacts,
        deletedContacts,
        createdBindings
      }
    } else {
      // it should never reach here
      throw Error("problem does not exist.")
    }

    return res.status(400).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
