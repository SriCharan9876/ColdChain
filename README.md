# Medicine Cold Chain Integrity System

## 1. Project Overview

**Medicine Cold Chain Integrity System** is a blockchain-based pharmaceutical supply-chain application based on the MediChain concept, extended with an on-chain cold-chain integrity layer.

The system combines:

- Pharmaceutical medicine/batch registration
- Manufacturer identity and authorization
- Supply-chain custody and lifecycle tracking
- Inventory and purchase/transfer functionality
- QR-based medicine identification/verification
- Configurable medicine storage-temperature limits
- Authorized Ethereum-address temperature loggers
- Blockchain-recorded temperature readings
- Automatic temperature-excursion detection
- Cold-chain status/verdict
- Temperature history visualization
- Role-based application users
- Ethereum wallet-based transaction authorization

The original MediChain repository is used as a **domain and workflow reference**. The current Solidity contracts are the authoritative specification for blockchain data and business rules. The frontend is being rebuilt as a clean **React** application rather than continuing the original large static JavaScript frontend.

---

## 2. Main Objective

The system should provide a tamper-resistant, auditable record of a medicine batch throughout its supply chain and should add verifiable cold-chain information to the existing traceability workflow.

For a temperature-sensitive medicine, the system should answer:

1. What medicine/batch is this?
2. Who manufactured it?
3. What are its storage requirements?
4. What is its current lifecycle/supply-chain state?
5. Which Ethereum address is authorized to submit temperature readings?
6. What temperatures have been recorded?
7. Were any readings outside the permitted range?
8. What is the cold-chain verdict?
9. Can the information be read and verified directly from the blockchain?

The primary example range is **2°C–8°C**, but the Solidity contract stores `tempMin` and `tempMax` per medicine so the range is configurable.

---

# 3. System Architecture

```text
                         React Frontend
                              |
                    Web3.js / EVM provider
                              |
                           MetaMask
                              |
                +-------------+-------------+
                |                           |
       MedicineManagement             RegistrationLogin
          Solidity contract               Solidity contract
                |                           |
                |                           |
        Medicine/batch data          User registration
        Supply-chain state            User roles
        Inventory                     Account information
        Temperature limits            Account status
        Logger authorization
        Temperature history
        Excursion detection
        Cold-chain status
                |
                +-------------+
                              |
                     Ethereum / Sepolia
                        blockchain
```

There is no traditional centralized database required for the core blockchain records. Contract-managed data is read from the blockchain.

---

# 4. Technology Stack

| Layer | Technology |
|---|---|
| Blockchain | Ethereum-compatible blockchain |
| Final/demo network | Ethereum Sepolia testnet |
| Development contract testing | Remix JavaScript VM |
| Smart contracts | Solidity `^0.8.0` |
| Smart-contract IDE | Remix IDE |
| Wallet | MetaMask |
| Blockchain connection | Web3.js |
| Frontend | React + JavaScript |
| Styling | HTML/CSS, optionally Bootstrap or another UI library |
| Charts | Chart.js |
| QR | QR generation/scanning library as appropriate |
| Version control | Git + GitHub |
| Hosting | Static frontend hosting such as GitHub Pages, Cloudflare Pages or Vercel |

The project does not require Truffle, Hardhat, Ganache, MongoDB, or a traditional backend server for its core functionality.

---

# 5. Smart Contracts

The project uses two Solidity contracts.

## 5.1 MedicineManagement

Original source filename:

```text
contract/AddNewMedicine.sol
```

Contract name:

```solidity
MedicineManagement
```

This is the primary business-logic contract. It manages medicine batches, manufacturer authorization, supply-chain state, inventory, temperature limits, logger authorization, temperature history, excursion detection, and cold-chain status.

## 5.2 RegistrationLogin

Original source filename:

```text
contract/ResistrationLogin.sol
```

The filename uses the spelling `ResistrationLogin`, but the Solidity contract is named:

```solidity
RegistrationLogin
```

This contract handles application users, registration/login-related functionality, roles, account status, and user details.

The contracts have separate responsibilities and should remain separate in the React application.

