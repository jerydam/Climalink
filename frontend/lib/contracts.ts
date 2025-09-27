	// Smart Contract ABIs and addresses for ClimaLink
	export const CONTRACTS = {
	TOKEN: {
		address: "0x59e7CEAE1721f7B5D8F30A573d3cF8E1d3E592b5",
		abi: [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_bdagToken",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "_daoContract",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "OwnableInvalidOwner",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "OwnableUnauthorizedAccount",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "owner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "spender",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Approval",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "account",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "status",
					"type": "bool"
				}
			],
			"name": "AuthorizedMinter",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "account",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "status",
					"type": "bool"
				}
			],
			"name": "Blacklisted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Burn",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Mint",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnershipTransferred",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "Paused",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Stake",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Transfer",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "Unpaused",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Unstake",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "BDAG_STAKE_AMOUNT",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MINT_AMOUNT",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "STAKE_LOCK_PERIOD",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "allowance",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "spender",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "approve",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "authorizedMinters",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "balanceOf",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "bdagToken",
			"outputs": [
				{
					"internalType": "contract IBDAG",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "blacklisted",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "burn",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "daoContract",
			"outputs": [
				{
					"internalType": "contract IClimaLinkDao",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "decimals",
			"outputs": [
				{
					"internalType": "uint8",
					"name": "",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "emergencyWithdrawBDAG",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getBalanceOfUser",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getStakedAmount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUnlockTime",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "isEligibleForMinting",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "maxSupply",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "mint",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "name",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "pause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "paused",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "renounceOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				},
				{
					"internalType": "bool",
					"name": "status",
					"type": "bool"
				}
			],
			"name": "setAuthorizedMinter",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				},
				{
					"internalType": "bool",
					"name": "status",
					"type": "bool"
				}
			],
			"name": "setBlacklisted",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "stakeBDAG",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "stakedBDAG",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "stakingTimestamp",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "symbol",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalSupply",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "transfer",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "transferFrom",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "unpause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "unstakeBDAG",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	],
	},
	DAO: {
		address: "0xa3bCEfF348BAaa6D3dD9D504c976C4023dd6c872",
		abi:[
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_tokenContract",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "OwnableInvalidOwner",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "OwnableUnauthorizedAccount",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "newClimateContract",
					"type": "address"
				}
			],
			"name": "ClimateContractUpdated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "member",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "success",
					"type": "bool"
				}
			],
			"name": "MemberAutoUpgraded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "member",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "status",
					"type": "bool"
				}
			],
			"name": "MemberBlacklisted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "member",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint128",
					"name": "memberId",
					"type": "uint128"
				}
			],
			"name": "MemberJoined",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "member",
					"type": "address"
				}
			],
			"name": "MemberLeft",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "member",
					"type": "address"
				}
			],
			"name": "MemberRemovedOnUnstake",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnershipTransferred",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "Paused",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "proposer",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "name",
					"type": "string"
				}
			],
			"name": "ProposalCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				}
			],
			"name": "ProposalExecuted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				}
			],
			"name": "ProposalExpired",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "newTokenContract",
					"type": "address"
				}
			],
			"name": "TokenContractUpdated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "Unpaused",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "voter",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "enum ClimaLinkDao.VoteType",
					"name": "vote",
					"type": "uint8"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "weight",
					"type": "uint256"
				}
			],
			"name": "VoteCast",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "MAX_PROPOSAL_DURATION",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MEMBERSHIP_FEE",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MINIMUM_STAKE",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MIN_PROPOSAL_DURATION",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "QUORUM_PERCENTAGE",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "VOTING_DELAY",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "blacklisted",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "climateContract",
			"outputs": [
				{
					"internalType": "contract IClimaLinkClimate",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "desc",
					"type": "string"
				},
				{
					"internalType": "uint128",
					"name": "duration",
					"type": "uint128"
				}
			],
			"name": "createProposal",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "emergencyWithdraw",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				}
			],
			"name": "executeProposal",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getActiveMembers",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getMemberList",
			"outputs": [
				{
					"components": [
						{
							"internalType": "uint128",
							"name": "memberId",
							"type": "uint128"
						},
						{
							"internalType": "address",
							"name": "memberAddress",
							"type": "address"
						},
						{
							"internalType": "uint256",
							"name": "joinedAt",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "votingPower",
							"type": "uint256"
						},
						{
							"internalType": "bool",
							"name": "active",
							"type": "bool"
						}
					],
					"internalType": "struct ClimaLinkDao.Member[]",
					"name": "",
					"type": "tuple[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				}
			],
			"name": "getProposalVotes",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "forVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "againstVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "abstainVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalVotes",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				},
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserVote",
			"outputs": [
				{
					"internalType": "bool",
					"name": "hasVoted",
					"type": "bool"
				},
				{
					"internalType": "enum ClimaLinkDao.VoteType",
					"name": "voteChoice",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "isMember",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "joinDao",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "leaveDao",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				}
			],
			"name": "markProposalExpired",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "memberIds",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"name": "memberList",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "memberId",
					"type": "uint128"
				},
				{
					"internalType": "address",
					"name": "memberAddress",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "joinedAt",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "votingPower",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "active",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "membersCount",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "member",
					"type": "address"
				}
			],
			"name": "notifyUnstake",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "pause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "paused",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "proposalCount",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"name": "proposals",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				},
				{
					"internalType": "string",
					"name": "name",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "uint128",
					"name": "deadline",
					"type": "uint128"
				},
				{
					"internalType": "address",
					"name": "proposer",
					"type": "address"
				},
				{
					"internalType": "enum ClimaLinkDao.ProposalStatus",
					"name": "status",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "forVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "againstVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "abstainVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalVotes",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "executed",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "quorumRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "createdAt",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "renounceOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_climateContract",
					"type": "address"
				}
			],
			"name": "setClimateContract",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "member",
					"type": "address"
				},
				{
					"internalType": "bool",
					"name": "status",
					"type": "bool"
				}
			],
			"name": "setMemberBlacklist",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_tokenContract",
					"type": "address"
				}
			],
			"name": "setTokenContract",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "tokenContract",
			"outputs": [
				{
					"internalType": "contract IClimaLinkToken",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "unpause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "viewProposals",
			"outputs": [
				{
					"components": [
						{
							"internalType": "uint128",
							"name": "proposalId",
							"type": "uint128"
						},
						{
							"internalType": "string",
							"name": "name",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "description",
							"type": "string"
						},
						{
							"internalType": "uint128",
							"name": "deadline",
							"type": "uint128"
						},
						{
							"internalType": "address",
							"name": "proposer",
							"type": "address"
						},
						{
							"internalType": "enum ClimaLinkDao.ProposalStatus",
							"name": "status",
							"type": "uint8"
						},
						{
							"internalType": "uint256",
							"name": "forVotes",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "againstVotes",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "abstainVotes",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalVotes",
							"type": "uint256"
						},
						{
							"internalType": "bool",
							"name": "executed",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "quorumRequired",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "createdAt",
							"type": "uint256"
						}
					],
					"internalType": "struct ClimaLinkDao.Proposal[]",
					"name": "",
					"type": "tuple[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "index",
					"type": "uint128"
				}
			],
			"name": "viewVotes",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "proposalId",
					"type": "uint128"
				},
				{
					"internalType": "enum ClimaLinkDao.VoteType",
					"name": "voteType",
					"type": "uint8"
				}
			],
			"name": "vote",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				},
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "votes",
			"outputs": [
				{
					"internalType": "bool",
					"name": "hasVoted",
					"type": "bool"
				},
				{
					"internalType": "enum ClimaLinkDao.VoteType",
					"name": "vote",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "weight",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	],
	},
	CLIMATE: {
		address: "0xCe06013582EB5D054937f0c0BAd88B4833BDE13e",
		abi:[
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_tokenContract",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "_daoContract",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "OwnableInvalidOwner",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "OwnableUnauthorizedAccount",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "string",
					"name": "parameter",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "oldValue",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "newValue",
					"type": "uint256"
				}
			],
			"name": "ConfigurationUpdated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "admin",
					"type": "address"
				}
			],
			"name": "EmergencyReportFinalized",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnershipTransferred",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "Paused",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "reporter",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "location",
					"type": "string"
				}
			],
			"name": "ReportCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"indexed": false,
					"internalType": "enum ClimaLinkClimate.ReportStatus",
					"name": "status",
					"type": "uint8"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "validVotes",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "invalidVotes",
					"type": "uint256"
				}
			],
			"name": "ReportFinalized",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "validator",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "enum ClimaLinkClimate.VoteChoice",
					"name": "vote",
					"type": "uint8"
				}
			],
			"name": "ReportVoteCast",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "reporter",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "ReporterRewarded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "enum ClimaLinkClimate.Role",
					"name": "role",
					"type": "uint8"
				}
			],
			"name": "RoleAssigned",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "enum ClimaLinkClimate.Role",
					"name": "oldRole",
					"type": "uint8"
				},
				{
					"indexed": false,
					"internalType": "enum ClimaLinkClimate.Role",
					"name": "newRole",
					"type": "uint8"
				}
			],
			"name": "RoleUpgraded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "Unpaused",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "validator",
					"type": "address"
				}
			],
			"name": "ValidatorAdded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "validator",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "inactiveDays",
					"type": "uint256"
				}
			],
			"name": "ValidatorInactive",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "validator",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "reason",
					"type": "string"
				}
			],
			"name": "ValidatorRemoved",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "validator",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "ValidatorRewardDistributed",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "MAX_VALIDATION_EXTENSION",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MIN_BDAG_STAKE",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MIN_CLT_FOR_VALIDATOR",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "REPORT_REWARD",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "VALIDATION_PERIOD",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "VALIDATOR_INACTIVITY_PERIOD",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "VALIDATOR_REWARD_POOL",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "checkValidatorEligibility",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "consensusThreshold",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "weather",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "location",
							"type": "string"
						},
						{
							"internalType": "int128",
							"name": "temperature",
							"type": "int128"
						},
						{
							"internalType": "int128",
							"name": "longitude",
							"type": "int128"
						},
						{
							"internalType": "int128",
							"name": "latitude",
							"type": "int128"
						},
						{
							"internalType": "uint128",
							"name": "humidity",
							"type": "uint128"
						}
					],
					"internalType": "struct ClimaLinkClimate.ReportData",
					"name": "data",
					"type": "tuple"
				}
			],
			"name": "createReport",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "dailyReportCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "daoContract",
			"outputs": [
				{
					"internalType": "contract IClimaLinkDao",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				}
			],
			"name": "distributeRewards",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"internalType": "enum ClimaLinkClimate.ReportStatus",
					"name": "status",
					"type": "uint8"
				}
			],
			"name": "emergencyFinalizeReport",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"internalType": "uint256",
					"name": "additionalHours",
					"type": "uint256"
				}
			],
			"name": "extendVotingDeadline",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				}
			],
			"name": "finalizeReport",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "validator",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "reason",
					"type": "string"
				}
			],
			"name": "forceRemoveValidator",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getActiveReports",
			"outputs": [
				{
					"internalType": "uint128[]",
					"name": "",
					"type": "uint128[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getAllValidators",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getMinValidatorsForConsensus",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				}
			],
			"name": "getReport",
			"outputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "weather",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "location",
							"type": "string"
						},
						{
							"internalType": "int128",
							"name": "temperature",
							"type": "int128"
						},
						{
							"internalType": "int128",
							"name": "longitude",
							"type": "int128"
						},
						{
							"internalType": "int128",
							"name": "latitude",
							"type": "int128"
						},
						{
							"internalType": "uint128",
							"name": "humidity",
							"type": "uint128"
						}
					],
					"internalType": "struct ClimaLinkClimate.ReportData",
					"name": "data",
					"type": "tuple"
				},
				{
					"internalType": "address",
					"name": "reporter",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				},
				{
					"internalType": "enum ClimaLinkClimate.ReportStatus",
					"name": "status",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "validationDeadline",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "validVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "invalidVotes",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "rewardsDistributed",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				}
			],
			"name": "getReportVoters",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserDailyReportCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getValidatorRequirements",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "minCLTBalance",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "minBDAGStake",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "additionalRequirements",
					"type": "string"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "validator",
					"type": "address"
				}
			],
			"name": "getValidatorStats",
			"outputs": [
				{
					"internalType": "bool",
					"name": "isActive",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "reportsValidated",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "correctVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalRewardsEarned",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "lastActiveTimestamp",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "accuracyRate",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"internalType": "address",
					"name": "validator",
					"type": "address"
				}
			],
			"name": "getValidatorVote",
			"outputs": [
				{
					"internalType": "bool",
					"name": "hasVoted",
					"type": "bool"
				},
				{
					"internalType": "enum ClimaLinkClimate.VoteChoice",
					"name": "voteChoice",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "joinSystem",
			"outputs": [
				{
					"internalType": "enum ClimaLinkClimate.Role",
					"name": "",
					"type": "uint8"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "lastReportDay",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "lastReportTimestamp",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "maxReportsPerDay",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "minValidatorsRequired",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "pause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "paused",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address[]",
					"name": "validators",
					"type": "address[]"
				}
			],
			"name": "removeInactiveValidators",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "renounceOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "reportCount",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "",
					"type": "uint128"
				}
			],
			"name": "reports",
			"outputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "weather",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "location",
							"type": "string"
						},
						{
							"internalType": "int128",
							"name": "temperature",
							"type": "int128"
						},
						{
							"internalType": "int128",
							"name": "longitude",
							"type": "int128"
						},
						{
							"internalType": "int128",
							"name": "latitude",
							"type": "int128"
						},
						{
							"internalType": "uint128",
							"name": "humidity",
							"type": "uint128"
						}
					],
					"internalType": "struct ClimaLinkClimate.ReportData",
					"name": "data",
					"type": "tuple"
				},
				{
					"internalType": "address",
					"name": "reporter",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				},
				{
					"internalType": "enum ClimaLinkClimate.ReportStatus",
					"name": "status",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "validationDeadline",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "validVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "invalidVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalValidators",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "rewardsDistributed",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "tokenContract",
			"outputs": [
				{
					"internalType": "contract IClimaLinkToken",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalValidators",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "unpause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_minValidatorsRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_consensusThreshold",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_maxReportsPerDay",
					"type": "uint256"
				}
			],
			"name": "updateConfiguration",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "upgradeToValidator",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "userRoles",
			"outputs": [
				{
					"internalType": "enum ClimaLinkClimate.Role",
					"name": "",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "validatorIndex",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "validatorInfo",
			"outputs": [
				{
					"internalType": "bool",
					"name": "isActive",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "reportsValidated",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "correctVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalRewardsEarned",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "lastActiveTimestamp",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "validatorList",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint128",
					"name": "reportId",
					"type": "uint128"
				},
				{
					"internalType": "enum ClimaLinkClimate.VoteChoice",
					"name": "choice",
					"type": "uint8"
				}
			],
			"name": "vote",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	],
	},
	BDAG: { address: '0xA42F4a5e684d7A94a9a47e79b06c31E9e2c7B0B1',
		abi:[
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "spender",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "allowance",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "needed",
					"type": "uint256"
				}
			],
			"name": "ERC20InsufficientAllowance",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "sender",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "balance",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "needed",
					"type": "uint256"
				}
			],
			"name": "ERC20InsufficientBalance",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "approver",
					"type": "address"
				}
			],
			"name": "ERC20InvalidApprover",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "receiver",
					"type": "address"
				}
			],
			"name": "ERC20InvalidReceiver",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "sender",
					"type": "address"
				}
			],
			"name": "ERC20InvalidSender",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "spender",
					"type": "address"
				}
			],
			"name": "ERC20InvalidSpender",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "OwnableInvalidOwner",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "OwnableUnauthorizedAccount",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "owner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "spender",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "Approval",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnershipTransferred",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "Transfer",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "spender",
					"type": "address"
				}
			],
			"name": "allowance",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "spender",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "approve",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "balanceOf",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "decimals",
			"outputs": [
				{
					"internalType": "uint8",
					"name": "",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "mint",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "name",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "renounceOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "symbol",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalSupply",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "transfer",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "transferFrom",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]},}

	export type ContractName = keyof typeof CONTRACTS
