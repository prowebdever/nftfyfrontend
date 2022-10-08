import { AbiItem } from 'web3-utils'
import erc721MintAbi from '../abi/erc721Mint.json'
import { getChainConfigById } from '../config'
import { clearTransaction, handleTransaction, TransactionType } from '../graphql/variables/TransactionVariable'
import { code } from '../messages'
import { initializeWeb3 } from './MultiWalletService'
import { notifyError } from './NotificationService'

export const mintErc721 = (collectionAddress: string, cid: string, ownerAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const { mint } = getChainConfigById(chainId)
    const contractErc721 = new web3.eth.Contract(erc721MintAbi as AbiItem[], mint.minterAddress)

    contractErc721.methods.mint(collectionAddress, cid, ownerAddress).send({ from: ownerAddress }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.mint) : clearTransaction()
    })
  } catch (error) {
    notifyError(code[5011], error)
  }
}