---

# 6. RegistrationLogin Responsibilities

The existing role model includes:

```text
Manufacturer
Wholesaler
Distributor
Pharmacy
Customer
```

The registration contract contains user-related functionality including registration, login/user lookup, password-related operations, account activation/deactivation, and user details.

The React frontend should use the actual ABI of the contract rather than reproducing old frontend assumptions.

A normal application user and a cold-chain logger address are different concepts. A logger is primarily an Ethereum address authorized for a particular medicine; it is not necessarily a separate user role in `RegistrationLogin`.

---

# 7. MedicineManagement Data Model

The current medicine model is deliberately split into two nested structures.

## BasicDetails

```solidity
struct BasicDetails {
    string manufacturerId;
    address manufacturerAddress;
    string medicineName;
    string medicineId;
    string medicineType;
    string strength;
    string batchNumber;
    string storageConditions;
}
```

Meaning:

| Field | Meaning |
|---|---|
| `manufacturerId` | Application-level manufacturer identifier |
| `manufacturerAddress` | Ethereum wallet that created the medicine |
| `medicineName` | Medicine name |
| `medicineId` | Unique medicine/batch identifier |
| `medicineType` | Tablet, capsule, syrup, injection, etc. |
| `strength` | Medicine strength |
| `batchNumber` | Batch number |
| `storageConditions` | Human-readable storage requirements |

The manufacturer Ethereum address is captured from `msg.sender` when the medicine is created. It should not be treated as a user-supplied string field.

## SpecDetails

```solidity
struct SpecDetails {
    uint256 manufactureDate;
    uint256 expiryDate;
    uint256 price;
    uint256 quantity;
    MedicineState state;
    int256 tempMin;
    int256 tempMax;
}
```

Meaning:

| Field | Meaning |
|---|---|
| `manufactureDate` | Manufacture timestamp |
| `expiryDate` | Expiry timestamp |
| `price` | Current medicine price |
| `quantity` | Current available quantity |
| `state` | Medicine lifecycle state |
| `tempMin` | Minimum permitted temperature in °C |
| `tempMax` | Maximum permitted temperature in °C |

Temperature values are integer degrees Celsius. Solidity decimal/floating-point temperature values are not used.

Example:

```text
tempMin = 2
tempMax = 8
```

means:

```text
2°C <= temperature <= 8°C
```

## Medicine

```solidity
struct Medicine {
    BasicDetails basic;
    SpecDetails spec;
}
```

Medicine storage uses:

```solidity
mapping(string => Medicine) public medicines;
string[] public medicineIds;
```

The medicine ID is the main lookup key.

---

# 8. MedicineInput

Medicine creation uses a flat input structure:

```solidity
struct MedicineInput {
    string manufacturerId;
    string medicineName;
    string medicineId;
    string medicineType;
    string strength;
    string batchNumber;
    string storageConditions;
    uint256 manufactureDate;
    uint256 expiryDate;
    uint256 price;
    uint256 quantity;
    int256 tempMin;
    int256 tempMax;
}
```

The React Add Medicine form must collect these values.

The manufacturer wallet is not part of this input. `MedicineManagement` records `msg.sender` as the manufacturer address.

Frontend validation should ensure:

```text
tempMin <= tempMax
quantity >= 0
expiryDate is appropriate for manufactureDate
medicineId is supplied
```

The contract remains the final authority for validation.

---

# 9. Medicine Lifecycle

The medicine contract has a `MedicineState` enum representing lifecycle state. The existing application uses the conceptual states:

```text
Manufactured
InStock
Sold
Expired
```

The React UI should display human-readable labels, not raw enum numbers.

Existing MediChain supply-chain functionality should be preserved, including functions such as:

```text
addMedicine()
purchaseMedicine()
updateMedicineState()
getMedicine()
getMedicineState()
```

The exact function signatures must always be taken from the current Solidity source/ABI.

---

# 10. Manufacturer Authorization

The medicine contract records the manufacturer's Ethereum wallet in:

```solidity
medicines[_medicineId].basic.manufacturerAddress
```

