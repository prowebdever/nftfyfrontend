import axios from 'axios'
import BigNumber from 'bignumber.js'
import { doc, getDoc } from 'firebase/firestore'
import { flatten, reverse } from 'lodash'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import erc20Abi from '../abi/erc20.json'
import erc20SharesAbi from '../abi/erc20shares.json'
import erc721Abi from '../abi/erc721.json'
import erc721WrappedAbi from '../abi/erc721wrapped.json'
import nftfyAbi from '../abi/nftfy.json'
import nftfyTokenIcon from '../assets/tokens/nftfy.svg'
import { getChainConfigById } from '../config'
import { firestore } from '../firebase'
import { nftfyFracGraphQlClientV1 } from '../graphql/nftfy/frac-v1/ClientNftfyFracGraphql'
import {
  USER_FRACS_BY_OWNER_QUERY_V1,
  UserFracsByOwnerDataV1,
  UserFracsByOwnerVarsV1
} from '../graphql/nftfy/frac-v1/userFrac/UserFracsByOwner'
import { nftfyFracGraphQlClientV2 } from '../graphql/nftfy/frac-v2/ClientNftfyFracGraphql'
import {
  USER_FRACS_BY_OWNER_QUERY_V2,
  UserFracsByOwnerDataV2,
  UserFracsByOwnerVarsV2
} from '../graphql/nftfy/frac-v2/userFrac/UserFracsByOwner'
import { nftfyNftGraphQlClient } from '../graphql/nftfy/nft/ClientNftfyNftGraphql'
import { NFT_BY_ADDRESS_QUERY, NftByAddressData, NftByAddressVar } from '../graphql/nftfy/nft/nft/nftByAddress'
import { NftByWalletData, NftByWalletVar, NFTS_BY_WALLET_QUERY } from '../graphql/nftfy/nft/wallet/nftsByWallet'
import { accountVar, chainIdVar, WalletProvider } from '../graphql/variables/WalletVariable'
import { code } from '../messages'
import { MarketplaceERC20Item } from '../types/MarketplaceTypes'
import { WalletERC20Share, WalletErc721Item } from '../types/WalletTypes'
import { initializeWeb3 } from './MultiWalletService'
import { notifyError } from './NotificationService'
import { getErc721Metadata, getZoraErc721Metadata, isAllowedChain, scale } from './UtilService'

interface WalletService {
  get721Items(account: string, chainId: number, offset: number, limit: number): Promise<WalletErc721Item[]>
  get721Item(address: string, tokenId: string, chainId: number): Promise<WalletErc721Item | null>
  getERC20Shares(account: string, chainId: number, version?: number): Promise<WalletERC20Share[]>
  getERC20SharesByAddress(walletAddress: string, erc20Address: string, chainId: number): Promise<WalletERC20Share | undefined>
}

export const walletService = (providerName: WalletProvider): WalletService => {
  switch (providerName) {
    case WalletProvider.api:
      return apiProvider()

    case WalletProvider.web3:
      return web3Provider()

    case WalletProvider.theGraph:
      return theGraphProvider()

    default:
      return apiProvider()
  }
}

