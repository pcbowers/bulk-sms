/* eslint-disable no-redeclare */
import {
  Document as MongooseDocument,
  EnforceDocument,
  FilterQuery,
  Model as MongooseModel,
  Query,
  UpdateQuery,
  UpdateWriteOpResult
} from "mongoose"
import { decrypt, encrypt, pluralizer } from "./helpers"

export const MAX_OPERATIONS = 2000

/**
 * =====================================================================
 * =====================================================================
 *
 * Mongoose Generator Functions:
 * -generateSortQuery()
 * -generateCursor()
 * -generateFilterQuery()
 *
 * =====================================================================
 * =====================================================================
 */

interface GenerateSortQueryOptions {
  defaultDirection?: number
}

/**
 * Generates a sort query based on the passed parameters
 * @param sortFields a list of sort fields. + and - dictate ascending and descending respectively. Example: ["+name", "-_id"]
 * @param options.defaultDirection default direction if + and - is not passed, either 0 or 1. default: 1
 * @returns the generated sort query
 */
export const generateSortQuery = (
  sortFields: string[] = [],
  options: GenerateSortQueryOptions = {}
): [string, number][] => {
  // destructure options
  const { defaultDirection = 1 } = options

  const sortQuery: [string, number][] = sortFields.map((field) => {
    // if starts with -, descending
    if (field.substring(0, 1) === "-") return [field.substring(1), -1]

    // if starts with +, ascending
    if (field.substring(0, 1) === "+") return [field.substring(1), 1]

    // default is ascending
    return [field, 1]
  })

  // if _id is not included, add it, use defaultDirection
  if (sortQuery.every((field) => field[0] !== "_id"))
    sortQuery.push(["_id", defaultDirection])

  return sortQuery
}

/**
 * Generates a cursor for pagination
 * @param lastDocument the last document from the previous search query
 * @param sortQuery a sort query generated by generateSortQuery()
 * @returns a filter clause used as the next cursor
 */
export const generateCursor = <Document extends MongooseDocument>(
  lastDocument: Document,
  sortQuery: [string, number][]
): FilterQuery<Document> => {
  // build or query to generate cursor
  return {
    $or: sortQuery.map((sortParam, index) => {
      // extract the field and direction from each sort parameter
      const [field, direction] = sortParam

      // check if the field exists
      if (lastDocument.get(field) === undefined)
        throw Error(`${field} does not exist on this document.`)

      // set comparison operator based on sort direction
      const comparisonOp = direction === 1 ? "$gt" : "$lt"

      /*
        This builds out the previous query.

        Example: I am sorting by +name, -email, +_id
        1. As I loop through, I start with +name. All I need to check
        for here is if it is greater than name
        2. If the name is equal to current, I also need to check if
        it is less than email. Therefore, the previous query should include
        equal to name
        3. If the name and email are equal, then I need greater than _id.
        This requires me to check the equality of both name and email.

        As you can see, the prev query slowly increases the more sort params
        there are. Thus, the previous query must be built as below.
      */
      const prevSortQuery = sortQuery
        // slice array to get everything before current index
        .slice(0, index)
        .reduce((acc, prevSortParam) => {
          // extract the name of the previous field
          const [prevField, ,] = prevSortParam
          // return the overalll query with value of the previous field
          return {
            ...acc,
            [prevField]: {
              $eq: lastDocument.get(prevField)
            }
          }
        }, {})

      // return the overall query with combination of equality sort query and comparison query
      return {
        ...prevSortQuery,
        [field]: {
          [comparisonOp]: lastDocument.get(field)
        }
      }
    })
  } as object
}

interface GenerateFilterQueryOptions {
  union?: boolean
}

/**
 * Generates a filter query based on the filters and options passed
 * @param filters an object containing filters with optional operators. Example: { _id[in]: ["id1", "id2"]}
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @returns a filter query based on the filters
 */