Manufacturer-protected actions verify that the caller is the recorded manufacturer.

The contract also verifies the application-level manufacturer ID where required.

Important distinction:

```text
Manufacturer ID  !=  Ethereum wallet address
```

The manufacturer ID is application data. The wallet address provides blockchain-level transaction identity.

---

# 11. Authorized Logger Model

The cold-chain layer uses a simple blockchain-enforced logger authorization model rather than a full IoT PKI architecture.

The contract stores:

```solidity
mapping(string => address) public medicineLoggers;
```

Conceptually:

```text
Medicine ID  --->  Authorized logger Ethereum address
```

A manufacturer registers the logger for a medicine.

The registered logger is the only address allowed to submit temperature readings for that medicine.

The authorization is enforced by Solidity. The frontend must never be the only place where logger access is restricted.

---

# 12. Temperature Reading Model

Temperature readings are represented conceptually as:

```solidity
struct TemperatureReading {
    int256 temperature;
    uint256 timestamp;
    bool excursion;
}
```

Each reading contains:

| Field | Meaning |
|---|---|
| `temperature` | Recorded temperature in °C |
| `timestamp` | Blockchain timestamp associated with the reading |
| `excursion` | Whether the reading was outside the medicine's range |

Temperature readings are maintained per medicine.

The frontend must treat temperature history as an array of readings, not as a single value.

---

# 13. Temperature Recording Logic

The temperature recording operation should enforce:

1. Medicine exists.
2. Caller is the registered logger.
3. Temperature is compared against `tempMin` and `tempMax`.
4. Reading is stored.
5. Temperature event is emitted.
6. Excursion event is emitted when outside the allowed range.

The excursion condition is:

```text
temperature < tempMin
OR
temperature > tempMax
```

The allowed range is inclusive.

For a 2–8°C medicine:

| Reading | Result |
|---:|---|
| 2°C | In range |
| 5°C | In range |
| 8°C | In range |
| 1°C | Excursion |
| 9°C | Excursion |

---

# 14. Cold-Chain Status

The contract provides cold-chain status functionality, including the existing cold-chain validity/status functions.

The frontend should expose a clear verdict such as:

```text
VALID
```

or:

```text
EXCURSION DETECTED
```

The UI must distinguish the following:

```text
No temperature readings available
```

from:

```text
Cold chain valid
```

An absence of readings must not be silently presented as proof that the medicine stayed within range.

The contract-derived cold-chain verdict is authoritative; frontend-only calculations are for presentation and convenience.

---

# 15. Temperature History

The frontend should retrieve the medicine's complete temperature history from the contract.

Example:

```text
Medicine MED001
  Reading 1: 5°C
  Reading 2: 6°C
  Reading 3: 7°C
  Reading 4: 9°C  <- excursion
  Reading 5: 6°C
```

The history should be displayed as a timeline and/or Chart.js graph.

The chart should show:

- Timestamp
- Temperature
- Minimum allowed temperature
- Maximum allowed temperature
- Excursion readings

The chart is a visualization of blockchain data and is not a separate source of truth.

---

# 16. QR Verification

The original MediChain application already uses QR functionality for medicine identification.

The React application should retain this concept.

A QR code may contain a medicine identifier, for example:

```json
{
  "medicineId": "MED001"
}
```

The frontend should use the identifier to query the blockchain.

A QR code should not be treated as the trusted source of medicine data. It is an identifier/access mechanism. The blockchain provides the medicine information.

The tracked result should include:

- Medicine identity
- Batch number
- Manufacturer
- Lifecycle state
- Storage conditions
- Allowed temperature range
- Latest temperature
- Temperature history
- Cold-chain verdict

---

# 17. React Frontend Architecture

The frontend is intentionally being rebuilt as a clean React application rather than copying the original monolithic `user.js`/HTML architecture.

