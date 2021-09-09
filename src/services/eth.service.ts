import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { web3 } from "../utils/Web3";

@Injectable()
export class EthService {
  private etherscanApiKey = "Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV";

  constructor(private httpService: HttpService) {}

  async getTopChangesBalance() {
    const lastBlocks = await this.getLastBlocks();
    const transactions = this.getLastTransactions(lastBlocks);
    const transactionsWithInfo = await this.getTransactionsWithInfo(
      transactions
    );

    let changesMap: Map<string, number> = new Map();

    for (let transaction of transactionsWithInfo) {
      let transactionValue = Number(transaction.value);

      let addressToValue = changesMap.get(transaction.from);

      if (addressToValue == undefined) {
        changesMap.set(transaction.to, transactionValue);
      } else {
        changesMap.set(transaction.to, addressToValue + transactionValue);
      }

      let addresFromValue = changesMap.get(transaction.to);

      if (addresFromValue == undefined) {
        changesMap.set(transaction.from, transactionValue);
      } else {
        changesMap.set(transaction.from, addresFromValue + transactionValue);
      }
    }

    let topBalanceAddress = {
      address: "",
      value: 0,
    };

    changesMap.forEach((value, address) => {
      if (value > topBalanceAddress.value) {
        topBalanceAddress.value = value;
        topBalanceAddress.address = address;
      }
    });

    console.log(`Top balance address`);
    console.log(topBalanceAddress);

    return topBalanceAddress;
  }

  getLastTransactions(blocks: any[]) {
    let transactions = [];

    blocks.forEach((block) => {
      block.transactions.forEach((transaction) =>
        transactions.push(transaction)
      );
    });

    return transactions;
  }

  async getTransactionsWithInfo(transactions: any[]) {
    let getTransactionRequests = [];
    let transactionsWithInfo = [];

    for (let transaction of transactions) {
      let request = web3.eth.getTransaction(transaction.hash);
      getTransactionRequests.push(request);
    }

    transactionsWithInfo = await Promise.all(getTransactionRequests);

    return transactionsWithInfo;
  }

  async getLastBlocks() {
    let lastBlockNumber = await this.getLastBlockNumber();
    let lastBock16 = parseInt(lastBlockNumber, 16);

    let blocks = [];

    /*
      Можно перенести на promise.all, но упираемся в etherscan request rate
    */

    for (let i = 1; i <= 5; i++) {
      let lastNum = lastBock16 - i;
      let hash = lastNum.toString(16);
      let block = await this.getBlock(hash);
      blocks.push(block);
    }

    return blocks;
  }

  async getLastBlockNumber() {
    let requestResult = await this.httpService
      .get(
        `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${this.etherscanApiKey}`
      )
      .toPromise();

    return requestResult.data.result;
  }

  async getBlock(num16: string) {
    let requestResult = await this.httpService
      .get(
        `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${num16}&boolean=true&apikey=${this.etherscanApiKey}`
      )
      .toPromise();

    return requestResult.data.result;
  }
}
