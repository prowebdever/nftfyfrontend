import { now } from 'lodash'
import { getChainConfigById } from '../config'
import { nftfyFracGraphQlClientV1 } from '../graphql/nftfy/frac-v1/ClientNftfyFracGraphql'
import { FracByIdDataV1, FracByIdVarsV1, FRAC_BY_ID_QUERY_V1 } from '../graphql/nftfy/frac-v1/frac/FracById'
import { FracsDataV1, FracsVarsV1, FRACS_QUERY_V1 } from '../graphql/nftfy/frac-v1/frac/Fracs'
import { nftfyFracGraphQlClientV2 } from '../graphql/nftfy/frac-v2/ClientNftfyFracGraphql'
import { CurrencyAssetByIdData, CurrencyAssetByIdVars, CURRENCY_ASSET_BY_ID_QUERY } from '../graphql/nftfy/frac-v2/frac/CurrencyAssetById'
import { FracByIdDataV2, FracByIdVarsV2, FRAC_BY_ID_QUERY_V2 } from '../graphql/nftfy/frac-v2/frac/FracById'
import {
  FracByIdWithUserFracsDataV2,
  FracByIdWithUserFracsVarsV2,
  FRAC_BY_ID_WITH_USER_FRACS_QUERY_V2
} from '../graphql/nftfy/frac-v2/frac/FracByIdWithUserFracs'
import {
  FracsDataV2,
  FracsVarsV2,
  FRACS_QUERY_V2,
  FRACS_QUERY_V2_FILTER_BY_AUCTION_SOLD,
  FRACS_QUERY_V2_FILTER_BY_LIVE_AUCTION_SOLD
} from '../graphql/nftfy/frac-v2/frac/Fracs'
import { WalletProvider } from '../graphql/variables/WalletVariable'
import { code } from '../messages'
import { ERC20Asset, MarketplaceERC20Item } from '../types/MarketplaceTypes'
import { AssetERC20 } from '../types/WalletTypes'
import { getBoxMetadata } from './BoxService'
import { notifyError } from './NotificationService'
import { TheGraphPeerToPeerService } from './PeerToPeerService'
import { zeroXQuoteService } from './QuoteService'
import { units } from './UtilService'
import { getErc20Balance, walletService } from './WalletService'

interface MarketplaceService {
  getMarketplaceItems(
    orderDirection: 'asc' | 'desc',
    orderField: 'timestamp' | 'liquidity' | 'name',
    paginationLimit: number,
    filterCurrent: string,
    offset?: number,
    searchName?: string,
    released?: boolean
  ): Promise<MarketplaceERC20Item[]>
  getMarketplaceItemByAddress(erc20Address: string): Promise<MarketplaceERC20Item | undefined>
  getAsset(erc20Address: string): Promise<ERC20Asset | undefined>
}