Recommended structure:

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MedicineCard.jsx
│   │   ├── MedicineDetails.jsx
│   │   ├── ColdChainStatus.jsx
│   │   ├── TemperatureChart.jsx
│   │   ├── TemperatureHistory.jsx
│   │   └── QRScanner.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AddMedicine.jsx
│   │   ├── TrackMedicine.jsx
│   │   ├── BuyMedicine.jsx
│   │   └── Profile.jsx
│   │
│   ├── contracts/
│   │   ├── MedicineManagementABI.json
│   │   └── RegistrationLoginABI.json
│   │
│   ├── services/
│   │   ├── blockchain.js
│   │   ├── medicineService.js
│   │   ├── registrationService.js
│   │   └── walletService.js
│   │
│   ├── utils/
│   │   ├── medicineStates.js
│   │   ├── dateUtils.js
│   │   └── temperatureUtils.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

This is a recommended organization, not a rigid requirement.

---

# 18. Blockchain Service Layer

React UI components should not contain large amounts of repeated raw Web3 logic.

Create reusable services for operations such as:

```text
medicineService
    getMedicine()
    getAllMedicines()
    addMedicine()
    purchaseMedicine()
    updateMedicineState()
    registerLogger()
    getTemperatureHistory()
    getTemperatureReadingCount()
    getColdChainStatus()
```

The registration service handles functions belonging to `RegistrationLogin`.

This separation keeps the UI independent from contract details.

---

# 19. Contract ABI and Address Configuration

The frontend requires both:

1. Contract ABI
2. Deployed contract address

These should be centralized.

Conceptually:

```javascript
const contracts = {
  medicineManagement: {
    address: "...",
    abi: [...]
  },
  registrationLogin: {
    address: "...",
    abi: [...]
  }
};
```

Environment variables are preferable for addresses in a React/Vite project, for example:

```text
VITE_MEDICINE_CONTRACT_ADDRESS=...
VITE_REGISTRATION_CONTRACT_ADDRESS=...
```

Never store private keys or seed phrases in the frontend.

Contract addresses are public and may be included in frontend configuration.

---

# 20. Critical ABI Rule

The current `Medicine` return structure is nested.

Do **not** use the old MediChain assumption:

```text
medicineData[0] = manufacturerId
medicineData[1] = medicineName
medicineData[2] = medicineId
...
```

The current conceptual structure is:

```text
Medicine
├── basic
│   ├── manufacturerId
│   ├── manufacturerAddress
│   ├── medicineName
│   ├── medicineId
│   ├── medicineType
│   ├── strength
│   ├── batchNumber
│   └── storageConditions
│
└── spec
    ├── manufactureDate
    ├── expiryDate
    ├── price
    ├── quantity
    ├── state
    ├── tempMin
    └── tempMax
```

Always inspect the current Solidity ABI before writing integration code.

The Solidity source and ABI take precedence over old frontend code.

---

# 21. Wallet / Web3 Flow

General flow:

```text
Open application
      |
      v
Check wallet provider
      |
      v
Connect MetaMask when required
      |
      v
Check network
      |
      v
Initialize Web3
      |
      v
Create contract instances
      |
      v
Read blockchain data
      |
      v
User submits transaction
      |
      v
MetaMask confirmation
      |
      v
Blockchain confirmation
      |
      v
Refresh UI from blockchain
```

Read-only operations should use contract calls.

State-changing operations require wallet transactions and MetaMask confirmation.

The application must never request private keys or seed phrases.

---

# 22. Network

The final demonstration network is:

```text
Ethereum Sepolia
```

The frontend should detect the active network and clearly tell the user when MetaMask is connected to the wrong network.

Example:

```text
Please switch MetaMask to Sepolia Testnet.
```

The application should not silently send transactions to an unintended network.

---

# 23. Add Medicine UI

The Add Medicine page should collect:

### Manufacturer

- Manufacturer ID

The connected Ethereum wallet supplies the manufacturer blockchain identity.

### Medicine

- Medicine name
- Medicine ID
- Medicine type
- Strength
- Batch number
- Storage conditions

### Dates

- Manufacture date
- Expiry date

### Commercial

- Price
- Quantity

### Cold-chain

- Minimum temperature
- Maximum temperature

Example:

