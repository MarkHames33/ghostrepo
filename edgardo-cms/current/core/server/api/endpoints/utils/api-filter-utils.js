"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdminApiBulkFilterTransformer = exports.rejectAdminApiRestrictedFieldsTransformer = exports.rejectNewslettersContentApiRestrictedFieldsTransformer = exports.rejectPagesContentApiRestrictedFieldsTransformer = exports.rejectPostsContentApiRestrictedFieldsTransformer = exports.rejectTagsContentApiRestrictedFieldsTransformer = exports.rejectAuthorsContentApiRestrictedFieldsTransformer = exports.rejectContentApiRestrictedFieldsTransformer = void 0;
exports.rejectAuthorsRestrictedOrderFields = rejectAuthorsRestrictedOrderFields;
exports.rejectTagsRestrictedOrderFields = rejectTagsRestrictedOrderFields;
exports.rejectPostsContentApiRestrictedOrderFields = rejectPostsContentApiRestrictedOrderFields;
exports.rejectPagesContentApiRestrictedOrderFields = rejectPagesContentApiRestrictedOrderFields;
exports.rejectNewslettersContentApiRestrictedOrderFields = rejectNewslettersContentApiRestrictedOrderFields;
const errors_1 = __importDefault(require("@tryghost/errors"));
const mongo_utils_1 = require("@tryghost/mongo-utils");
const schema = require('../../../data/schema').tables;
// Never filterable or orderable through the Content API, on any resource or relation.
const CONTENT_API_RESTRICTED_FIELDS = new Set([
    'password',
    'email',
    'email_only',
    'html',
    'lexical',
    'locale',
    'mobiledoc',
    'newsletter_id',
    'plaintext',
    'email_recipient_filter',
    'published_by',
]);
const CONTENT_API_RESTRICTED_RELATIONS = new Set(['mobiledoc_revisions', 'post_revisions']);
const CONTENT_API_PAGE_RESTRICTED_FIELDS = new Set(['email_subject']);
const CONTENT_API_POST_RESTRICTED_FIELDS = new Set(['show_title_and_feature_image']);
const CONTENT_API_NEWSLETTER_FIELDS = new Set([
    'id',
    'uuid',
    'name',
    'description',
    'slug',
    'sender_email',
    'subscribe_on_signup',
    'visibility',
    'sort_order',
    'created_at',
    'updated_at',
]);
// User fields and relations the Content API does not expose: blocked as bare fields on authors and via author relations elsewhere.
// Not blocked as bare fields on other resources, where visibility/status are legitimate filters.
const CONTENT_API_USER_RESTRICTED_FIELDS = new Set([
    'status',
    'last_seen',
    'created_at',
    'updated_at',
    'roles',
    'roles_users',
    'visibility',
    'locale',
    'accessibility',
    'paid_subscription_started_notification',
    'paid_subscription_canceled_notification',
    'tour',
    'comment_notifications',
    'recommendation_notifications',
    'gift_subscription_notifications',
    'mention_notifications',
    'donation_notifications',
    'milestone_notifications',
    'free_member_signup_notification',
]);
const CONTENT_API_AUTHOR_RELATIONS = new Set(['author', 'authors', 'primary_author']);
const CONTENT_API_TAG_RESTRICTED_FIELDS = new Set([
    'created_at',
    'updated_at',
    'parent_id',
    'parent',
]);
const CONTENT_API_TAG_RELATIONS = new Set(['tag', 'tags', 'primary_tag']);
const ADMIN_API_RESTRICTED_FIELDS = new Set(['password']);
function getOrderAttributes(tableName) {
    return Object.keys(schema[tableName])
        .map((field) => `${tableName}.${field}`)
        .filter((field) => !field.includes('@@'));
}
const CONTENT_API_AUTHOR_ORDER_ATTRIBUTES = getOrderAttributes('users');
const CONTENT_API_TAG_ORDER_ATTRIBUTES = getOrderAttributes('tags');
const CONTENT_API_NEWSLETTER_ORDER_ATTRIBUTES = getOrderAttributes('newsletters');
const CONTENT_API_POST_ORDER_ATTRIBUTES = [
    ...getOrderAttributes('posts'),
    ...getOrderAttributes('posts_meta').filter((field) => !['posts_meta.id', 'posts_meta.post_id'].includes(field)),
];
function hasRestrictedSegment(key, fields) {
    return key
        .toLowerCase()
        .split('.')
        .some((segment) => fields.has(segment));
}
function hasRestrictedUserSegment(key) {
    const segments = key.toLowerCase().split('.');
    return segments.some((segment, index) => index > 0 &&
        CONTENT_API_AUTHOR_RELATIONS.has(segments[index - 1]) &&
        CONTENT_API_USER_RESTRICTED_FIELDS.has(segment));
}
function hasRestrictedTagSegment(key) {
    const segments = key.toLowerCase().split('.');
    return segments.some((segment, index) => index > 0 &&
        CONTENT_API_TAG_RELATIONS.has(segments[index - 1]) &&
        CONTENT_API_TAG_RESTRICTED_FIELDS.has(segment));
}
function isContentApiRestrictedKey(key) {
    return (hasRestrictedSegment(key, CONTENT_API_RESTRICTED_FIELDS) ||
        hasRestrictedSegment(key, CONTENT_API_RESTRICTED_RELATIONS) ||
        hasRestrictedUserSegment(key) ||
        hasRestrictedTagSegment(key));
}
function isAuthorsContentApiRestrictedKey(key) {
    return (isContentApiRestrictedKey(key) || hasRestrictedSegment(key, CONTENT_API_USER_RESTRICTED_FIELDS));
}
function isTagsContentApiRestrictedKey(key) {
    return (isContentApiRestrictedKey(key) || hasRestrictedSegment(key, CONTENT_API_TAG_RESTRICTED_FIELDS));
}
function isPostsContentApiRestrictedKey(key) {
    return (isContentApiRestrictedKey(key) || hasRestrictedSegment(key, CONTENT_API_POST_RESTRICTED_FIELDS));
}
function isPagesContentApiRestrictedKey(key) {
    return (isContentApiRestrictedKey(key) || hasRestrictedSegment(key, CONTENT_API_PAGE_RESTRICTED_FIELDS));
}
function isNewslettersContentApiRestrictedKey(key) {
    const normalizedKey = key.toLowerCase();
    const fieldKey = normalizedKey.startsWith('newsletters.')
        ? normalizedKey.slice('newsletters.'.length)
        : normalizedKey;
    return !CONTENT_API_NEWSLETTER_FIELDS.has(fieldKey);
}
function rejectRestrictedOrderFields(order, orderAttributes, isRestricted) {
    if (!order) {
        return order;
    }
    const allowedClauses = (Array.isArray(order) ? order : [order])
        .flatMap((value) => value.split(','))
        .map((clause) => clause.trim())
        .filter(Boolean)
        .filter((clause) => {
        const [field] = clause.split(/\s+/);
        const normalizedField = field.toLowerCase();
        const resolvedField = orderAttributes.find((orderAttribute) => orderAttribute.endsWith(normalizedField)) ||
            normalizedField;
        return !isRestricted(resolvedField);
    });
    return allowedClauses.length ? allowedClauses.join(',') : undefined;
}
const rejectContentApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, isContentApiRestrictedKey);
};
exports.rejectContentApiRestrictedFieldsTransformer = rejectContentApiRestrictedFieldsTransformer;
const rejectAuthorsContentApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, isAuthorsContentApiRestrictedKey);
};
exports.rejectAuthorsContentApiRestrictedFieldsTransformer = rejectAuthorsContentApiRestrictedFieldsTransformer;
const rejectTagsContentApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, isTagsContentApiRestrictedKey);
};
exports.rejectTagsContentApiRestrictedFieldsTransformer = rejectTagsContentApiRestrictedFieldsTransformer;
const rejectPostsContentApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, isPostsContentApiRestrictedKey);
};
exports.rejectPostsContentApiRestrictedFieldsTransformer = rejectPostsContentApiRestrictedFieldsTransformer;
const rejectPagesContentApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, isPagesContentApiRestrictedKey);
};
exports.rejectPagesContentApiRestrictedFieldsTransformer = rejectPagesContentApiRestrictedFieldsTransformer;
const rejectNewslettersContentApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, isNewslettersContentApiRestrictedKey);
};
exports.rejectNewslettersContentApiRestrictedFieldsTransformer = rejectNewslettersContentApiRestrictedFieldsTransformer;
const rejectAdminApiRestrictedFieldsTransformer = (input) => {
    return (0, mongo_utils_1.rejectStatements)(input, (key) => hasRestrictedSegment(key, ADMIN_API_RESTRICTED_FIELDS));
};
exports.rejectAdminApiRestrictedFieldsTransformer = rejectAdminApiRestrictedFieldsTransformer;
const validateAdminApiBulkFilterTransformer = (input) => {
    const restrictedField = (0, mongo_utils_1.getUsedKeys)(input).find((key) => hasRestrictedSegment(key, ADMIN_API_RESTRICTED_FIELDS));
    if (restrictedField) {
        throw new errors_1.default.BadRequestError({
            message: 'Restricted fields cannot be used in bulk operation filters.',
        });
    }
    return input;
};
exports.validateAdminApiBulkFilterTransformer = validateAdminApiBulkFilterTransformer;
function rejectAuthorsRestrictedOrderFields(order) {
    return rejectRestrictedOrderFields(order, CONTENT_API_AUTHOR_ORDER_ATTRIBUTES, isAuthorsContentApiRestrictedKey);
}
function rejectTagsRestrictedOrderFields(order) {
    return rejectRestrictedOrderFields(order, CONTENT_API_TAG_ORDER_ATTRIBUTES, isTagsContentApiRestrictedKey);
}
function rejectPostsContentApiRestrictedOrderFields(order) {
    return rejectRestrictedOrderFields(order, CONTENT_API_POST_ORDER_ATTRIBUTES, isPostsContentApiRestrictedKey);
}
function rejectPagesContentApiRestrictedOrderFields(order) {
    return rejectRestrictedOrderFields(order, CONTENT_API_POST_ORDER_ATTRIBUTES, isPagesContentApiRestrictedKey);
}
function rejectNewslettersContentApiRestrictedOrderFields(order) {
    return rejectRestrictedOrderFields(order, CONTENT_API_NEWSLETTER_ORDER_ATTRIBUTES, isNewslettersContentApiRestrictedKey);
}
