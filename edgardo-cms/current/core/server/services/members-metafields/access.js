"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERNAL = exports.MEMBERS = exports.ADMIN = void 0;
exports.readableFields = readableFields;
exports.canWrite = canWrite;
exports.ADMIN = { entry: 'admin' };
exports.MEMBERS = { entry: 'members' };
exports.INTERNAL = { entry: 'internal' };
/**
 * Which of the site's fields this audience may see.
 *
 * Every field, whichever door they came through. Written as a function rather than
 * left unwritten so that when a publisher can mark a field as staff only, one
 * function changes and every caller is already asking.
 */
function readableFields(_audience, fields) {
    return fields;
}
/**
 * Whether this audience may write this field.
 *
 * Also total today. Kept separate from `readableFields` because the asymmetry to
 * expect is a field a member may read but not change, which one combined
 * permission could not express.
 */
function canWrite(_audience, _field) {
    return true;
}
