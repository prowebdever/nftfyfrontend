import React from 'react'
import { useReactiveVar } from '@apollo/client'
import { Button, Modal } from 'antd'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import { getChainConfigById } from '../../config'
import { boxModalVar, searchBoxModalVar } from '../../graphql/variables/BoxVariables'
import { clearTransaction, transactionLoadingVar, transactionVar } from '../../graphql/variables/TransactionVariable'
import { accountVar, chainIdVar, nftInWalletUpdateVar, WalletProvider } from '../../graphql/variables/WalletVariable'
import { code } from '../../messages'
import { addedNftInBox } from '../../services/BoxService'
import { notifyError } from '../../services/NotificationService'
import { walletService } from '../../services/WalletService'
import { colorsV2, fonts, viewport } from '../../styles/variables'
import { WalletErc721ItemModal } from '../../types/BoxTypes'
import { ContractImage } from '../shared/ContractImage'
import { BoxModalLoading } from './BoxModalLoading'

interface BoxModalParams {
  boxId: number
  nameBox: string
}

export const AddBoxModal = ({ boxId, nameBox: name }: BoxModalParams) => {
  const boxModal = useReactiveVar(boxModalVar)
  const account = useReactiveVar(accountVar)
  const chainId = useReactiveVar(chainIdVar)
  const search = useReactiveVar(searchBoxModalVar)
  const { boxAddress } = getChainConfigById(chainId)

  const [nfts, setNfts] = useState<WalletErc721ItemModal[]>([])
  const [loading, setLoading] = useState(false)

  const limit = 20
  const [offset, setOffset] = useState(limit)
  const [hasMore, setHasMore] = useState(true)
  const transaction = useReactiveVar(transactionVar)
  const transactionLoading = useReactiveVar(transactionLoadingVar)

  nftInWalletUpdateVar(boxModal)

  useEffect(() => {
    setLoading(true)
    const getInitialNfts = async () => {
      if (account && chainId) {
        try {
          const nftItems = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Items(
            account,
            chainId,
            0,
            limit
          )
          const nftItemModal = nftItems.map(nft => {
            return {
              ...nft,
              loading: false,
              disabled: false
            }
          })

          if (chainId !== 1) {
            setHasMore(false)
          }
          setNfts(nftItemModal)
          setLoading(false)
        } catch (error) {
          setLoading(false)
        }
      }
    }
    getInitialNfts()
  }, [account, chainId])

  useEffect(() => {
    if (
      !transactionLoading &&
      transaction &&
      (transaction.type === 'setApprovalForAllErc721' || transaction.type === 'boxAddItem') &&
      transaction.confirmed
    ) {
      clearTransaction()
    }
  }, [transaction, transactionLoading])

  const getNextNfts = async () => {
    if (account && chainId) {
      try {
        const nftItems = await walletService(chainId === 1 ? WalletProvider.api : WalletProvider.theGraph).get721Items(
          account,
          chainId,
          offset,
          limit
        )
        const nftItemModal = nftItems.map(nft => {
          return {
            ...nft,
            loading: false,
            disabled: false
          }
        })
        setNfts([...nfts, ...nftItemModal])
        setOffset(offset + limit)

        if (nftItems.length === 0) {
          setHasMore(false)
        }
      } catch (error) {
        notifyError(code[5011], error)
      }
    }
  }

  const closeModal = () => {
    boxModalVar(false)
  }

  const addNftInBox = async (erc721: WalletErc721ItemModal) => {
    if (!account) return
    setLoadingItem(erc721.tokenId)
    try {
      if (await addedNftInBox(boxId, erc721.address, Number(erc721.tokenId), chainId, account)) {
        window.location.reload()
        removeInList(erc721.tokenId)
      } else {
        setLoadingItem(undefined)
      }
    } catch (error) {
      setLoadingItem(undefined)
    }
  }

  function setLoadingItem(tokenId: string | undefined) {
    const newNftList: WalletErc721ItemModal[] | undefined = []

    if (tokenId === undefined) {
      nfts.forEach(nft => {
        const nftUpdate = {
          ...nft,
          loading: false,
          disabled: false
        }
        newNftList.push(nftUpdate)
      })
      setNfts(newNftList)
      return
    }

    nfts.forEach(nft => {
      if (nft.tokenId === tokenId) {
        const nftUpdate = {
          ...nft,
          loading: true
        }
        newNftList.push(nftUpdate)
      } else {
        const nftUpdate = {
          ...nft,
          loading: false,
          disabled: true
        }
        newNftList.push(nftUpdate)
      }
    })
    setNfts(newNftList)
  }

  function removeInList(tokenId: string | undefined) {
    const newNftList: WalletErc721ItemModal[] | undefined = []
    nfts.forEach(nft => {
      if (nft.tokenId !== tokenId) {
        const nftUpdate = {
          ...nft
        }
        newNftList.push(nftUpdate)
      }
    })
    setNfts(newNftList)
  }

  const loadingCards = []
  for (let i = 1; i <= 4; i += 1) {
    loadingCards.push(<BoxModalLoading key={`card-loading-${i}`} />)
  }

  function afterCloseModal() {
    searchBoxModalVar('')
  }

  return (
    <S.Modal visible={boxModal} onCancel={() => closeModal()} footer={null} destroyOnClose afterClose={afterCloseModal}>
      <header>
        <h1>{`Add NFT to ${name}`}</h1>
      </header>
      <S.Main>
        <S.ListNFT>
          {loading && loadingCards}
          {!loading && (
            <InfiniteScroll dataLength={nfts.length} height={400} next={getNextNfts} hasMore={hasMore} loader={loadingCards}>
              <div>
                {nfts.map(
                  nft =>
                    nft.address.toLowerCase() !== boxAddress.toLowerCase() && (
                      <li key={nft.tokenId}>
                        <ContractImage src={nft?.metadata?.image || ''} name={`${nft.name}-${nft.tokenId}`} large={false} />
                        <div className='info'>
                          <h2>{nft.metadata?.name}</h2>
                          <div>
                            <span>{`Token ID: ${nft.tokenId}`}</span>
                          </div>
                        </div>
                        <div className='action'>
                          <S.BtnAdd loading={nft.loading} onClick={() => addNftInBox(nft)} disabled={nft.disabled}>
                            Add
                          </S.BtnAdd>
                        </div>
                      </li>
                    )
                )}
              </div>
            </InfiniteScroll>
          )}
          {!nfts.length && !loading && !search && <p>No NFT in your wallet</p>}
          {!nfts.length && !loading && search && (
            <p>
              No results for
              {`' ${search} '`}
            </p>
          )}
        </S.ListNFT>
        <p>You can only add one NFT each time.</p>
      </S.Main>
    </S.Modal>
  )
}