const generateFilterQuery = <Document extends MongooseDocument>(
  filters: { [key: string]: any },
  options: GenerateFilterQueryOptions = {}
): FilterQuery<Document> => {
  // destructure options
  const { union = false } = options

  const newFilters = Object.keys(filters).reduce((acc, filter) => {
    // get the value of the filter
    const filterValue = filters[filter]
    // get the name of the filter
    let filterName = filter
    // set the base operator
    let operator = "$eq"

    // if a different operator is desired, extract it and reset the filter name
    if (filter.includes("[")) {
      filterName = filter.split("[")[0]
      operator = "$" + filter.split("[")[1]
      if (filter.includes("]")) operator = operator.slice(0, -1)
    }

    // if the filter doesn't already exist, add it
    if (!acc.hasOwnProperty(filterName)) acc[filterName] = {}

    // add operator and value to overall filter
    acc[filterName][operator] = filterValue

    return acc
  }, {} as { [parameterName: string]: { [filterOperator: string]: string | string[] } })

  // place each filter as a separate element in an array
  const filterQuery = [
    ...Object.keys(newFilters).map((key) => ({
      [key]: newFilters[key]
    }))
  ]

  // use union if there is more than one filter query
  if (filterQuery.length > 1)
    return { [union ? "$or" : "$and"]: filterQuery } as object
  if (filterQuery.length === 1) return filterQuery[0] as object
  return {}
}

/**
 * =====================================================================
 * =====================================================================
 *
 * Create Document Wrappers:
 * - createDoc()
 * - createDocs()
 *
 * =====================================================================
 * =====================================================================
 */

/**
 * Creates a single document
 * @param Model the document model to be created (curried)
 * @param schema the data for the document to be created
 * @returns the created document
 */
export const createDoc =
  <Document extends MongooseDocument, Schema>(Model: MongooseModel<Document>) =>
  async (schema: Schema): Promise<EnforceDocument<Document, {}>> => {
    return await Model.create(schema)
  }

interface CreateDocsOptions {
  maxOperations?: number
}

/**
 * Creates multiple documents
 * @param Model the document model to be created (curried)
 * @param schemas the data for the documents to be created (curried)
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @returns the created documents
 */
export const createDocs =
  <Document extends MongooseDocument, Schema>(Model: MongooseModel<Document>) =>
  (schemas: Schema[]) =>
  async (
    options: CreateDocsOptions = {}
  ): Promise<EnforceDocument<Document, {}>[]> => {
    // destructure options
    const { maxOperations = Infinity } = options

    await checkMax(Model, maxOperations, "create", schemas.length)

    return await Model.insertMany(schemas)
  }

/**
 * =====================================================================
 * =====================================================================
 *
 * Update Document Wrappers:
 * - updateDocById()
 * - updateDocByQuery()
 * - updateDocByBuiltQuery()
 * - updateDocsByQuery()
 * - updateDocsByBuiltQuery()
 *
 * =====================================================================
 * =====================================================================
 */

interface UpdateDocByIdOptions {
  overwrite?: boolean
}

/**
 * Updates a single document by ID
 * @param Model the document model to be updated (curried)
 * @param id the id of the document to update
 * @param schema the schema with the updates
 * @param options.overwrite whether to overwrite the whole document or just the parts included. default: false
 * @returns the updated document or null if it is not found
 */
export const updateDocById =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  async (
    id: string,
    schema: UpdateQuery<Document>,
    options: UpdateDocByIdOptions = {}
  ): Promise<EnforceDocument<Document, {}> | null> => {
    // destructure options
    const { overwrite = false } = options

    return await Model.findByIdAndUpdate(id, schema, {
      overwrite: overwrite,
      returnOriginal: false,
      omitUndefined: true
    })
  }

interface UpdateDocByQueryOptions {
  overwrite?: boolean
}

/**
 * Updates a single document by Query
 * @param Model the document model to be updated (curried)
 * @param filterQuery a filter query to select the document to be udpated (curried)
 * @param schema the schema with the updates
 * @param options.overwrite whether to overwrite the whole document or just the parts included. default: false
 * @returns the updated document or null if it is not found
 */
