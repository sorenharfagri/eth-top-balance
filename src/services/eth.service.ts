import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { web3 } from "../utils/Web3";

@Injectable()
export class EthService {
  private etherscanApiKey = "Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV";

  constructor(private httpService: HttpService) {}

  async onModuleInit() {
    await this.getTopChangesBalance();
  }

  async getTopChangesBalance() {
    const lastBlocks = await this.getLastBlocks();
    const transactions = this.getLastTransactions(lastBlocks);

    const changesMap: Map<string, number> = new Map();

    for (let transaction of transactions) {
      const transactionValue = parseInt(transaction.value, 16)

      const addressToValue = changesMap.get(transaction.to);

      if (addressToValue == undefined) {
        changesMap.set(transaction.to, transactionValue);
      } else {
        changesMap.set(transaction.to, addressToValue + transactionValue);
      }

      const addresFromValue = changesMap.get(transaction.from);

      if (addresFromValue == undefined) {
        changesMap.set(transaction.from, -transactionValue);
      } else {
        changesMap.set(transaction.from, addresFromValue - transactionValue);
      }
    }

    const topBalanceAddress = {
      address: "",
      value: 0,
    };

    changesMap.forEach((value, address) => {
      if (Math.abs(value) > topBalanceAddress.value) {
        topBalanceAddress.value = Math.abs(value);
        topBalanceAddress.address = address;
      }
    });

    console.log(`Top balance address`);
    console.log(topBalanceAddress);

    return topBalanceAddress;
  }

  getLastTransactions(blocks: any[]) {
    const transactions = [];

    blocks.forEach((block) => {
      block.transactions.forEach((transaction) =>
        transactions.push(transaction)
      );
    });

    return transactions;
  }

  /*
    Deprecated
  */
  async getTransactionsWithInfo(transactions: any[]) {
    const getTransactionRequests = [];

    for (let transaction of transactions) {
      const request = web3.eth.getTransaction(transaction.hash);
      getTransactionRequests.push(request);
    }

    const transactionsWithInfo = await Promise.all(getTransactionRequests);

    return transactionsWithInfo;
  }

  async getLastBlocks() {
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBock16 = parseInt(lastBlockNumber, 16);

    const blocks = [];

    /*
      Можно перенести на promise.all, но упираемся в etherscan request rate
    */

    for (let i = 1; i <= 100; i++) {
      const lastNum = lastBock16 - i;
      const hash = lastNum.toString(16);
      const block = await this.getBlock(hash);
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
