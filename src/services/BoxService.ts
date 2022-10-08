import { AbiItem } from 'web3-utils'
import boxAbi from '../abi/boxAbi.json'
import { getChainConfigById } from '../config'
import { BoxByIdData, BoxByIDVars, BOX_BY_ID_QUERY } from '../graphql/box/boxes/BoxByIdQuery'
import { BoxByOwnerData, BoxByOwnerVars, BOX_BY_OWNER_QUERY } from '../graphql/box/boxes/BoxByOwnerQuery'
import { boxGraphQlClient } from '../graphql/box/ClientBoxGraphql'
import { clearTransaction, handleTransaction, TransactionType } from '../graphql/variables/TransactionVariable'
import { WalletProvider } from '../graphql/variables/WalletVariable'
import { code } from '../messages'
import { BoxAsset } from '../types/BoxTypes'
import { WalletErc721Item } from '../types/WalletTypes'
import { initializeWeb3 } from './MultiWalletService'
import { isApprovedForAllErc721, setApprovalForAllErc721 } from './NftfyService'
import { notifyError, notifySuccess } from './NotificationService'
import { walletService } from './WalletService'

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const getBoxItemById = async (boxId: string, chainId: number) => {
  const { boxAddress } = getChainConfigById(chainId)
  const boxRequest = await boxGraphQlClient(chainId).query<BoxByIdData, BoxByIDVars>({
    query: BOX_BY_ID_QUERY,
    variables: { id: `${boxAddress.toLowerCase()}#${boxId.toLowerCase()}` }
  })

  return boxRequest.data
}

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const getBoxItems = async (accountAddress: string, chainId: number): Promise<BoxAsset[]> => {
  try {
    const listBox = []

    const boxRequest = await boxGraphQlClient(chainId).query<BoxByOwnerData, BoxByOwnerVars>({
      query: BOX_BY_OWNER_QUERY,
      variables: { owner: accountAddress }
    })

    for (let i = 0; i < boxRequest.data.boxes.length; i += 1) {
      listBox.push(getBoxMetadata(Number(boxRequest.data.boxes[i].tokenId), chainId))
    }

    const boxes: BoxAsset[] = await Promise.all(listBox)

    return boxes
  } catch (error) {
    notifyError(code[5011], error)
    return error
  }
}

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const getBoxMetadata = async (boxId: number, chainId: number): Promise<BoxAsset> => {
  const { boxAddress } = getChainConfigById(chainId)

  const { box } = await getBoxItemById(String(boxId), chainId)

  const boxMetadata = await walletService(WalletProvider.web3).get721Item(boxAddress, String(boxId), chainId)

  const nftsListPromises: Promise<WalletErc721Item | null>[] = []

  box.items.forEach(boxItem => {
    nftsListPromises.push(
      walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Item(
        boxItem.collection.id,
        boxItem.tokenId,
        chainId
      )
    )
  })

  const nftsList = await Promise.all(nftsListPromises)
  const nfts = nftsList.map(nft => {
    return {
      tokenId: nft?.tokenId || '',
      image_url: nft?.metadata?.image || '',
      name: nft?.name || '',
      title: nft?.metadata?.name || '',
      address: nft?.address || '',
      nameContract: nft?.metadata?.asset_contract?.name || '',
      loading: false
    }
  })

  return {
    name: boxMetadata?.metadata?.name || '',
    author: boxMetadata?.metadata?.author || '',
    ownerOf: box?.owner,
    description: boxMetadata?.metadata?.description || '',
    image: boxMetadata?.metadata?.image || '',
    social_media: boxMetadata?.metadata?.social_media,
    web_site_url: boxMetadata?.metadata?.web_site_url,
    twitter: boxMetadata?.metadata?.twitter,
    telegram: boxMetadata?.metadata?.telegram,
    discord: boxMetadata?.metadata?.discord,
    instagram: boxMetadata?.metadata?.instagram,
    boxId,
    boxAddress,
    nftCount: Number(box?.items.length),
    nfts
  }
}

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const sendMintBox = (cid: string, accountAddress: string, chainId: number) => {
  try {
    const web3 = initializeWeb3(chainId)
    const { boxAddress } = getChainConfigById(chainId)
    const contractBox = new web3.eth.Contract(boxAbi as AbiItem[], boxAddress)
    const result = contractBox.methods.mint(cid, accountAddress).send({ from: accountAddress }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.mintBox) : clearTransaction()
    })
    return result
  } catch (error) {
    notifyError(code[5011], error)
    return error
  }
}

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const approve = async (tokenAddress: string, account: string, boxAddress: string, chainId: number) => {
  await setApprovalForAllErc721(tokenAddress, account, boxAddress, chainId)
  const result = await isApprovedForAllErc721(tokenAddress, account, boxAddress, chainId)
  result ? notifySuccess('Contract NFTs unlocked successfully') : notifyError(code[5011])

  return result
}

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const addedNftInBox = async (boxId: number, tokenAddress: string, tokenId: number, chainId: number, account: string) => {
  const web3 = initializeWeb3(chainId)
  const { boxAddress } = getChainConfigById(chainId)
  const contractBox = new web3.eth.Contract(boxAbi as AbiItem[], boxAddress)
  const isApprovedForAll = await isApprovedForAllErc721(tokenAddress, account, boxAddress, chainId)

  if (!isApprovedForAll) {
    await setApprovalForAllErc721(tokenAddress, account, boxAddress, chainId)

    const contractApproved = await isApprovedForAllErc721(tokenAddress, account, boxAddress, chainId)

    contractApproved ? notifySuccess('Contract NFTs unlocked successfully') : notifyError(code[5011])
  }

  const isApprovedForAll2 = await isApprovedForAllErc721(tokenAddress, account, boxAddress, chainId)

  if (isApprovedForAll2) {
    try {
      await contractBox.methods.boxAddItem(boxId, tokenAddress, tokenId).send({ from: account }, (_error: Error, tx: string) => {
        tx ? handleTransaction(tx, TransactionType.boxAddItem) : clearTransaction()
      })
      notifySuccess('NFT added in box')
      return true
    } catch (e) {
      notifyError(code[5011])
      return false
    }
  } else return false
}

/**
 * @deprecated This is trash implementation, all service need to be done using Encapsulation
 */
export const removeNftInBox = async (boxId: number, tokenAddress: string, tokenId: number, chainId: number, account: string) => {
  const web3 = initializeWeb3(chainId)
  const { boxAddress } = getChainConfigById(chainId)
  const contractBox = new web3.eth.Contract(boxAbi as AbiItem[], boxAddress)
  try {
    await contractBox.methods.boxRemoveItem(boxId, tokenAddress, tokenId, account).send({ from: account }, (_error: Error, tx: string) => {
      tx ? handleTransaction(tx, TransactionType.removeNftInBox) : clearTransaction()
    })
    notifySuccess('NFT removed from box')
    return true
  } catch (e) {
    notifyError(code[5011])
    return false
  }
}