export const updateDocByQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterQuery: FilterQuery<Document>) =>
  async (
    schema: UpdateQuery<Document>,
    options: UpdateDocByQueryOptions = {}
  ): Promise<EnforceDocument<Document, {}> | null> => {
    // destructure options
    const { overwrite = false } = options

    return await Model.findOneAndUpdate(filterQuery, schema, {
      overwrite: overwrite,
      returnOriginal: false,
      omitUndefined: true
    })
  }

interface UpdateDocByBuiltQueryOptions {
  overwrite?: boolean
  union?: true
}

/**
 * Updates a single document by Built Query
 * @param Model the document model to be updated (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @param schema the schema with the updates
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @param options.overwrite whether to overwrite the whole document or just the parts included. default: false
 * @returns the updated document or null if it is not found
 */
export const updateDocByBuiltQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterFields: { [key: string]: any }) =>
  async (
    schema: UpdateQuery<Document>,
    options: UpdateDocByBuiltQueryOptions = {}
  ): Promise<EnforceDocument<Document, {}> | null> => {
    // destructure options
    const { overwrite = false, union = true } = options

    return await updateDocByQuery<Document>(Model)(
      generateFilterQuery(filterFields, { union })
    )(schema, { overwrite })
  }

interface UpdateDocsByQueryOptions {
  maxOperations?: number
  overwrite?: boolean
}

/**
 * Updates multiple documents by Query
 * @param Model the document model to be updated (curried)
 * @param filterQuery a filter query to select the documents to be udpated (curried)
 * @param schema the schema with the updates
 * @param options.maxOperationsthe max operations before an error is thrown. default: Infinity
 * @param options.overwrite whether to overwrite the whole document or just the parts included. default: false
 * @returns an object containing ok, n selected, and nModified
 */
export const updateDocsByQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterQuery: FilterQuery<Document>) =>
  async (
    schema: UpdateQuery<Document>,
    options: UpdateDocsByQueryOptions = {}
  ): Promise<UpdateWriteOpResult> => {
    // destructure options
    const { maxOperations = Infinity, overwrite = false } = options

    await checkMax(Model, maxOperations, "update", filterQuery)

    return await Model.updateMany(filterQuery, schema, {
      overwrite: overwrite,
      returnOriginal: false,
      omitUndefined: true
    })
  }

interface UpdateDocsByBuiltQueryOptions {
  maxOperations?: number
  union?: boolean
  overwrite?: boolean
}

/**
 * Updates multiple documents by Built Query
 * @param Model the document model to be updated (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @param schema the schema with the updates
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @param options.overwrite whether to overwrite the whole document or just the parts included. default: false
 * @returns an object containing ok, n selected, and nModified
 */
export const updateDocsByBuiltQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterFields: { [key: string]: any }) =>
  async (
    schema: UpdateQuery<Document>,
    options: UpdateDocsByBuiltQueryOptions = {}
  ): Promise<UpdateWriteOpResult> => {
    // destructure options
    const {
      maxOperations = Infinity,
      union = false,
      overwrite = false
    } = options

    return await updateDocsByQuery<Document>(Model)(
      generateFilterQuery(filterFields, { union })
    )(schema, { maxOperations, overwrite })
  }

/**
 * =====================================================================
 * =====================================================================
 *
 * Delete Document Wrappers:
 * - deleteDocById()
 * - deleteDocByQuery()
 * - deleteDocByBuiltQuery()
 * - deleteDocsByQuery()
 * - deleteDocsByBuiltQuery()
 *
 * =====================================================================
 * =====================================================================
 */

/**
 * Deletes a single document by ID
 * @param Model the document model to be deleted (curried)
 * @param id the id of the document to be deleted
 * @returns the deleted document or null if not found
 */
export const deleteDocById =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  async (id: string): Promise<EnforceDocument<Document, {}> | null> => {
    return await Model.findByIdAndDelete(id)
  }

/**
 * Deletes a single document by query
 * @param Model the document model to be deleted (curried)
 * @param filterQuery a filter query to select the documents to be deleted (curried)
 * @returns the deleted document or null if not found
 */
export const deleteDocByQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterQuery: FilterQuery<Document>) =>
  async (): Promise<EnforceDocument<Document, {}> | null> => {
    return await Model.findOneAndDelete(filterQuery)
  }

