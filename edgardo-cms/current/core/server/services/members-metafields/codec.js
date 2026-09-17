"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metafieldCodec = void 0;
const zod_1 = require("zod");
const identity_1 = require("@tryghost/metafield-types/identity");
const case_keys_1 = require("../../lib/case-keys");
const schema_1 = require("./schema");
const models_1 = require("./models");
exports.metafieldCodec = zod_1.z.codec(schema_1.DbMetafield, models_1.Metafield, {
    // DbMetafield validates `type` as the field-type enum, so the decoded row
    // already carries a FieldType and camelKeys preserves it — no cast needed.
    decode: (row) => ({ ...(0, case_keys_1.camelKeys)(row), namespace: identity_1.CUSTOM_NAMESPACE }),
    encode: ({ namespace: _namespace, ...field }) => (0, case_keys_1.snakeKeys)(field),
});