export const marketplaceService = (chainId: number, version: 1 | 2): MarketplaceService => {
  const { boxAddress } = getChainConfigById(chainId)

  const setMarketplaceItemMetadata = async (erc20Item: MarketplaceERC20Item) => {
    if (!erc20Item.target.tokenURI && chainId !== 1) {
      return erc20Item
    }

    const { erc20List } = getChainConfigById(chainId)

    const erc721Item = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Item(
      erc20Item.target.collection.id,
      erc20Item.target.tokenId,
      chainId
    )

    if (!erc721Item) {
      return erc20Item
    }

    const { metadata } = erc721Item

    if (metadata && !metadata?.name) {
      metadata.name = `${erc721Item.name} #${erc721Item.tokenId}`
    }

    // Get the payment token symbol from the config for the erc20 while the new update is not deployed on the subgraph, as decided with
    // Rodrigo
    const paymentTokenSymbol = !erc20Item.paymentToken.id ? 'ETH' : erc20List.find(erc20 => erc20.id === erc20Item.paymentToken?.id)?.symbol

    if (erc20Item.target.collection.id.toLowerCase() === boxAddress.toLowerCase()) {
      const metadataBox = await getBoxMetadata(Number(erc20Item.target.tokenId), chainId)
      const { nftCount } = metadataBox
      return {
        ...erc20Item,
        paymentTokenSymbol,
        metadata,
        nftCount
      }
    }

    return {
      ...erc20Item,
      paymentTokenSymbol,
      metadata,
      nftCount: 0
    }
  }

  const setMarketplaceItemHoldersCount = async (erc20Item: MarketplaceERC20Item): Promise<MarketplaceERC20Item> => {
    const client = version === 2 ? await nftfyFracGraphQlClientV2(chainId) : await nftfyFracGraphQlClientV1(chainId)
    const holders = await client.query<FracByIdWithUserFracsDataV2, FracByIdWithUserFracsVarsV2>({
      query: FRAC_BY_ID_WITH_USER_FRACS_QUERY_V2,
      variables: { id: erc20Item.id.toLowerCase() }
    })

    return { ...erc20Item, holdersCount: holders?.data?.frac?.userFracs.length || 0 }
  }

  return {
    async getMarketplaceItems(
      orderDirection: 'asc' | 'desc',
      orderField: 'timestamp' | 'liquidity' | 'name',
      paginationLimit,
      activeFilters,
      offset = 0,
      searchName: string,
      released = false
    ) {
      const client = version === 2 ? await nftfyFracGraphQlClientV2(chainId) : await nftfyFracGraphQlClientV1(chainId)
      try {
        const setMarketplaceItemsMetadata = async (erc20Items: MarketplaceERC20Item[]) => {
          const erc20ItemsFormatted: MarketplaceERC20Item[] = []

          await Promise.all(
            erc20Items.map(async erc20Item => {
              erc20ItemsFormatted.push(await setMarketplaceItemMetadata(erc20Item))
            })
          )

          return erc20ItemsFormatted
        }

        const executeQuery = async (): Promise<MarketplaceERC20Item[]> => {
          let selectedContractAddress = ''
          let selectedStatus = ''
          let selectedReleased = false
          let selectedCutoff = 0
          let resultQuery

          if (activeFilters !== 'all') {
            switch (activeFilters) {
              case 'boxes':
                selectedContractAddress = '0xfc44f66d5d689cd9108c6577533e9572f53a50bc'
                break
              case 'liveAuction':
                selectedStatus = 'AUCTION_OR_SOLD'
                selectedCutoff = Math.round(now() / 1000)
                break
              case 'firstOffer':
                selectedStatus = 'SET_PRICE'
                break
              case 'sold':
                selectedStatus = 'AUCTION_OR_SOLD'
                selectedCutoff = Math.round(now() / 1000)
                break
              case 'fractionSale':
                selectedReleased = true
                break
              default:
                selectedReleased = false
            }
          }

          if (version === 2) {
            if (activeFilters !== 'sold' && activeFilters !== 'liveAuction') {
              const queryV2 = await client.query<FracsDataV2, FracsVarsV2>({
                query: FRACS_QUERY_V2,
                variables: {
                  orderDirection,
                  orderField,
                  name: searchName,
                  target_contains: selectedContractAddress,
                  status_contains: selectedStatus,
                  released: !!selectedReleased,
                  skip: offset,
                  first: paginationLimit
                }
              })
              resultQuery = queryV2
            }
            if (activeFilters === 'sold') {
              const queryV2 = await client.query<FracsDataV2, FracsVarsV2>({
                query: FRACS_QUERY_V2_FILTER_BY_AUCTION_SOLD,
                variables: {
                  orderDirection,
                  orderField,
                  name: searchName,
                  cutoff_lt: selectedCutoff,
                  released: !!selectedReleased,
                  skip: offset,
                  first: paginationLimit
                }
              })
              resultQuery = queryV2
            }

            if (activeFilters === 'liveAuction') {
              const queryV2 = await client.query<FracsDataV2, FracsVarsV2>({
                query: FRACS_QUERY_V2_FILTER_BY_LIVE_AUCTION_SOLD,
                variables: {
                  orderDirection,
                  orderField,
                  name: searchName,
                  cutoff_gte: selectedCutoff,
                  released: !!selectedReleased,
                  skip: offset,
                  first: paginationLimit
                }
              })
              resultQuery = queryV2
            }

            if (!resultQuery) {
              // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
              return []
            }

            const { data, error } = resultQuery

            if (error || !data || !data.fracs) {
              // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
              return []
            }

            return data.fracs.map(frac => ({
              ...frac,
              exitPrice: frac.reservePrice,
              sharePrice: frac.fractionPrice,
              sharesCount: frac.fractionsCount,
              type: frac.type || 'SET_PRICE',
              status: frac.status || 'OFFER'
            }))
          }

          if (version === 1) {
            const query = await client.query<FracsDataV1, FracsVarsV1>({
              query: FRACS_QUERY_V1,
              variables: {
                orderDirection,
                orderField,
                name: searchName,
                released
              }
            })

            if (!query) {
              // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
              return []
            }

            const { data, error } = query

            if (error || !data || !data.fracs) {
              // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5015], error)'
              return []
            }

            return data.fracs.map(frac => ({
              ...frac,
              type: 'SET_PRICE',
              status: 'OFFER'
            }))
          }

          return []
        }

        const erc20Items = await executeQuery()

        return await setMarketplaceItemsMetadata(erc20Items)
      } catch (e) {
        notifyError(code[5015], e)
        return []
      }
    },

    async getMarketplaceItemByAddress(erc20Address: string) {
      const client = version === 2 ? await nftfyFracGraphQlClientV2(chainId) : await nftfyFracGraphQlClientV1(chainId)
      try {
        if (version === 2) {
          const queryV2 = await client.query<FracByIdDataV2, FracByIdVarsV2>({
            query: FRAC_BY_ID_QUERY_V2,
            variables: {
              id: erc20Address.toLowerCase()
            }
          })

          if (!queryV2) {
            // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5016], error)'
            return undefined
          }

          const { data, error } = queryV2

          if (error || !data || !data.frac) {
            // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5016], error)'
            return undefined
          }

          const erc20: MarketplaceERC20Item = {
            ...data.frac,
            exitPrice: data.frac.reservePrice,
            sharePrice: data.frac.fractionPrice,
            sharesCount: data.frac.fractionsCount,
            type: data.frac.type || 'SET_PRICE',
            status: data.frac.status || 'OFFER'
          }

          const erc20ItemWithMetadata = await setMarketplaceItemMetadata(erc20)

          return setMarketplaceItemHoldersCount(erc20ItemWithMetadata)
        }

        const query = await client.query<FracByIdDataV1, FracByIdVarsV1>({
          query: FRAC_BY_ID_QUERY_V1,
          variables: {
            id: erc20Address.toLowerCase()
          }
        })

        if (!query) {
          // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5016], error)'
          return undefined
        }

        const { data, error } = query

        if (error || !data || !data.frac) {
          // TODO: After change chainIdVar to be <number | undefined>, inser again 'notifyError(code[5016], error)'
          return undefined
        }

        const erc20: MarketplaceERC20Item = {
          ...data.frac,
          type: 'SET_PRICE',
          status: 'OFFER'
        }

        const erc20ItemWithMetadata = await setMarketplaceItemMetadata(erc20)

        return setMarketplaceItemHoldersCount(erc20ItemWithMetadata)
      } catch (error) {
        // TODO: Uncomment after refactor chainId
        // notifyError(code[5016], error)
        return undefined
      }
    },
    async getAsset(erc20Address: string) {
      const client = version === 2 ? await nftfyFracGraphQlClientV2(chainId) : await nftfyFracGraphQlClientV1(chainId)
      const { data, error } = await client.query<CurrencyAssetByIdData, CurrencyAssetByIdVars>({
        query: CURRENCY_ASSET_BY_ID_QUERY,
        variables: {
          id: erc20Address
        }
      })

      if (error || !data || !data.currency) {
        // TODO: Uncomment after refactor chainId
        // notifyError(code[5016])
        return undefined
      }

      return {
        ...data.currency,
        address: data.currency.id,
        imageUrl: ''
      }
    }
  }
}

