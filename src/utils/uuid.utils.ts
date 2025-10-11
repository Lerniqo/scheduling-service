import { createHash } from 'crypto';

/**
 * Generates a deterministic UUID v5-like string from any input string
 * This ensures that the same input string always produces the same UUID
 */
export function generateDeterministicUUID(input: string): string {
  // Create a hash of the input string
  const hash = createHash('sha256').update(input).digest('hex');
  
  // Format as UUID v4 (though it's deterministic, not random)
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20), // Variant bits
    hash.substring(20, 32)
  ].join('-');
  
  return uuid;
}

/**
 * Validates if a string is a valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Converts a string ID to UUID format
 * If already a UUID, returns as-is
 * If not, generates a deterministic UUID
 */
export function ensureUUID(id: string): string {
  if (isValidUUID(id)) {
    return id;
  }
  return generateDeterministicUUID(id);
}