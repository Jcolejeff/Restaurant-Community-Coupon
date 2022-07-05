import {useContract} from './useContract';
import RestaurantNFT from '../contracts/RestaurantNFT.json';
import RestaurantNFTContract from '../contracts/RestaurantNFTContractAddress.json';


// export interface for NFT contract
export const useMinterContract = () => useContract(RestaurantNFT.abi, RestaurantNFTContract.RestaurantNFT);