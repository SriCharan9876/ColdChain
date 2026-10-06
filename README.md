# Medicine Cold Chain Integrity System

## 1. Project Overview
The Medicine Cold Chain Integrity System is a blockchain-based pharmaceutical supply-chain application. It provides a secure, decentralized architecture to track medicine from manufacturing through distribution to retail pharmacies. The system integrates robust supply-chain lifecycle enforcement with a strict on-chain cold-chain integrity layer, guaranteeing that temperature constraints are strictly audited and verified using immutable Ethereum blockchain records.

## 2. Core System Concept
The core concept is to provide a fully decentralized supply-chain model (Manufacturer → Wholesaler → Pharmacy) coupled with verifiable cold-chain condition logging. The smart contract acts as the ultimate arbiter of truth, strictly enforcing role-based capabilities, defining sequential medicine lifecycles, and managing secure batch-level inventory operations.

## 3. Key Features
- **Controlled Supply-Chain Lifecycle:** Enforced transition of medicine batches through predefined states (`Manufactured`, `InStock`, `Sold`).
- **Role-Based Access Control:** Strict on-chain verification of user roles for all critical functions (e.g., only Manufacturers can add medicine).
- **Batch-Level Inventory Tracking:** Robust quantity tracking and depletion directly on the smart contract.
- **Authorized Cold-Chain Monitoring:** Only Manufacturer-authorized IoT/Proxy wallets can submit temperature readings for a batch.
- **Automated Excursion Detection:** Smart contracts automatically evaluate temperature readings against configured safe ranges, logging violations instantly.
- **Immutable Audit Trail:** Comprehensive, chronological logging of every event (registration, purchase, state transition, and temperature submission) queryable directly from the blockchain.
- **Modern Decentralized Application (dApp):** An interactive React + Vite frontend seamlessly integrated with Web3.js and MetaMask.

## 4. Role-Based Access and Responsibilities
The system defines 5 primary user roles in the `RegistrationLogin.sol` contract and 1 specialized technical wallet authorization (Logger).

1. **Manufacturer**
   - **Role:** Pharmaceutical producers.
   - **Capabilities:** Registers new medicine batches onto the blockchain (`addMedicine`), specifying batch details, quantities, prices, and temperature limits. Authorizes a logger wallet for the batch (`registerLogger`).

2. **Wholesaler**
   - **Role:** Bulk buyers and regional distributors.
   - **Capabilities:** Purchases batches in the `Manufactured` state directly from Manufacturers, triggering an on-chain 5% wholesale commission fee adjustment. This transitions the batch to `InStock`.

3. **Distributor**
   - **Role:** Logistics operators.
   - **Capabilities:** Operates as a tracking and monitoring participant. They can verify batches via QR, inspect the cold-chain status, and view the audit trail.

4. **Pharmacy**
   - **Role:** Retail pharmacies and clinics.
   - **Capabilities:** Purchases batches in the `InStock` state from Wholesalers. The smart contract applies a 3% pharmacy commission. Purchasing reduces the available quantity; when it reaches zero, the batch transitions to `Sold`.

5. **Customer**
   - **Role:** End patients or regulators.
   - **Capabilities:** Consumers can verify medicine authenticity using QR codes, check expiry dates, and audit the complete cold-chain history to ensure safety.

6. **Logger (Specialized Technical Role)**
   - **Role:** An IoT sensor or proxy environmental monitoring wallet.
   - **Capabilities:** A Logger is **not** an application user account. It is purely an Ethereum address authorized by the Manufacturer for a specific batch. It can only submit temperature readings (`recordTemperature`). Unauthorized submissions are strictly rejected by the smart contract.

## 5. Medicine Lifecycle / State Machine
The smart contract enforces a controlled medicine lifecycle in which downstream purchases are permitted only when the batch has reached the appropriate lifecycle state. The contract operates strictly on a **batch-level inventory model**. 

- **Manufactured (State 0):** The initial lifecycle state immediately after a Manufacturer registers the medicine batch.
- **InStock (State 1):** Reached after a valid Wholesaler purchase. The smart contract enforces that Pharmacy purchases are only permitted from this state, preventing the bypassing of the intermediate wholesale stage.
- **Sold (State 2):** Reached automatically when the remaining batch quantity drops to zero after Pharmacy purchase(s).

## 6. Medicine Purchase Rules
The `purchaseMedicine()` function strictly enforces supply-chain transitions:
- **Wholesaler Purchase (`buyerType = 1`):** Requires the medicine to be in the `Manufactured` state. The purchase transitions the state to `InStock`, applies a 5% commission to the unit price, and decreases the available quantity.
- **Pharmacy Purchase (`buyerType = 2`):** Requires the medicine to be in the `InStock` state. Applies a 3% commission. If the remaining quantity drops to zero, the state becomes `Sold`.
- **History Tracking:** All valid purchases emit a `MedicinePurchased` event and append to the immutable `saleHistory` on-chain array. The Wholesaler's acquired inventory is represented by the batch's transition into the `InStock` state, allowing Pharmacy downstream procurement.

## 7. Medicine Data Model
A medicine batch is stored on-chain using two primary structures:
- **`BasicDetails`:** `manufacturerId`, `manufacturerAddress`, `medicineName`, `medicineId` (unique identifier), `medicineType`, `strength`, `batchNumber`, and `storageConditions`.
- **`SpecDetails`:** `manufactureDate`, `expiryDate` (stored as UTC timestamps), `price`, `quantity`, current lifecycle `state`, `tempMin`, and `tempMax`.