```text
Medicine: Insulin ABC
Medicine ID: MED001
Batch: BATCH001
Storage: 2°C – 8°C
Minimum: 2
Maximum: 8
```

---

# 24. Logger Registration UI

A manufacturer should be able to select a medicine and register a logger Ethereum address.

Example:

```text
Medicine ID:
MED001

Logger wallet:
0x1234...
```

The contract enforces that the caller is authorized to perform the registration.

The UI should display the currently registered logger address when appropriate.

---

# 25. Logger / Temperature Simulation

Physical IoT hardware is not required for the core demonstration.

A simulated logger can generate readings.

Conceptual flow:

```text
Logger wallet
     |
     v
Generate temperature
     |
     v
recordTemperature()
     |
     v
MedicineManagement
     |
     +-- authorized logger?
     |       |
     |       +-- No -> revert
     |       +-- Yes
     |
     +-- compare temperature with range
     +-- store reading
     +-- emit temperature event
     +-- emit excursion event when required
```

Example sequence:

```text
5°C
6°C
7°C
9°C   <- excursion
6°C
```

---

# 26. Track Medicine UI

Track Medicine is a core user-facing feature.

It should accept either:

- Medicine ID
- QR code

After identification, it should query the blockchain.

Display:

### Identity

- Medicine name
- Medicine ID
- Batch number
- Medicine type
- Strength
- Manufacturer ID
- Manufacturer wallet

### Supply chain

- Quantity
- Price
- Lifecycle state
- Manufacture date
- Expiry date

### Storage

- Storage conditions
- Minimum temperature
- Maximum temperature

### Cold chain

- Latest temperature
- Number of readings
- Temperature history
- Excursion indication
- Overall cold-chain status

---

# 27. Cold-Chain UI States

At minimum, distinguish:

### No readings

```text
Cold Chain Status
No temperature readings available
```

### Valid

```text
Cold Chain Status
✓ VALID

Allowed range: 2°C – 8°C
Latest temperature: 5°C
```

### Excursion

```text
Cold Chain Status
⚠ EXCURSION DETECTED

Allowed range: 2°C – 8°C
Latest temperature: 9°C
```

If historical readings contain an excursion, the batch should remain flagged even if the latest reading has returned to the allowed range.

---

# 28. Temperature Chart

Use Chart.js or an equivalent React-compatible chart library.

The chart should display:

- X-axis: reading time
- Y-axis: temperature in °C
- Recorded readings
- Minimum permitted temperature
- Maximum permitted temperature
- Excursion points

Example data:

```text
5°C
6°C
7°C
9°C  <- excursion
6°C
```

The chart should be responsive and usable on mobile devices.

---

# 29. Dashboard

The dashboard may provide:

- Total medicine count
- In-stock medicine count
- Sold quantities
- Expired medicines
- Recent medicines
- Recent temperature activity
- Cold-chain alerts/excursions

Dashboard values should be derived from blockchain state where applicable.

The dashboard must not become a separate database of truth.

---

# 30. Purchase / Supply-Chain UI

Existing MediChain purchase/supply-chain functionality should be preserved through the React frontend.

A purchase flow should generally:

1. Display available medicines.
2. Display medicine information.
3. Select quantity.
4. Validate user input.
5. Submit the blockchain transaction.
6. Wait for confirmation.
7. Refresh quantity and state from the blockchain.

The frontend must respect the authorization and quantity rules implemented by Solidity.

---

# 31. Inventory Behavior

Inventory is stored on-chain.

Example:

```text
Initial quantity: 10

Purchase 3
Remaining: 7

Purchase remaining 7
Remaining: 0
```

The frontend must refresh the blockchain state after a successful transaction rather than assuming the local value is correct.

---

# 32. Error Handling

The frontend should handle common Web3/Solidity failures gracefully:

- Wallet not installed
- Wallet not connected
- Wrong network
- Wrong account
- User rejected transaction
- Insufficient test ETH
- Medicine not found
- Duplicate medicine ID
- Unauthorized manufacturer
- Unauthorized logger
- Invalid logger address
- Logger not registered
- Insufficient inventory
- Contract call failure
- RPC/network failure

