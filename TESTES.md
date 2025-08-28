# Guia de Testes Unitários

Este documento explica como implementar e executar testes unitários na aplicação.

## 📋 Índice

1. [O que são Testes Unitários](#o-que-são-testes-unitários)
2. [Estrutura dos Testes](#estrutura-dos-testes)
3. [Como Executar os Testes](#como-executar-os-testes)
4. [Explicação Detalhada dos Testes](#explicação-detalhada-dos-testes)
5. [Padrões de Teste](#padrões-de-teste)
6. [Boas Práticas](#boas-práticas)

## 🎯 O que são Testes Unitários

Testes unitários são testes que verificam se uma **unidade específica** do código (como uma função, método ou classe) funciona corretamente de forma **isolada**. Eles são rápidos, confiáveis e ajudam a identificar bugs rapidamente.

### Por que usar testes unitários?

- ✅ **Detectar bugs rapidamente**
- ✅ **Facilitar refatoração**
- ✅ **Documentar o comportamento do código**
- ✅ **Melhorar a qualidade do código**
- ✅ **Aumentar a confiança nas mudanças**

## 📁 Estrutura dos Testes

```
src/
├── use-cases/
│   ├── user/
│   │   ├── create-user.use-case.ts          # Código original
│   │   ├── create-user.use-case.spec.ts     # Teste unitário
│   │   ├── get-user.use-case.ts
│   │   ├── get-user.use-case.spec.ts
│   │   └── ...
│   ├── card/
│   │   ├── create-card.use-case.ts
│   │   ├── create-card.use-case.spec.ts
│   │   └── ...
│   └── ...
```

### Convenção de Nomenclatura

- **Arquivo de teste**: `nome-do-arquivo.spec.ts`
- **Exemplo**: `create-user.use-case.ts` → `create-user.use-case.spec.ts`

## 🚀 Como Executar os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (útil durante desenvolvimento)
npm run test:watch

# Executar testes com cobertura
npm run test:cov

# Executar testes específicos
npm test -- --testNamePattern="CreateUserUseCase"

# Executar testes de um arquivo específico
npm test -- --testPathPattern="user"

# Executar testes com output detalhado
npm test -- --verbose
```

### Exemplos de Uso

```bash
# Executar apenas testes de usuário
npm test -- --testPathPattern="user"

# Executar apenas testes de cards
npm test -- --testPathPattern="card"

# Executar um teste específico
npm test -- --testNamePattern="deve criar um usuário com sucesso"
```

## 📖 Explicação Detalhada dos Testes

### 1. Estrutura Básica de um Teste

```typescript
// Importações necessárias
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';

// Mock das dependências externas
jest.mock('../../utils/cpf-validator');

// Grupo de testes
describe('CreateUserUseCase', () => {
  // Variáveis que serão usadas nos testes
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  // Mock do repositório
  const mockUserRepository = {
    create: jest.fn(),
    update: jest.fn(),
    // ... outros métodos
  };

  // Configuração antes de cada teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get('UserRepository');
  });

  // Limpeza após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testes específicos
  describe('execute', () => {
    it('deve criar um usuário com sucesso', async () => {
      // ARRANGE (Preparação)
      userRepository.create.mockResolvedValue(expectedUser);

      // ACT (Ação)
      const result = await useCase.execute(createUserDto);

      // ASSERT (Verificação)
      expect(result).toEqual(expectedUser);
    });
  });
});
```

### 2. Padrão AAA (Arrange, Act, Assert)

Cada teste segue o padrão **AAA**:

#### **A**rrange (Preparação)
```typescript
// Configura os dados e mocks necessários
const createUserDto = { /* dados de teste */ };
userRepository.create.mockResolvedValue(expectedUser);
```

#### **A**ct (Ação)
```typescript
// Executa o método que queremos testar
const result = await useCase.execute(createUserDto);
```

#### **A**ssert (Verificação)
```typescript
// Verifica se o resultado é o esperado
expect(result).toEqual(expectedUser);
expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
```

### 3. Mocks e Simulações

#### O que são Mocks?

Mocks são **simulações** de dependências externas (como banco de dados, APIs, etc.) que permitem testar o código de forma isolada.

#### Exemplo de Mock

```typescript
// Mock de uma função externa
jest.mock('../../utils/cpf-validator');

// Mock de um repositório
const mockUserRepository = {
  create: jest.fn(), // Função mock que podemos controlar
  findByCpf: jest.fn(),
};

// Configurando o comportamento do mock
userRepository.create.mockResolvedValue(expectedUser);
userRepository.findByCpf.mockResolvedValue(null);
```

## 🧪 Padrões de Teste

### 1. Teste de Caso de Sucesso

```typescript
it('deve criar um usuário com sucesso', async () => {
  // ARRANGE
  userRepository.create.mockResolvedValue(expectedUser);

  // ACT
  const result = await useCase.execute(createUserDto);

  // ASSERT
  expect(result).toEqual(expectedUser);
  expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
});
```

### 2. Teste de Caso de Erro

```typescript
it('deve lançar erro quando CPF for inválido', async () => {
  // ARRANGE
  (isValidCPF as jest.Mock).mockReturnValue(false);

  // ACT & ASSERT
  await expect(useCase.execute(createUserDto))
    .rejects.toThrow('CPF inválido');
});
```

### 3. Teste de Validação de Chamadas

```typescript
it('deve chamar o repositório com os parâmetros corretos', async () => {
  // ARRANGE
  userRepository.create.mockResolvedValue(expectedUser);

  // ACT
  await useCase.execute(createUserDto);

  // ASSERT
  expect(userRepository.create).toHaveBeenCalledWith(
    expect.objectContaining({
      cpf: createUserDto.cpf,
      name: createUserDto.name,
    })
  );
});
```

### 4. Teste de Verificação de Não-Chamada

```typescript
it('não deve chamar create quando validação falhar', async () => {
  // ARRANGE
  (isValidCPF as jest.Mock).mockReturnValue(false);

  // ACT & ASSERT
  await expect(useCase.execute(createUserDto))
    .rejects.toThrow('CPF inválido');
  
  expect(userRepository.create).not.toHaveBeenCalled();
});
```

## ✅ Boas Práticas

### 1. Nomenclatura Clara

```typescript
// ✅ Bom
it('deve criar um usuário com sucesso', async () => {});
it('deve lançar erro quando CPF for inválido', async () => {});

// ❌ Ruim
it('should work', async () => {});
it('test 1', async () => {});
```

### 2. Testes Independentes

Cada teste deve ser **independente** dos outros:

```typescript
// ✅ Bom - cada teste configura seus próprios mocks
beforeEach(() => {
  jest.clearAllMocks(); // Limpa mocks entre testes
});

// ❌ Ruim - testes dependem de estado compartilhado
```

### 3. Teste de Casos Extremos

```typescript
// Teste com dados vazios
it('deve lidar com dados vazios', async () => {});

// Teste com dados inválidos
it('deve validar dados de entrada', async () => {});

// Teste de performance
it('deve responder rapidamente', async () => {});
```

### 4. Cobertura de Testes

Aim para cobrir:
- ✅ **Casos de sucesso**
- ✅ **Casos de erro**
- ✅ **Validações de entrada**
- ✅ **Comportamentos extremos**
- ✅ **Integração entre componentes**

## 🔧 Comandos Úteis

### Verificar Cobertura

```bash
npm run test:cov
```

### Executar Testes em Modo Watch

```bash
npm run test:watch
```

### Executar Testes Específicos

```bash
# Por nome do teste
npm test -- --testNamePattern="CreateUser"

# Por caminho do arquivo
npm test -- --testPathPattern="user"

# Por padrão de nome
npm test -- --testNamePattern="deve criar"
```

## 📊 Interpretando Resultados

### Teste Passando ✅
```
PASS  src/use-cases/user/create-user.use-case.spec.ts
✓ deve criar um usuário com sucesso
✓ deve lançar erro quando CPF for inválido
```

### Teste Falhando ❌
```
FAIL  src/use-cases/user/create-user.use-case.spec.ts
✗ deve criar um usuário com sucesso
  Expected: ObjectContaining {"cpf": "123.456.789-09"}
  Received: {"cpf": "123.456.789-10"}
```

### Cobertura de Testes 📈
```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.71 |    83.33 |   88.89 |   85.71 |
```

## 🎯 Próximos Passos

1. **Implemente testes para todos os use cases**
2. **Adicione testes para controllers**
3. **Implemente testes de integração**
4. **Configure CI/CD para executar testes automaticamente**
5. **Mantenha a cobertura de testes acima de 80%**

---

**Lembre-se**: Testes são um investimento que se paga com o tempo. Eles ajudam a manter a qualidade do código e a confiança nas mudanças! 🚀