const S = {
  Modal: styled(Modal)`
    .ant-modal-content {
      border-radius: 16px;
      .ant-modal-close {
        display: none;
      }
      .ant-modal-body {
        padding: 0px;
      }
    }

    header {
      width: 100%;
      padding: 20px 32px;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      border: 1px solid #e8e8e8;

      h1 {
        font-family: ${fonts.nunito};
        font-style: normal;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;

        display: flex;
        align-items: center;

        color: ${colorsV2.gray[4]};
      }
    }
  `,
  Main: styled.div`
    font-family: ${fonts.nunito};
    padding: 32px;
    @media (max-width: ${viewport.sm}) {
      padding: 18px;
    }
    > p {
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: ${colorsV2.gray[5]};
    }
  `,
  ListNFT: styled.ul`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 32px;
    height: auto;
    max-height: 450px;
    overflow: auto;
    overflow-y: auto;
    li {
      width: 100%;
      height: 56px;
      display: flex;
      flex-direction: row;
      margin-bottom: 24px;
      align-items: center;
      img {
        width: 56px;
        height: auto;
        max-height: 56px !important;
        background-position: center;
        object-fit: cover;
      }
      .info {
        margin-left: 8px;
        h2 {
          font-style: normal;
          font-weight: 500;
          font-size: 16px;
          line-height: 20px;
          color: ${colorsV2.gray[4]};
          margin-bottom: 5px;
          @media (max-width: ${viewport.sm}) {
            margin-bottom: 2px;
          }
        }
        div {
          display: flex;
          flex-direction: row;
          @media (max-width: ${viewport.sm}) {
            flex-direction: column;
          }
          span {
            font-weight: normal;
            font-size: 12px;
            line-height: 130%;
            color: ${colorsV2.gray[3]};
            margin-right: 10px;
            width: 200px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
        }
      }
      .action {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
    p {
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: ${colorsV2.gray[5]};
      margin: 0 auto;
    }
  `,
  BtnAdd: styled(Button)`
    border: none;
    background: ${colorsV2.blue.main};
    border-radius: 8px;
    width: 84px;
    height: 32px;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    color: ${colorsV2.white};

    &:hover,
    &:focus,
    &:active {
      background: ${colorsV2.blue.dark};
      color: ${colorsV2.white};
    }
  `
}