User-facing messages should be understandable rather than exposing raw Solidity errors as the only feedback.

---

# 33. Security Model

The frontend is **not trusted**. Important rules must be enforced in Solidity.

Examples:

- Hiding Add Medicine in React is not authorization; the contract must enforce authorization.
- Hiding logger controls is not authorization; the contract must reject unauthorized logger transactions.
- Disabling a purchase button is not an inventory guarantee; Solidity must enforce quantity.
- A browser calculation is not the authoritative cold-chain verdict; the contract is authoritative.

The wallet's signed transaction provides the blockchain identity of the caller.

---

# 34. Scope and Non-Goals

The current system does not implement full physical IoT security.

It does not provide:

- Physical temperature sensor hardware
- Full IoT device PKI
- ECDSA signatures for every sensor message
- Firmware attestation
- Merkle-tree anchoring of sensor readings or firmware
- Web-of-Trust device reputation
- GPS verification
- Physical tamper detection
- A complete oracle solution
- Proof that a physical sensor was truthful

A simulated logger can represent a sensor device for demonstration.

These features may be considered future extensions, not assumptions about the current system.

---

# 35. Oracle Limitation

Blockchain integrity does not automatically prove physical truth.

For example:

```text
Physical environment = 12°C
          |
          v
Sensor reports = 7°C
          |
          v
Blockchain stores = 7°C
```

The blockchain can prove that the submitted value was recorded and that an unauthorized wallet did not submit it. It cannot independently know that the physical sensor measured the correct temperature.

Therefore the current system provides:

- Logger wallet authorization
- Tamper-resistant on-chain storage
- Immutable temperature history
- Automatic excursion detection
- Auditable cold-chain status

It does not completely solve physical sensor fraud.

---

# 36. Data Flows

## Medicine creation

```text
Manufacturer
   -> React Add Medicine
   -> Web3.js
   -> MetaMask
   -> MedicineManagement.addMedicine()
   -> Ethereum
```

## Logger registration

```text
Manufacturer
   -> React
   -> MetaMask
   -> registerLogger()
   -> medicineLoggers[medicineId]
```

## Temperature recording

```text
Logger
   -> temperature value
   -> Web3.js / MetaMask
   -> recordTemperature()
   -> authorization check
   -> range check
   -> store reading
   -> emit event
```

## Medicine tracking

```text
User
   -> Medicine ID / QR
   -> React Track Medicine
   -> getMedicine()
   -> getTemperatureHistory()
   -> cold-chain status function
   -> blockchain
   -> UI + chart
```

---

# 37. Frontend Design Principles

The React application should be:

### Componentized

Avoid one giant component or one giant JavaScript file.

Separate pages, reusable components, blockchain services, configuration, and utilities.

### Responsive

Support desktop, laptop, tablet, and mobile layouts.

### User-friendly

Blockchain concepts should not be required to understand normal medicine information.

### Transaction-aware

Every transaction should expose an appropriate state:

```text
Idle
Pending
Confirmed
Failed
```

### Read/write separated

Read-only calls and wallet transactions should be clearly separated in the service layer.

### Blockchain-first

After state-changing transactions, refresh data from the contract.

---

# 38. Contract Integration Rules for AI Coding Assistants

Any AI coding assistant working on this project should treat the Solidity contracts and generated ABI as the authoritative backend specification.

Before implementing a contract call:

1. Read the current Solidity contract.
2. Read the current ABI.
3. Confirm the exact function name.
4. Confirm the exact parameter types/order.
5. Confirm the return type/structure.
6. Confirm whether the function is read-only or state-changing.
7. Confirm authorization requirements.
8. Confirm relevant events.
9. Do not rely on outdated frontend code when it conflicts with Solidity.

The old MediChain frontend is a reference for business workflow and UI ideas only.

Do not restore old flat `getMedicine()` indexing assumptions.

---

# 39. Source-of-Truth Hierarchy

When implementing a feature, use this priority:

