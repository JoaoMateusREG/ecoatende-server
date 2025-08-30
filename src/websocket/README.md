# WebSocket - Painel de Chamados

Este módulo implementa funcionalidade WebSocket para comunicação em tempo real entre o servidor e os clientes frontend.

## Funcionalidades

- **Conexão WebSocket**: Clientes podem se conectar via WebSocket
- **Autenticação por Organização**: Cada cliente deve se autenticar com o CNPJ da organização
- **Comunicação em Tempo Real**: Notificações automáticas quando cards são criados, atualizados ou concluídos
- **Ping/Pong**: Sistema de heartbeat para manter conexões ativas
- **Estatísticas**: Endpoint para monitorar conexões ativas

## Como Conectar

### 1. Conexão WebSocket

```javascript
const ws = new WebSocket('ws://localhost:3000/ecoatende/websocket');

ws.onopen = () => {
  console.log('Conectado ao WebSocket');
  
  // Autenticar com a organização
  ws.send(JSON.stringify({
    tipo: 'auth',
    organizationCnpj: '12.345.678/0001-90'
  }));
};
```

### 2. Autenticação

Após conectar, envie uma mensagem de autenticação:

```javascript
ws.send(JSON.stringify({
  tipo: 'auth',
  organizationCnpj: '12.345.678/0001-90'
}));
```

### 3. Receber Notificações

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.tipo) {
    case 'card_update':
      handleCardUpdate(message.dados);
      break;
    case 'pong':
      console.log('Pong recebido');
      break;
    case 'erro':
      console.error('Erro:', message.mensagem);
      break;
  }
};
```

## Tipos de Mensagens

### Card Update
Quando um card é criado, atualizado ou concluído:

```json
{
  "tipo": "card_update",
  "organizationCnpj": "12.345.678/0001-90",
  "dados": {
    "id": 1,
    "card": "A001",
    "status": "WAITING",
    "datehour": "2024-01-15T10:30:00Z",
    "serviceId": 1,
    "serviceName": "Atendimento Geral",
    "eventType": "new_card_created"
  }
}
```

### Event Types

- `new_card_created`: Novo card criado
- `card_updated`: Card atualizado
- `card_called`: Card chamado para atendimento
- `card_concluded`: Card concluído

## Endpoints REST

### GET /websocket/stats

Retorna estatísticas das conexões WebSocket:

```json
{
  "totalConnections": 10,
  "activeConnections": 8,
  "organizations": ["12.345.678/0001-90", "98.765.432/0001-10"]
}
```

## Endpoints de Cards com WebSocket

### POST /cards
Cria um novo card e envia notificação WebSocket.

### PUT /cards/:id
Atualiza um card e envia notificação WebSocket.

### PUT /cards/:id/start-attendance
Inicia o atendimento de um card e envia notificação WebSocket.

### PUT /cards/:id/complete
Conclui um card e envia notificação WebSocket.

## Configuração

O WebSocket está configurado para:

- **Path**: `/websocket`
- **Ping Interval**: 25 segundos
- **Transport**: WebSocket apenas

## Segurança

- Todas as conexões são isoladas por organização (CNPJ)
- Mensagens são enviadas apenas para clientes da mesma organização
- Sistema de heartbeat para detectar conexões inativas 