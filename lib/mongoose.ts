/* global process, global */

import mongoose, { Mongoose } from "mongoose"

declare module globalThis {
  let mongoose: {
    connection?: Mongoose
    promise?: Promise<Mongoose>
  }
}

const MONGODB_URI = String(process.env.MONGODB_URI)

if (!MONGODB_URI)
  throw new Error("please define the MONGODB_URI environment variable")

// create a global connection so only 1 connection is ever created
let cache = globalThis.mongoose
if (!cache) {
  globalThis.mongoose = { connection: undefined, promise: undefined }
  cache = globalThis.mongoose
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
