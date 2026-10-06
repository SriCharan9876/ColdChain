import { getWeb3 } from './web3Provider';
import AddNewMedicineABI from '../contracts/AddNewMedicineABI.json';
import { MEDICINE_CONTRACT_ADDRESS } from '../contracts/config';

export const getMedicineContract = () => {
  const web3 = getWeb3();
  return new web3.eth.Contract(AddNewMedicineABI, MEDICINE_CONTRACT_ADDRESS);
};

export const addMedicine = async (medicineInput, account) => {
  const contract = getMedicineContract();
  return contract.methods.addMedicine(medicineInput).send({ from: account });
};

export const getMedicine = async (medicineId) => {
  const contract = getMedicineContract();
  return contract.methods.getMedicine(medicineId).call();
};

export const getAllMedicines = async () => {
  const contract = getMedicineContract();
  return contract.methods.getAllMedicines().call();
};

export const registerLogger = async (medicineId, manufacturerId, loggerAddress, account) => {
  const contract = getMedicineContract();
  return contract.methods.registerLogger(medicineId, manufacturerId, loggerAddress).send({ from: account });
};

export const getLogger = async (medicineId) => {
  const contract = getMedicineContract();
  return contract.methods.medicineLoggers(medicineId).call();
};

export const recordTemperature = async (medicineId, temperature, account) => {
  const contract = getMedicineContract();
  return contract.methods.recordTemperature(medicineId, temperature).send({ from: account });
};

export const getTemperatureHistory = async (medicineId) => {
  const contract = getMedicineContract();
  return contract.methods.getTemperatureHistory(medicineId).call();
};

export const getColdChainStatus = async (medicineId) => {
  const contract = getMedicineContract();
  return contract.methods.getColdChainStatus(medicineId).call();
};

export const purchaseMedicine = async (medicineId, quantity, buyerType, buyerId, value, account) => {
  const contract = getMedicineContract();
  return contract.methods.purchaseMedicine(medicineId, quantity, buyerType, buyerId).send({ from: account, value });
};

export const getMedicineEvents = async (medicineId) => {
  const contract = getMedicineContract();
  try {
    // Attempt to query from recent block range first to avoid Infura/Alchemy 10,000 block range limit errors
    const web3 = getWeb3();
    const currentBlock = await web3.eth.getBlockNumber();
    const startBlock = Math.max(0, Number(currentBlock) - 9000);

    const events = await contract.getPastEvents('allEvents', {
      fromBlock: startBlock,
      toBlock: 'latest'
    });
    
    return events.filter(e => e.returnValues && e.returnValues.medicineId === medicineId);
  } catch (err) {
    console.warn("Falling back to query events without block window limit...", err);
    // Fallback attempt with default or lower block range if provider requires
    try {
      const events = await contract.getPastEvents('allEvents', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      return events.filter(e => e.returnValues && e.returnValues.medicineId === medicineId);
    } catch (e) {
      console.error("Failed to fetch events:", e);
      return [];
    }
  }
};