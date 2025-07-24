const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

// Connect to the local Ethereum node (Ganache)
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// Read and compile the Solidity code
const code = fs.readFileSync('D:/Enhanced_Blockchain_Voting-main/Enhanced_Blockchain_Voting-main/voting.sol').toString();
const compiledCode = solc.compile(code);

// Extract ABI and Bytecode from compiled contract
const abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);
const VotingContract = web3.eth.contract(abiDefinition);
const byteCode = "0x" + compiledCode.contracts[':Voting'].bytecode; // Add "0x" prefix herega

// Helper function to convert string to bytes32 format
function toBytes32(text) {
  return web3.padRight(web3.fromAscii(text), 64);
}

// Deploy the contract
web3.eth.getAccounts((error, accounts) => {
  if (error) {
    console.log(error);
    return;
  }

  const candidateNames = ['Sanat', 'Aniket', 'Mandar', 'Akshay'].map(name => {
    const bytes32Name = toBytes32(name);
    console.log(`Bytes32 for ${name}: ${bytes32Name}`); // Displaying bytes32 representation
    return bytes32Name;
  });

  const deployedContract = VotingContract.new(
    candidateNames,
    {
      data: byteCode,
      from: accounts[0],
      gas: 4700000
    },
    (err, contract) => {
      if (err) {
        console.log(err);
        return;
      }
      if (contract.address) {
        console.log("Contract deployed at address: " + contract.address);
        // Save contract address for UI or further use
        fs.writeFileSync('contractAddress.txt', contract.address);
        console.log("ABI Definition: ", JSON.stringify(abiDefinition));
      }
    }
  );
});
