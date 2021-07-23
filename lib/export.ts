import {
  createDoc,
  createDocs,
  deleteDoc,
  deleteDocsById,
  deleteDocsByQuery,
  deleteDocsByTag,
  getDoc,
  getDocsById,
  getDocsByIdPaginate,
  getDocsByQuery,
  getDocsByQueryPaginate,
  getDocsByTag,
  getDocsByTagPaginate,
  getDocsCountByQuery,
  updateDoc,
  updateDocsById,
  updateDocsByQuery,
  updateDocsByTag
} from "./helpers"
import { Broadcast } from "./models/Broadcast"
import { Contact } from "./models/Contact"
import { Flow } from "./models/Flow"
import { Task } from "./models/Task"

// middlewares
export { MAX_DB_OPERATIONS } from "./helpers"
export { withCookies } from "./middleware/cookies"
export { withMethod } from "./middleware/method"
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
export const create = {
  contact: createDoc(Contact),
  contacts: createDocs(Contact),
  broadcast: createDoc(Broadcast),
  broadcasts: createDocs(Broadcast),
  flow: createDoc(Flow),
  flows: createDocs(Flow),
  task: createDoc(Task),
  tasks: createDocs(Task)
}

export const update = {
  contact: updateDoc(Contact),
  contacts: {
    byQuery: updateDocsByQuery(Contact),
    byTag: updateDocsByTag(Contact),
    byId: updateDocsById(Contact)
  },
  broadcast: updateDoc(Broadcast),
  broadcasts: {
    byQuery: updateDocsByQuery(Broadcast),
    byTag: updateDocsByTag(Broadcast),
    byId: updateDocsById(Broadcast)
  },
  flow: updateDoc(Flow),
  flows: {
    byQuery: updateDocsByQuery(Flow),
    byTag: updateDocsByTag(Flow),
    byId: updateDocsById(Flow)
  },
  task: updateDoc(Task),
  tasks: {
    byQuery: updateDocsByQuery(Task),
    byTag: updateDocsByTag(Task),
    byId: updateDocsById(Task)
  }
}

export const remove = {
  contact: deleteDoc(Contact),
  contacts: {
    byQuery: deleteDocsByQuery(Contact),
    byTag: deleteDocsByTag(Contact),
    byId: deleteDocsById(Contact)
  },
  broadcast: deleteDoc(Broadcast),
  broadcasts: {
    byQuery: deleteDocsByQuery(Broadcast),
    byTag: deleteDocsByTag(Broadcast),
    byId: deleteDocsById(Broadcast)
  },
  flow: deleteDoc(Flow),
  flows: {
    byQuery: deleteDocsByQuery(Flow),
    byTag: deleteDocsByTag(Flow),
    byId: deleteDocsById(Flow)
  },
  task: deleteDoc(Task),
  tasks: {
    byQuery: deleteDocsByQuery(Task),
    byTag: deleteDocsByTag(Task),
    byId: deleteDocsById(Task)
  }
}

export const find = {
  contact: getDoc(Contact),
  contacts: {
    countByQuery: getDocsCountByQuery(Contact),
    byQuery: getDocsByQuery(Contact),
    byTag: getDocsByTag(Contact),
    byId: getDocsById(Contact)
  },
  broadcast: getDoc(Broadcast),
  broadcasts: {
    countByQuery: getDocsCountByQuery(Broadcast),
    byQuery: getDocsByQuery(Broadcast),
    byTag: getDocsByTag(Broadcast),
    byId: getDocsById(Broadcast)
  },
  flow: getDoc(Flow),
  flows: {
    countByQuery: getDocsCountByQuery(Flow),
    byQuery: getDocsByQuery(Flow),
    byTag: getDocsByTag(Flow),
    byId: getDocsById(Flow)
  },
  task: getDoc(Task),
  tasks: {
    countByQuery: getDocsCountByQuery(Task),
    byQuery: getDocsByQuery(Task),
    byTag: getDocsByTag(Task),
    byId: getDocsById(Task)
  }
}

export const paginate = {
  contacts: {
    byQuery: getDocsByQueryPaginate(Contact),
    byTag: getDocsByTagPaginate(Contact),
    byId: getDocsByIdPaginate(Contact)
  },
  broadcasts: {
    byQuery: getDocsByQueryPaginate(Broadcast),
    byTag: getDocsByTagPaginate(Broadcast),
    byId: getDocsByIdPaginate(Broadcast)
  },
  flows: {
    byQuery: getDocsByQueryPaginate(Flow),
    byTag: getDocsByTagPaginate(Flow),
    byId: getDocsByIdPaginate(Flow)
  },
  tasks: {
    byQuery: getDocsByQueryPaginate(Task),
    byTag: getDocsByTagPaginate(Task),
    byId: getDocsByIdPaginate(Task)
  }
}
