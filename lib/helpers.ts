import { createCipheriv, createDecipheriv, randomBytes } from "crypto"
import { FilterQuery, Model, Query } from "mongoose"
import { curry, __ } from "ramda"
import { BroadcastDocument, BroadcastSchema } from "./models/Broadcast"
import { ContactDocument, ContactSchema } from "./models/Contact"
import { FlowDocument, FlowSchema } from "./models/Flow"
import { InboxDocument, InboxSchema } from "./models/Inbox"
import { TaskDocument, TaskSchema } from "./models/Task"

export let MAX_DB_OPERATIONS = {
  set dangerouslyChangeValue(newValue: number) {
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
  | InboxSchema

export type DocumentUnion =
  | Model<FlowDocument>
  | Model<TaskDocument>
  | Model<BroadcastDocument>
  | Model<ContactDocument>
  | Model<InboxDocument>

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

type BaseModel = DocumentUnion
type BaseSchema = SchemaUnion
type BaseSchemas = SchemaUnion[]
type BaseFilterQuery = FilterQuery<DocumentUnion>
type BaseQuerySingle = Query<DocumentUnion, DocumentUnion>
type BaseQueryMultiple = Query<DocumentUnion[], DocumentUnion>

// MONGODB Queries

export const fieldHasAnyQuery = (
  field: string,
  values: string | string[]
): BaseFilterQuery => {
  if (!Array.isArray(values)) values = values.split(",")
  return {
    [field]: {
      $in: values
    }
  }
}

export const fieldHasAllQuery = (
  field: string,
  values: string | string[]
): BaseFilterQuery => {
  if (!Array.isArray(values)) values = values.split(",")
  return {
    [field]: {
      $all: values
    }
  }
}

export const fieldMatchesQuery = (
  field: string,
  value: string
): BaseFilterQuery => {
  return {
    [field]: value
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
    if (count > MAX_DB_OPERATIONS.value)
      throw Error(
        `You can only create up to ${MAX_DB_OPERATIONS.value} at a time.`
      )
    return await Model.insertMany(schemas)
  }
)

// UPDATE calls

// update a single document
export const updateDoc = curry(
  async (Model: BaseModel, id: string, schema: BaseSchema) => {
    return await (Model as any).findByIdAndUpdate(id, schema, {
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
    const count = await getDocsCountByQuery(Model, filterQuery).exec()
    if (count > MAX_DB_OPERATIONS.value)
      throw Error(
        `You can only update up to ${MAX_DB_OPERATIONS.value} at a time.`
      )
    return await Model.updateMany(filterQuery, schemas, {
      returnOriginal: false,
      omitUndefined: true
    })
  }
)

// update all documents
export const updateDocs = updateDocsByQuery(__, {})

// update multiple docs by tag
export const updateDocsWithAll = curry(
  async (
    Model: BaseModel,
    field: string,
    values: string[],
    schemas: BaseSchemas
  ) => {
    return await updateDocsByQuery(
      Model,
      fieldHasAllQuery(field, values),
      schemas
    )
  }
)

// update multiple docs by ID
export const updateDocsWithAny = curry(
  async (
    Model: BaseModel,
    field: string,
    values: string[],
    schemas: BaseSchemas
  ) => {
    return await updateDocsByQuery(
      Model,
      fieldHasAnyQuery(field, values),
      schemas
    )
  }
)

// DELETE Calls

// delete a document
export const deleteDoc = curry(async (Model: BaseModel, id: string) => {
  return await Model.findByIdAndDelete(id)
})

// delete multiple documents by query
export const deleteDocsByQuery = curry(
  async (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    const count = await getDocsCountByQuery(Model, filterQuery).exec()
    if (count > MAX_DB_OPERATIONS.value)
      throw Error(
        `You can only delete up to ${MAX_DB_OPERATIONS.value} at a time.`
      )

    return await Model.deleteMany(filterQuery as any)
  }
)

// delete all documents
export const deleteDocs = deleteDocsByQuery(__, {})

// delete multiple documents by id
export const deleteDocsWithAny = curry(
  async (Model: BaseModel, field: string, values: string[]) => {
    return await deleteDocsByQuery(Model, fieldHasAnyQuery(field, values))
  }
)

// delete multiple documents by tag
export const deleteDocsWithAll = curry(
  async (Model: BaseModel, field: string, values: string[]) => {
    return await deleteDocsByQuery(Model, fieldHasAllQuery(field, values))
  }
)

// GET Calls

// GET Document Calls

// get a count of multiple documents by query
export const getDocsCountByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return Model.countDocuments(filterQuery as any)
  }
)

// get a count of all documents
export const getDocsCount = getDocsCountByQuery(__, {})

// get a document
export const getDoc = curry((Model: BaseModel, id: string) => {
  return Model.findById(id)
})

// get a single document by query
export const getDocByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return Model.findOne(filterQuery)
  }
)

// get a single document by query
export const getDocByValue = curry(
  (Model: BaseModel, field: string, value: string) => {
    return getDocByQuery(Model, fieldMatchesQuery(field, value))
  }
)

// get multiple documents by query
export const getDocsByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return (Model as any).find(filterQuery)
  }
)

// get all documents
export const getDocs = getDocsByQuery(__, {})

// get multiple documents by tag
export const getDocsWithAll = curry(
  (Model: BaseModel, field: string, values: string[]) => {
    return getDocsByQuery(Model, fieldHasAllQuery(field, values))
  }
)

// get multiple documents by id
export const getDocsWithAny = curry(
  (Model: BaseModel, field: string, values: string[]) => {
    return getDocsByQuery(Model, fieldHasAnyQuery(field, values))
  }
)

// get multiple documents by query and paginate
export const getDocsByQueryPaginate = curry(
  async (
    Model: BaseModel,
    filterQuery: BaseFilterQuery,
    cursor: string,
    limit: number
  ) => {
    cursor = cursor || ""
    limit = limit || MAX_DB_OPERATIONS.value

    let docQuery = getDocsByQuery(Model, filterQuery)

    limit = Math.ceil(limit)
    if (limit > MAX_DB_OPERATIONS.value || limit <= 0)
      throw Error(
        `You can only get up to ${MAX_DB_OPERATIONS.value} at a time and your limit must be more than 0.`
      )

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
export const getDocsWithAllPaginate = curry(
  async (
    Model: BaseModel,
    field: string,
    values: string[],
    cursor: string,
    limit: number
  ) => {
    return await getDocsByQueryPaginate(
      Model,
      fieldHasAllQuery(field, values),
      cursor,
      limit
    )
  }
)

// get multiple documents by IDs and paginate
export const getDocsWithAnyPaginate = curry(
  async (
    Model: BaseModel,
    field: string,
    values: string[],
    cursor: string,
    limit: number
  ) => {
    return await getDocsByQueryPaginate(
      Model,
      fieldHasAnyQuery(field, values),
      cursor,
      limit
    )
  }
)

// GET Field Calls

// get a field based on a query and path
export const getField = curry(
  async (query: BaseQuerySingle, fieldPath: string) => {
    return getDeepNestedValue(fieldPath, await query.exec())
  }
)

// get multiple fields based on a query and path
export const getFields = curry(
  async (query: BaseQueryMultiple, fieldPath: string) => {
    const data = await query.exec()
    return data.map((doc) => getDeepNestedValue(fieldPath, doc))
  }
)
