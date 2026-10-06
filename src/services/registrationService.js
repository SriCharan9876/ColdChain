import { getWeb3 } from './web3Provider';
import RegistrationLoginABI from '../contracts/RegistrationLoginABI.json';

const getRegistrationContract = () => {
  const web3 = getWeb3();
  const address = import.meta.env.VITE_REGISTRATION_CONTRACT_ADDRESS;
  return new web3.eth.Contract(RegistrationLoginABI, address);
};

export const registerUser = async (userInput, account) => {
  const contract = getRegistrationContract();
  return contract.methods.register(userInput).send({ from: account });
};

export const loginUser = async (email, password, account) => {
  const contract = getRegistrationContract();
  return contract.methods.login(email, password).send({ from: account });
};

export const getUserDetails = async (email, password) => {
  const contract = getRegistrationContract();
  return contract.methods.getUserDetails(email, password).call();
};

export const getAllUserDetails = async () => {
  const contract = getRegistrationContract();
  return contract.methods.getAllUserDetails().call();
};