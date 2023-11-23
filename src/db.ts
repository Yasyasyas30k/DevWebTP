import { JSONFile } from "lowdb/node"
import { Data } from "./types"
import { Low } from "lowdb"

const defaultData: Data = { users: [], courses: [], students_courses: [] }
const adapter = new JSONFile<Data>('db.json')
const db = new Low(adapter, defaultData)

export default db