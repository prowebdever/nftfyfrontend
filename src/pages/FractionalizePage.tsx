import { useReactiveVar } from '@apollo/client'
import { Button } from 'antd'
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import { NftCard } from '../components/shared/cards/NftCard'
import { globalConfig } from '../configV2'
import { accountVar, chainIdVar, connectWalletModalVar, WalletProvider } from '../graphql/variables/WalletVariable'
import { walletService } from '../services/WalletService'
import { colors, fonts, viewport } from '../styles/variables'
import { WalletErc721Item } from '../types/WalletTypes'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function FractionalizePage() {
  const account = useReactiveVar(accountVar)
  const chainId = useReactiveVar(chainIdVar)

  const [loading, setLoading] = useState(true)
  const [alertError, setAlertError] = useState(false)
  const [nfts, setNfts] = useState<WalletErc721Item[]>([])

  const { paginationLimit } = globalConfig

  const [offset, setOffset] = useState(paginationLimit)
  const [hasMore, setHasMore] = useState(true)

  const loadingCards = (
    <S.CardsContainer>
      {[...Array(paginationLimit)].map(() => (
        <NftCard key={`loading-${Math.random()}`} loading fractionalize size='small' />
      ))}
    </S.CardsContainer>
  )

  useEffect(() => {
    const getInitialNfts = async () => {
      if (account && chainId) {
        try {
          const nftItems = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Items(
            account,
            chainId,
            0,
            paginationLimit
          )
          setNfts(nftItems)

          if (chainId !== 1 || nftItems.length < paginationLimit) {
            setHasMore(false)
          }
        } catch (error) {
          setAlertError(true)
        }
      }
      setLoading(false)
    }

    getInitialNfts()
  }, [account, chainId, paginationLimit])

  const getNextNfts = async () => {
    if (account && chainId) {
      try {
        const nftItems = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Items(
          account,
          chainId,
          offset,
          paginationLimit
        )

        setNfts([...nfts, ...nftItems])
        setOffset(offset + paginationLimit)

        if (nftItems.length < paginationLimit) {
          setHasMore(false)
        }
      } catch (error) {
        setAlertError(true)
      }
    }
  }

  const openConnectWalletModal = () => {
    connectWalletModalVar(true)
  }

  return (
    <DefaultPageTemplate alertWallet={!!(account && alertError)}>
      {loading && loadingCards}
      {!loading && nfts.length && (
        <InfiniteScroll dataLength={nfts.length} next={getNextNfts} hasMore={hasMore} loader={loadingCards}>
          <S.CardsContainer>
            {nfts.map(nftItem => (
              <NftCard
                key={`${nftItem.address}-${nftItem.tokenId}`}
                name={nftItem.metadata?.name || `${nftItem.name} #${nftItem.tokenId}`}
                typeName={nftItem.name}
                image={nftItem.metadata?.image}
                metadata={nftItem.metadata}
                address={nftItem.address}
                url={`/wallet/fractionalize/${nftItem.address}/${nftItem.tokenId}`}
                fractionalize
                size='small'
              />
            ))}
          </S.CardsContainer>
        </InfiniteScroll>
      )}
      {!loading && !account && (
        <S.BoxMessage>
          <S.H1>Please connect your wallet</S.H1>
          <S.Span>To fractionalize a NFT you should connect the wallet</S.Span>
          <S.Button onClick={openConnectWalletModal}>Connect Wallet</S.Button>
        </S.BoxMessage>
      )}
      {!loading && account && !nfts.length && (
        <S.BoxMessage>
          <S.H1>No NFT in your wallet</S.H1>
          <S.Span>You can buy one in our marketplace</S.Span>
          <S.Button href='/#/marketplace'>Marketplace</S.Button>
        </S.BoxMessage>
      )}
    </DefaultPageTemplate>
  )
}

export const S = {
  CardsContainer: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: auto;
    gap: 24px 24px;
    margin-bottom: 32px;

    @media (max-width: ${viewport.xl}) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media (max-width: ${viewport.lg}) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media (max-width: ${viewport.md}) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: ${viewport.sm}) {
      grid-template-columns: 1fr;
    }
  `,
  EmptyNft: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;

    span {
      font-family: ${fonts.nunito};
      font-style: normal;
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
      color: ${colors.gray1};
      margin-top: 20px;
    }

    small {
      font-family: ${fonts.nunito};
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: ${colors.gray1};
    }

    @media (max-width: ${viewport.sm}) {
      span {
        text-align: center;
      }

      small {
        text-align: center;
      }
    }
  `,
  BoxMessage: styled.section`
    flex: 1;
    background: ${colors.white};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 5px;

    border: 1px solid transparent;
    box-sizing: border-box;
    border-radius: 8px;

    @media (max-width: ${viewport.md}) {
      text-align: center;
    }
  `,
  H1: styled.h1`
    margin-bottom: 8px;

    font-family: ${fonts.nunito};
    font-style: normal;
    font-weight: 400;
    font-size: 2.3rem;
    line-height: 3rem;

    color: ${colors.gray1};
    @media (max-width: ${viewport.md}) {
      font-size: 2.2rem;
    }
  `,
  Span: styled.span`
    margin-bottom: 16px;

    font-family: ${fonts.nunito};
    font-style: normal;
    font-weight: 400;
    font-size: 1.3rem;
    line-height: 2.2rem;

    color: ${colors.gray1};
    @media (max-width: ${viewport.md}) {
      font-size: 1.2rem;
    }
  `,
  Button: styled(Button)`
    width: 100%;
    max-width: 192px;

    box-shadow: 1px 1px 5px rgb(0 0 0 / 5%);
    box-sizing: border-box;
    border-radius: 8px;

    font-family: ${fonts.nunito};
    font-style: normal;
    font-weight: 400;
    font-size: 14px;

    color: ${colors.gray1};

    &:focus {
      color: ${colors.gray1};
      box-shadow: 1px 1px 5px rgb(0 0 0 / 5%);
      outline: none;
    }

    &:hover {
      color: ${colors.gray1};
      box-shadow: 1px 1px 5px rgb(0 0 0 / 5%);
    }
  `
}
