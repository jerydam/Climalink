// Smart Contract ABIs and addresses for ClimaLink
export const CONTRACTS = {
  TOKEN: {
    address: "0xb6147E56105f09086C1DC3eb7d6A595F1818b499",
    abi: [
      {
        inputs: [
          { internalType: "address", name: "_bdagToken", type: "address" },
          { internalType: "address", name: "_daoContract", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "owner", type: "address" },
          { indexed: true, internalType: "address", name: "spender", type: "address" },
          { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "from", type: "address" },
          { indexed: true, internalType: "address", name: "to", type: "address" },
          { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "stakeBDAG",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "unstakeBDAG",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getStakedAmount",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
  },
  CLIMATE: {
    address: "0x50AdE72a0bF3F424505c3828D140C976B99b7D06",
    abi: [
      {
        inputs: [{ internalType: "address", name: "_tokenContract", type: "address" }],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "uint128", name: "index", type: "uint128" },
          { indexed: true, internalType: "address", name: "validator", type: "address" },
        ],
        name: "ReportValidated",
        type: "event",
      },
      {
        inputs: [
          {
            components: [
              { internalType: "string", name: "weather", type: "string" },
              { internalType: "int128", name: "temperature", type: "int128" },
              { internalType: "uint128", name: "humidity", type: "uint128" },
              { internalType: "string", name: "location", type: "string" },
              { internalType: "int128", name: "longitude", type: "int128" },
              { internalType: "int128", name: "latitude", type: "int128" },
            ],
            internalType: "struct ClimaLinkClimate.ReportInput",
            name: "input",
            type: "tuple",
          },
        ],
        name: "createClimateReport",
        outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint128", name: "index", type: "uint128" }],
        name: "getClimateReport",
        outputs: [
          {
            components: [
              { internalType: "string", name: "location", type: "string" },
              { internalType: "int128", name: "longitude", type: "int128" },
              { internalType: "int128", name: "latitude", type: "int128" },
              { internalType: "int128", name: "temperature", type: "int128" },
              { internalType: "uint128", name: "humidity", type: "uint128" },
              { internalType: "string", name: "weather", type: "string" },
              { internalType: "address", name: "reporter", type: "address" },
              { internalType: "uint256", name: "timestamp", type: "uint256" },
              { internalType: "enum ClimaLinkClimate.ReportStatus", name: "status", type: "uint8" },
              { internalType: "uint256", name: "validationCount", type: "uint256" },
            ],
            internalType: "struct ClimaLinkClimate.ReportView",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint128", name: "index", type: "uint128" },
          { internalType: "bool", name: "isValid", type: "bool" },
        ],
        name: "validateReport",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
}

export type ContractName = keyof typeof CONTRACTS
