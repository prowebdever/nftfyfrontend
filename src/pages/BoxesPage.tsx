import { useReactiveVar } from '@apollo/client'
import { Button } from 'antd'
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import copy from '../assets/box/copy.svg'
import { AddBoxModal } from '../components/box/AddBoxModal'
import { BoxPageLoading } from '../components/box/BoxPageLoading'
import { allowedChains } from '../config'
import { boxModalVar } from '../graphql/variables/BoxVariables'
import { accountVar, chainIdVar } from '../graphql/variables/WalletVariable'
import { getBoxItems } from '../services/BoxService'
import { notifyError, notifySuccess } from '../services/NotificationService'
import { formatShortAddress, safeIpfsUrl } from '../services/UtilService'
import { colors, colorsV2, fonts, viewport } from '../styles/variables'
import { BoxAsset } from '../types/BoxTypes'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function BoxesPage() {
  const account = useReactiveVar(accountVar)
  const chainId = useReactiveVar(chainIdVar)
  const boxModal = useReactiveVar(boxModalVar)
  const [alertBscNetworkError, setAlertBscNetworkError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [boxIdModal, setBoxIdModal] = useState(0)
  const [boxes, setBoxes] = useState<BoxAsset[]>([])
  const [nameBox, setNameBox] = useState('')

  useEffect(() => {
    const verifiedChain = allowedChains.find(id => id === chainId)
    if (!verifiedChain) {
      setAlertBscNetworkError(true)
      return
    }

    setAlertBscNetworkError(false)
  }, [chainId])

  useEffect(() => {
    const getListBox = async () => {
      setLoading(true)
      if (account) {
        try {
          const getBoxListItems = async () => {
            const listbox = await getBoxItems(String(account), chainId)
            setBoxes(listbox)
            setLoading(false)
          }
          if (!boxModal) {
            getBoxListItems()
          } else {
            setLoading(false)
          }
        } catch (error) {
          notifyError('something went wrong')
          setLoading(false)
        }
      }
    }
    getListBox()
  }, [boxModal, account, chainId])

  const copyAddress = () => {
    notifySuccess('Address copied!')
  }

  const createBox = async () => {
    window.location.href = '/#/create/box'
  }

  const openModalAddedNft = (boxId: number, name: string) => {
    setNameBox(name)
    setBoxIdModal(boxId)
    boxModalVar(true)
  }

  return (
    <DefaultPageTemplate alertBscNetwork={alertBscNetworkError}>
      <S.HeaderBox>
        <div>
          <h1>BOXES</h1>
          <p>The Nftfy Box allows you to group many NFTs into a single ERC721 item.</p>
        </div>
        <S.ButtonAction onClick={createBox}>Create a new Box</S.ButtonAction>
      </S.HeaderBox>
      <S.ListBox>
        {loading && <BoxPageLoading />}
        {!loading &&
          account &&
          boxes.length > 0 &&
          boxes.map(boxItem => (
            <Link to={`/wallet/box/${boxItem.boxId}`} key={`${boxItem.boxAddress}-${boxItem.boxId}`}>
              <li key={`${boxItem.boxAddress}-${boxItem.boxId}`}>
                <S.ContentInfo>
                  <Link to={`/wallet/box/${boxItem.boxId}`}>
                    {boxItem?.image && <S.CardImageBox className='boxImage' src={safeIpfsUrl(boxItem.image)} alt={boxItem.name} />}
                  </Link>
                  <S.InfoCard>
                    <h2>{boxItem.name}</h2>
                    <S.CopyToClipboard onCopy={copyAddress} text={boxItem.boxAddress}>
                      <h3>
                        {formatShortAddress(boxItem.boxAddress)}
                        <img src={copy} alt='copy' />
                      </h3>
                    </S.CopyToClipboard>
                    <S.BlockIds>
                      <span>
                        <strong>Box ID: </strong>
                        {boxItem.boxId}
                      </span>
                    </S.BlockIds>
                    {boxItem.author && (
                      <h4>
                        <strong>Author:</strong>
                        <span>{boxItem.author}</span>
                      </h4>
                    )}
                  </S.InfoCard>
                </S.ContentInfo>
                <S.CardListNfts>
                  <ul>{boxItem.nftCount <= 3 && boxItem.nfts.map(nft => <img key={nft.tokenId} src={nft.image_url} alt={nft.name} />)}</ul>
                  <ul>
                    {boxItem.nftCount > 3 &&
                      boxItem.nfts.slice(0, 2).map(item => <img key={item.tokenId} src={item.image_url} alt={item.name} />)}
                    {boxItem.nftCount > 3 && (
                      <div>
                        <span>{`+ ${boxItem.nftCount - 2}`}</span>
                      </div>
                    )}
                  </ul>
                  <div className='action'>
                    {boxItem.nftCount === 0 && (
                      <S.ButtonAction
                        onClick={e => {
                          openModalAddedNft(boxItem.boxId, boxItem.name)
                          e.preventDefault()
                        }}>
                        Add a first NFT
                      </S.ButtonAction>
                    )}
                  </div>
                </S.CardListNfts>
              </li>
            </Link>
          ))}
      </S.ListBox>
      {!loading && account && !boxes.length && (
        <S.EmptyCard>
          <h1>You don`t have any Box Yet</h1>
        </S.EmptyCard>
      )}

      <AddBoxModal boxId={boxIdModal} nameBox={nameBox} />
    </DefaultPageTemplate>
  )
}

const S = {
  HeaderBox: styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: flex-end;
    font-family: ${fonts.nunito};
    margin-bottom: 40px;
    div {
      h1 {
        font-weight: 500;
        font-size: 32px;
        line-height: 40px;
        color: ${colorsV2.gray[4]};
        margin-bottom: 7px;
      }
      p {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 12px;
        color: ${colorsV2.gray[4]};
        max-width: 700px;
        padding-right: 50px;
      }
    }
    @media (max-width: ${viewport.lg}) {
      margin-bottom: 26px;
      flex-direction: column;
      align-items: center;
      div {
        margin-bottom: 16px;
        h1 {
          text-align: center;
        }
        p {
          text-align: center;
          padding-right: 0px;
        }
      }
    }
  `,
  ButtonAction: styled(Button)`
    background: ${colorsV2.blue.main};
    width: 216px;
    height: 32px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    color: ${colors.white};

    &:hover,
    &:focus,
    &:active {
      background: ${colorsV2.blue.dark};
      color: ${colorsV2.white};
    }
  `,
  CardImageBox: styled.img`
    max-width: 104px;
    min-width: 104px;
    border-radius: 8px;
    height: 104px;
    background-position: center;
    object-fit: cover;

    &:hover {
      opacity: 0.7;
    }
  `,
  ContentInfo: styled.div`
    display: flex;
    flex-direction: row;
  `,
  ListBox: styled.ul`
    li {
      width: 100%;
      height: auto;
      min-height: 136px;
      border: 1px solid ${colorsV2.gray[1]};
      box-sizing: border-box;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;

      &:hover {
        box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.16);
      }
    }
    @media (max-width: ${viewport.sm}) {
      li {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 16px;
        img:nth-child(1) {
          height: 104px;
          width: auto;
          margin-bottom: 15px;
        }
      }
    }
  `,

  CardListNfts: styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    ul {
      display: flex;
      flex-direction: row;
      gap: 15px;
      img {
        border-radius: 8px;
        height: 88px;
        max-height: 88px;
        width: 88px;
        max-width: 88px;
        background-position: center;
        object-fit: cover;
      }
      img:nth-child(1) {
        margin-bottom: 0px;
      }
      div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 88px;
        width: 88px;
        border-radius: 8px;
        background: ${colorsV2.gray[0]};
        span {
          font-weight: 500;
          font-size: 32px;
          line-height: 40px;
          color: ${colorsV2.gray[4]};
        }
      }
    }
    @media (max-width: ${viewport.sm}) {
      .action {
        width: 100%;
        height: 88px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  `,

  InfoCard: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 16px;
    height: 104px;
    h2 {
      font-weight: normal;
      font-size: 32px;
      line-height: normal;
      color: ${colorsV2.black};
      width: 320px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    h4 {
      margin-bottom: 5px;
      color: ${colorsV2.gray[4]};
      font-size: 14px;
      display: flex;
      flex-direction: row;
      align-items: center;
      span {
        font-weight: 500;
        padding-left: 5px;
        color: ${colorsV2.black};
      }
    }
    p {
      font-style: normal;
      font-weight: normal;
      font-size: 12px;
      color: ${colorsV2.gray[4]};
      max-width: 400px;
      white-space: pre-line;
      height: 38px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }

    @media (max-width: ${viewport.lg}) {
      margin-left: 10px;
      padding: 0px;
      h2 {
        font-size: 16px;
      }
      p {
        font-size: 10px;
        word-break: break-all;
      }
    }
  `,

  BlockIds: styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
    span {
      margin-right: 20px;
      font-size: 14px;
      color: ${colorsV2.gray[4]};
    }

    @media (max-width: ${viewport.lg}) {
      align-items: center;
    }
  `,
  CopyToClipboard: styled(CopyToClipboard)`
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 10px;
    margin-bottom: 8px;
    max-width: 110px;
    img {
      width: 12px;
      height: 12px !important;
      margin-left: 5px;
      margin-bottom: 0px !important;
    }

    &:hover {
      color: ${colorsV2.blue.main};
    }

    @media (max-width: ${viewport.lg}) {
      align-items: center;
    }
  `,
  EmptyCard: styled.div`
    width: 100%;
    border: none;
    box-sizing: border-box;
    background: ${colorsV2.gray[0]};
    border-radius: 8px;
    height: 136px;
    display: flex;
    justify-content: center;
    align-items: center;
    h1 {
      font-weight: 500;
      font-size: 20px;
      line-height: 26px;
      color: ${colorsV2.gray[4]};
    }
  `
}
