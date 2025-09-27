# ClimaLink - Decentralized Climate Reporting Platform

**A blockchain-based platform for community-driven climate data collection, validation, and governance.**

ClimaLink empowers users to submit real-time weather reports, validate community-submitted data, and participate in decentralized autonomous organization (DAO) governance, earning CLT (ClimaLink Token) rewards. Built on blockchain technology, ClimaLink ensures transparency, incentivizes accurate reporting, and fosters community-driven climate data integrity.

## Hackathon Submission Overview

**Problem Addressed**: Traditional weather data sources are often centralized, lack transparency, and may not cover remote or underserved regions. ClimaLink solves this by enabling decentralized, community-driven weather reporting with blockchain-verified data and governance.

**Solution**: A Web3 platform where users submit weather reports, validators ensure data accuracy, and a DAO governs platform decisions. Staking and token rewards incentivize participation, while smart contracts ensure trust and transparency.

**Target Audience**: Climate researchers, developers, communities in underserved regions, and Web3 enthusiasts.

**Impact**: Provides reliable, decentralized climate data, promotes global participation, and empowers communities to contribute to and govern a transparent climate data ecosystem.

---

## Table of Contents

- [Hackathon Submission Overview](#hackathon-submission-overview)
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Backend Structure](#backend-structure)
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
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

ClimaLink is a decentralized platform that leverages blockchain technology to crowdsource accurate climate data globally. Users submit weather reports, validators verify data accuracy, and a DAO governs platform operations. The platform uses CLT tokens for rewards and BDAG token staking for membership, ensuring economic incentives and trustless operation.

### Key Benefits
- **Decentralized Data Collection**: Global community-driven weather reporting.
- **Data Integrity**: Multi-validator consensus ensures reliable data.
- **Incentivized Participation**: Earn 20 CLT tokens per validated report.
- **Transparent Governance**: DAO-based decision-making with 51% quorum.
- **Immutable Records**: Blockchain ensures tamper-proof data and transactions.
- **Role Progression**: Automatic upgrades from Reporter to Validator via DAO membership.

---

## Features

### Core Functionality
- **Weather Report Submission**: Submit real-time weather data with GPS coordinates.
- **Community Validation**: 24-hour validator voting ensures data accuracy.
- **Interactive Climate Map**: Visualize global climate data in real-time.
- **Token Rewards**: Earn 20 CLT tokens for validated reports.
- **DAO Governance**: Participate in platform decisions with 1-hour voting delays.
- **Staking System**: Stake 100 BDAG tokens for 60 days to unlock privileges.
- **Role Upgrades**: Seamless progression to Validator role via DAO membership.

### User Features
- **Wallet Integration**: Connect MetaMask or other Web3 wallets.
- **Profile Management**: Track contributions, achievements, and reputation.
- **Transaction History**: View blockchain interactions and token earnings.
- **Achievement System**: Unlock badges for participation milestones.
- **Real-time Statistics**: Monitor personal and platform-wide metrics.
- **Role Status**: Check current role and upgrade eligibility.

---

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router for dynamic UI.
- **TypeScript**: Type-safe development for robust code.
- **Tailwind CSS**: Utility-first CSS for responsive design.
- **shadcn/ui**: Modern, reusable UI components.
- **Lucide Icons**: Comprehensive icon library for intuitive visuals.

### Backend
- **Node.js**: Server-side runtime for API handling.
- **Express.js**: Framework for building RESTful APIs.
- **Weather APIs**: Integration with external weather services (e.g., OpenWeatherMap).
- **MongoDB**: Database for caching API responses and user metadata.

### Blockchain Integration
- **Ethers.js v6**: Ethereum blockchain interaction library.
- **Wagmi**: React hooks for Web3 wallet connectivity.
- **Web3Modal**: Multi-wallet connection support.
- **Solidity**: Smart contracts for token, climate, and DAO logic.

### State Management
- **React Context**: Global state for user and blockchain data.
- **Custom Hooks**: Reusable logic for blockchain interactions.

---

## Backend Structure

The backend of ClimaLink is designed to handle weather data retrieval, processing, and integration with the blockchain, ensuring seamless interaction between the frontend, external weather APIs, and smart contracts. Below is the structure and workflow for managing current weather and forecast data.

### Directory Structure
```
backend/
├── .env                    # Environment variables (API keys, blockchain endpoints)
├── .gitignore             # Ignore node_modules, env files
├── package.json           # Node.js dependencies and scripts
├── pnpm-lock.yaml         # Package lock for dependency consistency
├── server.js              # Main Express server entry point
├── controllers/
│   └── weatherController.js # Handles weather API logic
├── routes/
│   └── api.js             # Defines API endpoints
└── services/
    └── weatherService.js  # Interacts with external weather APIs
```

### Components and Workflow

1. **server.js**:
   - Initializes the Express server.
   - Configures middleware (CORS, JSON parsing, error handling).
   - Mounts API routes from `routes/api.js`.
   - Connects to MongoDB for data storage and Redis for caching.

2. **controllers/weatherController.js**:
   - Handles HTTP requests for weather data.
   - Processes data from `weatherService.js` and formats responses.
   - Example response for current weather data (as provided in your code):
     ```javascript
     return {
         latitude,
         longitude,
         temperature: apiData.main.temp,
         humidity: apiData.main.humidity,
         weatherCondition: apiData.weather[0].main || apiData.weather[0].description || 'Unknown',
         timestamp: new Date(apiData.dt * 1000), // Convert UNIX timestamp to Date
         confidence: 0.95,
     };
     ```
   - This structure is used to standardize weather data returned to the frontend or submitted to the blockchain via the `Climate` smart contract.

3. **routes/api.js**:
   - Defines RESTful endpoints:
     - `GET /api/current`: Fetches current weather for given coordinates.
     - `GET /api/forecast`: Retrieves 5-day weather forecast.
     - `POST /api/weather/submit`: Submits user weather reports to the blockchain.
   - Routes requests to appropriate controllers.

4. **services/weatherService.js**:
   - Integrates with external weather APIs (e.g., OpenWeatherMap) to fetch current and forecast data.
   - Validates input coordinates (latitude ±90°, longitude ±180°).
   - Caches API responses in Redis to reduce external API calls.
   - Formats data to align with the `ReportData` struct in the `Climate` smart contract:
     ```solidity
     struct ReportData {
         string weather;
         string location;
         int128 temperature;
         int128 longitude;
         int128 latitude;
         uint128 humidity;
     }
     ```

### Current Weather Workflow
1. **User Request**: The frontend sends a `GET /api/current?lat=<latitude>&lon=<longitude>` request.
2. **Cache Check**: `weatherService.js` checks Redis for cached data.
3. **API Call**: If no cache, it queries an external API (e.g., OpenWeatherMap) using an API key from `.env`.
4. **Data Processing**: `weatherController.js` formats the response:
   - Converts UNIX timestamp (`apiData.dt`) to a JavaScript `Date` object (`new Date(apiData.dt * 1000)`).
   - Extracts temperature, humidity, and weather condition.
   - Adds a confidence score (hardcoded at 0.95 for API data).
5. **Response**: Returns the formatted object to the frontend for display or submission to the blockchain.
6. **Blockchain Submission**: If a user submits a report, the data is sent to the `createReport` function in the `Climate` contract, which validates and stores it on-chain.

### Forecast Workflow
1. **User Request**: The frontend sends a `GET /api/forecast?lat=<latitude>&lon=<longitude>` request.
2. **Cache Check**: Redis is queried for cached forecast data.
3. **API Call**: If no cache, `weatherService.js` fetches a 5-day forecast from the external API.
4. **Data Processing**: Aggregates forecast data (e.g., daily averages for temperature, humidity).
5. **Response**: Returns a list of forecast objects to the frontend, each including:
   - Date (converted from UNIX timestamp).
   - Temperature, humidity, and weather conditions.
   - Confidence score (0.95 for API data).
6. **Display**: The frontend renders the forecast on the interactive climate map.

### Integration with Blockchain
- **Report Submission**: Users submit weather reports via the `submit/` page, which calls `POST /api/submit`. The backend validates the data and invokes the `createReport` function in the `Climate` contract.
- **Validation**: Validators access pending reports via the `validate/` page, which queries the `getActiveReports` function. Votes are submitted to the `vote` function.
- **Rewards**: Upon report finalization, the backend triggers `distributeRewards` to mint CLT tokens.

### Scalability and Optimization
- **Redis Caching**: Reduces API calls by caching weather data for 5 minutes.
- **MongoDB**: Stores user metadata and report history for quick retrieval.
- **Rate Limiting**: Enforced on the blockchain (max 10 reports/day) and backend to prevent abuse.
- **Error Handling**: Robust validation for API responses and user inputs.

---

## Smart Contracts

### Contract Addresses
| Contract | Address | Purpose |
|----------|---------|---------|
| CLT Token | `0xb6147E56105f09086C1DC3eb7d6A595F1818b499` | ERC-20 reward token with staking. |
| DAO Contract | `0x8FfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF` | Governance, voting, and membership. |
| Climate Reports | `0x50AdE72a0bF3F424505c3828D140C976B99b7D06` | Report storage and validation. |

### Key Contract Functions
#### CLT Token Contract
- `stakeBDAG()`: Stake 100 BDAG tokens, receive 1000 CLT.
- `unstakeBDAG()`: Unstake after 60-day lock.
- `mint(address, amount)`: Mint CLT rewards (authorized only).
- `balanceOf(address)`: Check CLT balance.
- `getStakedAmount(address)`: View staked BDAG amount.
- `getUnlockTime(address)`: Check unstaking unlock time.
- `isEligibleForMinting(address)`: Verify staking eligibility.

#### Climate Contract
- `createClimateReport(ReportInput)`: Submit weather reports (Reporters only).
- `voteOnReport(uint128, VoteChoice)`: Vote on report validity (Validators only).
- `finalizeReport(uint128)`: Finalize reports post-voting.
- `joinAsReporterOrValidator()`: Register roles with DAO upgrades.
- `getClimateReport(uint128)`: Retrieve report data.
- `getActiveVotingReports()`: List reports in voting phase.
- `checkAndUpgradeRole(address)`: Upgrade roles based on eligibility.

#### DAO Contract
- `joinDao()`: Join DAO with 1000 CLT fee and 100 BDAG stake.
- `createProposal(string, string, uint128)`: Create governance proposals.
- `vote(uint128, VoteType)`: Vote on proposals after 1-hour delay.
- `executeProposal(uint128)`: Execute passed proposals (51% quorum).
- `viewProposals()`: List all proposals.
- `getMemberList()`: View active DAO members.
- `notifyUnstake(address)`: Remove members upon unstaking.

---

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm.
- Git.
- MetaMask or compatible Web3 wallet.
- BDAG tokens (minimum 100 for staking).

### Setup
1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-org/climalink.git
   cd climalink
   ```
2. **Install Dependencies**:
   ```bash
   pnpm install
   # or
   yarn install
   ```
3. **Configure Environment**:
   Create `.env.local` in `frontend/`:
   ```env
   NEXT_PUBLIC_NETWORK=mainnet
   NEXT_PUBLIC_INFURA_ID=your_infura_project_id
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   ```
   Create `.env` in `backend/`:
   ```env
   WEATHER_API_KEY=your_openweathermap_key
   MONGODB_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_connection_string
   ```
4. **Run Backend**:
   ```bash
   cd backend
   node server.js
   ```
5. **Run Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
6. **Access**: Open `http://localhost:3000`.

---

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
│   └── blockchain/     # Blockchain interactio
└── public/             # Static assets
```

## Usage Guide

### Getting Started
1. **Connect Wallet**: Use MetaMask via the "Connect Wallet" button.
2. **Stake BDAG**: Stake 100 BDAG tokens to receive 1000 CLT.
3. **Choose Role**: Start as a Reporter or upgrade to Validator via DAO.
4. **Contribute**: Submit reports or validate data.

### Submitting Reports
1. Navigate to `submit/` page (Reporter role required).
2. Enter:
   - Location (latitude ±90°, longitude ±180°).
   - Temperature (-100°C to +100°C).
   - Humidity (0-100%).
   - Weather condition (max 50 chars).
   - Location description (max 100 chars).
3. Submit to blockchain via `createReport`.
4. Await 24-hour validation; earn 20 CLT if validated.

### Validating Reports
1. Access `validate/` page (Validator role required).
2. Review pending reports within 24-hour voting window.
3. Cross-reference with external weather data.
4. Vote "Valid" or "Invalid" via `voteOnReport`.
5. Reports finalize with >51% consensus or after 24 hours.

### DAO Participation
1. Stake 100 BDAG and maintain 1000 CLT.
2. Pay 1000 CLT to join DAO via `joinDao`.
3. Create or vote on proposals via `createProposal` and `vote`.
4. Proposals execute with 51% quorum after 1-hour delay.

---

## User Roles

### Reporter (Entry Level)
- **Requirements**: Stake 100 BDAG (receive 1000 CLT).
- **Abilities**: Submit weather reports.
- **Rewards**: 20 CLT per validated report.
- **Upgrade**: Auto-upgrades to Validator upon DAO membership.

### Validator (Advanced Level)
- **Requirements**: DAO membership, 1000 CLT, 100 BDAG stake.
- **Abilities**: Submit and validate reports, participate in DAO.
- **Rewards**: Report rewards + validation rewards.
- **Governance**: Full DAO voting rights.

---

## Token Economy

### CLT Token
- **Total Supply**: 1 billion tokens.
- **Distribution**: Minted for staking and rewards.
- **Initial Mint**: 1000 CLT for 100 BDAG stake.
- **Report Rewards**: 20 CLT per validated report.
- **DAO Fee**: 1000 CLT for membership.

### BDAG Token Staking
- **Minimum Stake**: 100 BDAG.
- **Lock Period**: 60 days.
- **Benefits**: CLT minting, DAO access, platform roles.
- **Unstaking**: Removes DAO membership and Validator status.

---

## Staking System
- **Process**: Stake 100 BDAG via `stakeBDAG`, receive 1000 CLT.
- **Lock Period**: 60 days.
- **Benefits**: Enables Reporter role, DAO eligibility, and rewards.
- **Unstaking**: Via `unstakeBDAG`, notifies DAO for membership removal.

---

## Validation Process
- **Submission**: Reporters submit via `createReport`.
- **Voting**: Validators vote within 24 hours via `voteOnReport`.
- **Consensus**: >51% agreement finalizes reports early; otherwise, finalized after 24 hours.
- **Rewards**: 20 CLT for validated reports, distributed via `distributeRewards`.

---

## DAO Governance
- **Membership**: Requires 100 BDAG stake, 1000 CLT fee.
- **Proposals**: Created via `createProposal` (1-30 days duration).
- **Voting**: After 1-hour delay, members vote via `vote`.
- **Execution**: Proposals meeting 51% quorum execute via `executeProposal`.

---

## Security Features
- **Smart Contracts**: ReentrancyGuard, Pausable, SafeMath, Ownable.
- **Access Controls**: Role-based permissions, authorized minters.
- **Emergency Features**: Contract pausing, admin withdrawals.
- **Blacklisting**: Prevents malicious actors.

---

## Roadmap
- **Phase 1 (Current)**: Core reporting, validation, DAO, and token system.
- **Phase 2 (Q1 2026)**: Mobile app, analytics dashboard, API integrations.
- **Phase 3 (Q2 2026)**: ML validation, NFT achievements, climate fund.
- **Phase 4 (Q4 2026)**: Cross-chain support, prediction algorithms, carbon credits.

---

## Contributing
- **Areas**: UI/UX, smart contract optimization, validation algorithms, security audits.
- **Process**:
  1. Fork repository.
  2. Create feature branch (`git checkout -b feature/new-feature`).
  3. Follow TypeScript/Solidity best practices.
  4. Write tests and update documentation.
  5. Submit Pull Request with detailed description.

---

## License
MIT License - see [LICENSE](LICENSE) file.

---

## Acknowledgments
- OpenZeppelin for secure contract libraries.
- BlockDAG for blockchain infrastructure.
- Community contributors and validators.
- Weather API providers (e.g., OpenWeatherMap).
- Security auditors and Web3 community.

---

**Disclaimer**: ClimaLink is experimental and involves financial risks. BDAG tokens are locked for 60 days upon staking. Verify weather data from multiple sources for critical decisions. Participate responsibly.
