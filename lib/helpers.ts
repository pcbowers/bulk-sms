import { createCipheriv, createDecipheriv, randomBytes } from "crypto"
import { FilterQuery, Model, Query } from "mongoose"
import { curry, __ } from "ramda"
import { BroadcastDocument, BroadcastSchema } from "./models/Broadcast"
import { ContactDocument, ContactSchema } from "./models/Contact"
import { FlowDocument, FlowSchema } from "./models/Flow"
import { TaskDocument, TaskSchema } from "./models/Task"

export let MAX_DB_OPERATIONS = {
  set dangerouslyChangeValue(newValue) {
    this.value = newValue
  },
  resetValue() {
    this.value = 100
  },
  value: 100
}

// UNION TYPES

export type SchemaUnion =
  | FlowSchema
  | TaskSchema
  | BroadcastSchema
  | ContactSchema

export type DocumentUnion =
  | FlowDocument
  | TaskDocument
  | BroadcastDocument
  | ContactDocument

// GENERIC FUNCTIONS

const algorithm = "aes-256-ctr"
const secretKey = "1c227d77-a6bf-40de-ac68-3cda668c"
const iv = randomBytes(16)

const encrypt = (obj: Object) => {
  const cipher = createCipheriv(algorithm, secretKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(obj)),
    cipher.final()
  ])

  return `${iv.toString("hex")}_${encrypted.toString("hex")}`
}

const decrypt = (hash: string) => {
  const [iv, content] = hash.split("_")
  const decipher = createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  )

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final()
  ])

  return JSON.parse(decrpyted.toString())
}

/**
 * A general wrapper for Promise.all so that multiple asynchronous events can be handled at once
 * @param func A function that returns a promise
 * @returns A Promise that returns an array of elements, each one having been passed in to the function
 */
export const pluralizer = (func: Function) => {
  return async (elements: Array<Object>) => {
    return await Promise.all(
      elements.map(async (element) => {
        return await func(element)
      })
    )
  }
}

/**
 * Extract a deep nested value.
 * Attributions go to speigg from the following answer:
 * https://stackoverflow.com/questions/6491463
 * @param path A string containing the path array/object path (i.e. a[0].b.c[3])
 * @param obj The object containing the path
 * @param separator The separator (default is '.' Change if key contains a period)
 * @returns The value at the path's endpoint
 */
export const getDeepNestedValue = (
  path: string | string[],
  obj: any,
  separator = "."
) => {
  const properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

// MONGOOSE HELPER FUNCTIONS

// base mongoose types

type BaseModel = Model<DocumentUnion>
type BaseSchema = SchemaUnion
type BaseSchemas = SchemaUnion[]
type BaseFilterQuery = FilterQuery<DocumentUnion>
type BaseQuerySingle = Query<DocumentUnion, DocumentUnion>
type BaseQueryMultiple = Query<DocumentUnion[], DocumentUnion>

// MONGODB Queries

/**
 * select all documents with any of the given ids
 * @param ids an array of IDs
 * @returns A filter query
 */
export const idQuery = (ids: string[]): BaseFilterQuery => {
  return {
    _id: {
      $in: ids
    }
  }
}

/**
 * select all documents with all of the given tags
 * @param tags an array of tags
 * @returns A filter query
 */
export const tagQuery = (tags: string[]): BaseFilterQuery => {
  return {
    tags: {
      $all: tags
    }
  }
}

// CREATE calls

// create a single document
export const createDoc = curry(async (Model: BaseModel, schema: BaseSchema) => {
  return await Model.create(schema)
})

// create multiple documents
export const createDocs = curry(
  async (Model: BaseModel, schemas: BaseSchemas) => {
    const count = schemas.length
    if(count > MAX_DB_OPERATIONS.value) throw Error(`You can only create up to ${MAX_DB_OPERATIONS.value} at a time.`)
    return await Model.insertMany(schemas)
  }
)

// UPDATE calls

// update a single document
export const updateDoc = curry(
  async (Model: BaseModel, id: string, schema: BaseSchema) => {
    return await Model.findByIdAndUpdate(id, schema, {
      returnOriginal: false,
      omitUndefined: true
    })
  }
)

// update multiple documents by query
export const updateDocsByQuery = curry(
  async (
    Model: BaseModel,
    filterQuery: BaseFilterQuery,
    schemas: BaseSchemas
  ) => {
    const count = await getDocsCountByQuery(Model, filterQuery)
    if(count > MAX_DB_OPERATIONS.value) throw Error(`You can only update up to ${MAX_DB_OPERATIONS.value} at a time.`)
    return await Model.updateMany(filterQuery, schemas, {
      returnOriginal: false,
      omitUndefined: true
    })
  }
)

// update all documents
export const updateDocs = updateDocsByQuery(__, {})

// update multiple docs by tag
export const updateDocsByTag = curry(
  async (Model: BaseModel, tags: string[], schemas: BaseSchemas) => {
    return await updateDocsByQuery(Model, tagQuery(tags), schemas)
  }
)

// update multiple docs by ID
export const updateDocsById = curry(
  async (Model: BaseModel, ids: string[], schemas: BaseSchemas) => {
    return await updateDocsByQuery(Model, idQuery(ids), schemas)
  }
)

// DELETE Calls

// delete a document
export const deleteDoc = async (Model: BaseModel, id: string) => {
  return await Model.findByIdAndDelete(id)
}

// delete multiple documents by query
export const deleteDocsByQuery = curry(
  async (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    const count = await getDocsCountByQuery(Model, filterQuery)
    if(count > MAX_DB_OPERATIONS.value) throw Error(`You can only delete up to ${MAX_DB_OPERATIONS.value} at a time.`)
    return await Model.deleteMany(filterQuery)
  }
)

// delete all documents
export const deleteDocs = deleteDocsByQuery(__, {})

// delete multiple documents by id
export const deleteDocsById = curry(async (Model: BaseModel, ids: string[]) => {
  return await deleteDocsByQuery(Model, idQuery(ids))
})

// delete multiple documents by tag
export const deleteDocsByTag = curry(
  async (Model: BaseModel, tags: string[]) => {
    return await deleteDocsByQuery(Model, tagQuery(tags))
  }
)

// GET Calls

// GET Document Calls

// get a count of multiple documents by query
export const getDocsCountByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return Model.countDocuments(filterQuery)
  }
)

