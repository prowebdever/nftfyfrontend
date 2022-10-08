import { MaxUint256 } from '@ethersproject/constants'
import BigNumber from 'bignumber.js'
import { now } from 'lodash'
import { AbiItem } from 'web3-utils'
import erc20Abi from '../abi/erc20.json'
import peerToPeerAbi from '../abi/peerToPeerAbi.json'
import { getChainConfigById } from '../config'
import { nftfyPeerToPeerGraphQlClient } from '../graphql/nftfy/peerToPeer/ClientNftfyPeerToPeerGraphql'
import { GetMarketByIdData, GetMarketByIdVars, GET_MARKET_BY_ID_QUERY } from '../graphql/nftfy/peerToPeer/market/GetMarketByTokens'
import {
  GetBuyOrdersPriceByMarketIdData,
  GetBuyOrdersPriceByMarketIdVars,
  GET_BUY_ORDERS_PRICE_BY_MARKET_ID_QUERY
} from '../graphql/nftfy/peerToPeer/order/GetBuyOrdersPriceByMarketId'
import {
  GetSellOrdersPriceByMarketIdData,
  GetSellOrdersPriceByMarketIdVars,
  GET_SELL_ORDERS_PRICE_BY_MARKET_ID_QUERY
} from '../graphql/nftfy/peerToPeer/order/GetSellOrdersPriceByTokens'
import { clearTransaction, handleTransaction, TransactionType } from '../graphql/variables/TransactionVariable'
import { code } from '../messages'
import { initializeWeb3 } from './MultiWalletService'
import { notifyError } from './NotificationService'
import { units } from './UtilService'

export interface PeerToPeerOrder {
  owner: string
  orderId: string
  bookAmount: string
  execAmount: string
  price: string
}

export interface PeerToPeerTransaction {
  id: string
  orderId: string
  price: number
  side: 'BUY' | 'SELL'
  baseToken: string
  quoteToken: string
  baseAmount: string
  quoteAmount: string
  baseFeeAmount: string | null
  quoteFeeAmount: string | null
  maker: string
  taker: string
  age: string
}

export interface PeerToPeerMarket {
  buyOrders: PeerToPeerOrder[]
  sellOrders: PeerToPeerOrder[]
  transactions: PeerToPeerTransaction[]
}

interface EstimateOrderExecutionByBook {
  _bookFeeAmount: string
  _execAmount: string
}

interface PeerToPeerService {
  cancelOrder(orderId: string, account: string): void
  createOrder(
    payableAmount: string,
    bookToken: string,
    execToken: string,
    bookAmount: string,
    execAmount: string,
    bookTokenDecimals: number,
    execTokenDecimals: number,
    account: string
  ): Promise<void>
  updateOrder(
    payableAmount: string,
    orderId: string,
    bookAmount: string,
    execAmount: string,
    bookTokenDecimals: number,
    execTokenDecimals: number,
    account: string
  ): void
  executeOrder(
    payableAmount: string,
    orderId: string,
    bookAmount: string,
    execAmount: string,
    bookTokenDecimals: number,
    account: string
  ): void
  estimateOrderExecutionByBook(orderId: string, bookAmount: string, bookTokenDecimals: number): Promise<EstimateOrderExecutionByBook>
  getMarket(baseToken: string, quoteToken: string): Promise<PeerToPeerMarket>
  isApprovedErc20(erc20Address: string, account: string): Promise<number>
  approveErc20(erc20Address: string, account: string): void
  getTokensPairMarketPrice(bookTokenAddress: string, execTokenAddress: string, bookTokenDecimals?: number): Promise<string | undefined>
  fee(): Promise<string>
}

