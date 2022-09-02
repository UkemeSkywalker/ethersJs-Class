import abi from "./abi.js";
import openTab from "./tab.js";
const { ethers: etherjs } = ethers;

const rpcUrl = "https://goerli.infura.io/v3/ba80361523fe423bb149026a490266f0";
const signerProvider = new etherjs.providers.Web3Provider(window.ethereum);

const provider = new etherjs.providers.JsonRpcProvider(rpcUrl);

const signer = signerProvider.getSigner();
// Tokens
const tokenAddress = "0xC770d227Eb937D7D3A327e68180772571C24525F";
const abw = "0xa312C8cD98C4F539AB30ff4fdd4Dc5579E6b087b";
// const tokenlist = {
//   abw: "0xa312C8cD98C4F539AB30ff4fdd4Dc5579E6b087b",
//   devRelCoin: "0x9991F670aFDF369B9d83064f335E5609D5dE9D3F",
//   GrandPrixToken: "0xb7f8e86DD191683c9B7ef3B88F08926F4e86cF44",
//   herrenConsultToken: "0x0A6ff5bf6B08949833ac9FAB65b750885362b591",
//   marsNetworkCoin: "0xB229515c1C28268AcB79Dd7A71B583e66f0cF797"
// } 

const tokenList = [
  "0xa312C8cD98C4F539AB30ff4fdd4Dc5579E6b087b",
  "0x9991F670aFDF369B9d83064f335E5609D5dE9D3F",
  "0xb7f8e86DD191683c9B7ef3B88F08926F4e86cF44",
  "0x0A6ff5bf6B08949833ac9FAB65b750885362b591",
  "0xB229515c1C28268AcB79Dd7A71B583e66f0cF797"
]

const useContract = (index, contractAbi = abi, isSigner = false
) => {
  const providerSigner = new etherjs.providers.Web3Provider(window.ethereum);
  const signer = providerSigner.getSigner();
  
  const provider = new etherjs.providers.JsonRpcProvider(rpcUrl);
  const newProvider = isSigner ? signer : provider;
  return new etherjs.Contract(tokenList[index], contractAbi, newProvider);
};


// view functions
// new ethers.Contract(address, abi, provider)

//state  mutating functions
// new ethers.Contract(address, abi, signer)

const connectWallet = async () => {
  await signerProvider.send("eth_requestAccounts");
  await getUserWallet();
};

const getUserWallet = async () => {
  let userAddress = await signer.getAddress();
  //   connectedWallet = userAddress;
  updateUserAddress(userAddress);
  return userAddress;
  //   console.log(connectedWallet, "connected wallet");
};




export default {
  openTab,
};

// elements
// const button = document.getElementById("connectBtn");
// const userAddress = document.getElementById("userAddress");

// Event Listeners
connectBtn.addEventListener("click", connectWallet);

function updateUserAddress(address) {
  userAddress.innerText = address;
}

function tokenTemplateUpdate(name, symbol, totalSupply, userbalance) {
  return `<div id="token"><div class="flex justify-between items-center">
    <div>
        <div class="flex items-center">
            <div class="p-2 token-thumbnail w-10 h-10"> 
                <img src="https://bafybeiekvvr4iu4bqxm6de5tzxa3yfwqptmsg3ixpjr4edk5rkp3ddadaq.ipfs.dweb.link/" alt="token-img" />  </div>
            <div>
                <p class="font-semibold">${name} - ${symbol} </p>
                <p>Total Supply:${totalSupply}</p>
            </div>
        </div>
    </div>
    <div>${userbalance}</div>
</div></div>`;
}


async function getTokenDetails() {
  loader.innerText = "Loading...";
  let preparedData = [];

  for (let i = 0; i < tokenList.length; i++) {

    const token = await useContract(i, abi);
    try {
      const [name, symbol, totalSupply, userbalance] = await Promise.all([
        token.name(),
        token.symbol(),
        token.totalSupply(),
        token.balanceOf(getUserWallet())
        
      ]);
      
      preparedData.push({ name, symbol, totalSupply: Number(totalSupply), userbalance});
      console.log(preparedData);
    } catch (error) {
      errored.innerText = "Error Occurred!";
      console.log("error occurred", error);
    }
     finally {
      loader.innerText = "";
    }
  }
  
return preparedData;

}





async function InitData() {
  // const { name, symbol, totalSupply, userbalance} = await getTokenDetails();
  const prepData = await getTokenDetails();
  // get the warapper element 

  // prep the child element 

  // push the child element
  for(let i = 0; i < prepData.length; i++){
    const template = tokenTemplateUpdate(prepData[i].name, prepData[i].symbol, prepData[i].totalSupply / 10 ** 18, prepData[i].userbalance);
    const node = document.createElement("div");
    node.innerHTML = template;
    document.getElementById("wrap").appendChild(node);
    
  }
  // console.log(something);
  // const template = tokenTemplateUpdate(name, symbol, totalSupply / 10 ** 18, userbalance);
  // token.innerHTML = template;
}

InitData();



// tokenDetails();

/***
 * @amt - Number
 * @receiver - string
 **/
async function sendToken(address, amt) {
  const contract = useContract(tokenAddress, abi, true);
  const decimal = await getDecimals();
  const parseUnit = new etherjs.utils.parseUnits(amt, decimal);
  const txn = await contract.transfer(address, parseUnit);
  console.log(txn, "transaction pending....");
  sendTransaction.innerText = "Sending";
  window.alert(`transaction pending....`);
  const confirm = await txn.wait();
  console.log("transaction ends", confirm);
  window.alert(`${amt} CLT sent to ${address}`);
  sendTransaction.innerText = "Send";
}

async function getDecimals() {
  return await useContract().decimals();
}

sendTransaction.addEventListener("click", async () => {
  const amount = amt.value;
  const receiverAddress = receiver.value;
  console.log(amount, receiverAddress);

  await sendToken(receiver.value, amt.value);
});
