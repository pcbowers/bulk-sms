import {
  createDoc,
  createDocs,
  getDoc,
  getDocByValue,
  getDocsByQueryPaginate,
  getDocsWithAllPaginate,
  getDocsWithAnyPaginate
} from "./helpers"
import { Contact } from "./models/Contact"

// middlewares
export { MAX_DB_OPERATIONS } from "./helpers"
export { withCookies } from "./middleware/cookies"
export { withDatabase } from "./middleware/database"
export { withMethod } from "./middleware/method"
export { withSession } from "./middleware/session"
export { withTwilioAuthentication } from "./middleware/twilio_auth"
export { withUserAuthentication } from "./middleware/user_auth"
// other
export { connectToDatabase } from "./mongoose"
//twilio functions
export {
  createBinding,
  createBindings,
  createBroadcast,
  deleteBinding,
  deleteBindings,
  getBinding,
  getBindings,
  getPhoneNumber,
  getText,
  getTexts,
  twimlResponse,
  updateBinding,
  updateBindings
} from "./twilio"
// database functions

export const contact = {
  findByAnyTag: getDocsWithAnyPaginate(Contact, "tags"),
  findByAllTags: getDocsWithAllPaginate(Contact, "tags"),
  findByAnyId: getDocsWithAnyPaginate(Contact, "_id"),
  findById: getDoc(Contact),
  findAll: getDocsByQueryPaginate(Contact, {}),
  findByTwilioBindingId: getDocByValue(Contact, "twilioBindingId"),
  findByAnyTwilioBindingId: getDocsWithAnyPaginate(Contact, "twilioBindingId"),
  findByTwilioIdentity: getDocByValue(Contact, "twilioIdentity"),
  findByAnyTwilioIdentity: getDocsWithAnyPaginate(Contact, "twilioIdentity"),
  findByPhoneNumber: getDocByValue(Contact, "phoneNumber"),
  findByAnyPhoneNumber: getDocsWithAnyPaginate(Contact, "phoneNumber"),
  findByEmail: getDocByValue(Contact, "email"),
  findByAnyEmail: getDocsWithAnyPaginate(Contact, "email"),
  findByQuery: getDocsByQueryPaginate(Contact),
  create: {
    one: createDoc(Contact),
    many: createDocs(Contact)
  }
}
