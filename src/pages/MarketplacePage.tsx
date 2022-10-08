import { useReactiveVar } from '@apollo/client'
import { Button } from 'antd'
import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import { FilterMarketPlace } from '../components/marketplace/FilterMarketplace'
import { FooterCardMarketplace } from '../components/marketplace/FooterCardMarketplace'
import { FooterCardMarketplaceLoading } from '../components/marketplace/FooterCardMarketplaceLoading'
import { PaginationButton } from '../components/shared/buttons/PaginationButton'
import { SortDropdownFilter } from '../components/shared/buttons/SortDropdownFilter'
import EmptyState from '../components/shared/EmptyState'
import { CardTemplate } from '../components/shared/template/cards/CardTemplate'
import {
  marketplaceFiltersVar,
  sortingDirectionMarketplaceItemsVar,
  sortingFieldMarketplaceItemsVar
} from '../graphql/variables/MarketplaceVariable'
import { useChainConfig, useGlobalConfig } from '../hooks/ConfigHook'
import { useMarketplaceNfts } from '../hooks/MarketplaceHooks'
import { colors, colorsV2, fonts, viewportMargin, viewportV2 } from '../styles/variables'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function MarketplacePage() {
  const sortingField = useReactiveVar(sortingFieldMarketplaceItemsVar)
  const sortingDirection = useReactiveVar(sortingDirectionMarketplaceItemsVar)
  const { paginationLimit } = useGlobalConfig()
  const { chainId } = useChainConfig()
  const marketplaceFilter = useReactiveVar(marketplaceFiltersVar)

  const { loading, hasMore, loadMore, nfts } = useMarketplaceNfts(marketplaceFilter, sortingDirection, sortingField, paginationLimit)

  const loader = (
    <S.CardsContainer>
      {[...Array(paginationLimit)].map(() => (
        <CardTemplate key={`loading-${Math.random()}`} loading chainId={Number(chainId)}>
          <FooterCardMarketplaceLoading loading />
        </CardTemplate>
      ))}
    </S.CardsContainer>
  )

  return (
    <DefaultPageTemplate bgGray>
      <S.Filter>
        <FilterMarketPlace />
        <div className='without-filter'>
          <SortDropdownFilter />
        </div>
      </S.Filter>
      {!loading && !nfts.length && <EmptyState />}
      <InfiniteScroll next={loadMore} hasMore={hasMore} loader={loader} dataLength={nfts.length}>
        <S.CardsContainer>
          {nfts.map(nftItem => {
            const image = String(nftItem?.metadata?.image)
            return (
              <CardTemplate
                key={`${nftItem.id}`}
                image={image}
                animation_url={nftItem?.metadata?.animation_url}
                name={String(nftItem?.metadata?.name)}
                isBoxNftCount={nftItem?.nftCount}
                collectionAddress={nftItem?.target.collection.id}
                url={`/marketplace/${nftItem.id}`}
                chainId={Number(chainId)}>
                <FooterCardMarketplace erc20Item={nftItem} chainId={Number(chainId)} />
              </CardTemplate>
            )
          })}
        </S.CardsContainer>
      </InfiniteScroll>
    </DefaultPageTemplate>
  )
}

export const S = {
  CardsContainer: styled.div`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 4vw;
    justify-content: flex-start;
    align-items: flex-start;

    > div:last-of-type {
      margin-bottom: 4vw;
    }

    @media (min-width: ${props => props.theme.viewport.tablet}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: ${props => props.theme.viewport.desktop}) {
      grid-template-columns: repeat(3, 1fr);

      > div:last-of-type {
        margin-bottom: 4vw;
      }
    }

    @media (min-width: ${props => props.theme.viewport.desktopXl}) {
      grid-template-columns: repeat(4, 1fr);
      gap: 2vw;

      > div:last-of-type {
        margin-bottom: 2vw;
      }
    }
  `,
  Filter: styled.div`
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    box-shadow: none;
    margin-bottom: ${viewportMargin.base};

    .ant-input-affix-wrapper:focus,
    .ant-input-affix-wrapper-focused {
      border: none;
      box-shadow: none;
    }

    > div {
      display: flex;
      align-items: center;

      &.without-filter {
        width: 100%;
        > button {
          margin-left: auto;
        }
      }

      > div:nth-child(1) {
        display: flex;
        align-items: center;

        span {
          font-family: ${fonts.nunito};
          font-style: normal;
          font-weight: 600;
          font-size: 1.4rem;
          line-height: 1.6rem;
          color: ${colorsV2.gray[3]};
          margin-right: 8px;
        }
      }
    }

    @media (min-width: ${viewportV2.tablet}) {
      margin-bottom: ${viewportMargin.base};
    }

    @media (min-width: ${viewportV2.desktop}) {
      margin-bottom: ${viewportMargin.tablet};
    }
  `,

  Pagination: styled(PaginationButton)`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${colors.white};

    .hide {
      display: none;
    }
  `,
  LoadMoreButton: styled(Button)`
    width: 100%;
    max-width: 304px;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    color: ${colorsV2.white};
    background-image: linear-gradient(90deg, #fe8367 5.73%, #fe7688 100%);
    margin: 0 auto;

    &:active,
    &:focus,
    &:hover {
      opacity: 0.75;
      color: ${colorsV2.white};
      background-image: linear-gradient(90deg, #fe8367 5.73%, #fe7688 100%);
    }
  `
}
