# teltonika_parser

Parser modular para pacotes Teltonika, com suporte aos codecs 8, 8 Extended, 12, 13, 14 e 16.  
Projetado para ser utilizado em servidores de rastreamento que recebem dados de dispositivos via TCP.

---

## ✨ Features

- ✅ Suporte aos Codecs:
  - `Codec 8`: AVL básico
  - `Codec 8 Extended`: AVL com IO extendido
  - `Codec 12`: Comandos ASCII (ex: `getver`)
  - `Codec 13`: Respostas USSD
  - `Codec 14`: JSON encapsulado
  - `Codec 16`: GNSS + CAN (FMx150)
- 🔍 Pré-parsing com extração de IMEI, validação de preâmbulo e CRC
- 📦 Builder de comandos para comunicação com dispositivos via Codec 12
- 🧪 Cobertura completa de testes unitários com Jest e TypeScript

---

## 🧱 Estrutura do Projeto

```
teltonika_parser/
├── src/
│   ├── codecs/              # Parsers por codec
│   ├── core/                # Comando builder, pre-parser
│   ├── packageParser.ts     # Parser principal que roteia por codec
│   └── types.ts             # Tipagens comuns
├── tests/                   # Testes unitários organizados por módulo
├── fixtures/                # Payloads de testes reais em hex (mocked)
├── jest.config.js           # Configuração do Jest com ts-jest
├── tsconfig.json            # Configuração do TypeScript
├── package.json             # Scripts e dependências
└── README.md                # Documentação 📘
```

---

## ⚙️ Instalação

```bash
git clone https://github.com/GuilhermeFrick/teltonika_parser.git
cd teltonika_parser
npm install
```

---

## 🚀 Como Executar os Testes

### Passo a passo

1. **Verifique a versão do Jest:**
   - Este projeto usa **Jest v29** com **ts-jest**.

2. **Execute os testes com:**
```bash
npm test
```

> O Jest vai executar todos os arquivos `*.test.ts` dentro da pasta `/tests`.

---

## 🧪 Cobertura de Testes

Você pode gerar o relatório de cobertura com:

```bash
npx jest --coverage
```

A saída incluirá cobertura de:

- `TeltonikaPreParser`
- `TeltonikaPackageParser`
- `Codec8Parser`, `Codec13Parser`, `Codec16Parser`, etc.
- `TeltonikaCommandBuilder`

Exemplo de cobertura esperada:

```
File                          | % Stmts | % Branch | % Funcs | % Lines
-----------------------------|---------|----------|---------|---------
src/core/preParser.ts        | 100     | 100      | 100     | 100
src/codecs/codec8.ts         | 100     | 100      | 100     | 100
src/codecs/codec13.ts        | 100     | 100      | 100     | 100
src/core/commandBuilder.ts   | 100     | 100      | 100     | 100
src/packageParser.ts         | 100     | 100      | 100     | 100
```

---

## 🛠 Exemplos de Uso

### Parse de Pacote

```ts
import { TeltonikaPackageParser } from './src/packageParser';

const payload = Buffer.from('00000000000000350C01050000000667657476657201AABBCCDD', 'hex');

const result = TeltonikaPackageParser.parse({
  imei: '123456789012345',
  payload
});

console.log(result);
```

### Construção de Comando Codec 12

```ts
import { TeltonikaCommandBuilder } from './src/core/commandBuilder';

const packet = TeltonikaCommandBuilder.buildCodec12Command('getver');
// Enviar esse Buffer via TCP para o rastreador
```

---

## 📘 Referências Oficiais

- [Teltonika Codec Protocols](https://wiki.teltonika-gps.com/view/Codec)
- [Codec8 AVL Format](https://wiki.teltonika-gps.com/view/Codec_8)
- [Codec12 Command Structure](https://wiki.teltonika-gps.com/view/Codec_12)
- [Codec13/14/16 Extended Data](https://wiki.teltonika-gps.com/view/Main_Page)

---

## 🧑‍💻 Autor

[Guilherme Frick](https://github.com/GuilhermeFrick)  
Especialista em sistemas embarcados, telemetria e protocolos automotivos.

---
