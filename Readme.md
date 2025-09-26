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
- [Staking System](#staking-system)
- [Validation Process](#validation-process)
- [DAO Governance](#dao-governance)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## Overview

ClimaLink is a decentralized platform that incentivizes accurate climate reporting through blockchain technology. Users can earn CLT (ClimaLink Token) rewards by submitting weather data and validating reports from other community members. The platform features a built-in DAO for governance decisions and uses BDAG token staking for membership verification.

### Key Benefits

- **Decentralized Data Collection**: Community-driven weather reporting from global locations
- **Quality Assurance**: Multi-validator system ensures data accuracy with 24-hour voting periods
- **Economic Incentives**: Token rewards for contributors and validators with automatic minting
- **Democratic Governance**: DAO-based decision making with 51% quorum requirements
- **Transparency**: All data and transactions recorded on blockchain
- **Role Progression**: Automatic upgrades from Reporter to Validator based on DAO membership

## Features

### Core Functionality

- **Weather Report Submission**: Submit real-time weather data with location coordinates
- **Community Validation**: 24-hour voting period with validator consensus mechanism
- **Interactive Climate Map**: Visualize global climate reports in real-time
- **Token Rewards**: Earn 20 CLT tokens for validated reports
- **DAO Governance**: Participate in platform decisions through proposal voting with 1-hour voting delay
- **Staking System**: Stake 100 BDAG tokens with 60-day lock period for enhanced privileges
- **Automatic Role Upgrades**: Seamless progression from Reporter to Validator upon DAO membership

### User Features

- **Wallet Integration**: Connect MetaMask and other Web3 wallets
- **Profile Management**: Track your contributions, achievements, and reputation
- **Transaction History**: View all blockchain interactions and token earnings
- **Achievement System**: Unlock badges and rewards for platform participation
- **Real-time Statistics**: Monitor personal and global platform metrics
- **Role Status**: View current role and upgrade eligibility

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
- **Smart Contracts** - Solidity-based contracts with security features

### State Management
- **React Context** - Global state management
- **Custom Hooks** - Reusable blockchain interaction logic

## Smart Contracts

### Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| CLT Token | `0xb6147E56105f09086C1DC3eb7d6A595F1818b499` | ERC-20 reward token with staking |
| DAO Contract | `0x8FfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF` | Governance, voting, and membership |
| Climate Reports | `0x50AdE72a0bF3F424505c3828D140C976B99b7D06` | Report storage and validation |

### Key Contract Functions

#### CLT Token Contract
- `stakeBDAG()` - Stake 100 BDAG tokens and receive 1000 CLT tokens automatically
- `unstakeBDAG()` - Unstake tokens after 60-day lock period
- `mint(address, amount)` - Mint rewards to users (authorized minters only)
- `balanceOf(address)` - Get user's CLT balance
- `getStakedAmount(address)` - Get user's staked BDAG amount
- `getUnlockTime(address)` - Get unstaking unlock timestamp
- `isEligibleForMinting(address)` - Check if user has staked minimum BDAG

#### Climate Contract
- `createClimateReport(ReportInput)` - Submit weather report (reporters only)
- `voteOnReport(uint128, VoteChoice)` - Vote on report validity (validators only)
- `finalizeReport(uint128)` - Finalize report after voting deadline
- `joinAsReporterOrValidator()` - Register role with automatic DAO member upgrades
- `getClimateReport(uint128)` - Retrieve detailed report data
- `getActiveVotingReports()` - Get all reports currently in voting phase
- `checkAndUpgradeRole(address)` - Check and upgrade user role eligibility

#### DAO Contract
- `joinDao()` - Join DAO with 1000 CLT membership fee and 100 BDAG stake requirement
- `createProposal(string, string, uint128)` - Create governance proposal
- `vote(uint128, VoteType)` - Vote on proposals after 1-hour delay
- `executeProposal(uint128)` - Execute passed proposals meeting 51% quorum
- `viewProposals()` - Get all proposals with voting data
- `getMemberList()` - Get active DAO members
- `notifyUnstake(address)` - Remove member when they unstake BDAG

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- MetaMask or compatible Web3 wallet
- BDAG tokens for staking (minimum 100 BDAG)

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
2. **Stake BDAG Tokens**: Stake minimum 100 BDAG to get 1000 CLT automatically
3. **Choose Role**: Start as Reporter or upgrade to Validator through DAO membership
4. **Start Contributing**: Begin submitting reports or validating community data

### Submitting Reports

1. Navigate to "Submit Report" (Reporter role required)
2. Set your location (GPS coordinates: longitude ±180°, latitude ±90°)
3. Input weather data:
   - Temperature: -100°C to +100°C
   - Humidity: 0-100%
   - Weather conditions (max 50 characters)
   - Location description (max 100 characters)
4. Review and submit to blockchain
5. Wait for 24-hour validation period
6. Earn 20 CLT tokens if report is validated

### Validating Reports

1. Access "Validate" page (Validator role required)
2. Review pending reports in 24-hour voting window
3. Compare with external weather data sources
4. Vote "Valid" or "Invalid" (cannot vote on own reports)
5. Reports finalize when >51% of validators agree or deadline expires
6. Early finalization possible with majority consensus

### DAO Participation

1. Stake minimum 100 BDAG tokens
2. Maintain minimum 1000 CLT balance
3. Pay 1000 CLT membership fee to join DAO
4. Automatic upgrade to Validator role upon joining
5. Create proposals with 1-30 day duration
6. Vote on proposals after 1-hour delay period
7. Execute proposals meeting 51% quorum requirement

## User Roles

### Reporter (Entry Level)
- **Requirements**: Stake 100 BDAG tokens (receive 1000 CLT)
- **Abilities**: Submit weather reports with location data
- **Rewards**: 20 CLT tokens per validated report
- **Upgrade Path**: Automatic upgrade to Validator upon DAO membership

### Validator (Advanced Level)
- **Requirements**: 
  - DAO membership (1000 CLT fee + 100 BDAG stake)
  - Maintain 1000 CLT balance
  - Keep 100 BDAG staked
- **Abilities**: All Reporter privileges plus report validation voting
- **Rewards**: Reporter rewards plus validation participation rewards
- **Governance**: Full DAO voting rights

### Automatic Role Upgrades
- System automatically upgrades Reporters to Validators when they join the DAO
- Real-time eligibility checking and seamless role transitions
- No manual upgrade process required

## Token Economy

### CLT Token (ClimaLink Token)
- **Total Supply**: 1 billion tokens maximum
- **Distribution**: Automatic minting for staking and rewards
- **Initial Mint**: 1000 CLT when staking 100 BDAG
- **Report Rewards**: 20 CLT per validated report
- **DAO Fee**: 1000 CLT membership fee

### BDAG Token Staking
- **Minimum Stake**: 100 BDAG tokens required
- **Lock Period**: 60 days (approximately 2 months)
- **Benefits**: CLT minting eligibility, DAO access, platform participation
- **Auto-unstake**: DAO membership automatically removed when unstaking

### Economic Model
- **Entry Cost**: 100 BDAG stake + 1000 CLT (for DAO/Validator)
- **Earning Potential**: 20 CLT per validated report
- **Governance Participation**: Proposal voting and creation rights
- **Long-term Commitment**: 60-day lock encourages platform stability

## Staking System

### BDAG Staking Process
1. **Stake**: Call `stakeBDAG()` with 100 BDAG minimum
2. **Automatic Rewards**: Receive 1000 CLT tokens immediately
3. **Lock Period**: Tokens locked for 60 days from stake time
4. **Unstaking**: Call `unstakeBDAG()` after lock period expires
5. **Consequences**: Unstaking removes DAO membership and Validator status

### Staking Benefits
- Immediate 1000 CLT token mint
- Eligibility for additional CLT rewards
- Access to Reporter role and report submission
- DAO membership eligibility with additional requirements
- Platform governance participation

## Validation Process

### Report Validation Workflow
1. **Submission**: Reporter submits weather report with location data
2. **Voting Period**: 24-hour window for validator voting
3. **Validator Voting**: Active validators vote "Valid" or "Invalid"
4. **Consensus Rules**:
   - Early finalization if >51% of validators agree
   - Final decision based on majority after 24 hours
   - Reporter cannot vote on their own reports
5. **Rewards**: 20 CLT minted to reporter if validated

### Quality Assurance
- Multi-validator consensus mechanism
- Geographic and temporal data validation
- External weather data cross-referencing recommended
- Blacklisting system for malicious actors

## DAO Governance

### Membership Requirements
- Stake minimum 100 BDAG tokens
- Maintain minimum 1000 CLT balance
- Pay 1000 CLT membership fee
- Meet continuous eligibility requirements

### Proposal System
- **Creation**: Members can create proposals with 1-30 day duration
- **Voting Delay**: 1-hour delay before voting begins
- **Quorum**: 51% of active members required
- **Execution**: Automatic execution for passed proposals
- **Expiration**: Unmet proposals expire after deadline

### Governance Powers
- Platform parameter updates
- Smart contract upgrades
- Economic model adjustments
- Community dispute resolution
- Strategic decision making

## Security Features

### Smart Contract Security
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause functionality for all contracts
- **Ownable**: Admin controls for critical functions
- **SafeMath**: Overflow protection for mathematical operations
- **Blacklisting**: Malicious actor prevention system

### Access Controls
- **Authorized Minters**: Controlled CLT token minting
- **Role-based Permissions**: Function access based on user roles
- **Validation Checks**: Input validation and business logic enforcement
- **Time Locks**: Stake lock periods and voting delays

### Emergency Features
- **Contract Pausing**: Owner can pause operations
- **Emergency Withdrawal**: Admin fund recovery mechanisms
- **Member Removal**: Blacklisting and automatic unstaking
- **Proposal Extensions**: Deadline extensions for critical votes

## Roadmap

### Phase 1 (Current)
- Basic reporting and validation with 24-hour cycles
- DAO governance implementation with 51% quorum
- Token economics launch with automatic staking rewards
- Role-based system with automatic upgrades

### Phase 2 (Late 2025 - Q1 2026)
- Mobile application with full functionality
- Advanced analytics dashboard with validation metrics
- API for third-party integrations and data access
- Enhanced validator reputation system

### Phase 3 (Q1 2026 - Q2 2026)
- Machine learning validation assistance
- NFT achievement system for long-term contributors
- Climate emergency fund for hazardous weather environments
- Enterprise partnerships and institutional adoption

### Phase 4 (Q1 -Q4 2026)
- Cross-chain integration for broader accessibility
- Advanced prediction algorithms based on historical data
- Carbon credit integration for environmental impact
- Global climate data marketplace

## Contributing

We welcome contributions from the community! Here's how you can help:

### Development Areas
- Frontend UI/UX improvements and mobile responsiveness
- Smart contract optimizations and gas efficiency
- Validation algorithm enhancements
- Security audits and bug fixes
- Documentation updates and translations
- Integration with weather APIs and external data sources

### Contribution Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript and Solidity best practices
4. Write comprehensive tests for new features
5. Update documentation for changes
6. Commit with clear messages (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request with detailed description

### Code Standards
- Use existing UI components from shadcn/ui
- Follow OpenZeppelin standards for smart contracts
- Implement proper error handling and validation
- Add security considerations for all functions
- Test thoroughly on testnet before mainnet deployment

## Security Considerations

- Smart contracts audited by professional security firms
- Multi-signature wallet for critical contract upgrades
- Time locks on sensitive administrative functions
- Community governance for major platform changes
- Active bug bounty program with responsible disclosure
- Regular security reviews and penetration testing

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- BlockDAG for blockchain infrastructure and BDAG token
- Community contributors, validators, and reporters
- Weather data providers for validation references
- Security auditors and the broader Web3 community

---

**Disclaimer**: This platform is experimental and involves financial risk. Users should understand blockchain technology and cryptocurrency risks. BDAG tokens are locked for 60 days upon staking. Always verify weather data from multiple sources for critical decisions. Participate responsibly and within your financial means.