export const TheGraphPeerToPeerService = (chainId: number): PeerToPeerService => {
  return {
    cancelOrder(orderId: string, account: string): void {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)

        const contractErc20 = new web3.eth.Contract(peerToPeerAbi as AbiItem[], peerToPeerAddress)
        contractErc20.methods.cancelOrder(orderId).send({ from: account }, (_error: Error, tx: string) => {
          tx ? handleTransaction(tx, TransactionType.peerToPeerCancelOrder) : clearTransaction()
        })
      } catch (error) {
        notifyError(code[5011], error)
      }
    },
    async createOrder(
      payableAmount: string,
      bookToken: string,
      execToken: string,
      bookAmount: string,
      execAmount: string,
      bookTokenDecimals: number,
      execTokenDecimals: number,
      account: string
    ): Promise<void> {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)

        const contractErc20 = new web3.eth.Contract(peerToPeerAbi as AbiItem[], peerToPeerAddress)
        const orderId = await contractErc20.methods.generateOrderId(account, Date.now()).call()

        await contractErc20.methods
          .createOrder(bookToken, execToken, orderId, units(bookAmount, bookTokenDecimals), units(execAmount, execTokenDecimals))
          .send({ from: account, value: payableAmount }, (_error: Error, tx: string) => {
            tx ? handleTransaction(tx, TransactionType.peerToPeerCreateOrder) : clearTransaction()
          })
      } catch (error) {
        notifyError(code[5011], error)
      }
    },
    updateOrder(
      payableAmount: string,
      orderId: string,
      bookAmount: string,
      execAmount: string,
      bookTokenDecimals: number,
      execTokenDecimals: number,
      account: string
    ): void {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)

        const contractErc20 = new web3.eth.Contract(peerToPeerAbi as AbiItem[], peerToPeerAddress)
        contractErc20.methods
          .updateOrder(orderId, units(bookAmount, bookTokenDecimals), units(execAmount, execTokenDecimals))
          .send({ from: account, value: payableAmount }, (_error: Error, tx: string) => {
            tx ? handleTransaction(tx, TransactionType.peerToPeerUpdateOrder) : clearTransaction()
          })
      } catch (error) {
        notifyError(code[5011], error)
      }
    },
    executeOrder(
      payableAmount: string,
      orderId: string,
      bookAmount: string,
      execAmount: string,
      bookTokenDecimals: number,
      account: string
    ): void {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)
        const contractErc20 = new web3.eth.Contract(peerToPeerAbi as AbiItem[], peerToPeerAddress)

        contractErc20.methods
          .executeOrder(orderId, units(bookAmount, bookTokenDecimals), execAmount)
          .send({ from: account, value: payableAmount }, (_error: Error, tx: string) => {
            tx ? handleTransaction(tx, TransactionType.peerToPeerExecuteOrder) : clearTransaction()
          })
      } catch (error) {
        notifyError(code[5011], error)
      }
    },
    async estimateOrderExecutionByBook(
      orderId: string,
      bookAmount: string,
      bookTokenDecimals: number
    ): Promise<EstimateOrderExecutionByBook> {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)
        const contractPeerToPeer = new web3.eth.Contract(peerToPeerAbi as AbiItem[], peerToPeerAddress)

        return contractPeerToPeer.methods.estimateOrderExecutionByBook(orderId, units(bookAmount, bookTokenDecimals)).call()
      } catch (error) {
        notifyError(code[5011], error)
        return { _bookFeeAmount: '', _execAmount: '' }
      }
    },
    approveErc20(erc20Address: string, account: string): void {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)
        const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20Address)
        contractErc20.methods.approve(peerToPeerAddress, MaxUint256.toString()).send({ from: account }, (_error: Error, tx: string) => {
          tx ? handleTransaction(tx, TransactionType.peerToPeerApproveErc20) : clearTransaction()
        })
      } catch (error) {
        notifyError(code[5011], error)
      }
    },
    async isApprovedErc20(erc20Address: string, account: string): Promise<number> {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)
        const contractERC20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20Address)
        return contractERC20.methods.allowance(account, peerToPeerAddress).call()
      } catch (error) {
        notifyError(code[5011], error)
        return 0
      }
    },
    async getMarket(baseToken: string, quoteToken: string): Promise<PeerToPeerMarket> {
      try {
        const getAge = (timestamp: string): string => {
          const executionTime = Number(timestamp) * 1000
          const diffSeconds = (now() - executionTime) / 1000

          let message = `${diffSeconds} seconds ago`

          if (diffSeconds > 60) {
            const minutes = Math.floor(diffSeconds / 60)
            message = `${minutes} mins ago`
          }

          if (diffSeconds > 3600) {
            const hours = Math.floor(diffSeconds / 3600)
            message = `${hours} hours ago`
          }

          if (diffSeconds > 86400) {
            const days = Math.floor(diffSeconds / 86400)
            message = `${days} days ago`
          }

          return message
        }

        const market = await nftfyPeerToPeerGraphQlClient(chainId).query<GetMarketByIdData, GetMarketByIdVars>({
          query: GET_MARKET_BY_ID_QUERY,
          variables: { id: `${baseToken.toLowerCase()}:${quoteToken.toLowerCase()}` }
        })

        if (market.data.market === null) {
          return {
            sellOrders: [],
            buyOrders: [],
            transactions: []
          }
        }

        const buyOrders: PeerToPeerOrder[] = market.data.market.bids.map(bid => {
          return {
            orderId: bid.id,
            owner: bid.owner,
            execAmount: bid.quoteAmount,
            bookAmount: bid.baseAmount,
            price: bid.price
          }
        })

        const sellOrders: PeerToPeerOrder[] = market.data.market.asks.map(ask => {
          return {
            orderId: ask.id,
            owner: ask.owner,
            execAmount: ask.quoteAmount,
            bookAmount: ask.baseAmount,
            price: ask.price
          }
        })

        const transactions: PeerToPeerTransaction[] = market.data.market.trades.map(trade => {
          return {
            ...trade,
            age: getAge(trade.timestamp),
            baseToken: trade.market.baseCurrency.id,
            quoteToken: trade.market.quoteCurrency.id
          }
        })

        return {
          transactions,
          sellOrders,
          buyOrders
        }
      } catch (error) {
        notifyError(code[5011], error)
        return { transactions: [], sellOrders: [], buyOrders: [] }
      }
    },
    async getTokensPairMarketPrice(
      bookTokenAddress: string,
      execTokenAddress: string,
      execTokenDecimals: number
    ): Promise<string | undefined> {
      try {
        const graphqlClient = nftfyPeerToPeerGraphQlClient(chainId)
        const buyOrders = await graphqlClient.query<GetBuyOrdersPriceByMarketIdData, GetBuyOrdersPriceByMarketIdVars>({
          query: GET_BUY_ORDERS_PRICE_BY_MARKET_ID_QUERY,
          variables: {
            marketId: `${bookTokenAddress.toLowerCase()}:${execTokenAddress.toLowerCase()}`
          }
        })

        const sellOrders = await graphqlClient.query<GetSellOrdersPriceByMarketIdData, GetSellOrdersPriceByMarketIdVars>({
          query: GET_SELL_ORDERS_PRICE_BY_MARKET_ID_QUERY,
          variables: {
            marketId: `${bookTokenAddress.toLowerCase()}:${execTokenAddress.toLowerCase()}`
          }
        })

        if (!buyOrders && !sellOrders) {
          return undefined
        }

        // Create copy of received arrays to avoid the "Cannot assign to read only property 'length' of object '[object Array]'" error
        const cheapestBuyOrder = [...buyOrders.data?.buyOrders].shift()
        const expensiveSellOrder = [...sellOrders.data?.sellOrders].shift()

        if (!cheapestBuyOrder && !expensiveSellOrder) {
          return undefined
        }
        if (!cheapestBuyOrder && expensiveSellOrder) {
          return expensiveSellOrder.price
        }
        if (cheapestBuyOrder && !expensiveSellOrder) {
          return cheapestBuyOrder.price
        }

        const ordersSum = new BigNumber(expensiveSellOrder?.price || '0').plus(cheapestBuyOrder?.price || '0')

        return ordersSum.dividedBy(2).toNumber().toLocaleString('en', { maximumFractionDigits: execTokenDecimals })
      } catch (error) {
        notifyError(code[5011], error)
        return undefined
      }
    },
    fee(): Promise<string> {
      try {
        const { peerToPeerAddress } = getChainConfigById(chainId)
        const web3 = initializeWeb3(chainId)
        const contractPeerToPeer = new web3.eth.Contract(peerToPeerAbi as AbiItem[], peerToPeerAddress)

        return contractPeerToPeer.methods.fee().call()
      } catch (error) {
        notifyError(code[5011], error)
        return Promise.resolve('')
      }
    }
  }
}
