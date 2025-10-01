# 🚀 Backend Faucet DApp - Autenticación Web3

Backend Node.js/Express que maneja la autenticación Web3 usando Sign-In with Ethereum (SIWE) y actúa como intermediario entre el frontend y la blockchain Sepolia.

## 🎯 Características

- ✅ Autenticación con Sign-In with Ethereum (SIWE)
- 🔐 Generación y validación de JWT tokens
- 🔗 Interacción directa con smart contracts en Sepolia
- 🛡️ Endpoints protegidos con middleware de autenticación
- 💰 El backend paga el gas de las transacciones
- 📊 API RESTful con manejo de errores

## 📋 Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Una wallet con ETH en Sepolia (para el backend)
- Clave privada de una wallet (NUNCA compartir)

## 🛠️ Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
PORT=3001

# Ethereum Configuration
PRIVATE_KEY=tu_clave_privada_aqui
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0x3e2117c19a921507ead57494bbf29032f33c7412

# JWT Configuration
JWT_SECRET=tu_secreto_jwt_minimo_32_caracteres_recomendado

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### ⚠️ Importante sobre PRIVATE_KEY

- Esta debe ser la clave privada de una wallet con ETH en Sepolia
- Esta wallet pagará el gas de todas las transacciones
- **NUNCA** uses una wallet con fondos reales en mainnet
- **NUNCA** compartas esta clave ni la subas a repositorios públicos

### 🔑 Obtener ETH de prueba en Sepolia

Puedes obtener ETH de prueba en estos faucets:

- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## 🚀 Ejecución

### Desarrollo (con auto-reload)

```bash
npm run dev
```

### Producción

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3001` (o el puerto que hayas configurado).

## 📡 API Endpoints

### Autenticación

#### `POST /auth/message`

Genera un mensaje SIWE para que el usuario lo firme con su wallet.

**Request:**

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**

```json
{
  "message": "localhost:3001 wants you to sign in...",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

#### `POST /auth/signin`

Verifica la firma del mensaje SIWE y genera un JWT.

**Request:**

```json
{
  "message": "localhost:3001 wants you to sign in...",
  "signature": "0x..."
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "message": "Autenticación exitosa"
}
```

#### `GET /auth/verify`

Verifica si un JWT es válido.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "valid": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Faucet (Requieren Autenticación)

#### `POST /faucet/claim` 🔒

Reclama tokens del faucet.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "txHash": "0xabc123...",
  "message": "Tokens reclamados exitosamente",
  "explorer": "https://sepolia.etherscan.io/tx/0xabc123..."
}
```

#### `GET /faucet/status/:address` 🔒

Obtiene el estado del faucet para una dirección.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "hasClaimed": false,
  "balance": "0",
  "totalUsers": 42,
  "users": ["0x...", "0x..."]
}
```

#### `GET /faucet/info`

Información general del faucet (público, no requiere autenticación).

**Response:**

```json
{
  "contractAddress": "0x3e2117c19a921507ead57494bbf29032f33c7412",
  "network": "Sepolia",
  "chainId": 11155111,
  "totalUsers": 42,
  "message": "Faucet DApp - Reclama tus tokens de prueba"
}
```

### Health Check

#### `GET /health`

Verifica el estado del servidor.

**Response:**

```json
{
  "status": "OK",
  "message": "Faucet Backend con Autenticación Web3",
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

## 🔒 Seguridad

### JWT Tokens

- Válidos por 24 horas
- Incluyen la dirección del usuario
- Verificados en cada endpoint protegido

### Middleware de Autenticación

- Valida el token JWT en el header `Authorization: Bearer <token>`
- Extrae la dirección del usuario del token
- Verifica que el token no haya expirado

### SIWE (Sign-In with Ethereum)

- Los mensajes SIWE expiran en 10 minutos
- Se usa un nonce aleatorio para cada mensaje
- La firma se verifica criptográficamente

## 🏗️ Arquitectura

```
frontend (React)
    ↓
    | HTTP/JSON
    ↓
backend (Express)
    ↓
    | Ethers.js
    ↓
Blockchain (Sepolia)
```

### Flujo de Autenticación

1. Usuario conecta su wallet en el frontend
2. Frontend solicita mensaje SIWE al backend (`POST /auth/message`)
3. Usuario firma el mensaje con su wallet
4. Frontend envía mensaje firmado al backend (`POST /auth/signin`)
5. Backend verifica la firma y genera JWT
6. Frontend guarda el JWT y lo usa en peticiones subsiguientes

### Flujo de Reclamo

1. Usuario autenticado hace clic en "Reclamar Tokens"
2. Frontend envía petición con JWT (`POST /faucet/claim`)
3. Backend verifica JWT y extrae dirección
4. Backend ejecuta `claimTokens()` en el smart contract
5. Backend espera confirmación de la transacción
6. Backend retorna hash de transacción al frontend

## 📝 Estructura de Archivos

```
backend/
├── src/
│   ├── index.js           # Servidor Express principal
│   ├── contract.js        # Interacción con blockchain
│   ├── middleware/
│   │   └── auth.js        # Middleware de autenticación JWT
│   └── routes/
│       ├── auth.js        # Rutas de autenticación SIWE
│       └── faucet.js      # Rutas del faucet
├── .env                   # Variables de entorno (no subir a Git)
├── .env.example           # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

Para probar los endpoints puedes usar herramientas como:

- [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code)
- [Postman](https://www.postman.com/)
- [curl](https://curl.se/)

Ejemplo con curl:

```bash
# Health check
curl http://localhost:3001/health

# Solicitar mensaje SIWE
curl -X POST http://localhost:3001/auth/message \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'

# Info del faucet (público)
curl http://localhost:3001/faucet/info
```

## 🐛 Troubleshooting

### Error: "PRIVATE_KEY no está configurada"

- Asegúrate de tener un archivo `.env` con la variable `PRIVATE_KEY`
- La clave privada debe tener el formato correcto (64 caracteres hex)

### Error: "insufficient funds"

- La wallet del backend no tiene suficiente ETH en Sepolia
- Obtén ETH de prueba de un faucet de Sepolia

### Error: "already claimed"

- El usuario ya reclamó sus tokens anteriormente
- Cada wallet solo puede reclamar una vez

### CORS errors

- Verifica que `FRONTEND_URL` en `.env` coincida con la URL de tu frontend
- Asegúrate de que el frontend esté corriendo

## 📚 Tecnologías Utilizadas

- [Express](https://expressjs.com/) - Framework web
- [ethers.js](https://docs.ethers.org/) - Librería para interactuar con Ethereum
- [SIWE](https://docs.login.xyz/) - Sign-In with Ethereum
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - Manejo de JWT
- [helmet](https://helmetjs.github.io/) - Seguridad HTTP
- [cors](https://github.com/expressjs/cors) - CORS middleware
- [dotenv](https://github.com/motdotla/dotenv) - Variables de entorno

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado como parte del proyecto de Faucet DApp con autenticación Web3.
