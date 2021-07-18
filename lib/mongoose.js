/* global process, global */

import mongoose from "mongoose"

const { MONGODB_URI } = process.env

if (!MONGODB_URI)
  throw new Error("please define the MONGODB_URI environment variable")

// create a global connection so only 1 connection is ever created
let cache = global.mongoose
if (!cache) {
  global.mongoose = { connection: null, promise: null }
  cache = global.mongoose
}

export async function connectToDatabase() {
  // return connection if it exists
  if (cache.connection) return cache.connection

  // define an awaiting connection if not already defined
  if (!cache.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useFindAndModify: false,
      useCreateIndex: true
    }

    cache.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose)
  }

  // await connection until it is resolved
  cache.connection = await cache.promise

  // return the new connection
  return cache.connection
}