const apiProvider = (): WalletService => {
  return {
    get721Items: async (account, chainId, offset, limit) => {
      const { openSeaApiUrl } = getChainConfigById(chainId)

      if (chainId !== 1) {
        return []
      }

      const response = await axios.get<{
        assets: {
          asset_contract: {
            name: string
            address: string
            symbol: string
          }
          token_id: string
          name: string
          image_url: string
          image_preview_url: string
          social_media: string
          web_site_url: string
          twitter: string
          telegram: string
          discord: string
          instagram: string
          description: string
          animation_url: string
          owner: { address: string }
        }[]
      }>(`${openSeaApiUrl}/assets?owner=${account}&order_direction=desc&offset=${offset}&limit=${limit}`)

      const erc721Items: WalletErc721Item[] = []

      response.data.assets.forEach(data => {
        // Helper to map all nfts from marketplace
        axios.get(
          `https://nftfy-nft-metadata.ue.r.appspot.com/nft/metadata?chain=1&contract=${data.asset_contract.address.toLowerCase()}&id=${
            data.token_id
          }`
        )

        const erc721Item: WalletErc721Item = {
          address: data.asset_contract.address,
          tokenId: data.token_id,
          name: data.name || data.asset_contract.name,
          symbol: data.asset_contract.symbol,
          ownerAddress: data.owner.address,

          metadata: {
            name: data.name,
            image: data.image_preview_url,
            social_media: data.social_media,
            web_site_url: data.web_site_url,
            twitter: data.twitter,
            telegram: data.telegram,
            discord: data.discord,
            instagram: data.instagram,
            imageFull: data.image_url,
            description: data.description,
            animation_url: data.animation_url,
            animationType: data.animation_url ? 'mp4' : undefined,
            attributes: []
          }
        }

        erc721Items.push(erc721Item)
      })

      return erc721Items
    },
    get721Item: async (address, tokenId, chainId) => {
      try {
        if (chainId !== 1 || !firestore) {
          return null
        }

        // Helper to map all nfts from marketplace
        axios.get(`https://nftfy-nft-metadata.ue.r.appspot.com/nft/metadata?chain=1&contract=${address.toLocaleLowerCase()}&id=${tokenId}`)

        const nftRef = doc(firestore, `nfts/${chainId}_${address.toLocaleLowerCase()}_${tokenId}`)
        const nftData = await getDoc(nftRef)

        const data = nftData.data() as {
          asset_contract: {
            address: string
            name: string
            symbol: string
          }
          token_id: string
          name: string
          image_url: string
          image_original_url: string
          social_media: string
          web_site_url: string
          twitter: string
          telegram: string
          discord: string
          instagram: string
          description: string
          animation_url: string
          owner: { address: string }
        }

        const erc721Item: WalletErc721Item = {
          address: data.asset_contract.address,
          tokenId: data.token_id,
          name: data.name || data.asset_contract.name,
          symbol: data.asset_contract.symbol,
          ownerAddress: data.owner.address,
          metadata: {
            name: data.name,
            image: data.image_url,
            imageFull: data.image_original_url,
            description: data.description,
            animation_url: data.animation_url,
            social_media: data.social_media,
            web_site_url: data.web_site_url,
            twitter: data.twitter,
            telegram: data.telegram,
            discord: data.discord,
            instagram: data.instagram,
            animationType: data.animation_url ? 'mp4' : undefined,
            attributes: []
          }
        }
        return erc721Item
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Could not find metadata for: ${chainId}_${address.toLocaleLowerCase()}_${tokenId}`)
        return null
      }
    },
    getERC20Shares(): Promise<WalletERC20Share[]> {
      // TODO: Implement on api provider
      return Promise.all([])
    },
    getERC20SharesByAddress(): Promise<WalletERC20Share | undefined> {
      // TODO: Implement on api provider
      return Promise.resolve(undefined)
    }
  }
}

/**
 * @deprecated Deprecated in favor of TheGraph
 */
const web3Provider = (): WalletService => {
  return {
    get721Items: async () => {
      const account = accountVar()
      const chainId = chainIdVar()

      const { erc721Addresses } = getChainConfigById(chainId)

      if (!account || !isAllowedChain(chainId)) {
        return []
      }
      const web3 = initializeWeb3(chainId)

      const getERC721Item = async (addressERC721: string) => {
        let erc721Items: WalletErc721Item[] = []
        const contractERC721 = new web3.eth.Contract(erc721Abi as AbiItem[], addressERC721)

        const totalTokens = await contractERC721.methods.balanceOf(account).call()

        const name = await contractERC721.methods.name().call()
        const symbol = await contractERC721.methods.symbol().call()

        const tokensIdsPromises = []

        for (let i = 0; i < totalTokens; i += 1) {
          tokensIdsPromises.push(contractERC721.methods.tokenOfOwnerByIndex(account, i).call())
        }

        const tokensIds = await Promise.all(tokensIdsPromises)

        tokensIds.forEach(tokenId => {
          erc721Items.push({
            address: addressERC721,
            tokenId,
            name,
            symbol
          })
        })

        const erc721ItemsMetadataPromises: Promise<{
          name: string
          address: string
          tokenId: string
          description: string
          image_url: string
          animation_url: string | undefined
          social_media?: string
          web_site_url?: string
          twitter?: string
          telegram?: string
          discord?: string
          instagram?: string
          animationType: string | undefined
        }>[] = []

        erc721Items.forEach(erc721Item => erc721ItemsMetadataPromises.push(getErc721Metadata(erc721Item.address, erc721Item.tokenId, web3)))

        const erc721ItemsMetadata = await Promise.all(erc721ItemsMetadataPromises)

        erc721Items = erc721Items.map(erc721Item => {
          const metadata = erc721ItemsMetadata.find(
            erc721ItemMetadata => erc721Item.address === erc721ItemMetadata.address && erc721Item.tokenId === erc721ItemMetadata.tokenId
          )

          if (metadata) {
            const erc721ItemClone = { ...erc721Item }

            erc721ItemClone.metadata = {
              name: metadata.name,
              image: metadata.image_url,
              imageFull: metadata.image_url,
              social_media: metadata.social_media,
              web_site_url: metadata.web_site_url,
              twitter: metadata.twitter,
              telegram: metadata.telegram,
              discord: metadata.discord,
              instagram: metadata.instagram,
              description: metadata.description,
              animation_url: String(metadata.animation_url),
              animationType: metadata.animationType
            }
            return erc721ItemClone
          }

          return erc721Item
        })

        return erc721Items
      }

      const erc721Promises: Promise<WalletErc721Item[]>[] = []

      erc721Addresses.forEach(addressERC721 => {
        erc721Promises.push(getERC721Item(addressERC721))
      })

      const erc721 = flatten(await Promise.all(erc721Promises))

      return erc721
    },
    get721Item: async (address, tokenId, chainId) => {
      const web3 = initializeWeb3(chainId)

      const contractErc721 = new web3.eth.Contract(erc721Abi as AbiItem[], address)
      const erc721Name = await contractErc721.methods.name().call()
      const erc721Symbol = await contractErc721.methods.symbol().call()

      const {
        description,
        image_url,
        name,
        social_media,
        web_site_url,
        twitter,
        telegram,
        discord,
        instagram,
        animation_url,
        author,
        attributes,
        animationType
      } =
        // Special treatment for Zora's contract, which get the image and the metadata from the NFT separately
        address.toLowerCase() === '0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7'
          ? await getZoraErc721Metadata(address, tokenId, web3)
          : await getErc721Metadata(address, tokenId, web3)

      return {
        name: erc721Name,
        symbol: erc721Symbol,
        address,
        tokenId,
        metadata: {
          image: image_url,
          imageFull: image_url,
          social_media,
          web_site_url,
          twitter,
          telegram,
          discord,
          instagram,
          name,
          author,
          attributes,
          animationType,
          description,
          animation_url: String(animation_url)
        }
      }
    },
    getERC20Shares: async (account: string, chainId: number): Promise<WalletERC20Share[]> => {
      const { erc721Addresses, nftfyAddress, ethAddress } = getChainConfigById(chainId)
      if (!isAllowedChain(chainId)) {
        return []
      }

      const web3 = initializeWeb3(chainId)

      const contractNftfy = new web3.eth.Contract(nftfyAbi as AbiItem[], nftfyAddress)

      const addressesWrappedERC721Promises: Promise<string>[] = []

      erc721Addresses.forEach(addressERC721 => addressesWrappedERC721Promises.push(contractNftfy.methods.wrappers(addressERC721).call()))

      const addressesWrappedERC721 = (await Promise.all(addressesWrappedERC721Promises)).filter(
        addressWrapped721 => addressWrapped721 !== ethAddress
      )

      const getErc20 = async (addressERC721Wrapper: string): Promise<string[]> => {
        const contractWrapperErc721 = new web3.eth.Contract(erc721WrappedAbi as AbiItem[], addressERC721Wrapper)
        const historyLength = await contractWrapperErc721.methods.historyLength().call()
        const erc20Promises: Promise<string>[] = []

        for (let i = 0; i < historyLength; i += 1) {
          erc20Promises.push(contractWrapperErc721.methods.historyAt(i).call())
        }

        return Promise.all(erc20Promises)
      }

      const erc20Promises: Promise<string[]>[] = []

      for (let i = 0; i < addressesWrappedERC721.length; i += 1) {
        erc20Promises.push(getErc20(addressesWrappedERC721[i]))
      }

      const erc20 = flatten(await Promise.all(erc20Promises))
      const getERC20Metadata = async (erc20Address: string): Promise<WalletERC20Share> => {
        const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)

        const nameShares = await contractErc20Shares.methods.name().call()
        const tokenId = await contractErc20Shares.methods.tokenId().call()

        const symbol = await contractErc20Shares.methods.symbol().call()
        const decimals = await contractErc20Shares.methods.decimals().call()
        const balance = await contractErc20Shares.methods.balanceOf(account).call()
        const totalSupply = await contractErc20Shares.methods.totalSupply().call()
        const exitPrice = Number(await contractErc20Shares.methods.exitPrice().call())
        const paymentToken = await contractErc20Shares.methods.paymentToken().call()
        const vaultBalance = await contractErc20Shares.methods.vaultBalance().call()
        const released = await contractErc20Shares.methods.released().call()

        const wrappedErc721Address = await contractErc20Shares.methods.wrapper().call()
        const contractErc721Wrapped = new web3.eth.Contract(erc721WrappedAbi as AbiItem[], wrappedErc721Address)

        const erc721Address = await contractErc721Wrapped.methods.target().call()

        const { description, image_url, address, name } = await getErc721Metadata(erc721Address, tokenId, web3)

        const getPaymentTokenDecimals = async () => {
          try {
            const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], paymentToken)
            return contractErc20.methods.decimals().call()
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)
          }

          return '-'
        }

        const getPaymentTokenSymbol = async () => {
          try {
            const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], paymentToken)
            return contractErc20.methods.symbol().call()
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)
          }

          return '-'
        }

        const paymentTokenDecimals = paymentToken === ethAddress ? 18 : await getPaymentTokenDecimals()
        const paymentTokenSymbol = paymentToken === ethAddress ? 'ETH' : await getPaymentTokenSymbol()

        return {
          id: erc20Address,
          symbol,
          decimals: Number(decimals),
          balance: scale(new BigNumber(balance), -decimals).toString(),
          totalSupply,
          exitPrice: exitPrice.toLocaleString('en'),
          name: nameShares,
          paymentToken: {
            id: paymentToken,
            symbol: paymentTokenSymbol,
            decimals: paymentTokenDecimals
          },
          vaultBalance,
          released,
          target: {
            id: address,
            tokenId,
            tokenURI: '',
            collection: {
              id: '',
              name: ''
            }
          },
          metadata: {
            name,
            image: image_url,
            description
          }
        }
      }

      const erc20WithMetadataPromises: Promise<WalletERC20Share>[] = []

      for (let i = 0; i < erc20.length; i += 1) {
        erc20WithMetadataPromises.push(getERC20Metadata(erc20[i]))
      }

      const erc20WithMetadata = reverse(
        flatten(await Promise.all(erc20WithMetadataPromises)).filter(erc20Item => Number(erc20Item.balance) > 0)
      )

      return erc20WithMetadata
    },
    getERC20SharesByAddress: async (
      walletAddress: string,
      erc20Address: string,
      chainId: number
    ): Promise<WalletERC20Share | undefined> => {
      const { ethAddress } = getChainConfigById(chainId)

      const web3 = initializeWeb3(chainId)

      const contractErc20Shares = new web3.eth.Contract(erc20SharesAbi as AbiItem[], erc20Address)

      const nameShares = await contractErc20Shares.methods.name().call()
      const tokenId = await contractErc20Shares.methods.tokenId().call()
      const decimals = await contractErc20Shares.methods.decimals().call()
      const symbol = await contractErc20Shares.methods.symbol().call()
      const balance = await contractErc20Shares.methods.balanceOf(walletAddress).call()
      const totalSupply = await contractErc20Shares.methods.totalSupply().call()
      const exitPrice = Number(await contractErc20Shares.methods.exitPrice().call())
      const paymentToken = await contractErc20Shares.methods.paymentToken().call()

      const vaultBalance = await contractErc20Shares.methods.vaultBalance().call()
      const released = await contractErc20Shares.methods.released().call()

      const { description, image_url, address, name } = await getErc721Metadata(erc20Address, tokenId, web3)

      const getPaymentTokenSymbol = async () => {
        try {
          const contractErc20 = new web3.eth.Contract(erc20Abi as AbiItem[], paymentToken)
          return contractErc20.methods.symbol().call()
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }

        return '-'
      }

      const paymentTokenSymbol = paymentToken === ethAddress ? 'ETH' : await getPaymentTokenSymbol()

      return {
        id: erc20Address,
        symbol,
        decimals: Number(decimals),
        balance,
        totalSupply,
        exitPrice: exitPrice.toLocaleString('en'),
        name: nameShares,
        paymentToken: {
          id: paymentToken,
          symbol: paymentTokenSymbol
        },
        vaultBalance,
        released,
        target: {
          id: address,
          tokenId
        },
        metadata: {
          name,
          description,
          image: image_url
        }
      }
    }
  }
}

const theGraphProvider = (): WalletService => {
  return {
    get721Item: async (address, tokenId, chainId): Promise<WalletErc721Item | null> => {
      try {
        const web3 = initializeWeb3(chainId)

        const nftByAddress = await nftfyNftGraphQlClient(chainId).query<NftByAddressData, NftByAddressVar>({
          query: NFT_BY_ADDRESS_QUERY,
          variables: {
            id: `${address.toLowerCase()}#${tokenId}`
          }
        })

        const {
          description,
          image_url,
          name,
          social_media,
          web_site_url,
          twitter,
          telegram,
          discord,
          instagram,
          animation_url,
          author,
          attributes,
          animationType
        } = await getErc721Metadata(address, tokenId, web3)

        return {
          name: nftByAddress.data.nft.collection.name,
          ownerAddress: nftByAddress.data.nft.owner,
          address,
          tokenId,
          symbol: nftByAddress.data.nft.collection.symbol,
          metadata: {
            image: image_url,
            imageFull: image_url,
            social_media,
            web_site_url,
            twitter,
            telegram,
            discord,
            instagram,
            name,
            author,
            attributes,
            animationType,
            description,
            animation_url: String(animation_url)
          }
        }
      } catch (error) {
        return null
      }
    },
    get721Items: async (walletAddress: string, chainId: number): Promise<WalletErc721Item[]> => {
      const web3 = initializeWeb3(chainId)
      try {
        let erc721Items: WalletErc721Item[] = []
        const nftsByWallet = await nftfyNftGraphQlClient(chainId).query<NftByWalletData, NftByWalletVar>({
          query: NFTS_BY_WALLET_QUERY,
          variables: {
            owner: walletAddress
          }
        })

        nftsByWallet?.data?.nfts.forEach(nft => {
          erc721Items.push({
            address: nft.collection.id,
            tokenId: nft.tokenId,
            name: nft.collection.name,
            symbol: nft.collection.symbol
          })
        })

        const erc721ItemsMetadataPromises: Promise<{
          name: string
          address: string
          tokenId: string
          description: string
          image_url: string
          animation_url: string | undefined
          social_media?: string
          web_site_url?: string
          twitter?: string
          telegram?: string
          discord?: string
          instagram?: string
          animationType: string | undefined
        }>[] = []

        erc721Items.forEach(erc721Item => erc721ItemsMetadataPromises.push(getErc721Metadata(erc721Item.address, erc721Item.tokenId, web3)))

        const erc721ItemsMetadata = await Promise.all(erc721ItemsMetadataPromises)

        erc721Items = erc721Items.map(erc721Item => {
          const metadata = erc721ItemsMetadata.find(
            erc721ItemMetadata => erc721Item.address === erc721ItemMetadata.address && erc721Item.tokenId === erc721ItemMetadata.tokenId
          )

          if (metadata) {
            const erc721ItemClone = { ...erc721Item }

            erc721ItemClone.metadata = {
              name: metadata.name,
              image: metadata.image_url,
              imageFull: metadata.image_url,
              social_media: metadata.social_media,
              web_site_url: metadata.web_site_url,
              twitter: metadata.twitter,
              telegram: metadata.telegram,
              discord: metadata.discord,
              instagram: metadata.instagram,
              description: metadata.description,
              animation_url: String(metadata.animation_url),
              animationType: metadata.animationType
            }
            return erc721ItemClone
          }

          return erc721Item
        })

        return erc721Items
      } catch (error) {
        return []
      }
    },
    getERC20Shares: async (account: string, chainId: number, version: 1 | 2): Promise<WalletERC20Share[]> => {
      try {
        const client = version === 2 ? await nftfyFracGraphQlClientV2(chainId) : await nftfyFracGraphQlClientV1(chainId)

        const executeQuery = async () => {
          if (version === 2) {
            const queryV2 = await client.query<UserFracsByOwnerDataV2, UserFracsByOwnerVarsV2>({
              query: USER_FRACS_BY_OWNER_QUERY_V2,
              variables: {
                owner: account,
                orderDirection: 'desc',
                orderField: 'id'
              }
            })

            if (!queryV2) {
              // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
              return []
            }

            const { data, error } = queryV2

            if (error || !data || !data.userFracs) {
              // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
              return []
            }

            return data.userFracs.map(userFrac => ({
              ...userFrac,
              frac: {
                ...userFrac.frac,
                exitPrice: userFrac.frac.reservePrice
              }
            }))
          }

          const query = await client.query<UserFracsByOwnerDataV1, UserFracsByOwnerVarsV1>({
            query: USER_FRACS_BY_OWNER_QUERY_V1,
            variables: {
              owner: account,
              orderDirection: 'desc',
              orderField: 'id'
            }
          })

          if (!query) {
            // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
            return []
          }

          const { data, error } = query

          if (error || !data || !data.userFracs) {
            // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
            return []
          }

          return data.userFracs
        }

        const erc20SharesItems = await executeQuery()

        const erc20Shares: Promise<WalletERC20Share>[] = erc20SharesItems.map(async userFrac => {
          // TODO: Implement on the Graph the get721Item()
          const erc721Item = await walletService(WalletProvider.web3).get721Item(
            Web3.utils.toChecksumAddress(userFrac.frac.target.collection.id),
            userFrac.frac.target.tokenId,
            chainId
          )

          const metadata = erc721Item?.metadata

          return {
            ...userFrac,
            ...userFrac.frac,
            metadata: metadata || undefined
          }
        })

        return Promise.all(erc20Shares)
      } catch (e) {
        notifyError(code[5015], e)

        return []
      }
    },
    getERC20SharesByAddress(): Promise<WalletERC20Share | undefined> {
      // TODO: Implement on The Graph provider
      return Promise.resolve(undefined)
    }
  }
}

