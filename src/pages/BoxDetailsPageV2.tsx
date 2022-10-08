import { useReactiveVar } from '@apollo/client'
import { Button, Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import copy from '../assets/box/copy.svg'
import iconDiscord from '../assets/box/iconDiscord.svg'
import iconInstagram from '../assets/box/iconInstagram.svg'
import iconLink from '../assets/box/iconLink.svg'
import iconProfile from '../assets/box/iconProfile.svg'
import iconSite from '../assets/box/iconSite.svg'
import iconTelegram from '../assets/box/iconTelegram.svg'
import iconTwitter from '../assets/box/iconTwitter.svg'
import { AddBoxModal } from '../components/box/AddBoxModal'
// import { BoxDetailsLoading } from '../components/box/BoxDetailsLoading'
import { BscAlertMessage } from '../components/shared/BscAlertMessage'
import { CardTemplate } from '../components/shared/template/cards/CardTemplate'
import { allowedChains } from '../config'
import { boxModalVar } from '../graphql/variables/BoxVariables'
import { clearTransaction, transactionLoadingVar, transactionVar } from '../graphql/variables/TransactionVariable'
import { accountVar, chainIdVar } from '../graphql/variables/WalletVariable'
import { getBoxMetadata, removeNftInBox } from '../services/BoxService'
import { notifySuccess } from '../services/NotificationService'
import { formatShortAddress } from '../services/UtilService'
import { colorsV2, fonts, viewport, viewportV2 } from '../styles/variables'
import { BoxAsset, NftBoxItems } from '../types/BoxTypes'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

export default function BoxDetailsPageV2() {
  const { boxId } = useParams<{ boxId: string }>()
  const chainId = useReactiveVar(chainIdVar)
  const [box, setBox] = useState<BoxAsset>()
  const [tab, setTab] = useState('details')
  const boxModal = useReactiveVar(boxModalVar)
  const account = useReactiveVar(accountVar)
  const [loading, setLoading] = useState(false)
  const [alertBscNetworkError, setAlertBscNetworkError] = useState(false)

  const copyAddress = () => {
    notifySuccess('Address copied!')
  }

  const history = useHistory()
  const transaction = useReactiveVar(transactionVar)
  const transactionLoading = useReactiveVar(transactionLoadingVar)

  useEffect(() => {
    const verifiedChain = allowedChains.find(id => id === chainId)
    if (!verifiedChain) {
      setAlertBscNetworkError(true)
      return
    }

    setAlertBscNetworkError(false)
  }, [chainId])

  useEffect(() => {
    try {
      setLoading(true)
      const getBoxAsset = async (id: number) => {
        const boxMetadata = await getBoxMetadata(id, chainId)
        setBox(boxMetadata)
        setLoading(false)
      }
      if (!boxModal) {
        getBoxAsset(Number(boxId))
      } else {
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
    }
  }, [boxId, chainId, boxModal, box?.image])

  useEffect(() => {
    if (!transactionLoading && transaction && transaction.type === 'removeNftInBox' && transaction.confirmed) {
      history.go(0)
      clearTransaction()
    }
  }, [history, transaction, transactionLoading])

  async function remove(nft: NftBoxItems) {
    if (!account) return
    setLoadingItem(nft.tokenId)
    try {
      if (await removeNftInBox(Number(boxId), nft.address, Number(nft.tokenId), chainId, account)) {
        removeNftInList(nft.tokenId)
      } else {
        setLoadingItem(undefined)
      }
    } catch (error) {
      setLoadingItem(undefined)
    }
  }

  function setLoadingItem(tokenId: string | undefined) {
    const newListNft: NftBoxItems[] | undefined = []

    if (!box) {
      return
    }
    box.nfts.forEach(nft => {
      if (nft.tokenId === tokenId) {
        const nftUpdate = {
          ...nft,
          loading: true
        }
        newListNft.push(nftUpdate)
      } else {
        const nftUpdate = {
          ...nft,
          loading: false
        }
        newListNft.push(nftUpdate)
      }
    })

    const newBox = {
      ...box,
      nfts: newListNft
    }

    setBox(newBox)
  }

  function removeNftInList(tokenId: string | undefined) {
    const newListNft: NftBoxItems[] | undefined = []

    if (!box) {
      return
    }
    box.nfts.forEach(nft => {
      if (nft.tokenId !== tokenId) {
        const nftUpdate = {
          ...nft
        }
        newListNft.push(nftUpdate)
      }
    })

    const newBox = {
      ...box,
      nfts: newListNft
    }

    setBox(newBox)
  }

  return (
    <DefaultPageTemplate>
      {alertBscNetworkError && <BscAlertMessage />}
      {/* {loading && <BoxDetailsLoading />} */}
      {!loading && box && (
        <>
          <S.Content>
            <aside>
              <img src={box?.image} alt={box?.name} />
            </aside>
            <aside>
              <h1>{box?.name}</h1>
              <S.CopyToClipboard onCopy={copyAddress} text={String(box?.boxAddress)}>
                <Tooltip placement='right' title='Copy Address'>
                  <span>{formatShortAddress(String(box?.boxAddress))}</span>
                  <img src={copy} alt='copy' />
                </Tooltip>
              </S.CopyToClipboard>
              <ul>
                <li>
                  <S.ButtonTab className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>
                    Details
                  </S.ButtonTab>
                </li>
                <li>
                  <S.ButtonTab className={tab === 'description' ? 'active' : ''} onClick={() => setTab('description')}>
                    Description
                  </S.ButtonTab>
                </li>
                <li>
                  <S.ButtonTab className={tab === 'social_media' ? 'active' : ''} onClick={() => setTab('social_media')}>
                    Social Media
                  </S.ButtonTab>
                </li>
              </ul>
              <S.ContentTab>
                {tab === 'details' && (
                  <aside className={tab}>
                    <div>
                      <img src={iconProfile} alt='creator' />
                      <h5>
                        <span>Creator</span>
                        <span>{formatShortAddress(String(box?.ownerOf))}</span>
                      </h5>
                    </div>

                    <h2>Edition: 1/1</h2>

                    <div>
                      <li>
                        Token Id:
                        {` ${box?.boxId}`}
                      </li>
                      <li>
                        <a target='_blank' rel='noreferrer' href={`https://opensea.io/assets/${box?.boxAddress}/${box?.boxId}`}>
                          View on open sea
                          <img src={iconLink} alt='link' />
                        </a>
                      </li>
                      <li>
                        <a target='_blank' rel='noreferrer' href={`https://etherscan.io/address/${box?.boxAddress}/${box?.boxId}`}>
                          View on etherscan
                          <img src={iconLink} alt='link' />
                        </a>
                      </li>
                    </div>
                  </aside>
                )}
                {tab === 'description' && (
                  <aside className={tab}>
                    <p>{box?.description}</p>
                  </aside>
                )}
                {tab === 'social_media' && (
                  <aside className={tab}>
                    <section>
                      {box?.web_site_url && (
                        <li>
                          <img src={iconSite} alt='site' />
                          <span>
                            <a href={box?.web_site_url}>{box?.web_site_url}</a>
                          </span>
                        </li>
                      )}
                      {box?.twitter && (
                        <li>
                          <img src={iconTwitter} alt='twitter' />
                          <span>{box?.twitter}</span>
                        </li>
                      )}
                      {box?.telegram && (
                        <li>
                          <img src={iconTelegram} alt='telegram' />
                          <span>{box?.telegram}</span>
                        </li>
                      )}
                      {box?.discord && (
                        <li>
                          <img src={iconDiscord} alt='discord' />
                          <span>{box?.discord}</span>
                        </li>
                      )}
                      {box?.instagram && (
                        <li>
                          <img src={iconInstagram} alt='instagram' />
                          <span>{box?.instagram}</span>
                        </li>
                      )}
                    </section>
                  </aside>
                )}
              </S.ContentTab>
            </aside>
          </S.Content>
          <S.ListBoxContent>
            <section>
              <h2>NFTs in this Box</h2>
              {box.ownerOf.toLowerCase() === account?.toLowerCase() && (
                <S.ButtonDefault onClick={() => boxModalVar(true)}>Add NFT</S.ButtonDefault>
              )}
            </section>
            <ul>
              {box?.nfts.map(nft => (
                <CardTemplate key={nft.tokenId} image={nft.image_url} chainId={chainId}>
                  <S.ContentCard>
                    <h2>{nft.title}</h2>
                    {box.ownerOf.toLowerCase() === account?.toLowerCase() && (
                      <S.ButtonRemove loading={nft.loading} onClick={() => remove(nft)}>
                        Remove
                      </S.ButtonRemove>
                    )}
                  </S.ContentCard>
                </CardTemplate>
              ))}
            </ul>
            {box?.nftCount === 0 && (
              <S.EmptyBox>
                <span>Add your first NFT in your Box</span>
              </S.EmptyBox>
            )}
          </S.ListBoxContent>
        </>
      )}
      {box && <AddBoxModal boxId={box.boxId} nameBox={box.name} />}
    </DefaultPageTemplate>
  )
}

export const S = {
  Content: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    aside {
      width: 50%;
      &:first-child {
        text-align: left;
        img {
          width: 100%;
          max-width: 550px;
          height: 100%;
          max-height: 525px;
          -webkit-user-drag: none;
          object-fit: cover;
        }
      }
      &:last-child {
        text-align: left;
        padding-left: 20px;
        h1 {
          font-family: ${fonts.nunito};
          font-size: 40px;
          font-weight: normal;
          color: ${colorsV2.black};
          display: flex;
          flex-direction: row;
          align-items: center;
          small {
            font-size: 18px;
            font-weight: normal;
            margin-left: 11px;
          }
        }
        > ul {
          margin-top: 24px;
          margin-bottom: 10px;
          display: flex;
          flex-direction: row;
          align-items: center;
          li {
            padding-right: 24px;
          }
        }
      }
    }
    @media (min-width: ${viewportV2.mobile}) and (max-width: ${viewportV2.tablet}) {
      flex-direction: column;
      aside {
        width: 100%;
        &:first-child {
          margin-bottom: 25px;
        }
        &:last-child {
          padding-left: 0;
          h1 {
            font-size: 30px;
            small {
              font-size: 12px;
            }
          }
          > ul {
            margin-top: 25px;
          }
        }
      }
    }
  `,
  CopyToClipboard: styled(CopyToClipboard)`
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    max-width: 110px;
    margin-top: 10px;
    span {
      gap: 6px;
      color: ${colorsV2.gray[3]};
      font-weight: normal;
      font-size: 10px !important;
      line-height: 120%;
      img {
        width: 12px;
        height: 12px;
        margin-left: 5px;
        margin-bottom: 0px;
      }
      &:hover {
        color: ${colorsV2.blue.main} !important;
      }
    }

    @media (max-width: ${viewport.lg}) {
      align-items: center;
    }
  `,
  ButtonTab: styled.button`
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    font-weight: 600;
    font-family: ${fonts.nunito};
    color: ${colorsV2.gray[3]};

    &:hover,
    &:active,
    &:focus {
      color: ${colorsV2.blue.main};
    }

    &.active {
      color: ${colorsV2.blue.main};
    }
  `,
  ContentTab: styled.section`
    width: 100%;
    max-width: 450px;
    height: 400px;
    padding: 20px;
    border: 1px solid ${colorsV2.gray[1]};
    border-radius: 8px;

    .details {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      div {
        margin-bottom: 24px;
        &:first-child {
          display: flex;
          flex-direction: row;
          img {
            width: 32px;
            height: 32px;
            margin-right: 8px;
          }
          h5 {
            display: flex;
            flex-direction: column;
            span {
              &:first-child {
                font-size: 12px;
                font-family: ${fonts.nunito};
                color: ${colorsV2.gray[4]};
              }
              &:last-child {
                font-size: 12px;
                font-family: ${fonts.nunito};
                color: ${colorsV2.black};
                font-weight: 600;
              }
            }
          }
        }
        &:last-child {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          list-style: none;
          li {
            font-size: 14px;
            font-family: ${fonts.nunito};
            color: ${colorsV2.gray[4]};
            &:first-child {
              margin-bottom: 8px;
            }
            a {
              padding: 0;
              img {
                width: 13px;
                height: 13px;
              }
            }
          }
        }
      }
      h2 {
        font-size: 20px;
        font-family: ${fonts.nunito};
        font-weight: 600;
        color: ${colorsV2.black};
        margin-bottom: 24px;
      }
    }
    .description {
      width: 100%;
      padding-left: 0px !important;
      p {
        font-family: ${fonts.nunito};
        font-size: 12px;
        color: ${colorsV2.gray[4]};
        line-height: initial;
        text-align: left;
        word-break: break-all;
      }
    }
    .social_media {
      list-style: none;
      li {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 21px;
        img {
          width: 14px;
          height: 14px;
          margin-right: 8px;
        }
        span {
          font-family: ${fonts.nunito};
          font-size: 18px;
          color: ${colorsV2.black};
          a {
            width: 300px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
        }
      }
    }
  `,
  ButtonDefault: styled(Button)`
    border: none;
    width: 106px;
    height: 40px;
    padding: 10px 24px;
    background-color: ${colorsV2.blue.main};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: ${fonts.nunito};
    color: ${colorsV2.white};
    transition: filter 0.2s;

    &:hover,
    &:focus,
    &:active {
      background-color: ${colorsV2.blue.main};
      color: ${colorsV2.white};
      filter: brightness(0.9);
    }
  `,
  ListBoxContent: styled.aside`
    margin-top: 100px;
    section {
      &:first-child {
        display: flex;
        flex-direction: row;
        align-items: center;
        h2 {
          margin-right: 23px;
          font-size: 40px;
          color: ${colorsV2.black};
          font-family: ${fonts.nunito};
        }
        @media (min-width: ${viewportV2.mobile}) and (max-width: ${viewportV2.tablet}) {
          flex-direction: column;
          h2 {
            font-size: 25px;
            margin-bottom: 30px;
            text-align: center;
          }
        }
      }
    }
    ul {
      margin-top: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 26px 16px;

      @media (min-width: ${viewportV2.tablet}) and (max-width: ${viewportV2.desktop}) {
        grid-template-columns: 1fr 1fr 1fr;
      }

      @media (min-width: ${viewportV2.mobile}) and (max-width: ${viewportV2.tablet}) {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
    @media (min-width: ${viewportV2.mobile}) and (max-width: ${viewportV2.tablet}) {
      margin-top: 30px;
    }
  `,
  ContentCard: styled.div`
    padding: 16px;
    h2 {
      font-size: 24px;
      font-weight: 600;
      font-family: ${fonts.nunito};
      color: ${colorsV2.black};
      text-align: left;
      margin-bottom: 16px;
      width: 220px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  `,
  ButtonRemove: styled(Button)`
    width: -webkit-fill-available;
    height: 32px;
    background: none;
    border: 1px solid ${colorsV2.gray[3]};
    border-radius: 8px;
    span {
      font-weight: 500 !important;
      font-size: 16px !important;
      line-height: 20px;
      color: ${colorsV2.gray[3]} !important;
    }

    &:hover,
    &:focus,
    &:active {
      border: 1px solid ${colorsV2.gray[2]};
      opacity: 0.8;
      span {
        font-weight: 500 !important;
        font-size: 16px !important;
        line-height: 20px;
        color: ${colorsV2.gray[2]} !important;
      }
    }
  `,
  EmptyBox: styled.div`
    width: 100%;
    height: 107px;
    margin-bottom: 30px;
    background: ${colorsV2.gray[0]};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 16px;
    span {
      font-weight: 500;
      font-size: 20px;
      line-height: 26px;
      color: ${colorsV2.gray[4]};
    }
    button {
      margin-top: 23px;
      span {
        color: ${colorsV2.white};
        font-size: 16px;
      }
    }
  `
}