interface DeleteDocByBuiltQueryOptions {
  union?: true
}

/**
 * Deletes a single document by query
 * @param Model the document model to be deleted (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @returns the deleted document or null if not found
 */
export const deleteDocByBuiltQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterFields: { [key: string]: any }) =>
  async (
    options: DeleteDocByBuiltQueryOptions = {}
  ): Promise<EnforceDocument<Document, {}> | null> => {
    // destructure options
    const { union = false } = options
    return await deleteDocByQuery<Document>(Model)(
      generateFilterQuery(filterFields, { union })
    )()
  }

interface DeleteDocsByQueryOptions {
  maxOperations?: number
}

/**
 * Deletes multiple documents by Query
 * @param Model the document model to be deleted (curried)
 * @param filterQuery a filter query to select the documents to be deleted (curried)
 * @param options.maxOperations the document model to be deleted (curried)
 * @returns an object containing ok, n selected, and deleted count
 */
export const deleteDocsByQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterQuery: FilterQuery<Document>) =>
  async (
    options: DeleteDocsByQueryOptions = {}
  ): Promise<{
    ok?: number
    n?: number
    deletedCount?: number
  }> => {
    // destructure options
    const { maxOperations = Infinity } = options

    checkMax(Model, maxOperations, "delete", filterQuery)

    return await Model.deleteMany(filterQuery as any)
  }

interface DeleteDocsByBuiltQueryOptions {
  maxOperations?: number
  union?: boolean
}

/**
 * Deletes multiple documents by Built Query
 * @param Model the document model to be deleted (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @returns an object containing ok, n selected, and deleted count
 */
export const deleteDocsByBuiltQuery =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterFields: { [key: string]: any }) =>
  async (
    options: DeleteDocsByBuiltQueryOptions = {}
  ): Promise<{
    ok?: number
    n?: number
    deletedCount?: number
  }> => {
    // destructure options
    const { maxOperations = Infinity, union = false } = options

    return await deleteDocsByQuery<Document>(Model)(
      generateFilterQuery(filterFields, { union })
    )({ maxOperations })
  }

/**
 * =====================================================================
 * =====================================================================
 *
 * Get Document Wrappers:
 * - executeQuery()
 * - getDocsCountByQuery()
 * - getDocsCountByBuiltQuery()
 * - getDocById()
 * - getDocByQuery()
 * - getDocByBuiltQuery()
 * - getDocsByQuery()
 * - getDocsByBuiltQuery()
 *
 * =====================================================================
 * =====================================================================
 */

interface QueryWrapperOptions {
  execute?: boolean
}

type QueryWrapper<ResultType, Document> =
  | Promise<ResultType>
  | LazyQueryWrapper<ResultType, Document>

type LazyQueryWrapper<ResultType, Document> = {
  (options: { execute: true }): Promise<ResultType>
  (options: { execute: false }): Query<
    ResultType,
    EnforceDocument<Document, {}>
  >
  (options: {}): Promise<ResultType>
  (): Promise<ResultType>
}

/**
 * Wraps a document query with an easy method to pass it along or execute it
 * @param docQuery a document query either to be passed along or executed
 * @param options.execute whether or not to execute the query or pass it along. default: true
 * @returns an function that will execute it or a function that will return it
 */

export function queryWrapper<ResultType, Document extends MongooseDocument>(
  docQuery: Query<ResultType, EnforceDocument<Document, {}>>
): Promise<ResultType>
export function queryWrapper<ResultType, Document extends MongooseDocument>(
  docQuery: Query<ResultType, EnforceDocument<Document, {}>>,
  executeImmediately: false
): LazyQueryWrapper<ResultType, Document>
export function queryWrapper<ResultType, Document extends MongooseDocument>(
  docQuery: Query<ResultType, EnforceDocument<Document, {}>>,
  executeImmediately: true
): Promise<ResultType>
export function queryWrapper<ResultType, Document extends MongooseDocument>(
  docQuery: Query<ResultType, EnforceDocument<Document, {}>>,
  executeImmediately: boolean
): typeof executeImmediately extends false
  ? LazyQueryWrapper<ResultType, Document>
  : Promise<ResultType>
