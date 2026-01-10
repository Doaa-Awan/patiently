/**
 * @typedef {'patient' | 'caregiver' | null} UserRole
 */

/**
 * @typedef {1|2|3|4|5|6|7|8|9|10} SeverityLevel
 */

/**
 * @typedef {
 *  'Pain' |
 *  'Fatigue' |
 *  'Nausea' |
 *  'Headache' |
 *  'Dizziness' |
 *  'Sleep Issues' |
 *  'Appetite Changes' |
 *  'Mood Changes' |
 *  'Breathing' |
 *  'Other'
 * } SymptomCategory
 */

/**
 * @typedef {Object} SymptomEntry
 * @property {string} id
 * @property {string} date        ISO string
 * @property {string} description
 * @property {SeverityLevel} severity
 * @property {SymptomCategory} category
 * @property {'patient' | 'caregiver'} userRole
 * @property {number} createdAt   timestamp
 */

/**
 * @typedef {Object} DailySummary
 * @property {string} date
 * @property {SymptomEntry[]} entries
 */

export {};