export const getErc20Balance = async (
  walletAddress: string,
  erc20Address: string,
  erc20Decimals: number,
  chainId: number,
  erc20Symbol?: string
): Promise<BigNumber> => {
  const { ethAddress, networkTokenSymbol } = getChainConfigById(chainId)

  if (!isAllowedChain(chainId)) {
    return new Promise(() => 0)
  }

  const web3 = initializeWeb3(chainId)

  if (erc20Address === ethAddress || (erc20Symbol && erc20Symbol === networkTokenSymbol)) {
    const balance = await web3.eth.getBalance(walletAddress)
    return scale(new BigNumber(balance), -18)
  }

  const contractERC20 = new web3.eth.Contract(erc20Abi as AbiItem[], erc20Address)
  const balance = await contractERC20.methods.balanceOf(walletAddress).call()

  return scale(new BigNumber(balance), -erc20Decimals)
}

export const addMetamaskCustomToken = (erc20: MarketplaceERC20Item, chainId: number) => {
  const web3 = initializeWeb3(chainId)

  web3.givenProvider.sendAsync({
    method: 'metamask_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: erc20.id,
        symbol: erc20.symbol,
        decimals: erc20.decimals,
        image: erc20.metadata?.image
      }
    }
  })
}

export const getAssetLogo = (address: string, chainId: number): string => {
  if (address === '0xBf6Ff49FfD3d104302Ef0AB0F10f5a84324c091c') {
    return nftfyTokenIcon
  }

  const { assets } = getChainConfigById(chainId)
  const web3 = initializeWeb3(chainId)
  try {
    if (assets.includes(address.toLowerCase())) {
      return `https://raw.githubusercontent.com/balancer-labs/assets/master/assets/${address.toLowerCase()}.png`
    }
    if (address.toLowerCase() === '0x50de6856358cc35f3a9a57eaaa34bd4cb707d2cd') {
      return 'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x50de6856358cc35f3a9a57eaaa34bd4cb707d2cd.png'
    }
    if (address.toLowerCase() === '0x6fcb6408499a7c0f242e32d77eb51ffa1dd28a7e') {
      return 'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x6fcb6408499a7c0f242e32d77eb51ffa1dd28a7e.png'
    }
    if (address.toLowerCase() === '0xffffffff2ba8f66d4e51811c5190992176930278') {
      return 'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xffffffff2ba8f66d4e51811c5190992176930278.png'
    }
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${web3.utils.toChecksumAddress(
      address
    )}/logo.png`
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return ''
  }
}

export const addErc20ToMetamask = (
  erc20Address: string,
  erc20Decimals: number,
  erc20Symbol: string,
  erc20ImageUrl: string,
  chainId: number
) => {
  const web3 = initializeWeb3(chainId)

  web3.givenProvider.sendAsync({
    method: 'metamask_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: erc20Address,
        symbol: erc20Symbol,
        decimals: erc20Decimals,
        image: erc20ImageUrl || `${window.location.href}/assets/nftfy.svg`
      }
    }
  })
}

export const addNftFyToMetamask = (chainId: number) => {
  const web3 = initializeWeb3(chainId)

  web3.givenProvider.sendAsync({
    method: 'metamask_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: '0xBf6Ff49FfD3d104302Ef0AB0F10f5a84324c091c',
        symbol: 'NFTFY',
        decimals: 18,
        image: `${window.location.href}/assets/nftfy.svg`
      }
    }
  })
}
