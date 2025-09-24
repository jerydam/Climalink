# ClimaLink - Decentralized Climate Reporting Platform

A blockchain-based platform for community-driven climate data collection, validation, and governance. ClimaLink enables users to submit weather reports, validate community data, and participate in decentralized autonomous organization (DAO) governance while earning CLT tokens.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Smart Contracts](#smart-contracts)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [User Roles](#user-roles)
- [Token Economy](#token-economy)
- [Contributing](#contributing)
- [License](#license)

## Overview

ClimaLink is a decentralized platform that incentivizes accurate climate reporting through blockchain technology. Users can earn CLT (ClimaLink Token) rewards by submitting weather data and validating reports from other community members. The platform features a built-in DAO for governance decisions and uses BDAG token staking for membership verification.

### Key Benefits

- **Decentralized Data Collection**: Community-driven weather reporting from global locations
- **Quality Assurance**: Multi-validator system ensures data accuracy
- **Economic Incentives**: Token rewards for contributors and validators
- **Democratic Governance**: DAO-based decision making for platform improvements
- **Transparency**: All data and transactions recorded on blockchain

## Features

### Core Functionality

- **Weather Report Submission**: Submit real-time weather data with location coordinates
- **Community Validation**: Review and validate reports from other users
- **Interactive Climate Map**: Visualize global climate reports in real-time
- **Token Rewards**: Earn CLT tokens for contributions and accurate validations
- **DAO Governance**: Participate in platform decisions through proposal voting
- **Staking System**: Stake BDAG tokens for enhanced privileges and rewards

### User Features

- **Wallet Integration**: Connect MetaMask and other Web3 wallets
- **Profile Management**: Track your contributions, achievements, and reputation
- **Transaction History**: View all blockchain interactions and token earnings
- **Achievement System**: Unlock badges and rewards for platform participation
- **Real-time Statistics**: Monitor personal and global platform metrics

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide Icons** - Comprehensive icon set

### Blockchain Integration
- **Ethers.js v6** - Ethereum blockchain interaction
- **Wagmi** - React hooks for Ethereum
- **Web3Modal** - Multi-wallet connection
- **Smart Contracts** - Solidity-based contracts for core logic

### State Management
- **React Context** - Global state management
- **Custom Hooks** - Reusable blockchain interaction logic

## Smart Contracts

### Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| CLT Token | `0xb6147E56105f09086C1DC3eb7d6A595F1818b499` | ERC-20 reward token |
| DAO Contract | `0x8FfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF` | Governance and voting |
| Climate Reports | `0x50AdE72a0bF3F424505c3828D140C976B99b7D06` | Report storage and validation |

### Key Contract Functions

#### CLT Token Contract
- `stakeBDAG()` - Stake BDAG tokens for DAO membership
- `unstakeBDAG()` - Unstake tokens (3 -months lock period)
- `mint(address, amount)` - Mint rewards to users
- `balanceOf(address)` - Get user's CLT balance
- `getStakedAmount(address)` - Get user's staked BDAG amount

#### Climate Contract
- `createClimateReport(ReportInput)` - Submit weather report
- `validateReport(uint128, bool)` - Validate community reports
- `joinAsReporterOrValidator(bool)` - Register as reporter/validator
- `getClimateReport(uint128)` - Retrieve report data

#### DAO Contract
- `joinDao()` - Join DAO (requires BDAG staking)
- `createProposal(string, string, uint128)` - Create governance proposal
- `vote(uint128, VoteType)` - Vote on proposals
- `executeProposal(uint128)` - Execute passed proposals

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- MetaMask or compatible Web3 wallet

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/climalink.git
   cd climalink
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_NETWORK=mainnet
   NEXT_PUBLIC_INFURA_ID=your_infura_project_id
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
climalink/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── dashboard/       # Dashboard-specific components
│   ├── profile/         # User profile components
│   ├── blockchain/      # Web3 integration components
│   ├── navigation/      # Navigation components
│   └── validation/      # Report validation components
├── contexts/            # React context providers
│   ├── role-context.tsx # User role management
│   └── web3-context.tsx # Blockchain connection
├── lib/                 # Utility libraries
│   ├── contracts.ts     # Smart contract ABIs and addresses
│   ├── web3.ts         # Web3 utility functions
│   └── utils.ts        # General utilities
├── app/                # Next.js app router pages
│   ├── dashboard/      # Main dashboard
│   ├── submit/         # Report submission
│   ├── validate/       # Report validation
│   ├── portfolio/      # Token management
│   ├── profile/        # User profile
│   └── blockchain/     # Blockchain interaction
└── public/             # Static assets
```

## Usage Guide

### Getting Started

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Join Platform**: Choose your role (Reporter, Validator, or DAO Member)
3. **Start Contributing**: Begin submitting reports or validating community data

### Submitting Reports

1. Navigate to "Submit Report"
2. Set your location (GPS or manual entry)
3. Input weather data (temperature, humidity, conditions)
4. Add optional notes and photos
5. Review and submit to blockchain
6. Earn CLT tokens once validated

### Validating Reports

1. Access "Validate" page (Validators and DAO members only)
2. Review pending reports from the community
3. Compare with external weather data
4. Vote "Valid" or "Invalid" with reasoning
5. Earn validation rewards for accurate assessments

### DAO Participation

1. Stake required BDAG tokens
2. Join the DAO through the interface
3. View and vote on active proposals
4. Create new proposals for platform improvements
5. Participate in governance decisions

## User Roles

### Reporter
- Submit weather reports from any location
- Earn CLT tokens for validated reports
- Access basic dashboard and statistics
- View personal contribution history

### Validator
- All Reporter privileges
- Validate community reports
- Earn validation rewards
- Higher reputation weight
- Access validation dashboard

### DAO Member
- All Validator privileges
- Vote on governance proposals
- Create new proposals
- Receive staking rewards
- Full platform access
- Enhanced voting power

## Token Economy

### CLT Token (ClimaLink Token)
- **Purpose**: Reward token for platform contributions
- **Earning**: Report submission, validation, DAO participation
- **Uses**: Future governance, premium features, marketplace

### BDAG Token
- **Purpose**: Staking token for DAO membership
- **Requirements**: Minimum stake for DAO access
- **Lock Period**: 3 -months unstaking period
- **Benefits**: Voting rights, staking rewards

### Reward Structure
- **Valid Report**: 20 CLT tokens
- **Successful Validation**: 10 CLT tokens
- **DAO Participation**: Variable rewards
- **Staking Rewards**: Percentage of staked amount

## Contributing

We welcome contributions from the community! Here's how you can help:

### Development

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Guidelines

- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Write clear commit messages
- Update documentation for new features
- Test thoroughly before submitting

### Areas for Contribution

- Frontend UI/UX improvements
- Smart contract optimizations
- Mobile responsiveness
- Accessibility enhancements
- Documentation updates
- Bug fixes and security improvements

## Security Considerations

- Smart contracts audited by [Audit Firm]
- Multi-signature wallet for contract upgrades
- Time locks on critical functions
- Community governance for major changes
- Bug bounty program active

## Roadmap

### Phase 1 (Current)
- Basic reporting and validation
- DAO governance implementation
- Token economics launch

### Phase 2 (Q2 2024)
- Mobile application
- Advanced analytics dashboard
- API for third-party integrations

### Phase 3 (Q3 2024)
- Machine learning validation
- NFT achievement system
- Fund Raising For Hazardious weather Environment
- Enterprise partnerships

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- BlockDag for blockchain infrastructure
- Community contributors and validators
- Weather data providers for validation references

---

**Disclaimer**: This platform is experimental. Users should understand the risks associated with blockchain technology and cryptocurrency rewards. Always verify weather data from multiple sources for critical decisions.