export function queryWrapper<
  ResultType,
  Document extends MongooseDocument,
  Execute extends boolean
>(
  docQuery: Query<ResultType, EnforceDocument<Document, {}>>,
  executeImmediately: boolean
): Execute extends true
  ? Promise<ResultType>
  : LazyQueryWrapper<ResultType, Document>
export function queryWrapper<ResultType, Document extends MongooseDocument>(
  docQuery: Query<ResultType, EnforceDocument<Document, {}>>,
  executeImmediately: boolean = true
): QueryWrapper<ResultType, Document> {
  if (executeImmediately) return docQuery.exec()

  function wrapper(options: { execute: true }): Promise<ResultType>
  function wrapper(options: {
    execute: false
  }): Query<ResultType, EnforceDocument<Document, {}>>
  function wrapper(options: {}): Promise<ResultType>
  function wrapper(): Promise<ResultType>
  function wrapper(options: QueryWrapperOptions = {}) {
    // destructure options
    const { execute = true } = options

    if (execute === false) return docQuery
    else return docQuery.exec()
  }

  return wrapper
}

interface GetDocsCountByQueryOptions {
  executeImmediately?: boolean
}

/**
 * Counts multiple documents by Query
 * @param Model the document model to be counted (curried)
 * @param filterQuery a filter query to select the documents to be counted
 * @param options.executeImmediately whether or not to execute the query immediately. default: true
 * @returns a query that results in a number
 */

export const getDocsCountByQuery =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (filterQuery: FilterQuery<Document>) =>
  (options: GetDocsCountByQueryOptions = {}) => {
    // destructure options
    const { executeImmediately = true } = options

    return queryWrapper<number, Document, Execute>(
      Model.countDocuments(filterQuery),
      executeImmediately
    )
  }

interface GetDocsCountByBuiltQueryOptions {
  union?: boolean
  executeImmediately?: boolean
}

/**
 * Counts multiple documents by Built Query
 * @param Model the document model to be counted (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @param options.executeImmediately whether or not to execute the query immediately. default: true
 * @returns a query that results in a number
 */
export const getDocsCountByBuiltQuery =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (filterFields: { [key: string]: any }) =>
  (options: GetDocsCountByBuiltQueryOptions = {}) => {
    // destructure options
    const { union = false, executeImmediately = true } = options

    return queryWrapper<number, Document, Execute>(
      Model.countDocuments(generateFilterQuery(filterFields, { union })),
      executeImmediately
    )
  }

interface GetDocByIdOptions {
  executeImmediately?: boolean
}

/**
 * Finds a single document by ID
 * @param Model the document model to be found (curried)
 * @param id the id of the document to be found
 * @param options.executeImmediately whether or not to execute the query immediately. default: false
 * @returns a query that results in a single document or null if not found
 */
export const getDocById =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (id: string, options: GetDocByIdOptions = {}) => {
    // destructure options
    const { executeImmediately = true } = options
    return queryWrapper<Document | null, Document, Execute>(
      Model.findById(id),
      executeImmediately
    )
  }

interface GetDocByQueryOptions {
  executeImmediately?: boolean
}

/**
 * Finds a single document by ID
 * @param Model the document model to be found (curried)
 * @param filterQuery a filter query to select the documents to be found (curried)
 * @param options.executeImmediately whether or not to execute the query immediately. default: true
 * @returns a query that results in a single document or null if not found
 */
export const getDocByQuery =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (filterQuery: FilterQuery<Document>) =>
  (options: GetDocByQueryOptions = {}) => {
    // destructure options
    const { executeImmediately = true } = options

    return queryWrapper<Document | null, Document, Execute>(
      Model.findOne(filterQuery),
      executeImmediately
    )
  }

interface GetDocByBuiltQueryOptions {
  union?: boolean
  executeImmediately?: boolean
}

