import { useReactiveVar } from '@apollo/client'
import { useEffect, useState } from 'react'
import { getChainConfigById } from '../config'
import { accountVar, chainIdVar, WalletProvider } from '../graphql/variables/WalletVariable'
import { getBoxMetadata } from '../services/BoxService'
import { walletService } from '../services/WalletService'
import { BoxAsset } from '../types/BoxTypes'
import { WalletErc721Item } from '../types/WalletTypes'

export function useWalletNfts(paginationLimit: number, offsetParams = 0) {
  const account = useReactiveVar(accountVar)
  const chainId = useReactiveVar(chainIdVar)
  const [offset, setOffset] = useState(offsetParams)
  const [loading, setLoading] = useState(true)
  const { boxAddress } = getChainConfigById(chainId)
  const [hasMore, setHasMore] = useState(true)
  const [nfts, setNfts] = useState<WalletErc721Item[]>([])

  useEffect(() => {
    const getNfts = async () => {
      if (account && chainId) {
        const listNfts = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Items(
          account,
          chainId,
          offset,
          paginationLimit
        )

        const nftItemsBoxPromise: Promise<BoxAsset>[] = []
        listNfts.forEach(nft => {
          if (nft.address.toLowerCase() === boxAddress.toLowerCase()) {
            nftItemsBoxPromise.push(getBoxMetadata(Number(nft.tokenId), chainId))
          }
        })

        const nftItemsBox = await Promise.all(nftItemsBoxPromise)
        const boxesWithNftCount: WalletErc721Item[] = []

        listNfts.forEach(nftItem => {
          const nftBoxItem = nftItemsBox.find(
            nftBox => nftItem.address.toLowerCase() === nftBox.boxAddress.toLowerCase() && nftItem.tokenId === nftBox.boxId.toString()
          )
          if (nftBoxItem) {
            const newNftItem = { ...nftItem, nftsCount: nftBoxItem.nftCount }
            boxesWithNftCount.push(newNftItem)
          } else {
            boxesWithNftCount.push(nftItem)
          }
        })

        setNfts(boxesWithNftCount)

        if (chainId !== 1 || nfts.length < paginationLimit) {
          setHasMore(false)
        }
      }
      setLoading(false)
    }
    getNfts()
  }, [account, boxAddress, chainId, nfts, offset, offsetParams, paginationLimit])

  const loadMore = async () => {
    if (account && chainId) {
      const nftItems = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Items(
        account,
        chainId,
        offset,
        paginationLimit
      )
      const nftItemsBoxPromise: Promise<BoxAsset>[] = []

      nftItems.forEach(nft => {
        if (nft.address.toLowerCase() === boxAddress.toLowerCase()) {
          nftItemsBoxPromise.push(getBoxMetadata(Number(nft.tokenId), chainId))
        }
      })
      const nftItemsBox = await Promise.all(nftItemsBoxPromise)

      const boxesWithNftCount: WalletErc721Item[] = []
      nftItems.forEach(nftItem => {
        const nftBoxItem = nftItemsBox.find(
          nftBox => nftItem.address.toLowerCase() === nftBox.boxAddress.toLowerCase() && nftItem.tokenId === nftBox.boxId.toString()
        )
        if (nftBoxItem) {
          const newNftItem = { ...nftItem, nftsCount: nftBoxItem.nftCount }
          boxesWithNftCount.push(newNftItem)
        } else {
          boxesWithNftCount.push(nftItem)
        }
      })

      setNfts([...nfts, ...boxesWithNftCount])
      setOffset(offset + paginationLimit)

      if (nftItems.length < paginationLimit) {
        setHasMore(false)
      }
    }
  }

  return { loading, hasMore, loadMore, nfts }
}

export function useWalletNft(address: string, tokenId: string) {
  const chainId = useReactiveVar(chainIdVar)
  const [erc721, setErc721] = useState<WalletErc721Item | undefined>(undefined)
  const [isBox, setIsBox] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nftsIntroBox, setNftsIntroBox] = useState<BoxAsset | undefined>(undefined)

  const { boxAddress } = getChainConfigById(chainId)

  useEffect(() => {
    const getNft = async () => {
      if (address && tokenId && chainId) {
        setIsLoading(true)
        const nft = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Item(address, tokenId, chainId)
        if (address.toLowerCase() === boxAddress.toLowerCase()) {
          setIsBox(true)
          const nftsInsideBox = await getBoxMetadata(Number(tokenId), chainId)
          setNftsIntroBox(nftsInsideBox)
        }
        if (nft) {
          setErc721(nft)
        } else {
          setErc721(undefined)
        }
        setIsLoading(false)
      }
    }
    getNft()
  }, [address, boxAddress, chainId, tokenId])

  return { erc721, isBox, nftsIntroBox, isLoading }
}
