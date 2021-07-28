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

export const pluralizer = (func: Function) => {
  return async (elements: Array<Object>) => {
    return await Promise.all(
      elements.map(async (element) => {
        return await func(element)
      })
    )
  }
}

export const getDeepNestedValue = (
  path: string | string[],
  obj: any,
  separator = "."
) => {
  const properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

// MONGOOSE HELPER FUNCTIONS

export const generateSortQuery = (sortFields: string[] = []) => {
  const sortQuery: [string, number][] = sortFields.map((field) => {
    if (field.substring(0, 1) === "-") return [field.substring(1), -1]
    return [field, 1]
  })

  if (sortQuery.every((field) => field[0] !== "_id")) sortQuery.push(["_id", 1])

  return sortQuery
}

export const generateCursor = (
  nextDocument: any,
  sortQuery: [string, number][]
) => {
  return {
    $or: sortQuery.map((sortParam, index) => {
      const [field, ascending] = sortParam
      const comparisonOp = ascending === 1 ? "$gt" : "$lt"
      const prevSortQuery = sortQuery
        .slice(0, index)
        .reduce((acc, prevSortParam) => {
          const [prevField, ,] = prevSortParam
          return {
            ...acc,
            [prevField]: {
              $eq: nextDocument[prevField]
            }
          }
        }, {})

      return {
        ...prevSortQuery,
        [field]: {
          [comparisonOp]: nextDocument[field]
        }
      }
    })
  }
}

const generateFilterQuery = curry(
  (filters: { [key: string]: any }, union: boolean = true): BaseFilterQuery => {
    const newFilters = Object.keys(filters).reduce((acc, filter) => {
      const filterValue = filters[filter]
      let filterName = filter
      let operator = "$eq"

      if (filter.includes("[")) {
        filterName = filter.split("[")[0]
        operator = "$" + filter.split("[")[1]
        if (filter.includes("]")) operator = operator.slice(0, -1)
      }

      if (!acc[filterName]) acc[filterName] = {}
      acc[filterName][operator] = filterValue

      return acc
    }, [] as any)

    const filterQuery = [
      ...Object.keys(newFilters).map((key, index, array) => ({
        [key]: newFilters[key]
      }))
    ]

    if (filterQuery.length > 1) return { [union ? "$or" : "$and"]: filterQuery }
    if (filterQuery.length === 1) return filterQuery[0]
    return {}
  }
)

// base mongoose types

type BaseModel = DocumentUnion
type BaseSchema = SchemaUnion
type BaseSchemas = SchemaUnion[]
type BaseFilterQuery = FilterQuery<DocumentUnion>
type BaseQuerySingle = Query<DocumentUnion, DocumentUnion>
type BaseQueryMultiple = Query<DocumentUnion[], DocumentUnion>

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

// update multiple documents by prebuilt query
export const updateDocsByBuiltQuery = curry(
  async (
    Model: BaseModel,
    filterFields: { [key: string]: any },
    union: boolean,
    schemas: BaseSchemas
  ) => {
    return await updateDocsByQuery(
      Model,
      generateFilterQuery(filterFields, union),
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

// delete multiple documents by prebuilt query
export const deleteDocsByBuiltQuery = curry(
  async (
    Model: BaseModel,
    filterFields: { [key: string]: any },
    union: boolean
  ) => {
    return await deleteDocsByQuery(
      Model,
      generateFilterQuery(filterFields, union)
    )
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

// get multiple documents by query
export const getDocsByQuery = curry(
  (Model: BaseModel, filterQuery: BaseFilterQuery) => {
    return (Model as any).find(filterQuery)
  }
)

// get all documents
export const getDocs = getDocsByQuery(__, {})

// get multiple documents by tag
export const getDocsByBuiltQuery = curry(
  (Model: BaseModel, filterFields: { [key: string]: any }, union: boolean) => {
    return getDocsByQuery(Model, generateFilterQuery(filterFields, union))
  }
)

// get multiple documents by query and paginate
export const getDocsByQueryPaginate = curry(
  async (
    Model: BaseModel,
    filterQuery: BaseFilterQuery,
    cursor: string,
    limit: number,
    sortFields: string[]
  ) => {
    cursor = cursor || ""
    limit = limit || MAX_DB_OPERATIONS.value

    const sortQuery = generateSortQuery(sortFields)

    let docQuery = getDocsByQuery(Model, filterQuery).sort(sortQuery)

    limit = Math.ceil(limit)
    if (limit > MAX_DB_OPERATIONS.value || limit <= 0)
      throw Error(
        `You can only get up to ${MAX_DB_OPERATIONS.value} at a time and your limit must be more than 0.`
      )

    if (cursor) {
      const decryptedCursor = decrypt(cursor)
      docQuery = docQuery.where(decryptedCursor)
    }

    const data = await docQuery.limit(limit + 1).exec()

    const hasMore = data.length > limit
    let nextCursor = cursor

    if (hasMore) {
      data.pop()
      const nextDocument = data[data.length - 1]
      nextCursor = encrypt(generateCursor(nextDocument, sortQuery))
    }

    return { data, hasMore, limit, cursor: nextCursor }
  }
)

export const getDocsPaginate = getDocsByQueryPaginate(__, {})

export const getDocsByBuiltQueryPaginate = curry(
  async (
    Model: BaseModel,
    filterFields: { [key: string]: any },
    union: boolean,
    cursor: string,
    limit: number,
    sortFields: string[]
  ) => {
    return await getDocsByQueryPaginate(
      Model,
      generateFilterQuery(filterFields, union),
      cursor,
      limit,
      sortFields
    )
  }
)

// GET Field Calls

// get a field based on a query and path
export const getField = curry(
  async (docQuery: BaseQuerySingle, fieldPath: string) => {
    return getDeepNestedValue(fieldPath, await docQuery.exec())
  }
)

// get multiple fields based on a query and path
export const getFieldsByQuery = curry(
  async (docQuery: BaseQueryMultiple, fieldPath: string) => {
    const data = await docQuery.exec()
    return data.map((doc) => getDeepNestedValue(fieldPath, doc))
  }
)
