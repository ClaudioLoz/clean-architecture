# Architecture Documentation

## Clean Architecture Implementation

This project implements Clean Architecture as defined by Robert C. Martin, with four distinct layers that follow the Dependency Rule: source code dependencies must point only inward, toward higher-level policies.

## Layer Structure

### 1. Domain Layer (Innermost)

**Location**: `src/domain/`

**Purpose**: Contains enterprise business rules and policies that are independent of any external concerns.

**Components**:
- **Entities** (`entities/`): Core business objects with business rules
- **Domain Services** (`services/`): Domain service interfaces
- **Repository Interfaces** (`repositories/`): Abstract contracts for data access
- **Service Interfaces** (`services/`): Abstract contracts for domain services
- **Domain Events** (`events/`): Events that represent important business occurrences
- **Events** (`events/`): Domain events for decoupled communication

**Dependencies**: None (completely independent)

**Example**:
```typescript
// User entity encapsulates business rules
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password?: string,
  ) {}

  hasPassword(): boolean {
    return !!this.password;
  }
}
```

### 2. Application Layer

**Location**: `src/application/`

**Purpose**: Contains application-specific business rules and orchestrates the flow of data between the domain and infrastructure layers.

**Components**:
- **Use Cases** (`use-cases/`): Application-specific business logic
- **Application Services** (`services/`): Coordinate domain objects and infrastructure
- **DTOs** (`dtos/`): Data transfer objects for application boundaries

**Dependencies**: Domain layer only

**Example**:
```typescript
// Use case orchestrates domain logic
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_SERVICE_TOKEN)
    private readonly passwordService: PasswordService,
    private readonly userEventService: UserEventService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Apply business rules
    const user = User.create(id, dto.username, dto.email);
    
    // Emit domain events
    this.eventPublisher.publish(USER_EVENTS.USER_CREATED, new UserCreatedEvent(user.id, user.username, user.email, false));
    
    return this.mapToResponse(user);
  }
}
```

### 3. Infrastructure Layer

**Location**: `src/infrastructure/`

**Purpose**: Implements interfaces defined by the domain layer and handles external concerns like databases, web services, etc.

**Components**:
- **Repository Implementations** (`database/`): Concrete implementations of domain repository interfaces
- **External Services** (`services/`): Third-party service integrations
- **Configuration** (`config/`): Infrastructure configuration

**Dependencies**: Domain and Application layers

**Example**:
```typescript
// Infrastructure implements domain interfaces
@Injectable()
export class FirebaseUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const userData = user.toPlainObject();
    await this.firestore.collection('users').doc(user.id).set(userData);
    return user;
  }
}

@Injectable()
export class PasswordServiceImpl implements PasswordService {
  generateSecurePassword(length: number = 12): string {
    // Implementation details...
  }
}
```

### 4. Presentation Layer

**Location**: `src/presentation/`

**Purpose**: Handles external communication, such as REST APIs, and translates external requests into application use cases.

**Components**:
- **Controllers** (`controllers/`): HTTP request handlers
- **DTOs** (`dtos/`): Request/response data structures
- **Middleware**: Request processing middleware

**Dependencies**: Application and Domain layers

**Example**:
```typescript
// Controller delegates to use cases
@Controller('users')
export class UserController {
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }
}
```

## Dependency Injection and Inversion

### Interface-Based Design

The application uses interfaces to define contracts between layers:

```typescript
// Domain defines the contract
export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Infrastructure implements the contract
@Injectable()
export class FirebaseUserRepository implements UserRepository {
  // Implementation details...
}

// NestJS wires them together using tokens from application
@Module({
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: FirebaseUserRepository,
    },
    {
      provide: PASSWORD_SERVICE_TOKEN,
      useClass: PasswordServiceImpl,
    },
  ],
})
export class InfrastructureModule {}
```

### Benefits

1. **Testability**: Easy to mock dependencies for unit testing
2. **Flexibility**: Can swap implementations without changing business logic
3. **Independence**: Domain layer remains pure and framework-agnostic

## Event-Driven Architecture

### Domain Events

Events represent important business occurrences and enable loose coupling:

```typescript
// Domain event
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly hasPassword: boolean,
  ) {}
}

// Event emission in use case
this.eventService.emitUserCreated(user.id, user.hasPassword());

// Event handling
@OnEvent(USER_EVENTS.USER_CREATED)
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  if (!event.hasPassword) {
    // Generate password automatically
  }
}
```

### Benefits

1. **Decoupling**: Components don't need direct references
2. **Extensibility**: Easy to add new event handlers
3. **Auditability**: Clear event trail for debugging

## Data Flow

### Request Flow

1. **HTTP Request** → `UserController`
2. **Validation** → DTO validation with class-validator
3. **Use Case Execution** → `CreateUserUseCase`
4. **Domain Logic** → Entity creation and validation
5. **Event Emission** → Domain events
6. **Repository Call** → Data persistence
7. **Response** → DTO mapping and HTTP response

### Event Flow

1. **Event Emission** → `UserEventService`
2. **Event Handling** → `EventHandlerService`
3. **Business Logic** → Password generation
4. **Repository Update** → User update with password

## Testing Strategy

### Unit Testing

Each layer is tested in isolation:

```typescript
// Domain entity testing
describe('User Entity', () => {
  it('should create user without password', () => {
    const user = User.create(id, username, email);
    expect(user.hasPassword()).toBe(false);
  });
});

// Use case testing with mocks
describe('CreateUserUseCase', () => {
  it('should create user and emit event', async () => {
    const mockRepository = { save: jest.fn() };
    const mockEventService = { emitUserCreated: jest.fn() };
    
    const useCase = new CreateUserUseCase(mockRepository, mockEventService);
    await useCase.execute(dto);
    
    expect(mockEventService.emitUserCreated).toHaveBeenCalled();
  });
});
```

### Integration Testing

Tests verify interaction between layers:

```typescript
describe('User API Integration', () => {
  it('should create user via HTTP', async () => {
    const response = await request(app)
      .post('/users')
      .send({ username: 'test', email: 'test@example.com' })
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
  });
});
```

## Security Architecture

### Password Security

- **Generation**: Cryptographically secure random passwords
- **Hashing**: bcrypt with configurable salt rounds
- **Validation**: Strength requirements enforced by domain rules

### Input Validation

- **DTO Validation**: class-validator at presentation layer
- **Domain Validation**: Value objects enforce business rules
- **Sanitization**: Automatic input sanitization

## Scalability Considerations

### Horizontal Scaling

- **Stateless Design**: No server-side session state
- **Event-Driven**: Natural fit for microservices
- **Database**: Firebase scales automatically

### Performance

- **Lazy Loading**: Dependencies injected only when needed
- **Caching**: Can be added at infrastructure layer
- **Async Operations**: Non-blocking I/O with promises

## Monitoring and Observability

### Logging

```typescript
// Structured logging in event handlers
@OnEvent(USER_EVENTS.USER_CREATED)
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  console.log(`User created: ${event.userId}`);
  // In production: use structured logging with correlation IDs
}
```

### Metrics

- **Domain Events**: Natural metric boundaries
- **Use Case Execution**: Business operation metrics
- **Repository Operations**: Database performance metrics

## Future Enhancements

### Potential Additions

1. **CQRS**: Separate read and write models
2. **Event Sourcing**: Store events as source of truth
3. **Saga Pattern**: Manage distributed transactions
4. **API Versioning**: Support multiple API versions
5. **Rate Limiting**: Prevent abuse
6. **Caching Layer**: Improve performance

### Migration Strategy

The clean architecture makes it easy to:

- **Change Databases**: Replace Firebase with PostgreSQL
- **Add Features**: New use cases and event handlers
- **Modify Business Rules**: Update domain entities
- **Switch Frameworks**: Replace NestJS with Express

## Conclusion

This Clean Architecture implementation provides:

- **Maintainability**: Clear separation of concerns
- **Testability**: Easy to unit test all layers
- **Flexibility**: Easy to change implementation details
- **Scalability**: Natural fit for distributed systems

The architecture follows established patterns and best practices while remaining pragmatic and focused on business value. 