/**
 * Finds a single document by ID
 * @param Model the document model to be found (curried)
 * @param filterFields  a filter query to select the documents to be found (curried)
 * @param options.executeImmediately whether or not to execute the query immediately. default: true
 * @returns a query that results in a single document or null if not found
 */
export const GetDocByBuiltQuery =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (filterFields: { [key: string]: any }) =>
  (options: GetDocByBuiltQueryOptions = {}) => {
    // destructure options
    const { union = false, executeImmediately = true } = options

    return getDocByQuery<Document, Execute>(Model)(
      generateFilterQuery<Document>(filterFields, { union })
    )({ executeImmediately })
  }

interface GetDocsByQueryOptions {
  maxOperations?: number
  executeImmediately?: boolean
}

/**
 * Finds multiple documents by Query
 * @param Model the document model to be found (curried)
 * @param filterQuery a filter query to select the documents to be found (curried)
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @param options.executeImmediately whether or not to execute the query immediately. default: true
 * @returns a function that will return a query
 */
export const getDocsByQuery =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (filterQuery: FilterQuery<Document>) =>
  async (options: GetDocsByQueryOptions = {}) => {
    // destructure options
    const { maxOperations = Infinity, executeImmediately = true } = options

    await checkMax(Model, maxOperations, "get", filterQuery)

    return queryWrapper<Document[], Document, Execute>(
      Model.find(filterQuery),
      executeImmediately
    )
  }

interface GetDocsByBuiltQueryOptions {
  maxOperations?: number
  union?: boolean
  executeImmediately?: boolean
}

/**
 *Finds multiple documents by Built Query
 * @param Model the document model to be found (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @param options.executeImmediately whether or not to execute the query immediately. default: true
 * @returns a function that will return a query
 */
export const getDocsByBuiltQuery =
  <Document extends MongooseDocument, Execute extends boolean>(
    Model: MongooseModel<Document>
  ) =>
  (filterFields: { [key: string]: any }) =>
  async (options: GetDocsByBuiltQueryOptions = {}) => {
    // destructure options
    const {
      maxOperations = Infinity,
      union = false,
      executeImmediately = true
    } = options

    return await getDocsByQuery<Document, Execute>(Model)(
      generateFilterQuery<Document>(filterFields, { union })
    )({ maxOperations, executeImmediately })
  }

/**
 * =====================================================================
 * =====================================================================
 *
 * Paginate Document Wrappers:
 * - getDocsByQueryPaginate()
 * - getDocsByBuiltQueryPaginate()
 *
 * =====================================================================
 * =====================================================================
 */

export interface PaginationResults {
  total: number
  hasMore: boolean
  limit: number
  cursor: string
}

interface GetDocsByQueryPaginateOptions {
  cursor?: string
  limit?: number
  sortFields?: string[]
  maxOperations?: number
}

/**
 * Finds multiple documents by Query and paginates them
 * @param Model the document model to be found (curried)
 * @param filterQuery a filter query to select the documents to be found (curried)
 * @param options.cursor an encrypted string that allows one to select the next batch of documents if necessary. default: ""
 * @param options.limit a limit to the number of documents per page. default: Infinity
 * @param options.sortFields a list of sort fields. + and - dictate ascending and descending respectively. default: ["+_id"]
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @returns a list of documents with limit, cursor, and total information, and also whether or not there's more
 */
