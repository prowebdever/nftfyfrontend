import React from 'react'
import { useReactiveVar } from '@apollo/client/react'
import { Alert, Button, Checkbox, Image, ImageProps, Input, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { RcFile } from 'antd/es/upload'
import Dragger from 'antd/es/upload/Dragger'
import { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import iconArrow from '../assets/box/arrow.svg'
import iconDiscord from '../assets/box/iconDiscord.svg'
import iconHelp from '../assets/box/iconHelp.svg'
import iconInstagram from '../assets/box/iconInstagram.svg'
import iconSite from '../assets/box/iconSite.svg'
import iconTelegram from '../assets/box/iconTelegram.svg'
import iconTwitter from '../assets/box/iconTwitter.svg'
import mintImageTypeDefault from '../assets/icons/mintImageTypeDefault.png'
import { clearTransaction, transactionLoadingVar, transactionVar } from '../graphql/variables/TransactionVariable'
import { accountVar, chainIdVar } from '../graphql/variables/WalletVariable'
import { code } from '../messages'
import { sendMintBox } from '../services/BoxService'
import { PinataIpfsService } from '../services/IpfsService'
import { notifyError, notifySuccess } from '../services/NotificationService'
import { colorsV2, fonts, viewport } from '../styles/variables'
import { Erc721Attribute, Erc721Properties } from '../types/UtilTypes'
import { DefaultPageTemplate } from './shared/templates/DefaultPageTemplate'

interface Erc721Metadata {
  name: string
  author: string
  image?: string
  animation_url?: string
  external_url: string
  alt?: string
  sensitive_content: string
  description?: string
  social_media?: string
  web_site_url?: string
  twitter?: string
  telegram?: string
  discord?: string
  instagram?: string
  attributes?: Erc721Attribute[]
  properties: Erc721Properties
}

export default function MintBox() {
  const [title, setTitle] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [author, setAuthor] = useState<string>()
  const [webSiteUrl, setWebSiteUrl] = useState<string>()
  const [twitter, setTwitter] = useState<string>()
  const [telegram, setTelegram] = useState<string>()
  const [discord, setDiscord] = useState<string>()
  const [instagram, setInstagram] = useState<string>()
  const [isSensitiveContent, setIsSensitiveContent] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [nftImageUrl, setNftImageUrl] = useState<string | undefined>(undefined)
  const [nftImage, setNftImage] = useState<File | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(false)

  const nftType = 'image'

  const chainId = useReactiveVar(chainIdVar)
  const account = useReactiveVar(accountVar)

  const history = useHistory()
  const transaction = useReactiveVar(transactionVar)
  const transactionLoading = useReactiveVar(transactionLoadingVar)

  function setVisible() {
    setIsVisible(!isVisible)
  }

  const mintNft = async () => {
    setIsLoading(true)
    const properties: Erc721Properties = {
      name: {
        type: 'string',
        description: title || ''
      },
      created_at: {
        type: 'string',
        description: new Date().toJSON()
      },
      preview_media_file_type: {
        type: 'string',
        description: 'image/png,image/jpeg'
      }
    }

    if (description) {
      properties['description'] = {
        type: 'string',
        description
      }
    }

    const nftMetadataJson: Erc721Metadata = {
      name: title || '',
      description: description || '',
      author: author || '',
      web_site_url: webSiteUrl || '',
      twitter: twitter || '',
      telegram: telegram || '',
      discord: discord || '',
      instagram: instagram || '',
      sensitive_content: `${isSensitiveContent}`,
      properties,
      image: '$media-uri',
      external_url: ''
    }

    const nftMetadataFile: Blob = new Blob([JSON.stringify(nftMetadataJson)], { type: 'application/json' })

    const nftMetadata = nftImage && (await PinataIpfsService(chainId).uploadToIpfs(nftMetadataFile, nftImage))

    if (!nftMetadata || nftMetadata.error) {
      notifyError(nftMetadata && nftMetadata.error ? nftMetadata.error : code[5011])
      setIsLoading(false)
      return
    }

    account && nftMetadata.cid && sendMintBox(nftMetadata.cid, account, chainId)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!transactionLoading && transaction && transaction.type === 'mintBox' && transaction.confirmed) {
      notifySuccess('Box minted successfully! You will be redirected to the Box list page in a few seconds')
      history.push(`/wallet/box`)
      clearTransaction()
    }
  }, [history, transaction, transactionLoading])

  const handleImageUpload = (file: RcFile) => {
    setNftImageUrl(undefined)

    const isBiggerThanLimitFilesize = file.size / 1024 / 1024 > (nftType === 'image' ? 10 : 1)

    if (isBiggerThanLimitFilesize) {
      notifyError(`The media file must be equal or smaller than ${nftType === 'image' ? 10 : 1}MB`)
      return false
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setNftImageUrl((reader.result as string) || '')
    }

    setNftImage(file)
    return false
  }

  const handleImageRemoval = () => {
    setNftImageUrl(undefined)
    return true
  }

  const isReadyToMint = (): boolean => {
    const mediaUpload = nftImage

    return !!(mediaUpload && title && author)
  }

  return (
    <DefaultPageTemplate>
      <S.Container>
        <S.LinkExternal to='/wallet/box'>
          <img src={iconArrow} alt='back' />
          <span>BOXES</span>
        </S.LinkExternal>
        <h2>Create a Box</h2>
        <div>
          <S.ItemCreation>
            <S.MediaUploadWrapper>
              <div>
                <h3>
                  Upload Box Image
                  <Tooltip title='Upload file to preview your brand new Box'>
                    <img src={iconHelp} alt='help' />
                  </Tooltip>
                </h3>
                <h4>{nftType === 'image' ? 'Image' : 'Cover'}</h4>
                <Dragger
                  id='fileUpload'
                  maxCount={1}
                  name='file'
                  onRemove={handleImageRemoval}
                  beforeUpload={handleImageUpload}
                  accept='image/png,image/jpeg'>
                  <p className='ant-upload-drag-icon'>
                    <S.Button>Choose File</S.Button>
                  </p>
                  <p className='ant-upload-hint'>{`Supports JPG and PNG. Max file size: ${nftType === 'image' ? '10' : '1'}MB.`}</p>
                </Dragger>
              </div>
            </S.MediaUploadWrapper>
            <div>
              <h3>
                Name of Box
                <Tooltip title='Set a name for your Box'>
                  <img src={iconHelp} alt='help' />
                </Tooltip>
              </h3>
              <S.Input value={title} maxLength={100} onChange={event => setTitle(event.target.value)} />
            </div>
            <div>
              <h3>
                Description
                <Tooltip title='The description will be included on the Box detail page underneath its image'>
                  <img src={iconHelp} alt='help' />
                </Tooltip>
              </h3>
              <S.TextArea rows={4} value={description} maxLength={1000} onChange={event => setDescription(event.target.value)} />
            </div>
            <div>
              <h3>
                Author
                <Tooltip title='Who is the one creating the Box?'>
                  <img src={iconHelp} alt='help' />
                </Tooltip>
              </h3>
              <S.Input value={author} maxLength={60} onChange={event => setAuthor(event.target.value)} />
            </div>
            <div>
              <h3>
                Web Site Url
                <Tooltip title='Do you have a website page?'>
                  <img src={iconHelp} alt='help' />
                </Tooltip>
              </h3>
              <S.Input value={webSiteUrl} maxLength={120} onChange={event => setWebSiteUrl(event.target.value)} />
            </div>
            <div>
              <h3>Twitter</h3>
              <S.Input value={twitter} maxLength={120} onChange={event => setTwitter(event.target.value)} />
            </div>
            <div>
              <h3>Telegram</h3>
              <S.Input value={telegram} maxLength={120} onChange={event => setTelegram(event.target.value)} />
            </div>
            <div>
              <h3>Discord</h3>
              <S.Input value={discord} maxLength={120} onChange={event => setDiscord(event.target.value)} />
            </div>
            <div>
              <h3>Instagram</h3>
              <S.Input value={instagram} maxLength={120} onChange={event => setInstagram(event.target.value)} />
            </div>
            <S.AcceptTerms>
              <span>
                <S.Checkbox checked={isSensitiveContent} onChange={event => setIsSensitiveContent(event.target.checked)} />
                <span> Content is 18+</span>
              </span>
            </S.AcceptTerms>
            <div>
              <p className='less-attractive'>
                Once your NFT is minted on the Ethereum mainnet, you will not be able to edit or update any of its information.
              </p>
              <br />
              <p className='less-attractive'>
                You agree that any information uploaded to the Ethereum Mainnet NFT Minter will not contain material subject to copyright or
                other proprietary rights, unless you have necessary permission or are otherwise legally entitled to post the material.
              </p>
            </div>
            <div>
              <S.Button loading={isLoading} disabled={!isReadyToMint()} onClick={mintNft}>
                Create Box
              </S.Button>
            </div>
          </S.ItemCreation>
          <S.Preview>
            <h3>Preview</h3>
            <div>
              <div>
                <S.Card>
                  <div>
                    <S.ImageWrapper>
                      <S.Image src={nftImageUrl || mintImageTypeDefault} onPreviewClose={setVisible} loading='lazy' />
                      {isVisible && <div className='title-image-nft'>{title || ''}</div>}
                    </S.ImageWrapper>
                  </div>
                  <div>
                    <span>{title}</span>
                  </div>
                </S.Card>
              </div>
              <div>
                <h4>Description</h4>
                <p>{description}</p>
                <h4>Author</h4>
                <p>{author}</p>
                <S.PreviewSocial>
                  <img src={iconSite} alt='site' />
                  <span>{webSiteUrl}</span>
                </S.PreviewSocial>
                <S.PreviewSocial>
                  <img src={iconTwitter} alt='site' />
                  <span>{twitter}</span>
                </S.PreviewSocial>
                <S.PreviewSocial>
                  <img src={iconTelegram} alt='site' />
                  <span>{telegram}</span>
                </S.PreviewSocial>
                <S.PreviewSocial>
                  <img src={iconDiscord} alt='site' />
                  <span>{discord}</span>
                </S.PreviewSocial>
                <S.PreviewSocial>
                  <img src={iconInstagram} alt='site' />
                  <span>{instagram}</span>
                </S.PreviewSocial>
              </div>
            </div>
          </S.Preview>
        </div>
      </S.Container>
    </DefaultPageTemplate>
  )
}