export const setMarketplaceItemsLiquidity = async (
  erc20Items: MarketplaceERC20Item[],
  chainId: number
): Promise<MarketplaceERC20Item[]> => {
  const erc20ItemsWithLiquidity: MarketplaceERC20Item[] = []

  await Promise.all(
    erc20Items.map(async erc20Item => {
      erc20ItemsWithLiquidity.push(await setMarketplaceItemLiquidity(erc20Item, chainId))
    })
  )

  return erc20ItemsWithLiquidity
}

export const setMarketplaceItemLiquidity = async (erc20Item: MarketplaceERC20Item, chainId: number): Promise<MarketplaceERC20Item> => {
  const itemWithLiquidity = { ...erc20Item }

  if (!erc20Item.paymentToken) {
    itemWithLiquidity.liquidity = {
      hasLiquidity: false,
      priceDollar: ''
    }
    return erc20Item
  }

  const erc20MarketPrice = await TheGraphPeerToPeerService(chainId).getTokensPairMarketPrice(
    erc20Item.id,
    erc20Item.paymentToken.id,
    erc20Item.paymentToken.decimals
  )

  if (!erc20MarketPrice) {
    itemWithLiquidity.liquidity = {
      hasLiquidity: false,
      priceDollar: ''
    }
    return erc20Item
  }

  itemWithLiquidity.liquidity = await zeroXQuoteService().quoteToStablecoin(
    erc20Item.paymentToken.id,
    units(erc20MarketPrice, erc20Item.paymentToken.decimals),
    erc20Item.paymentToken.decimals,
    chainId
  )

  return itemWithLiquidity
}

export const getMarketplaceAssetsList = async (account: string, chainId: number) => {
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
