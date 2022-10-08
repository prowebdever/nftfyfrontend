import { MaxUint256 } from '@ethersproject/constants'
import BigNumber from 'bignumber.js'
import { AbiItem } from 'web3-utils'
import erc20Abi from '../abi/erc20.json'
import erc20SharesAbi from '../abi/erc20shares.json'
import erc721Abi from '../abi/erc721.json'
import nftfyAbi from '../abi/nftfy.json'
import { getChainConfigById } from '../config'
import { clearTransaction, handleTransaction, TransactionType } from '../graphql/variables/TransactionVariable'
import { accountVar } from '../graphql/variables/WalletVariable'
import { code } from '../messages'
import { AssetERC20 } from '../types/WalletTypes'
import { initializeWeb3 } from './MultiWalletService'
import { notifyError } from './NotificationService'
import { coins, scale, units } from './UtilService'
import { getErc20Balance } from './WalletService'

export const getApproved721 = async (erc721Address: string, erc721TokenId: number, chainId: number) => {
  try {
    const { nftfyAddress, cryptokitties } = getChainConfigById(chainId)
    const web3 = initializeWeb3(chainId)
    const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], erc721Address)

    if (erc721Address === cryptokitties.contractAddress) {
      const cryptoKittiesAddress = await contractErc721.methods.kittyIndexToApproved(erc721TokenId).call()
      return cryptoKittiesAddress === nftfyAddress
    }

    const address = await contractErc721.methods.getApproved(erc721TokenId).call()
    return address === nftfyAddress
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}

export const approveErc721 = (erc721Address: string, erc721TokenId: number, account: string, chainId: number): void => {
  try {
    const { nftfyAddress } = getChainConfigById(chainId)
    const web3 = initializeWeb3(chainId)
    const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], erc721Address)
    contractErc721.methods.approve(nftfyAddress, erc721TokenId).send({ from: account }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.fractionalizeApprove) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const fractionalizeErc721 = (
  erc721Address: string,
  erc721Id: number,
  name: string,
  symbol: string,
  fractionPrice: string,
  fractionCount: string,
  fractionDecimals: number,
  paymentTokenAddress: string,
  account: string,
  chainId: number
): void => {
  try {
    const { nftfyAddress, ethAddress, balancer } = getChainConfigById(chainId)
    const web3 = initializeWeb3(chainId)

    const contractNftfy = new web3.eth.Contract(nftfyAbi as AbiItem[], nftfyAddress)
    contractNftfy.methods
      .fractionalize(
        erc721Address,
        erc721Id,
        name,
        symbol,
        fractionDecimals,
        units(fractionCount, fractionDecimals),
        fractionPrice,
        paymentTokenAddress === balancer.eth ? ethAddress : paymentTokenAddress
      )
      .send({ from: account }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.fractionalize) : clearTransaction()
      })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const approveErc20 = async (erc20ShareAddress: string, account: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20ShareAddress)
    await contractErc20.methods.approve(account, MaxUint256.toString()).send({ from: account })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const approveErc20Redeem = (erc20ShareAddress: string, erc20PaymentAddress: string, account: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20PaymentAddress)
    contractErc20.methods.approve(erc20ShareAddress, MaxUint256.toString()).send({ from: account }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.approveErc20Redeem) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const approveErc20Bridge = async (
  erc20Address: string,
  erc20Decimals: number,
  erc20Amount: string,
  chainId: number,
  spenderAddress?: string
) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20Address)
    await contractErc20.methods.approve(spenderAddress || accountVar(), erc20Amount).send({ from: accountVar() })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const isApprovedErc20 = async (erc20Address: string, account: string, chainId: number) => {
  const { nftfyTokenAddress } = getChainConfigById(chainId)
  const web3 = initializeWeb3(chainId)
  const contractERC20 = new web3.eth.Contract(erc20Abi as AbiItem[], nftfyTokenAddress)
  return contractERC20.methods.allowance(account, erc20Address).call()
}