export const getDocsByQueryPaginate =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterQuery: FilterQuery<Document>) =>
  async (
    options: GetDocsByQueryPaginateOptions = {}
  ): Promise<PaginationResults & { data: Document[] }> => {
    //destructure options
    const {
      cursor = "",
      limit = Infinity,
      sortFields = ["+_id"],
      maxOperations = Infinity
    } = options

    // check limit
    if (limit > maxOperations) throw Error(`limit must be <= ${maxOperations}.`)
    else if (limit <= 0) throw Error(`limit must be more than 0.`)
    else if (!Number.isInteger(limit)) throw Error(`limit must be an integer.`)

    // calculate total
    const total = await getDocsCountByQuery<Document, true>(Model)(
      filterQuery
    )()

    // generate a sort query
    const sortQuery = generateSortQuery(sortFields)

    // generate a document query
    let docQuery = (
      await getDocsByQuery<Document, false>(Model)(filterQuery)({
        maxOperations,
        executeImmediately: false
      })
    )({ execute: false })

    // sort the document query
    docQuery = docQuery.sort(sortQuery)

    // if cursor is included, add it to the document query
    if (cursor) {
      const decryptedCursor = decrypt(cursor)
      docQuery = docQuery.where(decryptedCursor)
    }

    // query data, add 1 to easily allow hasMore calculation
    const data = await queryWrapper(docQuery.limit(limit + 1), true)

    // calculate hasMore and initialize cursor
    const hasMore = data.length > limit
    let nextCursor = cursor

    // if there is more, remove last element and calculate cursor
    if (hasMore) {
      data.pop()
      const lastDocument = data[data.length - 1]
      nextCursor = encrypt(generateCursor(lastDocument, sortQuery))
    }

    return {
      data,
      total,
      hasMore,
      limit,
      cursor: nextCursor
    }
  }

interface GetDocsByBuiltQueryPaginateOptions {
  union?: boolean
  cursor?: string
  limit?: number
  sortFields?: string[]
  maxOperations?: number
}

/**
 * Finds multiple documents by Built Query and paginates them
 * @param Model the document model to be found (curried)
 * @param filterFields an object containing filters with optional operators (curried). Example: { _id[in]: ["id1", "id2"]}
 * @param options.union whether or not the filters should be the union of all or the intersection. default: false
 * @param options.cursor an encrypted string that allows one to select the next batch of documents if necessary. default: ""
 * @param options.limit a limit to the number of documents per page. default: Infinity
 * @param options.sortFields a list of sort fields. + and - dictate ascending and descending respectively. default: ["+_id"]
 * @param options.maxOperations the max operations before an error is thrown. default: Infinity
 * @returns a list of documents with limit, cursor, and total information, and also whether or not there's more
 */
export const getDocsByBuiltQueryPaginate =
  <Document extends MongooseDocument>(Model: MongooseModel<Document>) =>
  (filterFields: { [key: string]: any }) =>
  async (
    options: GetDocsByBuiltQueryPaginateOptions
  ): Promise<PaginationResults & { data: Document[] }> => {
    //destructure options
    const {
      union = false,
      cursor = "",
      limit = Infinity,
      sortFields = ["+_id"],
      maxOperations = Infinity
    } = options

    return await getDocsByQueryPaginate<Document>(Model)(
      generateFilterQuery<Document>(filterFields, { union })
    )({
      cursor,
      limit,
      sortFields,
      maxOperations
    })
  }

/**
 * =====================================================================
 * =====================================================================
 *
 * Miscellaneous Document Wrappers:
 * - populateDocs()
 * - checkMax()
 *
 * =====================================================================
 * =====================================================================
 */

/**
 * Changes refs into actual populated documents
 * @param docs the documents that need to be populated
 * @param populate the populate string. Example: "author stories"
 * @returns a list of documents that have been populated
 */
export const populateDocs = async <Document extends MongooseDocument>(
  docs: Document | Document[],
  populate: string
): Promise<Document[]> => {
  if (!Array.isArray(docs)) docs = [docs]
  return await pluralizer(
    async (doc: Document) => await doc.populate(populate).execPopulate()
  )(docs)
}

/**
 * Check the maximum number of operations
 * @param maxOperations the maximum number of operations before erroring
 * @param operation the name of the operation to put in the error message
 * @param filterQuery the filter query to get a proper count
 */
export const checkMax = async <Document extends MongooseDocument>(
  Model: MongooseModel<Document>,
  maxOperations: number,
  operation: string,
  filterQuery: number | FilterQuery<Document>
) => {
  const countQuery =
    typeof filterQuery === "number"
      ? filterQuery
      : await getDocsCountByQuery<Document, true>(Model)(filterQuery)()

  const count = maxOperations === Infinity || countQuery

  if (count !== true && count > maxOperations)
    throw Error(`You can only ${operation} up to ${maxOperations} at a time.`)
}
