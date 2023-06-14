

import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

const __dirname = dirname(fileURLToPath(import.meta.url))

const file = join(__dirname, "db.json")

let cached = global.lowDb

if (!cached) {
  cached = global.lowDb = { conn: null }
}

export async function dbConnect() {
  if (!cached.conn) {
    const adapter = new JSONFile(file)
    const defaultData = { messageHistory: [] }
    const db = new Low(adapter, defaultData)
    cached.conn = db
    console.log("DB INIT!")
  }

  await cached.conn.read()
  cached.conn.data ||= {messageHistory: {}}

  return cached.conn
}