const S = {
  Container: styled.div`
    > div {
      display: flex;
      margin-top: 24px;
      justify-content: center;

      @media (max-width: ${viewport.sm}) {
        flex-direction: column;
        &:first-child {
          margin-bottom: 24px;
        }
      }
    }

    h2 {
      color: ${colorsV2.gray[4]};
      font-weight: 600;
      font-size: 38px;
      margin-bottom: 64px;
      width: 100%;
      text-align: center;

      @media (max-width: ${viewport.sm}) {
        font-size: 20px;
        margin: 0;
      }
    }

    h3 {
      font-weight: normal;
      font-size: 18px;
      margin-bottom: 8px;
      display: flex;
      flex-direction: row;
      align-items: center;
      color: ${colorsV2.black};
      img {
        margin-left: 5px;
      }
    }

    h4 {
      font-weight: 500;
      font-size: 12px;
    }

    p,
    span {
      font-weight: 400;
      font-size: 16px;

      &.less-attractive {
        color: #888;
      }
    }

    .ant-upload-hint {
      font-weight: 500;
    }
  `,
  LinkExternal: styled(Link)`
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: ${colorsV2.gray[3]};
    margin-bottom: 32px;
    max-width: 872px;
    width: 100%;
    align-self: center;

    &:hover {
      color: ${colorsV2.gray[3]};
    }

    @media (max-width: ${viewport.sm}) {
      font-size: 10px;
      margin: 0;
      margin-bottom: 15px;
    }
  `,

  AcceptTerms: styled.div`
    > p {
      margin-top: 8px;
    }
  `,
  Preview: styled.div`
    max-width: 312px;

    @media (max-width: ${viewport.sm}) {
      max-width: none;
    }

    > div {
      display: flex;
      flex-direction: column;

      > div {
        &:first-child {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto;
          margin-bottom: 16px;

          > div {
            margin-left: 0;
            height: 370px;

            @media (max-width: ${viewport.sm}) {
              width: 100%;
            }
          }
        }

        > h4 {
          font-size: 18px;
          color: ${colorsV2.black};
        }

        &:last-child {
          p {
            font-weight: 400;
            font-size: 14px;
            color: ${colorsV2.gray[4]};
            min-height: 20px;
            margin-bottom: 20px;
            word-break: break-all;
            white-space: break-spaces;
          }
        }
      }
    }
  `,
  PreviewSocial: styled.h4`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 23px;
    img {
      margin-right: 5px;
    }
    span {
      font-family: ${fonts.nunito};
      font-weight: normal;
      font-stretch: normal;
      font-size: 18px;
      color: ${colorsV2.black};
    }
  `,
  ImageWrapper: styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    height: 300px;
    .title-image-nft {
      position: fixed;
      bottom: 20px;
      left: 20px;
      color: black;
      font-weight: 400;
      font-size: 1.5rem;
      z-index: 999999;
    }

    > .ant-image {
      width: 100%;
      height: 300px;
    }

    .ant-image-mask-info {
      text-align: center;
      @media (max-width: ${viewport.md}) {
        display: none;
      }
    }

    .ant-image-mask-info {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      font-size: 1.6rem;
      font-style: normal;
      font-weight: 400;
    }
  `,
  Image: styled(Image)<ImageProps>`
    border-radius: 8px;
    object-fit: cover;
    height: auto;
    width: 100%;
    height: 300px;
  `,
  Card: styled.div`
    width: 304px;
    height: 370px;
    border: 1px solid ${colorsV2.gray[1]};
    box-sizing: border-box;
    border-radius: 8px;
    justify-content: center;
    box-shadow: 1px 1px 5px hsla(0, 0%, 0%, 0.05);
    background: ${colorsV2.white};

    &:hover {
      cursor: pointer;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      transition: box-shadow ease-in 250ms;
    }

    @media (max-width: ${viewport.md}) {
      margin: 0 auto;
    }

    > div {
      &:first-child {
        width: 100%;
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &:last-child {
        height: 80px;
        padding: 24px;
        border-top: none;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        > span {
          color: ${colorsV2.gray['4']};
          font-size: 10px;
          font-weight: 400;
          line-height: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 13px;
          margin-top: 8px;

          &:last-child {
            color: ${colorsV2.black};
            margin-top: 4px;
            font-size: 24px;
            height: 18px;
            font-weight: 600;
            line-height: 18px;
          }
        }
      }
    }
  `,
  Checkbox: styled(Checkbox)`
    .ant-checkbox-inner {
      border-radius: 50%;
    }
  `,
  Button: styled(Button)`
    border-radius: 8px;
    background-color: ${colorsV2.blue.main};
    color: ${colorsV2.white};
    border: none;
    box-shadow: none;
    width: 100%;
    height: 40px;

    &:hover,
    &:active,
    &:focus {
      background-color: ${colorsV2.blue.dark};
      color: ${colorsV2.white};
      opacity: 0.8;
      box-shadow: none;
      border: none;
    }

    &:disabled {
      &:hover,
      &:active,
      &:focus {
        background-color: ${colorsV2.blue.dark};
        color: ${colorsV2.white};
        opacity: 0.6;
        box-shadow: none;
        border: none;
      }

      background-color: ${colorsV2.blue.main};
      color: ${colorsV2.white};
      opacity: 0.6;
      box-shadow: none;
      border: none;
    }

    &.advanced-settings {
      background-color: ${colorsV2.gray[4]};

      &:hover,
      &:active,
      &:focus {
        background-color: ${colorsV2.gray[4]};
      }

      &:disabled {
        &:hover,
        &:active,
        &:focus {
          background-color: ${colorsV2.gray[4]};
          opacity: 0.6;
          box-shadow: none;
          border: none;
        }
      }
    }
  `,
  Input: styled(Input)`
    border-radius: 8px;
  `,
  TextArea: styled(TextArea)`
    border-radius: 8px;
  `,
  NftTypeWrapper: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;

    > button {
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${colorsV2.gray[0]};
      box-sizing: border-box;
      border-radius: 8px;
      width: 112px;
      height: 112px;
      transition-property: opacity;
      transition-timing-function: ease-in;
      transition-duration: 250ms;

      &.active {
        border: 1px solid ${colorsV2.blue.main};
      }

      &:hover {
        opacity: 0.65;
      }

      &:not(:first-child) {
        margin-left: 24px;
      }
    }
  `,
  MediaUploadWrapper: styled.div`
    display: flex;
    justify-content: flex-start;

    .ant-btn {
      margin-top: 8px;
      width: 122px;
      height: 32px;
      font-size: 14px;
      font-weight: 600;
    }

    min-height: 166px;
    @media (max-width: ${viewport.sm}) {
      min-height: 188px;
    }

    > div {
      height: 100%;
      width: 100%;

      > h4 {
        margin-bottom: 8px;
      }

      &:only-child {
        max-width: 528px;
        @media (max-width: ${viewport.sm}) {
          max-width: none;
        }
      }

      &:not(:only-child) {
        max-width: 256px;
        @media (max-width: ${viewport.sm}) {
          max-width: none;
        }
      }

      &:not(:first-child) {
        margin-left: 16px;
        margin-top: 28px;
        @media (max-width: ${viewport.sm}) {
          margin-top: 16px;
          margin-left: auto;
        }
      }
    }

    @media (max-width: ${viewport.sm}) {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }
  `,
  Alert: styled(Alert)`
    border-radius: 8px;
    font-weight: 500;

    .ant-alert-message {
      margin-bottom: 8px;
      font-size: 14px;
    }
  `,
  ItemCreation: styled.div`
    max-width: 528px;
    margin-right: 40px;

    @media (max-width: ${viewport.sm}) {
      margin-right: 0;
      margin-bottom: 24px;
    }

    > div {
      margin-top: 24px;
    }

    div:nth-child(1) {
      margin-top: 0px;
    }

    > button {
      text-transform: uppercase;
      margin-top: 32px;
      width: 100%;
    }
  `,
  PropertyItem: styled.div`
    display: grid;
    grid-template-columns: 4fr 4fr 1fr;
    gap: 16px;

    &:not(:last-child) {
      margin-bottom: 16px;
    }

    > input {
      border-radius: 8px;
      height: 40px;
    }

    > button {
      border: none;
      box-shadow: none;
      height: 40px;
      border-radius: 8px;
      background-color: ${colorsV2.gray[4]};
      color: ${colorsV2.white};
      > span {
        font-size: 24px;
        line-height: 24px;
      }

      &:hover,
      &:active,
      &:focus {
        border: none;
        box-shadow: none;
        background-color: ${colorsV2.gray[4]};
        color: ${colorsV2.white};
        opacity: 0.6;
      }
    }
  `
}