export const isApprovedErc20Redeem = async (erc20ShareAddress: string, erc20PaymentAddress: string, account: string, chainId: number) => {
  const web3 = initializeWeb3(chainId)
  const contractERC20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20PaymentAddress)
  return contractERC20.methods.allowance(account, erc20ShareAddress).call()
}

export const setApprovalForAllErc721 = async (erc721Address: string, ownerAddress: string, operatorAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], erc721Address)
    await contractErc721.methods.setApprovalForAll(operatorAddress, true).send({ from: ownerAddress }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.setApprovalForAllErc721) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}

export const isApprovedForAllErc721 = async (erc721Address: string, ownerAddress: string, operatorAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], erc721Address)

    return contractErc721.methods.isApprovedForAll(ownerAddress, operatorAddress).call()
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}
export const getWrapperERC721 = async (erc721Address: string, chainId: number) => {
  const { nftfyAddress } = getChainConfigById(chainId)
  const web3 = initializeWeb3(chainId)
  const contractNftfy = new web3.eth.Contract(nftfyAbi as AbiItem[], nftfyAddress)
  const wrapperERC721 = contractNftfy.methods.wrappers(erc721Address).call()

  return wrapperERC721
}

export const isRedeemableErc20 = async (erc20Address: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)
    return !(await contractErc20Shares.methods.released().call())
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}

export const isClaimableErc20 = async (erc20Address: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)
    return contractErc20Shares.methods.released().call()
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}

export const claimErc20 = (erc20Address: string, account: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)
    contractErc20Shares.methods.claim().send({ from: account }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.portfolioClaim) : clearTransaction()
    })

    return true
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}

export const redeemErc20 = async (erc20Address: string, account: string, chainId: number) => {
  try {
    const { ethAddress } = getChainConfigById(chainId)

    const web3 = initializeWeb3(chainId)
    const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)

    const paymentToken = await contractErc20Shares.methods.paymentToken().call()
    const redeemAmount = await getAccountRedeemAmount(erc20Address, account, chainId)

    if (paymentToken === ethAddress) {
      contractErc20Shares.methods.redeem().send({ from: account, value: units(redeemAmount, 18) }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.redeem) : clearTransaction()
      })
    } else {
      contractErc20Shares.methods.redeem().send({ from: account }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.redeem) : clearTransaction()
      })
    }

    return true
  } catch (error) {
    notifyError(code[5011], error)
    return false
  }
}
export const getAccountRedeemAmount = async (erc20Address: string, account: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)
    const redeemAmountOf = await contractErc20Shares.methods.redeemAmountOf(account).call()
    return coins(redeemAmountOf, 18)
  } catch (error) {
    notifyError(code[5011], error)
    return '0'
  }
}

export const getAccountClaimAmount = async (erc20Address: string, account: string, chainId: number) => {
  try {
    const { ethAddress } = getChainConfigById(chainId)

    const web3 = initializeWeb3(chainId)
    const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)

    let decimals = 18
    const paymentToken = await contractErc20Shares.methods.paymentToken().call()

    if (paymentToken !== ethAddress) {
      const contractPayment = new web3.eth.Contract(erc20Abi as AbiItem[], paymentToken)
      decimals = Number(await contractPayment.methods.decimals().call())
    }

    const vaultBalance = await contractErc20Shares.methods.vaultBalanceOf(account).call()

    return scale(new BigNumber(vaultBalance), -decimals)
  } catch (error) {
    notifyError(code[5011], error)
    return '0'
  }
}

export const getFractionalizeAssetsList = async (account: string, chainId: number) => {
  const { ethAddress, balancer, erc20List } = getChainConfigById(chainId)
  const { eth } = balancer

  if (!account) {
    return erc20List
  }

  const erc20Promises: Promise<AssetERC20>[] = erc20List.map(async erc20 => {
    const balance = await getErc20Balance(account, erc20.address === eth ? ethAddress : erc20.address, erc20.decimals, chainId)
    return { ...erc20, balance: balance.toString() }
  })

  return Promise.all(erc20Promises)
}