// get a count of all documents
export const getDocsCount = getDocsCountByQuery(__, {})

// get a document
export const getDoc = (Model: BaseModel, id: string) => {
  return Model.findById(id)
}

// get a single document by query
export const getDocByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return Model.findOne(filterQuery)
  }
)

// get multiple documents by query
export const getDocsByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return Model.find(filterQuery)
  }
)

// get all documents
export const getDocs = getDocsByQuery(__, {})

// get multiple documents by tag
export const getDocsByTag = curry((Model: BaseModel, tags: string[]) => {
  return getDocsByQuery(Model, tagQuery(tags))
})

// get multiple documents by id
export const getDocsById = curry((Model: BaseModel, ids: string[]) => {
  return getDocsByQuery(Model, idQuery(ids))
})

// get multiple documents by query and paginate
export const getDocsByQueryPaginate = curry(
  async (
    Model: BaseModel,
    filterQuery: BaseFilterQuery,
    cursor: string = "",
    limit: number = MAX_DB_OPERATIONS.value
  ) => {
    let docQuery = getDocsByQuery(Model, filterQuery)

    limit = Math.ceil(limit)
    if(limit > MAX_DB_OPERATIONS.value || limit <= 0) throw Error(`You can only get up to ${MAX_DB_OPERATIONS.value} at a time and your limit must be more than 0.`)

    if (cursor) {
      const decryptedCursor = decrypt(cursor)
      docQuery = docQuery.where({ _id: { $lt: decryptedCursor } })
    }

    const data = await docQuery
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec()

    const hasMore = data.length > limit
    if (hasMore) data.pop()

    const nextCursor = hasMore ? encrypt(data[data.length - 1]._id) : cursor

    return { data, hasMore, limit, cursor: nextCursor }
  }
)

// get multiple documents by tags and paginate
export const getDocsByTagPaginate = curry(
  async (
    Model: BaseModel,
    tags: string[],
    cursor: string = "",
    limit: number = MAX_DB_OPERATIONS.value
  ) => {
    return await getDocsByQueryPaginate(Model, tagQuery(tags), cursor, limit)
  }
)

// get multiple documents by IDs and paginate
export const getDocsByIdPaginate = curry(
  async (
    Model: BaseModel,
    ids: string[],
    cursor: string = "",
    limit: number = MAX_DB_OPERATIONS.value
  ) => {
    return await getDocsByQueryPaginate(Model, idQuery(ids), cursor, limit)
  }
)

// GET Field Calls

// get a field based on a query and path
export const getField = async (query: BaseQuerySingle, fieldPath: string) => {
  return getDeepNestedValue(fieldPath, await query.exec())
}

// get multiple fields based on a query and path
export const getFields = async (
  query: BaseQueryMultiple,
  fieldPath: string
) => {
  const data = await query.exec()
  return data.map((doc) => getDeepNestedValue(fieldPath, doc))
}
