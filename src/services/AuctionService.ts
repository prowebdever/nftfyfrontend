import { MaxUint256 } from '@ethersproject/constants'
import { AbiItem } from 'web3-utils'
import nftfyErc20AuctionAbi from '../abi/erc20NftfyAuction.json'
import erc721Abi from '../abi/erc721.json'
import nftfyAuctionAbi from '../abi/nftfyAuction.json'
import { getChainConfigById } from '../config'
import { clearTransaction, handleTransaction, TransactionType } from '../graphql/variables/TransactionVariable'
import { code } from '../messages'
import { initializeWeb3 } from './MultiWalletService'
import { notifyError } from './NotificationService'
import { units } from './UtilService'

export const fractionalizeErc721 = (
  erc721Address: string,
  erc721Id: number,
  name: string,
  symbol: string,
  fractionPrice: string,
  fractionCount: string,
  fractionDecimals: number,
  paymentTokenAddress: string,
  fee: string,
  numberOfDays: number,
  account: string,
  chainId: number
): void => {
  try {
    const { nftfyAuctionAddress, ethAddress, balancer } = getChainConfigById(chainId)
    const web3 = initializeWeb3(chainId)
    // Kickoff set as 0 since it is not schedulable in the current version
    const kickoff = 0
    // 24 hours in seconds
    const duration = 60 * 60 * 24 * numberOfDays

    const contractNftfy = new web3.eth.Contract(nftfyAuctionAbi as AbiItem[], nftfyAuctionAddress)
    contractNftfy.methods
      .fractionalize(
        erc721Address,
        erc721Id,
        name,
        symbol,
        fractionDecimals,
        units(fractionCount, fractionDecimals),
        fractionPrice,
        paymentTokenAddress === balancer.eth ? ethAddress : paymentTokenAddress,
        kickoff,
        duration,
        units(fee, 16)
      )
      .send({ from: account }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.fractionalize) : clearTransaction()
      })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const approveErc721 = (erc721Address: string, erc721TokenId: number, account: string, chainId: number): void => {
  try {
    const { nftfyAuctionAddress } = getChainConfigById(chainId)
    const web3 = initializeWeb3(chainId)
    const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], erc721Address)
    contractErc721.methods.approve(nftfyAuctionAddress, erc721TokenId).send({ from: account }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.fractionalizeApprove) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const getApproved721 = async (erc721Address: string, erc721TokenId: number, chainId: number) => {
  try {
    const { nftfyAuctionAddress, cryptokitties } = getChainConfigById(chainId)
    const web3 = initializeWeb3(chainId)
    const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], erc721Address)

    if (erc721Address === cryptokitties.contractAddress) {
      const cryptoKittiesAddress = await contractErc721.methods.kittyIndexToApproved(erc721TokenId).call()
      return cryptoKittiesAddress === nftfyAuctionAddress
    }

    const address = await contractErc721.methods.getApproved(erc721TokenId).call()
    return address === nftfyAuctionAddress
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}

export const isApprovedErc20 = async (erc20Address: string, spenderAddress: string, accountAddress: string, chainId: number) => {
  const web3 = initializeWeb3(chainId)
  const contractERC20 = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)

  return contractERC20.methods.allowance(accountAddress, spenderAddress).call()
}

export const approveErc20 = (erc20Address: string, erc20SpenderAddress: string, accountAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)
    contractErc20Fraction.methods
      .approve(erc20SpenderAddress, MaxUint256.toString())
      .send({ from: accountAddress }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.bidApprove) : clearTransaction()
      })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const bidAmountOf = async (erc20Address: string, accountAddress: string, fractionPrice: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)

    return contractErc20Fraction.methods.bidAmountOf(accountAddress, fractionPrice).call()
  } catch (error) {
    return error
  }
}

export const bidRangeOf = async (erc20Address: string, accountAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)

    return contractErc20Fraction.methods.bidRangeOf(accountAddress).call()
  } catch (error) {
    notifyError(code[5011], error)
    return error
  }
}

export const bid = async (
  erc20Address: string,
  paymentTokenDecimals: number,
  accountAddress: string,
  fractionPrice: string,
  isNetworkToken: boolean,
  chainId: number
) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)
    const payableAmount = isNetworkToken ? await bidAmountOf(erc20Address, accountAddress, fractionPrice, chainId) : 0

    await contractErc20Fraction.methods
      .bid(fractionPrice)
      .send({ from: accountAddress, value: payableAmount }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.bid) : clearTransaction()
      })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const getStatusOffer = async (erc20Address: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)
    const result = contractErc20Fraction.methods.status().call()
    return result
  } catch (error) {
    notifyError(code[5011], error)
    return error
  }
}

export const isOwner = async (erc20Address: string, accountAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)

    return contractErc20Fraction.methods.isOwner(accountAddress).call()
  } catch (error) {
    notifyError(code[5011], error)
    return error
  }
}

export const redeem = async (erc20Address: string, accountAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)
    contractErc20Fraction.methods.redeem().send({ from: accountAddress }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.redeem) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const cancel = async (erc20Address: string, accountAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)
    contractErc20Fraction.methods.cancel().send({ from: accountAddress }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.bidCancel) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const updatePrice = async (erc20Address: string, accountAddress: string, fractionPrice: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Fraction = new web3.eth.Contract(nftfyErc20AuctionAbi as AbiItem[], erc20Address)
    contractErc20Fraction.methods.updatePrice(fractionPrice).send({ from: accountAddress }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.bidUpdate) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}
