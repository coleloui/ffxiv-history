/**
 * Casts a value to a specific variable type
 *
 * @param {*} val
 * @returns {*}
 */
function _cast(val: string | number) {
  // Cast Numbers
  if (!Number.isNaN(+val)) return +val

  // Format Strings
  if (typeof val === 'string') return val.toLowerCase()

  // Default
  return val
}

// /**
//  * @param {Array} fields
//  * @param {*} a
//  * @param {*} b
//  * @returns {number}
//  */
// function _sort(fields: Array<>, a: string, b: string) {
//   for (let i = 0; i < fields.length; i += 1) {
//     const [fieldA, fieldB] = [
//       getObjValue(a, fields[i].field),
//       getObjValue(b, fields[i].field),
//     ]
//     const [dataA, dataB] = [_cast(fieldA), _cast(fieldB)]

//     if (dataA > dataB) return fields[i].dir
//     if (dataA < dataB) return -fields[i].dir
//   }

//   return 0
// }

/**
 * Creates a unique version of the passed array
 *
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqify(arr: Array<string | number>) {
  return [...new Set(arr)]
}

/**
 * Capitalizes the first character of a String
 *
 * @param {string} str - The string
 * @returns {string}
 */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Camelcases a string
 *
 * @param {string} str
 * @param {string} [delimiter]
 * @returns {string}
 */
export function camelCasify(str = '', delimiter = '-') {
  return str
    .split(delimiter)
    .map((part, i) => (i === 0 ? part : capitalize(part)))
    .join('')
}

/**
 * Converts a number representing elapsed time to a string
 *
 * @param {number} t
 * @returns {string}
 */
export function convertTimeNumberToString(t: number) {
  if (!t) return '00:00'

  const d = new Date(t * 1000).toISOString()
  return t >= 3600 ? d.slice(11, -5) : d.slice(14, -5)
}

// /**
//  * Converts a string representing time to a number
//  *
//  * @param {string} t
//  * @returns {number}
//  */
// export function convertTimeStringToDuration(t: string) {
//   if (t === undefined) return 0

//   const timeParts: Array<string> = t.toString().split(':') | [" "]
//   let s = 0
//   let m = 1

//   // Add up the time
//   // Entries with no colon returns in seconds
//   // Adds up to days correctly
//   while (timeParts.length) {
//     s += m * +timeParts.pop()
//     m *= 60
//   }

//   // Return seconds
//   return Number.isInteger(s) ? s : 0
// }

/**
 * Compares member view to admin status
 *
 * @param {object} opts
 * @param {boolean} opts.admin
 * @param {object} opts.project
 * @param {object} opts.member
 * @returns {boolean}
 */
export function isManager(opts: {
  admin: boolean
  project: { managers: Array<number> }
}) {
  //  Admins are by default Managers
  return opts.admin
    ? true
    : opts.project.managers.some((m) => m === getObjValue(opts, 'member.id'))
}

// /**
//  * Creates a slug of the string
//  *
//  * @param {string} str
//  * @param {object} [opts]
//  * @param {boolean} [opts.lower]
//  * @param {RegExp} [opts.remove]
//  * @param {boolean} [opts.strict]
//  * @returns {string}
//  */
// export function slugify(str, opts = {}) {
//   return _slugify(str, {
//     lower: true,
//     remove: /[*,+~()'"!:@]/g,
//     strict: false,
//     ...opts,
//   })
// }

// /**
//  * The multi field sorting algorithm for state
//  *
//  * @param {Array} arr
//  * @param {Array} [sortFields]
//  * @returns {Array}
//  */
// export function sort(arr, sortFields = ['sort']) {
//   // Requires both entries and sorting fields
//   if (!arr.length) return arr
//   if (!sortFields || !sortFields.length) return arr

//   // Save the fields and their direction significance
//   const fields = sortFields.map((o) => ({
//     dir: o[0] === '-' ? -1 : 1,
//     field: o[0] === '-' ? o.substring(1) : o,
//   }))

//   // Sort the array
//   return arr.sort(_sort.bind(this, fields))
// }

/**
 * Creates an object of dot notational paths
 *
 * @param {object} obj The object to deconstruct
 * @param {Function} fn
 * @param {string} [path] The original prefix to start the dot notation
 * @param {boolean} [recursed] = false
 * @returns {*}
 */
export function getObjPaths(obj: object, fn, path = '', recursed = false) {
  if (!recursed && (typeof obj).toLowerCase() !== 'object') {
    return fn(null, obj)
  }

  Object.entries(obj || {}).forEach(([key, val]) => {
    const _key = path.length ? [path, key].join('.') : key
    const arrayCheck = Array.isArray(val)
    const mongooseCheck = getObjValue(val, '_bsontype') || false
    const nullCheck = val === null
    const objectCheck = (typeof val).toLowerCase() !== 'object'

    // Do not recurse upon primitive objects
    // Do not recurse upon Arrays
    // Do not recurse upon Mongoose ObjectIDs
    if (
      objectCheck ||
      arrayCheck ||
      mongooseCheck ||
      nullCheck ||
      (!nullCheck && !Object.keys(val).length)
    ) {
      return fn(_key, val)
    }

    // Recurse
    return getObjPaths(val, fn, _key, true)
  })

  return true
}

/**
 * Get the value of the path in an Object
 *
 * @param {object} obj The object to traverse
 * @param {string} _path The path to the value
 * @param {object} [opts] Additional options
 * @param {object} [opts.split=true]
 * @returns {*}
 */
export function getObjValue(obj = {}, _path = '', opts = { split: true }) {
  if (obj === undefined) return undefined

  // Do not alter if already the proper type
  let path = !Array.isArray(_path) ? undefined : _path

  if (path === undefined) {
    // Convert to an array
    path = opts.split ? _path.toString().split('.') : [_path.toString()]
  }

  // If the prop does not exist, return undefined
  // Otherwise, return the value
  return path.reduce((val, part) => {
    if (val?.[part] === undefined) return undefined
    return val[part]
  }, obj)
}

/**
 * Set the value of the path in an Object
 *
 * @param {object} obj The object to traverse
 * @param {Array | string} [_path] The path to the value
 * @param {*} val The value to store
 * @param {object} [opts] Additional options
 * @param {object} [opts.split=true]
 * @returns {object}
 */
export function setObjValue(
  obj = {},
  _path = [],
  val = undefined,
  opts = { split: true }
) {
  // Do not alter if already the proper type
  let path = !Array.isArray(_path) ? undefined : _path

  if (path === undefined) {
    // Convert to an array
    path = opts.split ? _path.toString().split('.') : [_path.toString()]
  }

  if (!path.length) {
    // Edge case: No path length. Just return
    return obj
  }
  if (path.length === 1) {
    // When there is no more depth to recurse, assign the value
    obj[path] = val
    return obj
  }

  // Get the prop
  const field = path.shift()

  if (field.includes('[')) {
    // Array, not an Object
    const [shortField, key] = field.match(/\w+\b/g)

    // If the prop does not exist, create it
    if (!Object.prototype.hasOwnProperty.call(obj, shortField))
      obj[shortField] = []

    // Instantiate the array index, if required
    if (!obj[shortField][key || 0]) obj[shortField][key || 0] = {}

    // Recurse
    obj[shortField][key] = setObjValue(obj[shortField][key], path, val)
  } else {
    // If the prop does not exist, create it
    if (!Object.prototype.hasOwnProperty.call(obj, field)) obj[field] = {}

    // Recurse
    obj[field] = setObjValue(obj[field], path, val)
  }

  return obj
}
