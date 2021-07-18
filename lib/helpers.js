export const pluralizer = (func) => {
  return async (elements) => {
    return await Promise.all(
      elements.map(async (element) => {
        return await func(element)
      })
    )
  }
}

export const createDoc = async ({ Model, fields }) => {
  return await Model.create(fields)
}

export const createDocs = async ({ Model, documents }) => {
  return await Model.insertMany(documents)
}

export const updateDoc = async ({ Model, id, fields }) => {
  return await Model.findByIdAndUpdate(id, fields, {
    returnOriginal: false,
    omitUndefined: true
  })
}

export const updateDocs = async ({ Model, query, fields }) => {
  return await Model.updateMany(query, fields, {
    returnOriginal: false,
    omitUndefined: true
  })
}

export const updateDocsByTag = async ({ Model, tags, fields }) => {
  return await updateDocs({
    Model,
    fields,
    query: {
      tags: {
        $all: tags
      }
    }
  })
}

export const deleteDoc = async ({ Model, id }) => {
  return await Model.findByIdAndDelete(id)
}

export const deleteDocs = async ({ Model, query }) => {
  return await Model.deleteMany(query)
}

export const deleteDocsById = async ({ Model, ids }) => {
  return await deleteDocs({
    Model,
    query: {
      _id: {
        $in: ids
      }
    }
  })
}

export const getDoc = async ({ Model, id, populate = [] }) => {
  return await Model.findById(id).populate(...populate)
}

export const getDocByQuery = async ({ Model, query, populate = [] }) => {
  return await Model.findOne(query).populate(...populate)
}

export const getDocsPagination = async ({
  Model,
  populate = [],
  query = {},
  requestedPageSize = 50,
  requestedPage = 1
}) => {
  const pageSize = requestedPageSize > 100 ? 100 : requestedPageSize
  const total = await Model.countDocuments(query)
  const totalPages = Math.ceil(total / pageSize)
  const page = requestedPage > totalPages ? totalPages : requestedPage

  const documents = await Model.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .sort({ updatedAt: -1 })
    .populate(...populate)

  return {
    pageSize: documents.length,
    page,
    totalPages,
    total,
    results: documents
  }
}

export const getDocs = async ({ Model, populate = [], query = {} }) => {
  const total = await Model.countDocuments(query)
  const documents = await Model.find(query)
    .sort({ updatedAt: -1 })
    .populate(...populate)

  return {
    total,
    results: documents
  }
}

export const getDocsByTagPagination = async ({
  Model,
  tags = [],
  populate = [],
  requestedPageSize,
  requestedPage
}) => {
  return await getDocsPagination({
    Model,
    query: {
      tags: {
        $in: tags
      }
    },
    populate,
    requestedPageSize,
    requestedPage
  })
}

export const getDocsByTag = async ({ Model, populate = [], tags = [] }) => {
  return await getDocs({
    Model,
    populate,
    query: {
      tags: {
        $in: tags
      }
    }
  })
}

export const getField = async ({ Model, id, field }) => {
  return (await getDoc({ Model, id }))[field]
}

export const getFieldByQuery = async ({ Model, query, field }) => {
  return (await getDocByQuery({ Model, query }))[field]
}

export const getFields = pluralizer(getField)

export const getFieldsDistinct = async ({ Model, field, query = {} }) => {
  return await Model.find(query).distinct(field)
}