## 8. Cold-Chain / Temperature Monitoring
- **Configuration:** When adding a medicine, the Manufacturer configures a minimum and maximum safe temperature (`tempMin`, `tempMax`).
- **Submission:** The authorized logger submits real-time integer temperature readings.
- **On-Chain Evaluation:** The smart contract evaluates the submitted temperature. The reading, the block timestamp, and a `withinRange` boolean are stored permanently.
- **Excursion Alert:** If the temperature falls outside the inclusive configured range, the contract immediately emits a `TemperatureExcursion` event.

### Cold-Chain Workflow:
1. Manufacturer authorizes a specific logger address.
2. Authorized logger records temperature via the blockchain.
3. Smart contract evaluates the temperature against the medicine's range limits.
4. The reading is stored securely on-chain.
5. Excursions are instantly identified and permanently recorded.
6. The frontend queries this data to display history, status, and dynamic charts.

## 9. QR Verification and Traceability
- **QR Mechanism:** QR codes function as a quick access mechanism to the medicine's unique ID.
- **Traceability:** Users scanning the QR code retrieve real-time data directly from the blockchain. This includes the current lifecycle state, available quantity, and the ultimate cold-chain integrity verdict.
- **Blockchain Foundation:** The blockchain is the underlying, tamper-resistant source of truth. The QR code simply points to this immutable record.

## 10. Audit and History
- **Audit View:** The system provides a comprehensive, read-only "Audit View" that compiles a chronological timeline of a batch.
- **On-Chain Events:** It dynamically fetches `MedicineAdded`, `MedicinePurchased`, `SaleHistoryRecorded`, `TemperatureRecorded`, `TemperatureExcursion`, and `MedicineStateUpdated` events from the blockchain logs.
- **Immutable Trust:** By leveraging Ethereum's event logs, the audit trail is completely immutable and cryptographically verifiable by any participant or regulator.

## 11. Frontend Architecture
The dApp uses a modern, modular architecture:
- **Frontend Framework:** React (v18+) and Vite for fast, optimized builds.
- **Routing:** React Router for seamless single-page application navigation.
- **Blockchain Interaction:** Web3.js interfaces with the MetaMask wallet provider.
- **State Management:** React Context API (`AuthContext`, `Web3Context`) separates blockchain state from application authentication state.
- **Service Layer:** `medicineService.js` and `registrationService.js` act as the bridge between React components and the Ethereum RPC.
- **Data Visualization:** Chart.js and react-chartjs-2 for temperature graphing.

**Interaction Flow:**
`User` → `React Frontend` → `Web3.js (Service Layer)` → `MetaMask` → `Ethereum Sepolia` → `Smart Contracts` → `On-Chain Records`

## 12. Security & Access Control
- **Smart Contract Enforcement:** Critical business rules are enforced by Solidity modifiers (e.g., `onlyManufacturer`), strict `require()` validations, and cryptographically verified addresses (`msg.sender`).
- **Decoupled Identity:** Application identity (`RegistrationLogin.sol`) is verified independently of physical supply-chain state transitions (`MedicineManagement.sol`).
- **Data Safety:** The frontend never handles or requests private keys. All sensitive transactions require manual user approval via MetaMask.

## 13. Testing and Validation
The system has undergone rigorous manual testing on the Ethereum Sepolia Testnet, including:
- Registration and session restoration across all roles.
- End-to-end medicine batch registration.
- Successful Logger authorization and wallet validation.
- Temperature boundary testing (e.g., safe readings at 2°C/8°C, and detected excursions at 10°C).
- Wholesaler purchasing reducing quantity and transitioning states (`Manufactured` → `InStock`).
- Pharmacy purchasing reducing quantity and transitioning states (`InStock` → `Sold`).
- Full chronological event rendering in the Audit View.
- Graceful rejection of unauthorized transaction attempts (e.g., unauthorized temperature logging).

## 14. Technology Stack
- **Smart Contracts:** Solidity `^0.8.0`, deployed via Remix IDE.
- **Network:** Ethereum Sepolia Testnet.
- **Frontend UI:** React.js, Vite, Vanilla CSS.
- **Web3 Integration:** Web3.js, MetaMask.

## 15. Project Setup / Installation

### Prerequisites
- Node.js (v18+)
- MetaMask extension installed in your browser.
- Sepolia ETH (available via public faucets) for executing transactions.

### Installation
1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the deployed Sepolia contract addresses:
   ```env
   VITE_REGISTRATION_CONTRACT_ADDRESS=0x158f94AFF2639E24cA037BfD8f19dc716FE0d3E4
   VITE_MEDICINE_CONTRACT_ADDRESS=0xa8ebB83875f2b10610AeD1bE2843475f0b2818Ef
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 16. Design Scope / Implementation Notes
- **Batch-Level Inventory:** The current `MedicineManagement` implementation tracks inventory and state at the batch level. It does not maintain isolated sub-balances for individual owners.
- **Oracle Dependency:** Temperature readings depend on the authorized logger supplying the physical temperature measurement. The blockchain guarantees the immutability and evaluation of the submitted record, but relies on the physical integrity of the sensor device.
- **Event Query Limitations:** The frontend incorporates adaptive block-range querying to respect RPC limits (e.g., Infura's 10,000 block limit) when fetching historical audit events.

## 17. Conclusion
The Medicine Cold Chain Integrity System delivers a highly transparent, tamper-proof, and strictly governed pharmaceutical supply chain. By anchoring business logic and cold-chain compliance directly into Ethereum smart contracts, it effectively eliminates centralized points of failure, ensuring that patients receive safe, verified, and strictly monitored medicine.
