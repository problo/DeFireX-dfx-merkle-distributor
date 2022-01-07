require('dotenv').config();

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA));
const BigNumber = require('bignumber.js');
const fs = require('fs');
const {decToHex, zeroPad, pack} = require('./helpers/utils.js');
const { MerkleTree } = require('./helpers/merkleTree.js');

const TOTAL_DFX_DISTRIBUTION = 100 * 1000 - 2000; // 100,000 DFX
const MIN_BALANCE = 20;
const MAX_BLOCK = 12022855; // Mar-12-2021 09:15:31 AM +UTC
const IS_GENERATE_TREE_ONLY = true;

(async () => {
    const defirex = new web3.eth.Contract(JSON.parse(`[{"constant":false,"inputs":[],"name":"acceptOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amountDAI","type":"uint256"},{"internalType":"uint256","name":"amountUSDC","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"address","name":"flashLoanFromAddress","type":"address"}],"name":"boostFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amountDAI","type":"uint256"},{"internalType":"uint256","name":"amountUSDC","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"address","name":"flashLoanFromAddress","type":"address"},{"internalType":"enum IDfFinanceDeposits.FlashloanProvider","name":"_providerType","type":"uint8"}],"name":"burnTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amountDAI","type":"uint256"},{"internalType":"bool","name":"useFlashLoan","type":"bool"}],"name":"burnTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_newRate","type":"uint256"}],"name":"changeCRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_newCoef","type":"uint256"}],"name":"changeEthCoef","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_claimForAddress","type":"address"}],"name":"claimProfitForCustomContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimProfitForLockedOnBridge","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimProfitForUniswap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"compPrice","type":"uint256"}],"name":"CompSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Credit","type":"event"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amountDAI","type":"uint256"},{"internalType":"uint256","name":"amountUSDC","type":"uint256"},{"internalType":"address","name":"flashloanFromAddress","type":"address"},{"internalType":"enum IDfFinanceDeposits.FlashloanProvider","name":"_providerType","type":"uint8"}],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"fixProfit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"migrateToV2Once","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint64","name":"index","type":"uint64"},{"indexed":false,"internalType":"uint64","name":"usdtProfit","type":"uint64"},{"indexed":false,"internalType":"uint64","name":"daiProfit","type":"uint64"}],"name":"Profit","type":"event"},{"constant":false,"inputs":[{"internalType":"address","name":"_admin","type":"address"},{"internalType":"bool","name":"_status","type":"bool"}],"name":"setAdminPermission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address[]","name":"_admins","type":"address[]"},{"internalType":"bool","name":"_status","type":"bool"}],"name":"setAdminPermission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newContract","type":"address"},{"internalType":"bool","name":"bActive","type":"bool"}],"name":"setApprovedContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_newAddress","type":"address"}],"name":"setLiquidityProviderAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"enum IDfFinanceDeposits.FlashloanProvider","name":"_newProviderType","type":"uint8"}],"name":"setProviderType","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_newRewardFee","type":"uint256"}],"name":"setRewardFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"flashLoanFromAddress","type":"address"},{"internalType":"uint256","name":"_newCRate","type":"uint256"},{"internalType":"uint256","name":"_newEthCoef","type":"uint256"},{"internalType":"uint256[3]","name":"amounts","type":"uint256[3]"},{"internalType":"bool","name":"check","type":"bool"}],"name":"sync","outputs":[{"internalType":"uint256","name":"avgCRate","type":"uint256"},{"internalType":"uint256","name":"avgEthCoef","type":"uint256"},{"internalType":"uint256","name":"f","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amountDAI","type":"uint256"},{"internalType":"uint256","name":"amountUSDC","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"address","name":"flashLoanFromAddress","type":"address"}],"name":"unwindFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint64","name":"max","type":"uint64"}],"name":"userClaimProfit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint64","name":"fromIndex","type":"uint64"},{"internalType":"uint64","name":"lastIndex","type":"uint64"},{"internalType":"uint256","name":"totalUsdtProfit","type":"uint256"},{"internalType":"uint256","name":"totalDaiProfit","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"bool","name":"isReinvest","type":"bool"}],"name":"userClaimProfitOptimized","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"admins","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"approvedContracts","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint256","name":"max","type":"uint256"}],"name":"calcUserProfit","outputs":[{"internalType":"uint256","name":"totalUsdtProfit","type":"uint256"},{"internalType":"uint256","name":"totalDaiProfit","type":"uint256"},{"internalType":"uint64","name":"index","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CDAI_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CETH_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"COMP_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"COMPOUND_ORACLE","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"COMPTROLLER","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"crate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CUSDC_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CWBTC_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DAI_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dfFinanceDeposits","outputs":[{"internalType":"contract IDfFinanceDeposits","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dfWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ETH_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ethCoef","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"fundsUnwinded","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCompPriceInDAI","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getUniswapAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint64","name":"fromIndex","type":"uint64"},{"internalType":"uint256","name":"max","type":"uint256"}],"name":"getUserProfitFromCustomIndex","outputs":[{"internalType":"uint256","name":"totalUsdtProfit","type":"uint256"},{"internalType":"uint256","name":"totalDaiProfit","type":"uint256"},{"internalType":"uint64","name":"index","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastFixProfit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastProfitDistIndex","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"liquidityProviderAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"profits","outputs":[{"internalType":"uint64","name":"blockNumber","type":"uint64"},{"internalType":"uint64","name":"daiProfit","type":"uint64"},{"internalType":"uint64","name":"usdtProfit","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"providerType","outputs":[{"internalType":"enum IDfFinanceDeposits.FlashloanProvider","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"internalType":"contract IDfDepositToken","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenETH","outputs":[{"internalType":"contract IDfDepositToken","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenUSDC","outputs":[{"internalType":"contract IDfDepositToken","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"USDC_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"USDT_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint256","name":"snapshotId","type":"uint256"}],"name":"userShare","outputs":[{"internalType":"uint256","name":"totalLiquidity","type":"uint256"},{"internalType":"uint256","name":"totalSupplay","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"WBTC_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"WETH_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]`), '0xb942ca22e0eb0f2524f53f999ae33fd3b2d58e3e');
    const dDAI = new web3.eth.Contract(JSON.parse(`[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Delegated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"Snapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Undelegated","type":"event"},{"constant":false,"inputs":[],"name":"acceptOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"snapshotId","type":"uint256"}],"name":"balanceOfAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOfWithDelegated","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOfWithoutReceived","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"delegates","outputs":[{"internalType":"uint128","name":"delegatedBalance","type":"uint128"},{"internalType":"uint128","name":"receivedBalance","type":"uint128"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"delgate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint8","name":"decimals","type":"uint8"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint8","name":"_decimals","type":"uint8"},{"internalType":"address payable","name":"_controller","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"prices","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"snapshot","outputs":[{"internalType":"uint256","name":"currentId","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"snapshot","outputs":[{"internalType":"uint256","name":"currentId","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"snapshotId","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address[]","name":"recipients","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"undelgate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]`), '0xfACd9A6fD887855d9432F7a080911b26d9DCAE01');
    const minBlock = 10570000;

    const finalDist = [];
    if (!IS_GENERATE_TREE_ONLY) {
        let uniqueAddresses = [];
        const STEP = 100000;
        for (let fromBlock = minBlock; fromBlock <= MAX_BLOCK; fromBlock += STEP) {
            const ret = await dDAI.getPastEvents('Transfer', {
                fromBlock: fromBlock,
                toBlock: fromBlock + STEP > MAX_BLOCK ? MAX_BLOCK : fromBlock + STEP
            });
            for (let row of ret) {
                const {to, from} = row.returnValues;
                for (let address of [to.toLowerCase(), from.toLowerCase()]) {
                    if (uniqueAddresses.indexOf(address) === -1) uniqueAddresses.push(address);
                }
            }
            // console.log('ret', ret);
        }
        console.log(`${uniqueAddresses.length} unique address`);

        const dfxDistributionShare = {};
        let n = 0;
        let totalShare = 0;
        let lastBlock = minBlock;
        let totalTime = 0;
        while (true) {
            let blockNumber;
            try {
                const ret = await defirex.methods.profits(n).call();
                blockNumber = ret.blockNumber;
            } catch (e) {
                break;
            }

            if (blockNumber > MAX_BLOCK) break;
            const lastBlockInfo = await web3.eth.getBlock(lastBlock, false);
            const currentBlockInfo = await web3.eth.getBlock(blockNumber, false);
            const timeDiff = currentBlockInfo.timestamp - lastBlockInfo.timestamp;
            totalTime += timeDiff;
            // const coef = 1 / (Math.log(1 + (n + 1) / 100));
            const coef = (n + 2) / (Math.log(2 + n) * (n + 1));
            console.log('snapshot', n, 'coef', coef);
            for (const address of uniqueAddresses) {
                const {totalLiquidity, totalSupplay} = await defirex.methods.userShare(address, n + 1).call();
                if (!dfxDistributionShare[address]) dfxDistributionShare[address] = 0;
                const currentShare = (totalLiquidity * timeDiff / totalSupplay * coef) || 0;
                dfxDistributionShare[address] += currentShare;
                totalShare += currentShare;
            }
            n++;
            lastBlock = blockNumber;
        }
        totalShare /= totalTime;
        fs.writeFileSync('./dfxDistributionShare.tmp', JSON.stringify({
            dfxDistributionShare,
            totalShare,
            totalTime
        }), 'utf8');
        // let {dfxDistributionShare, totalShare, totalTime} = JSON.parse(fs.readFileSync('./dfxDistributionShare.tmp', 'utf8'));

        // Write to file total distribution
        fs.writeFileSync('./dfxDistributionFinal.tmp', '', 'utf8');
        for (const address of uniqueAddresses) {
            let amount = Math.floor((dfxDistributionShare[address] / totalTime * TOTAL_DFX_DISTRIBUTION / totalShare) * 100) / 100;
            if (amount < MIN_BALANCE) amount = MIN_BALANCE;
            console.log(address, amount);
            finalDist.push({address, amount});
        }
        const greaterThenMinUsers = finalDist.filter(x => x.amount > MIN_BALANCE);
        const totalNotMin = greaterThenMinUsers.reduce((memo, x) => memo + x.amount, 0);
        const diff = finalDist.reduce((memo, x) => memo + x.amount, 0) - TOTAL_DFX_DISTRIBUTION;
        for (let user of greaterThenMinUsers) {
            user.amount -= diff * user.amount / totalNotMin;
        }

        for (let {address, amount} of finalDist) {
            fs.appendFileSync('./dfxDistributionFinal.tmp', `${address} ${amount}\r\n`, 'utf8');
        }
    } else {
        const rows = fs.readFileSync('./dfxDistributionFinal.tmp', 'utf8').split('\r\n').filter(x => x).map(x => x.trim());
        for(let row of rows) {
            const [address, amount] = row.split(' ').map(x => x.trim());
            console.log({address, amount});
            finalDist.push({address, amount});
        }
    }
    // Generate Merkle Tree
    let totalFunds = 0;
    let gIndex = 0;
    const elements = finalDist.map((x)=>{
        const index = gIndex++;
        const address = x.address;
        const amount = new BigNumber(x.amount).multipliedBy(10**18).toString(10);
        if (address.length != 42) throw new Error();
        const packed = pack([index, address, amount], [256, 160, 256]);
        totalFunds += amount * 1;
        return {leaf: Buffer.from(packed, 'hex'), index: index, address: address, amount};
    });

    const merkleTree = new MerkleTree(elements.map(x =>x.leaf));

    const root = merkleTree.getHexRoot();
    console.info('root', root);
    console.info('totalFunds', totalFunds);

    fs.writeFileSync('./dfx-merkle-distributor.json',
        JSON.stringify(elements.map((x)=>{
            return {proofs: merkleTree.getHexProof(x.leaf), index: x.index, address: x.address, amount : x.amount};
        })), 'utf8');



})();


