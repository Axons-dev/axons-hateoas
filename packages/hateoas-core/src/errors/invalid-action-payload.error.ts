export class InvalidActionPayloadError extends Error {
  constructor(actionName: string, missingFields: string[]) {
    super(
      `Invalid payload for action "${actionName}". Missing required fields: ${missingFields.join(', ')}`,
    );
    this.name = 'InvalidActionPayloadError';
  }
}