```text
1. Current Solidity contracts
2. Current contract ABI
3. Actual deployed contract behavior
4. Project architecture/requirements
5. Original MediChain frontend as reference
```

If old frontend code conflicts with the current Solidity source, follow the current Solidity source.

If a function's behavior is unclear, inspect the Solidity source/ABI before inventing behavior.

---

# 40. Testing Requirements

## Smart contract

Test at minimum:

### Medicine

- Valid medicine creation
- Duplicate medicine rejection
- Correct manufacturer address
- Correct temperature limits

### Logger

- Manufacturer can register logger
- Zero address logger rejected
- Registered logger can record
- Unauthorized account rejected
- Existing registered logger remains registered unless intentionally changed

### Temperature

For a 2–8°C medicine:

```text
5°C -> valid
8°C -> valid
2°C -> valid
9°C -> excursion
1°C -> excursion
```

### Cold-chain

- No readings is distinguishable from valid readings
- All readings in range produce valid status
- Any excursion produces excursion/invalid status

### Inventory

- Purchase reduces quantity
- Quantity cannot become negative
- Lifecycle states remain correct

## Frontend

Test:

- Registration/login
- Wallet connection
- Network detection
- Add Medicine
- Temperature-range validation
- Logger registration
- Temperature history
- Cold-chain status
- Chart rendering
- QR lookup
- Medicine tracking
- Purchase/transfer
- Transaction failure/rejection
- Refresh after transaction

---

# 41. Example End-to-End Scenario

Medicine:

```text
Insulin ABC
MED001
BATCH-001
Storage: 2°C–8°C
```

Manufacturer creates the medicine.

The contract stores:

```text
tempMin = 2
tempMax = 8
manufacturerAddress = manufacturer's wallet
```

Manufacturer registers a logger wallet.

The logger submits:

```text
5°C
6°C
7°C
9°C
6°C
```

The `9°C` reading is outside the permitted range and is recorded as an excursion. The contract emits the relevant excursion event.

When the user tracks the medicine, the frontend can show:

```text
Medicine: Insulin ABC
Batch: BATCH-001

Allowed temperature: 2°C – 8°C
Latest temperature: 6°C

Cold-chain status:
EXCURSION DETECTED
```

The chart displays the complete history, including the 9°C excursion.

Returning to 6°C does not erase the historical excursion.

---

# 42. Deployment Architecture

The final application is intended to look like:

```text
React frontend
      |
      v
MetaMask
      |
      v
Ethereum Sepolia
      |
      +---- MedicineManagement
      |
      +---- RegistrationLogin
```

The React application can be hosted on a static hosting platform.

No traditional application server is required for the core contract interactions.

---

# 43. Configuration Requirements

The frontend should have a single configuration location for:

- MedicineManagement contract address
- RegistrationLogin contract address
- Network/chain ID
- ABI imports

Development and final deployment addresses may be different.

Example conceptual configuration:

```text
Development MedicineManagement address
Final Sepolia MedicineManagement address
RegistrationLogin address
Sepolia chain ID
```

Do not duplicate addresses across components.

---

# 44. Future Extensions

Potential future work includes:

- Real IoT temperature hardware
- Secure device identity
- Signed sensor messages
- Hardware security modules
- Firmware integrity verification
- Merkle-tree anchoring
- Multi-device logger fleets
- GPS/location verification
- Automated alerts
- Regulator dashboard
- Advanced analytics
- Threshold notifications
- Detailed custody/audit visualization

These are extensions and should not be assumed to exist in the current Solidity contracts.

---

# 45. Final Project Concept

The project can be summarized as:

```text
Pharmaceutical traceability
        +
Blockchain-based custody and lifecycle
        +
Configurable cold-chain limits
        +
Authorized logger identity
        +
Immutable temperature history
        +
Automatic excursion detection
        +
QR-based medicine lookup
        +
React visualization
        =
Medicine Cold Chain Integrity System
```

The key architectural principle is that **React is the user interface, Web3.js is the blockchain communication layer, MetaMask supplies wallet identity/signatures, and the Solidity contracts enforce the actual business rules and maintain the trusted on-chain record.**
