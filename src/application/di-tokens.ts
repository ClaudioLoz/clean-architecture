/**
 * ARCHITECTURAL CONFLICT: This violates pure Clean Architecture theory.
 * Application layer should be framework-agnostic, but NestJS DI requires
 * framework-specific tokens and @Inject decorators in use cases.
 *
 * FRAMEWORK CONSTRAINT: TypeScript interfaces disappear at runtime,
 * so we need string tokens for NestJS DI.
 *
 * LOCATION DECISION: These tokens could stay in infrastructure layer,
 * but that would require use cases (application) to import from infrastructure,
 * which violates the dependency rule more severely than framework coupling.
 * Lesser of two evils: Accept framework coupling vs wrong dependency direction.
 *
 * ALTERNATIVE: Proxy/factory pattern in infrastructure layer
 * for pure Clean Architecture (no @Inject decorators in application).
 *
 * DECISION: Accept only this NestJS framework coupling for simplicity of the technical test.
 */

export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY';
export const PASSWORD_SERVICE_TOKEN = 'PASSWORD_SERVICE';
export const EVENT_PUBLISHER_TOKEN = 'EVENT_PUBLISHER';
export const ID_GENERATOR_TOKEN = 'ID_GENERATOR';
